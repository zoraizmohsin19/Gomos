// 'use strict';
const  TRACE_PROD = 1
const TRACE_STAGE = 2;
const TRACE_TEST  = 3;
const TRACE_DEV   = 4;
const TRACE_DEBUG = 5;
var  gomos = require("./commanFunction");

exports.getPayloads =  function(db,NAMEOFSERVICE,logger,gConsole){
   return new Promise((resolve, reject)=> {
    db.collection("Payloads")
    .find()
    .toArray(function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"getPayloads","This Is Getting All PayloadId","",err);  
        process.hasUncaughtExceptionCaptureCallback();
      }
      try{
          var dataFromPayload = [];
        for (var i = 0; i < result.length; i++) {
          dataFromPayload.push(result[i]);
        }
        resolve(dataFromPayload)
        gomos.gomosLog(logger,gConsole,TRACE_PROD,"getPayload - No. of payload read from collection", dataFromPayload.length);
      }
      catch(err){
        gomos.errorCustmHandler(NAMEOFSERVICE,"getPayloads","This Is Try Catch Of Getting All Payload","",err);  
      }
    });
      
})
}