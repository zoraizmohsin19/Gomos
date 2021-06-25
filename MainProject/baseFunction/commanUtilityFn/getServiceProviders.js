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

exports.getServiceProviders =  function(db,NAMEOFSERVICE,logger,gConsole){
   return new Promise((resolve, reject)=> {
    db.collection("ServiceProviders")
    .find()
    .toArray(function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"ServiceProviders",'This IS Getting All ServiceProviders',``,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);

      }
      try{
          let dataFromServiceProvider = [];
        for (var i = 0; i < result.length; i++) {
            dataFromServiceProvider.push(result[i]);
        }
        resolve(dataFromServiceProvider);

        gomos.gomosLog(logger,gConsole,TRACE_PROD,"ServiceProvider - No. of ServiceProvider read from collection", dataFromServiceProvider.length);
      }
      catch(err){
        gomos.errorCustmHandler(NAMEOFSERVICE,"ServiceProvider",'This IS Getting All ServiceProvider Try Catch Error',``,err,ERROR_RUNTIME,ERROR_TRUE,EXIT_TRUE);
      }
    });
      
})
}