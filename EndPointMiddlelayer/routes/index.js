var express = require("express");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
const url = require("url");
const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
const Schema = mongoose.Schema;
const axios = require('axios');
var urlConn, dbName;
var fs = require("fs");
var dateTime = require("node-datetime");
const NAMEOFSERVICE = "ENDPOINTMIDDLELAYER";
const  TRACE_PROD = 1
const TRACE_STAGE = 2;
const TRACE_TEST  = 3;
const TRACE_DEV   = 4;
const TRACE_DEBUG = 5;
var  gomos = require("../../commanFunction/routes/commanFunction");
var dt = dateTime.create();
var formattedDate = dt.format('Y-m-d');
const output = fs.createWriteStream(`./midllelayerAPIStd${formattedDate}.log`, { flags: "a" });
const errorOutput = fs.createWriteStream(`./midllelayerAPIErr${formattedDate}.log`, { flags: "a" });
var logger = gomos.createConsole(output,errorOutput);
const SERVICE_VALUE = 1;
var gConsole = false;
if(process.argv[4] == SERVICE_VALUE ){
  gConsole = true;
}
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

//common method to give access permission to retrive data from database
function accessPermission(res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
}


router.post("/sendto", function (req, res, next) {

  accessPermission(res); 
  var body = req.body.body;
  var DeviceName = body.DeviceName;
  var payloadId =  body.payloadId;
  var subCustCd =  body.subCustCd;
  var custCd =  body.custCd;
  var Date =  body.Date;
 // var assetId = body.assetId;
  var message = body.message;
  gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"Post method hit by endpoint thier value"+ ":"+DeviceName+":"+payloadId+":"+subCustCd+":"+payloadId+":"+DeviceName+":"+custCd,message ); 
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"/sendto",'THIS IS MONGO CLIENT ERROR','',err);
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
      try{
      db.collection("SubCustomers")
      .find({subCustCd:subCustCd,custCd:custCd})
      .toArray(function (err,result){
        var SubCustomersValidation = '';
            if (result.length > 0) {  
            gomos.gomosLog( logger,gConsole,TRACE_TEST,"SubCustomers Validation  true ", result.length); 
              // db.collection("Assets")
              // .find({subCustCd:subCustCd})
              // .toArray(function (err,result){
              //   var SubCustomersValidation = '';
              // if (result.length > 0) {
            gomos.gomosLog( logger,gConsole,TRACE_TEST,"assetId Validation  true ", result.length); 
            db.collection("Devices")
            .find({DeviceName: DeviceName})
              .toArray(function (err, result) {
                if (err) {
                  // console.log(err);
                  gomos.errorCustmHandler(NAMEOFSERVICE,"/sendto",'THIS IS QUERY ERROR','',err)
                  process.hasUncaughtExceptionCaptureCallback();
                }
                try {
                  if (result.length > 0) { 
                    var mac = result[0].mac;
                    var assetId = result[0].assetId;
                  gomos.gomosLog( logger,gConsole,TRACE_TEST,"Devices Validation  true "+mac , result.length); 
                    db.collection("Payloads")
                    .find({mac: mac, payloadId: payloadId })
                      .toArray(function (err, result) {
                        if (err) {
                          gomos.errorCustmHandler(NAMEOFSERVICE,"/sendto",'THIS IS QUERY ERROR','',err)
                          process.hasUncaughtExceptionCaptureCallback();
                        }
                      //  console.log(result);
                      try {
                        if (result.length > 0) {
                        gomos.gomosLog( logger,gConsole,TRACE_TEST,"Payloads Validation  true "+payloadId, result.length); 
                          var sensorNms;
                          sensorNms = result[0].sensors;
                      if (sensorNms != undefined) {
                            gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"sensorNms Not Undefined",sensorNms); 
                            sensorKeys = Object.keys(sensorNms); //conatins only the sensor names.
                          var ConvertedSensors = {};

                          //mapping of msgClientkeys with their corresponding business names which we get from payloads.
                          for (var k = 0; k < sensorKeys.length; k++) {
                            var configNameValue = {};
                            var configName = Object.keys(sensorNms[sensorKeys[k]]);
                            var businessName = Object.values(sensorNms[sensorKeys[k]]);
                            for (var j = 0; j < configName.length; j++) {  
                              configNameValue[businessName[j]] = configName[j];
                            }
                            for (let [key, value] of Object.entries(configNameValue)) {  
      
                              ConvertedSensors[key] = value;
                            }
                            
                          }
                          gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"ConvertedSensors  sensors key value",ConvertedSensors); 
                          translateMethod(ConvertedSensors,message, DeviceName,payloadId,subCustCd, custCd, Date,db, res,mac,assetId);
                        }       
                      }
                      else{
                      errorUpdate(DeviceName,payloadId, subCustCd, custCd, Date, message , db,res,"Payload ["+payloadId+"] not Present");   
                    }
                      } catch (err) {
                        gomos.errorCustmHandler(NAMEOFSERVICE,"/sendto",'THIS IS TRY CATCH ERROR','',err)
                      }    
                });
                  
              }
              else{
              errorUpdate(DeviceName,payloadId, subCustCd, custCd, Date, message, db, res,"Device ["+DeviceName +"] not found !;");
              }
                } catch (err) {
                  gomos.errorCustmHandler(NAMEOFSERVICE,"/sendto",'THIS IS TRY CATCH ERROR','',err)
                }
        });
      }else{
        errorUpdate(DeviceName,payloadId, subCustCd, custCd, Date, message, db, res,"SubCustomer ["+subCustCd +"] not found !;");
      }
    });
  }catch(err){
    gomos.errorCustmHandler(NAMEOFSERVICE,"/sendto",'THIS IS TRY CATCH ERROR','',err)
  }
});
 
    
  });

  function translateMethod(ConvertedSensors,message, DeviceName,payloadId,subCustCd, custCd, Date,db, res,mac,assetId) {
      try {
        var finalSensors = {};
        finalSensors["payloadId"] = payloadId;
        var  msgClientKeys = Object.keys(message);
        var sensorsNotFound = '';
       
        for (var k = 0; k < msgClientKeys.length; k++) {
          var configNMValues = {};
          // Key comparisons and value replacements are done here
            if (ConvertedSensors[msgClientKeys[k]]) {
              var configNm = ConvertedSensors[msgClientKeys[k]];
              var businessValue = message[msgClientKeys[k]];
              configNMValues[configNm] = businessValue;
            }
          else{
            sensorsNotFound = sensorsNotFound + "Sensor ["+ msgClientKeys[k] + "] not found !; ";
          }
          for (let [key, value] of Object.entries(configNMValues)) {  
            finalSensors[key] = value;
          }
      }
      gomos.gomosLog( logger,gConsole,TRACE_TEST,"translateMeg key value",finalSensors);      
      if(sensorsNotFound.length == 0 ){
        successUpdate(DeviceName,payloadId,subCustCd, custCd,Date, message, finalSensors,res,db,"success",mac,assetId)
            }
        else{
          errorUpdate(DeviceName,payloadId, subCustCd, custCd, Date, message, db,res,assetId,sensorsNotFound);     
        }   
      } catch (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"translateMethod",'THIS IS TRY CATCH ERROR','',err)  
      }
}
function successUpdate(DeviceName,payloadId,subCustCd, custCd,DateTime, message, finalSensors,res,db,responseTosend,mac,assetId){
  var nowDateTime = new Date(new Date().toISOString())
  var dataToStore ={
    DeviceName: DeviceName,
    mac: mac,
    payloadId: payloadId,
    assetId: assetId,
    subCustCd: subCustCd,
    custCd: custCd,
    Date: DateTime,
    sourceMsg: message,
    translatedMsg: finalSensors,
    type: "level4",
    processed: "N",
    lasterrorString: '',
    lasterrorTime: '',
    numberOfAttempt: 0,
    createdTime: nowDateTime,
    updatedTime: nowDateTime
  }
  // console.log(dataToStore);
  
    db.collection("Alerts")
    .insertOne(dataToStore, function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"successUpdate",'THIS IS INSERTING ERROR','',err)
        process.hasUncaughtExceptionCaptureCallback();
      } else {
        gomos.gomosLog( logger,gConsole,TRACE_PROD,"Entry saved in Alert With Translated Msg Collection");
        res.json(responseTosend);

      }
    });
}


 function errorUpdate(DeviceName,payloadId ,subCustCd, custCd, DateTime, message, db,res,responseTosend){
  var nowDateTime =  new Date(new Date().toISOString())
              var dataToStore ={
                DeviceName: DeviceName,
                payloadId: payloadId,
                //assetId: assetId,
                subCustCd: subCustCd,
                custCd: custCd,
                Date: DateTime,
                sourceMsg: message,
                translatedMsg: {"key": "NA"},
                type: "level4",
                processed: "E",
                lasterrorString: '',
                lasterrorTime: '',
                numberOfAttempt: 0,
                createdTime: nowDateTime,
                updatedTime: nowDateTime
              
              }
              // console.log(dataToStore);
                db.collection("Alerts")
                .insertOne(dataToStore, function (err, result) {
                  if (err) {
                    gomos.errorCustmHandler(NAMEOFSERVICE,"successUpdate",'THIS IS INSERTING ERROR','',err)  
                    process.hasUncaughtExceptionCaptureCallback();
                  } else {
                    res.json(responseTosend);
                   }
                  });
}
module.exports = function (app) {
  //DB Name and the url for database connection is from appConfig file in app.js
  urlConn = app.locals.urlConn;
  dbName = app.locals.dbName;
 // gomos =app.locals;
  return router;
};
