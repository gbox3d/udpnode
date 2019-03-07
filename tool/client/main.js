import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

import '../lib/collections'

let deviceList = new ReactiveVar([])

Template.index.onCreated(function helloOnCreated() {

  this.subscribe('udp/bcDetect')
  this.subscribe('udp/dataReciver')

  let cursor = dc_bcDetect.find({})

  console.log(cursor)

  cursor.observeChanges({

      added(id,fileds) {
        //서버쪽에서 추가하는 코드 : MsgLog.insert({text:'hello world'})
        console.log('observe add ' + id)
        console.log(fileds)
      },
      changed(id,fileds) {

        let _temp = []
        for(var key in fileds) {
          _temp.push( fileds[key] )
        }

        deviceList.set(_temp)

      },
      removed(id) {
        //MsgLog.remove({})
        // console.log('observe remove ' + id)
      }
  })

});

Template.index.helpers({
  "dataRecv"() {
    return dataReciver.findOne()
  },
  "deviceList"() {
    return deviceList.get()
    //return ['a','b']
  }
}

);

Template.index.events({
  'click button[name="test-1"]'(event, instance) {
    Meteor.call('udp/sendDataTo',
      {
        ip : "192.168.0.99",
        pkt : {
          cmd :"eval",
          code : "gpio.write(4,0)"
        }
      }
      )

  },
  'click button[name="test-2"]'(event, instance) {

    let _ip = instance.find('[name="connection-info"] input[name="ip"]').value
    Meteor.call('udp/sendDataTo',
      {
        ip : "192.168.0.99",
        pkt : {
          cmd :"eval",
          code : `print('hello') udp_safe_sender('ok', 2012,"${_ip}")`
        }
      }
    )

  },
  'click [name="command-line-tool"] button[name="run"]'(event, instance) {

    let _ip = instance.find('[name="connection-info"] input[name="ip"]').value
    let _cmd = instance.find('[name="command-line-tool"] input[name="code"]').value
    Meteor.call('udp/sendDataTo',
      {
        ip : "192.168.0.99",
        pkt : {
          cmd :"eval",
          code : `${_cmd} udp_safe_sender('ok', 2012,"${_ip}")`
        }
      }
    )

  },

  'click [name="file-ui"] button[name="load"]'(event,instance) {
    Meteor.call("udp/remoteFile/read",{
      ip: instance.find('[name="connection-info"] input[name="ip"]').value,
      filename:instance.find('input[name="filename"]').value
    })
  },
  'click [name="file-ui"] button[name="save"]'(event,instance) {
    Meteor.call("udp/remoteFile/write",{
      ip: instance.find('[name="connection-info"] input[name="ip"]').value,
      filename: instance.find('input[name="filename"]').value,
      buff : instance.find('[name="file-ui"] textarea[name="code"]').value
    })
  }
});
