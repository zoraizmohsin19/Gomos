// 'use strict';
const  TRACE_PROD = 1
const TRACE_STAGE = 2;
const TRACE_TEST  = 3;
const TRACE_DEV   = 4;
const TRACE_DEBUG = 5;
var  gomos = require("./commanFunction");

exports.getSubCustomers =  function(db,NAMEOFSERVICE){
   return new Promise((resolve, reject)=> {
    db.collection("SubCustomers")
    .find()
    .toArray(function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"getSubCustomers","This IS Getting All SubCustmoer","",err);
        process.hasUncaughtExceptionCaptureCallback();
      }
      try{
          let dataFromSubCust = [];
        for (var i = 0; i < result.length; i++) {
          dataFromSubCust.push(result[i]);
        }
        resolve(dataFromSubCust);

        gomos.gomosLog(TRACE_PROD,"getSubCustomers - No. of subeCustomer read from collection", dataFromSubCust.length);
      }
      catch(err){
        gomos.errorCustmHandler(NAMEOFSERVICE,"getSubCustomers","This is Try catch Of getting All Sub Custmoer",err);    
      }
    });
      
})
}