// 'use strict';
const  TRACE_PROD = 1
const TRACE_STAGE = 2;
const TRACE_TEST  = 3;
const TRACE_DEV   = 4;
const TRACE_DEBUG = 5;
var  gomos = require("./commanFunction");

exports.getCustomers =  function(db,NAMEOFSERVICE,logger,gConsole){
   return new Promise((resolve, reject)=> {
    db.collection("Customers")
    .find()
    .toArray(function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"Customers","This IS Getting All SubCustmoer","",err);
        process.hasUncaughtExceptionCaptureCallback();
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
        gomos.errorCustmHandler(NAMEOFSERVICE,"getSubCCustomersustomers","This is Try catch Of getting All Sub Custmoer",err);    
      }
    });
      
})
}