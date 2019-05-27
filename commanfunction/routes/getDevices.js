// 'use strict';
const  TRACE_PROD = 1
const TRACE_STAGE = 2;
const TRACE_TEST  = 3;
const TRACE_DEV   = 4;
const TRACE_DEBUG = 5;
var  gomos = require("./commanFunction");

exports.getDevices =  function(db,NAMEOFSERVICE,logger,gConsole){
   return new Promise((resolve, reject)=> {
    db.collection("Devices")
    .find()
    .toArray(function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"getDevices","This Query All Device From Collection Error","",err);
        process.hasUncaughtExceptionCaptureCallback();
      }
      try{
          var dataFromDevices =[];
        for (var i = 0; i < result.length; i++) {
          dataFromDevices.push(result[i]);
        }
        resolve(dataFromDevices);
        gomos.gomosLog(logger,gConsole,TRACE_PROD,"getDevices - No. of devices a read from collection", dataFromDevices.length);
      }
      catch(err){
        gomos.errorCustmHandler(NAMEOFSERVICE,"getDevices","THis IS Error From Try Catch Some","",err);
      }
          
    } )
      
})
}