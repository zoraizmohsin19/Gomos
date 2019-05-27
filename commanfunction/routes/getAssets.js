// 'use strict';
const  TRACE_PROD = 1
const TRACE_STAGE = 2;
const TRACE_TEST  = 3;
const TRACE_DEV   = 4;
const TRACE_DEBUG = 5;
var  gomos = require("./commanFunction");

exports.getAssets =  function(db,NAMEOFSERVICE,logger,gConsole){
   return new Promise((resolve, reject)=> {
    db.collection("Assets")
        .find()
        .toArray(function (err, result) {
          if (err) {
            gomos.errorCustmHandler(NAMEOFSERVICE,"getAssets","THis is Getting All Asset","",err);
            process.hasUncaughtExceptionCaptureCallback();
          }
          try{
              let dataFromAssets =[];
            for (var i = 0; i < result.length; i++) {
              dataFromAssets.push(result[i]);
            }
            resolve(dataFromAssets);
            gomos.gomosLog(logger,gConsole,TRACE_PROD,"getAssets - No. of assets read from collection", dataFromAssets.length);
          }
          catch(err){
            gomos.errorCustmHandler(NAMEOFSERVICE,"getAssets","This is generated From Try Catch error","",err);            
          }
        });
      
})
}