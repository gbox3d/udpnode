// const $ = require('jquery')
// require('popper.js')
// require('bootstrap')

window.$ = window.jQuery = require('jquery'); // not sure if you need this at all
window.Bootstrap = require('bootstrap');

const dgram = require("dgram");

const fs = require('fs')


function ApplicationMain() {

    let udp_socket = dgram.createSocket("udp4");

    let _config;
    let _configfilePath = 'tool/_config.json'
    function _loadConfig() {
        try {
            _config = JSON.parse(fs.readFileSync(_configfilePath, {
                encoding: 'utf8'
            }))
            console.log(_config)
        }
        catch (e) {
            console.log(e)
            alert(e)
        }
        _networkCfgComp.ip.value = _config.network.ip
        _networkCfgComp.port.value = _config.network.port
        alert('config file load ok')
    }

    function _saveConfig() {
        _config.network.ip = _networkCfgComp.ip.value
        _config.network.port =  parseInt(_networkCfgComp.port.value)
        fs.writeFileSync(_configfilePath,JSON.stringify(_config),{
            encoding : 'utf8'
        });
        alert('config file save ok')

        
    }

    let _networkCfgComp = {
        ip: document.querySelector('#ipaddress'),
        port: document.querySelector('#portnum')
    }

    document.querySelector('#btnNetworkSave').addEventListener('click',()=> {
        _saveConfig()
    })

    document.querySelector('#btnNetworkLoad').addEventListener('click',()=> {
        _loadConfig()
    })

    document.querySelector('#btnNetworkReBind').addEventListener('click',()=> {

        udp_socket.close(()=> {

            udp_socket = dgram.createSocket("udp4");

            udp_socket.bind(
                {
                    port:  parseInt (_networkCfgComp.port.value)
                },
                function () {
                    alert('rebind : ' + _networkCfgComp.port.value)
                    console.log('udp bind success');
                    addlogTextList('udp bind success');
                    //udp_socket.setBroadcast(true);
                }
            );

        });
        
    })

    _loadConfig()


    function addlogTextList(strMsg) {
        let logTextList = document.querySelector('#log-text')

        let _item = document.createElement('li');
        _item.classList.add('list-group-item');
        _item.innerText = strMsg
        logTextList.appendChild(_item)
    }


    udp_socket.on("message", function (msg, rinfo) {
        console.log(rinfo.address + ':' + rinfo.port + ' - ' + msg);
        //theApp.remote.ip = rinfo.address
        //theApp.remote.port = rinfo.port
    });
    udp_socket.on("error", function (_) {
       
    });
    udp_socket.on("close", function (_) {
       
    });


    udp_socket.bind(
        {
            port: _config.network.port
        },
        function () {
            console.log('udp bind success');
            addlogTextList('udp bind success');

            //udp_socket.setBroadcast(true);
        }
    );



    //textAreaCode
    document.querySelector('#btnCodeRun').addEventListener('click', function (evt) {

        
        let _cmd = {
            cmd: "eval",
            code: document.querySelector("#textAreaCode").value
        }
        let _packet = JSON.stringify(_cmd)

        
        udp_socket.send(Buffer.from(_packet), 0,
            _packet.length,
            parseInt (_networkCfgComp.port.value ),
            _networkCfgComp.ip.value,
            (err)=> {
                if(err === null) {
                    alert("send ok")
                }
                else {
                    alert(err)
                }

            }
        )
        
    })

}


var theApp = new ApplicationMain();




