// 'use strict';
const  TRACE_PROD = 1
const TRACE_STAGE = 2;
const TRACE_TEST  = 3;
const TRACE_DEV   = 4;
const TRACE_DEBUG = 5;
const ERROR_RUNTIME      = "runTimeError";
const ERROR_APPLICATION  =  "ApplicationError";
const ERROR_DATABASE     = "DataBaseError";
const EXIT_TRUE  = true;
const EXIT_FALSE = false;
const ERROR_TRUE = true;
const ERROR_FALSE = false;
var  gomos = require("./commanFunction");

exports.getDevices =  function(db,NAMEOFSERVICE,logger,gConsole){
   return new Promise((resolve, reject)=> {
    db.collection("Devices")
    .find()
    .toArray(function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"getDevices",'This Query All Device From Collection Error',``,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);

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
        gomos.errorCustmHandler(NAMEOFSERVICE,"getDevices",'This Query All Device From Collection Try Catch Error',``,err,ERROR_RUNTIME,ERROR_TRUE,EXIT_TRUE);
      }
          
    } )
      
})
}