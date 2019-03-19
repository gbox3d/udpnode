import '../../lib/collections'

var dgram = require( "dgram" );
var ipHepler = require('ip');



let bcConn = {
  socket : dgram.createSocket( "udp4" ),
  port : 1999
}

let dataConn = {
  socket : dgram.createSocket( "udp4" ),
  port : 2012
}

// client listens on a port as well in order to receive ping
bcConn.socket.bind( {port : bcConn.port });
dataConn.socket.bind( {port : dataConn.port });

bcConn.socket.on( "message", Meteor.bindEnvironment(( msg, rinfo )=> {

    let _pkt = JSON.parse(msg)
    let _address =  rinfo.address
    let _currentTick = (new Date()).getTime()
    // console.log()

    if( dc_bcDetect.find({address:_address}).count() > 0) {

      dc_bcDetect.update({address:_address},
        {$set:{
            pkt : _pkt,
            at : _currentTick
          }})

    }
    else {
      dc_bcDetect.insert({
        pkt : _pkt,
        address : _address,
        at : _currentTick
      })
    }
  })
)

let dataReciverCallBack = {}
dataConn.socket.on( "message",  Meteor.bindEnvironment(( msg, rinfo )=> {

    console.log('receive packet')
    console.log(msg.toString())
    let _pkt = JSON.parse(msg)

    dataReciver.insert({
      type:'none',
      address : rinfo.address,
      data : msg.toString(),
      at : new Date()
    })




    let _cb = dataReciverCallBack[_pkt.id]

    if( typeof _cb === 'function' ) {
      _cb({
        packet : _pkt
      })
    }


  })
)



Meteor.publish("udp/bcDetect", function() {

  return dc_bcDetect.find({'pkt.type' : 'bc'} )

  // console.log("publish udp/bcDetect")
  //
  // let deviceList = {}
  //
  // let _id = Random.id()
  // this.added('dc_bcDetect', _id,  deviceList)
  //
  // bcConn.socket.removeAllListeners("message")
  //
  // bcConn.socket.on( "message", ( msg, rinfo )=> {
  //   //console.log(rinfo)
  //
  //   let _pkt = JSON.parse(msg)
  //   //console.log( _pkt)
  //
  //   let _address = rinfo.address
  //   // let _address = rinfo.address.split('.')
  //   //
  //   // deviceList[_address[0]+_address[1]+_address[2]+_address[3]] = {
  //   //   ip : rinfo.address,
  //   //   timeStep: new Date(),
  //   //   cid : _pkt.cid
  //   // }
  //   //
  //   // // console.log(deviceList)
  //
  //   this.changed('dc_bcDetect', _id,  {
  //     address : _address,
  //     pkt : _pkt,
  //     at : (new Date()).getTime()
  //   })
  //
  // })
  //
  // this.ready()

});


// let dataReciverCallBack = {}
Meteor.publish("udp/dataReciver", function() {
  return dataReciver.find({})

  // let _id = Random.id()
  // this.added('dataReciver', _id,  {})
  //
  // console.log("publish udp/dataReciver add id " + _id)
  //
  // dataConn.socket.removeAllListeners("message")
  //
  // dataConn.socket.on( "message", ( msg, rinfo )=> {
  //
  //   console.log('receive packet')
  //   console.log(msg.toString())
  //
  //   let _pkt = JSON.parse(msg)
  //
  //   let _cb = dataReciverCallBack[_pkt.id]
  //
  //   if( typeof _cb === 'function' ) {
  //     _cb({
  //       packet : _pkt,
  //       collection_id : _id,
  //       publishObj : this
  //     })
  //   }
  //
  //
  // })
  //
  // this.ready()

})

Meteor.methods({
  "udp/sendDataTo"({ip,pkt}) {

    dataConn.socket.send(Buffer.from(JSON.stringify(pkt)),dataConn.port,ip)

    return {err:false}

  },
  "udp/remoteFile/read"({ip,filename}) {

    let _fsm = 0
    let _next = true
    let _startWaitTick = (new Date()).getTime()

    let buffer = ""

    //이전 데이터 지우기
    dataReciver.remove({type:'loadok'})


    let _loop = ()=> {

      switch(_fsm) {
        case 0:
          _fsm = 10
          break;
        case 10:
        {
          let callback_id = Random.id()
          let _code = "do " +
            `print('start read ${filename}')` +
            `local _r = file.open('${filename}') ` +
            "if _r then _r=1 else _r=0 end " +
            "local rt={ r=_r, " +
            "id=\"" + callback_id +
            "\"} " +
            "udp_safe_sender( " +
            "sjson.encode( rt)," +
            dataConn.port +"," +
            "\"" + ipHepler.address() + "\"" +
            ") " +
            "end"

          console.log(_code)

          let _pkt = {
            cmd :"eval",
            code : _code// "file.open('config.json') print(file.read()) file.close()"
          }


          dataConn.socket.send(Buffer.from(JSON.stringify(_pkt)),dataConn.port,ip)

          dataReciverCallBack[callback_id] = ({packet,publishObj,collection_id})=> {

            //처리 후 지우기
            delete dataReciverCallBack[callback_id]
            // console.log(packet)

            if(packet.r) {
               _fsm = 20 //읽기
            }

            // _next = false

          }

          _fsm = 100;
        }
          break;
        case 20:
        {
          let callback_id = Random.id()
          let _code = "do " +
            `local _d = file.read(64) ` +
            `local rt={id="${callback_id}"} ` +
            `if _d ~= nil then rt.r= encoder.toBase64( _d) end ` +
            `udp_safe_sender( sjson.encode(rt),${dataConn.port},"${ipHepler.address()}" ) ` +
            `end`

          // console.log(_code)

          let _pkt = {
            cmd :"eval",
            code : _code
          }
          dataConn.socket.send(Buffer.from(JSON.stringify(_pkt)),dataConn.port,ip)

          dataReciverCallBack[callback_id] = ({packet,publishObj,collection_id})=> {

            //처리 후 지우기
            delete dataReciverCallBack[callback_id]

            if(packet.r) {
              var buf = Buffer.from(packet.r , 'base64');
              // console.log(packet.r )
              // console.log(buf.toString() )
              buffer += buf
              _fsm = 20

            }
            else {
              console.log('end of file')
              _fsm = 30
            }

          }
          _fsm = 100

        }
          break;
        case 30:
        {
          let callback_id = Random.id()
          let _rcode = {
            r : "load",
            p1 : filename
          }
          let _code = "do " +
            `file.close()` +
            `local rt={id="${callback_id}",r=1} ` +
            `udp_safe_sender( sjson.encode(rt),${dataConn.port},"${ipHepler.address()}") ` +
            `uart.write(0,  [[${JSON.stringify(_rcode)}]] ) ` +
            `end `
          // console.log(_code)

          let _pkt = {
            cmd :"eval",
            code : _code
          }
          dataConn.socket.send(Buffer.from(JSON.stringify(_pkt)),dataConn.port,ip)

          dataReciverCallBack[callback_id] = ({packet})=> {

            //처리 후 지우기
            delete dataReciverCallBack[callback_id]

            // console.log('send to : ' + collection_id)
            // publishObj.changed('dataReciver',collection_id,{
            //   buf : buffer
            // })
            // console.log(buffer)

            dataReciver.insert({
              address : ip,
              type:'loadok',
              data : buffer,
              at : new Date()
            })

            if(packet.r) {
              _next = false;
            }



          }
          _fsm = 100

        }
          break;
        case 100:
          _startWaitTick = (new Date()).getTime()
          _fsm = 101
          //wait
          break;
        case 101:
          if((new Date()).getTime() - _startWaitTick > 3000 ) {
            console.log('time out')
            _next = false;
          }
          break;
      }

      if(_next) Meteor.setTimeout(_loop,100)
      else {
        console.log('load complete')
      }

    }

    _loop()

    return {err:false}
  },
  "udp/remoteFile/write"({ip,filename,buff}) {

    let _fsm = 0
    let _next = true
    let _startWaitTick = (new Date()).getTime()

    let _startIndex = 0
    let _writeLength = 64

    dataReciver.remove({type:'saveok'})


    let _loop = ()=> {

      switch(_fsm) {
        case 0:
          _fsm = 10
          break;
        case 10:
        {
          let callback_id = Random.id()
          let _code = "do " +
            `local _r = file.open("${filename}","w") ` +
            "if _r then _r=1 else _r=0 end " +
            `local rt={ r=_r, id="${callback_id}" } ` +
            `udp_safe_sender( sjson.encode( rt), ${dataConn.port},"${ipHepler.address()}") ` +
            "end"

          let _pkt = {
            cmd :"eval",
            code : _code// "file.open('config.json') print(file.read()) file.close()"
          }

          dataConn.socket.send(Buffer.from(JSON.stringify(_pkt)),dataConn.port,ip)

          dataReciverCallBack[callback_id] = ({packet,publishObj,collection_id})=> {

            //처리 후 지우기
            delete dataReciverCallBack[callback_id]

            if(packet.r) {
              _fsm = 20

            }

          }

          _fsm = 100;
        }
          break;
        case 20:
        {
          let callback_id = Random.id()
          let _buf = Buffer.from(buff.substr(_startIndex,_writeLength)).toString('base64')


          if(_buf.length <= 0) {
            console.log('end of buf')
            _fsm = 30
          }
          else {
            _startIndex += _writeLength
            let _code = "do " +
              `file.write( encoder.fromBase64 ( [[${_buf}]] ) ) ` +
              `local rt={id="${callback_id}"} ` +
              `udp_safe_sender( sjson.encode(rt),${dataConn.port},"${ipHepler.address()}" ) ` +
              `end`

            let _pkt = {
              cmd :"eval",
              code : _code
            }
            dataConn.socket.send(Buffer.from(JSON.stringify(_pkt)),dataConn.port,ip)

            dataReciverCallBack[callback_id] = ({packet,publishObj,collection_id})=> {

              console.log(packet)

              //처리 후 지우기
              delete dataReciverCallBack[callback_id]
              _fsm = 20
            }
            _fsm = 100
          }

        }
          break;
        case 30:
        {
          let callback_id = Random.id()
          let _rcode = {
            r : "save",
            p1 : filename
          }
          let _code = "do " +
            `file.close()` +
            `local rt={id="${callback_id}",r=1} ` +
            `udp_safe_sender( sjson.encode(rt),${dataConn.port},"${ipHepler.address()}") ` +
            `uart.write(0,  [[${JSON.stringify(_rcode)}]] ) ` +
            `end `
          // console.log(_code)

          let _pkt = {
            cmd :"eval",
            code : _code
          }
          dataConn.socket.send(Buffer.from(JSON.stringify(_pkt)),dataConn.port,ip)

          dataReciverCallBack[callback_id] = ({packet,publishObj,collection_id})=> {

            //처리 후 지우기
            delete dataReciverCallBack[callback_id]

            dataReciver.insert({
              type:'saveok',
              msg : 'ok'
            })
            // publishObj.changed('dataReciver',collection_id,{
            //   type : 'msg',
            //   buf : 'save ok'
            // })

            if(packet.r) {
              _next = false;
            }

          }
          _fsm = 100

        }
          break;
        case 100:
          _startWaitTick = (new Date()).getTime()
          _fsm = 101
          //wait
          break;
        case 101:
          if((new Date()).getTime() - _startWaitTick > 3000 ) {
            console.log('time out')
            dataReciver.insert({
              type:'saveok',
              msg : 'timeout'
            })
            _next = false;
          }
          break;
      }

      if(_next) Meteor.setTimeout(_loop,100)
      else {
        console.log('save complete')
      }

    }

    _loop()

    return {err:false}

  },
  "db/clearAll"() {
    dataReciver.remove({})
    dc_bcDetect.remove({})
  },
  "etc/getReturnIp"() {
    return {
      err:false,
      ip:ipHepler.address()
    }
  }

})



console.log('udp network module ready! ',ipHepler.address())

