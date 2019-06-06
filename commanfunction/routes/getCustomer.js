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

exports.getCustomers =  function(db,NAMEOFSERVICE,logger,gConsole){
   return new Promise((resolve, reject)=> {
    db.collection("Customers")
    .find()
    .toArray(function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"Customers",'This IS Getting All Customer',``,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);

      }
      try{
          let dataFromCustomer = [];
        for (var i = 0; i < result.length; i++) {
            dataFromCustomer.push(result[i]);
        }
        resolve(dataFromCustomer);

        gomos.gomosLog(logger,gConsole,TRACE_PROD,"Customers - No. of subeCustomer read from collection", dataFromCustomer.length);
      }
      catch(err){
        gomos.errorCustmHandler(NAMEOFSERVICE,"Customers",'This IS Getting All Custmoer Try Catch Erroe',``,err,ERROR_RUNTIME,ERROR_TRUE,EXIT_TRUE);
      }
    });
      
})
}