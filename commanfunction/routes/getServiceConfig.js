// 'use strict';
const  TRACE_PROD = 1
const TRACE_STAGE = 2;
const TRACE_TEST  = 3;
const TRACE_DEV   = 4;
const TRACE_DEBUG = 5;
var  gomos = require("./commanFunction");

exports.getServiceConfig =  function(db,NAMEOFSERVICE,serviceKey,logger,gConsole){
   return new Promise((resolve, reject)=> {
          db.collection("ServiceSchedules")
            .find()
            .toArray(function (err, result) {
              if (err) {
            gomos.errorCustmHandler(NAMEOFSERVICE,"getServiceConfig","This Query Error","",err);  
                process.hasUncaughtExceptionCaptureCallback();
              }
              if (result.length > 0) {
                try{
                  var keys = Object.keys(result[0]);
                  if (keys.includes(serviceKey)) {
                    resolve(result[0][serviceKey]);
                    gomos.gomosLog(logger,gConsole,TRACE_PROD,"ServiceConfig freq. of Fact srvcs",result[0][serviceKey]); 
                  }
                }
                catch(err){
                  gomos.errorCustmHandler(NAMEOFSERVICE,"getServiceConfig","This is Try catch Error","",err);
                }
               
              }
            })
        })
}