/**
 * Created by gunpower on 2016. 9. 22..
 */

const http = require('http');
const util = require('util');
const fs = require('fs');
const net = require('net');

const os = require('os');
const UrlParser = require('url');

const dgram = require("dgram");

let udp_socket = dgram.createSocket("udp4");



let theApp = {
    mng_info: {},
    pub_method: {},
    config: {
        port: 2012,
        ip: '192.168.0.255'
    },
    remote: {
        port: 0,
        ip: null
    }

}

udp_socket.on("message", function (msg, rinfo) {

    console.log(rinfo.address + ':' + rinfo.port + ' - ' + msg);
    theApp.remote.ip = rinfo.address
    theApp.remote.port = rinfo.port
});

udp_socket.bind(
    {
        port: 2012
    },
    function () {
        console.log('udp bind success');
        udp_socket.setBroadcast(true);
    }
);


//theApp.mng_info.udp_socket = udp_socket;

theApp.pub_method.send_udp = function (strPacket) {

    //{"POS_NO":"01","MENU_CD":"C0000001","QTY":"1"}
    //udp_socket.send( new Buffer(strPacket), 0, strPacket.length, config.net.udp.port, theApp.mng_info.ip ); // added missing bracket

    udp_socket.send(
        new Buffer(strPacket), 0,
        strPacket.length,
        theApp.config.port, theApp.config.ip);

}

theApp.pub_method.send_test_udp = function () {
    theApp.pub_method.send_udp('{"POS_NO":"01","MENU_CD":"C0000001","QTY":"1"}')
}
theApp.pub_method.test1 = function () {

    if(theApp.remote.ip) {
        let _cmd = {
            cmd: "eval",
            code: "gpio.write(0,0)"
        }
        let _packet = JSON.stringify(_cmd)
    
        udp_socket.send(new Buffer(_packet), 0,
            _packet.length,
            theApp.remote.port,
            theApp.remote.ip
        )
    }
}

theApp.pub_method.test2 = function () {

    if(theApp.remote.ip) {
        let _cmd = {
            cmd: "eval",
            code: "gpio.write(0,1)"
        }
        let _packet = JSON.stringify(_cmd)
    
        udp_socket.send(new Buffer(_packet), 0,
            _packet.length,
            theApp.remote.port,
            theApp.remote.ip
        )
    }
}





//repl
function setup_repl(context) {

    let repl = require('repl');

    let repl_context = repl.start({
        prompt: 'Node.js via stdin> ',
        input: process.stdin,
        output: process.stdout
    }).context;

    //콘텍스트객체 설정
    //theApp을 repl에서 볼수있다
    repl_context.theApp = context;
}
setup_repl(theApp);
