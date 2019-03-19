import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

import '../lib/collections'

let returnIp = new ReactiveVar('')

Template.index.onCreated(function helloOnCreated() {

  this.subscribe('udp/bcDetect')
  this.subscribe('udp/dataReciver')

  Meteor.call("etc/getReturnIp",(e,_)=> {
    console.log(_)

    returnIp.set(_.ip)

  })

});

Template.index.helpers({
  "getReturnIp"() {
    return returnIp.get()
  },
  "dataRecv"() {
    return dataReciver.find({type:'none'},{
      sort : {at:-1},
      limit : 5
    })
  },
  "deviceList"() {
    return dc_bcDetect.find({})
    //return ['a','b']
  },
  "getLoadOk"() {
    return dataReciver.findOne({type:"loadok"})
  }
}

);

Template.index.events({
  'click [name="command-line-tool"] button[name="run"]'(event, instance) {

    let _ip = instance.find('[name="connection-info"] input[name="ip"]').value
    let _cmd = instance.find('[name="command-line-tool"] input[name="code"]').value


    Meteor.call('udp/sendDataTo',
      {
        ip : _ip,
        pkt : {
          cmd :"eval",
          code : `do ${_cmd} udp_safe_sender('{"r":"ok","d":"${btoa(_cmd)}"}', 2012,"${returnIp.get()}") end`
        }
      }
    )

  },
  'click [name="broadcast-list"] li'(event, instance) {

    // console.log(this._id)
    let _cd = dc_bcDetect.findOne({_id : this._id})
    instance.find('[name="connection-info"] input[name="ip"]').value = _cd.address


  },
  ///-------------- file ui
  'click [name="file-ui"] button[name="load"]'(event,instance) {
    Meteor.call("udp/remoteFile/read",{
      ip: instance.find('[name="connection-info"] input[name="ip"]').value,
      filename:instance.find('input[name="filename"]').value
    },function (err,result) {
      console.log(result)
    })
  },
  'click [name="file-ui"] button[name="save"]'(event,instance) {
    Meteor.call("udp/remoteFile/write",{
      ip: instance.find('[name="connection-info"] input[name="ip"]').value,
      filename: instance.find('input[name="filename"]').value,
      buff : instance.find('[name="file-ui"] textarea[name="code"]').value
    })
  },
  ///-------------- etc
  'click [name="etc-ui"] button[name="reset-db"]'(event, instance) {

    Meteor.call('db/clearAll')

  },
  'click button[name="test-1"]'(event, instance) {


  },
  'click button[name="test-2"]'(event, instance) {



  }
});
