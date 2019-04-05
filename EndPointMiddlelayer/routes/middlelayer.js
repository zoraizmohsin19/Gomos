var express = require("express");

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



//common method to give access permission to retrive data from database
function accessPermission(res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
}



  function translateMethod(ConvertedSensors,message, DeviceName,payloadId,subCustCd, custCd, Date,db, res,mac,assetId,token) {
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
      gomos.gomosLog(TRACE_TEST,"translateMeg key value",finalSensors);      
      if(sensorsNotFound.length == 0 ){
      
        if( token != undefined && token.length != 0){
          message["Token"] = token;
          finalSensors["Token"]= token;
        }
        successUpdate(DeviceName,payloadId,subCustCd, custCd,Date, message, finalSensors,res,db,"success",mac,assetId)
            }
        else{
          errorUpdate(DeviceName,payloadId, subCustCd, custCd, Date, message, db,res,assetId,sensorsNotFound);     
        }   
      } catch (err) {
        res.json("some Error is generated");
        gomos.errorCustmHandler(NAMEOFSERVICE,"translateMethod",'THIS IS TRY CATCH ERROR','',err);
      }
}
function successUpdate(DeviceName,payloadId,subCustCd, custCd,DateTime, message, finalSensors,res,db,responseTosend,mac,assetId){
  var nowDateTime =  new Date(new Date().toISOString())
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
        gomos.errorCustmHandler(NAMEOFSERVICE,"successUpdate",'THIS IS MONGOCLIENT ERROR','',err);

        process.hasUncaughtExceptionCaptureCallback();
      } else {
        gomos.gomosLog(TRACE_PROD,"Entry saved in Alert With Translated Msg Collection");
        res.json(responseTosend);

      }
    });
}
exports.endPointMiddelayerFn = function (urlConn,dbName,res,custCd,subCustCd,DeviceName,payloadId,Date,message,token){
    urlConn = urlConn;
    dbName = dbName;
  gomos.gomosLog(TRACE_DEBUG,"Post method hit by endpoint thier value"+ ":"+DeviceName+":"+payloadId+":"+subCustCd+":"+payloadId+":"+DeviceName+":"+custCd,message ); 
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"/sendto",'THIS IS MONGOCLIENT ERROR','',err);
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
      try{
      db.collection("SubCustomers")
      .find({subCustCd:subCustCd,custCd:custCd})
      .toArray(function (err,result){
        var SubCustomersValidation = '';
            if (result.length > 0) {  
            gomos.gomosLog(TRACE_TEST,"SubCustomers Validation  true ", result.length); 
              // db.collection("Assets")
              // .find({subCustCd:subCustCd})
              // .toArray(function (err,result){
              //   var SubCustomersValidation = '';
              // if (result.length > 0) {
            gomos.gomosLog(TRACE_TEST,"assetId Validation  true ", result.length); 
            db.collection("Devices")
            .find({DeviceName: DeviceName})
              .toArray(function (err, result) {
                if (err) {
                  // console.log(err);
                   gomos.errorCustmHandler(NAMEOFSERVICE,"/sendto",'THIS IS MONGOCLIENT ERROR','',err);
                  process.hasUncaughtExceptionCaptureCallback();
                }
                try {
                  if (result.length > 0) { 
                    var mac = result[0].mac;
                    var assetId = result[0].assetId;
                  gomos.gomosLog(TRACE_TEST,"Devices Validation  true "+mac , result.length); 
                    db.collection("Payloads")
                    .find({mac: mac, payloadId: payloadId })
                      .toArray(function (err, result) {
                        if (err) {
                          gomos.errorCustmHandler(NAMEOFSERVICE,"/sendto",'THIS IS MONGOCLIENT ERROR','',err);
                   
                          process.hasUncaughtExceptionCaptureCallback();
                        }
                      //  console.log(result);
                      try {
                        if (result.length > 0) {
                        gomos.gomosLog(TRACE_TEST,"Payloads Validation  true "+payloadId, result.length); 
                          var sensorNms;
                          sensorNms = result[0].sensors;
                      if (sensorNms != undefined) {
                            gomos.gomosLog(TRACE_DEBUG,"sensorNms Not Undefined",sensorNms); 
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
                          gomos.gomosLog(TRACE_DEBUG,"ConvertedSensors  sensors key value",ConvertedSensors); 
                          translateMethod(ConvertedSensors,message, DeviceName,payloadId,subCustCd, custCd, Date,db, res,mac,assetId,token);
                        }       
                      }
                      else{
                      errorUpdate(DeviceName,payloadId, subCustCd, custCd, Date, message , db,res,"Payload ["+payloadId+"] not Present");   
                    }
                      } catch (err) {
                   gomos.errorCustmHandler(NAMEOFSERVICE,"/sendto",'THIS IS TRY CATCH ERROR','',err);
                      }    
                });
                  
              }
              else{
              errorUpdate(DeviceName,payloadId, subCustCd, custCd, Date, message, db, res,"Device ["+DeviceName +"] not found !;");
              }
                } catch (err) {
                  gomos.errorCustmHandler(NAMEOFSERVICE,"/sendto",'THIS IS TRY CATCH ERROR','',err);          
                }
          // });
          // } 
          // else{
          //   errorUpdate(DeviceName,payloadId, subCustCd, custCd, Date, message, db, res,assetId,"AssetsId ["+assetId+"] not found !;");
          // }
        });
      }else{
        errorUpdate(DeviceName,payloadId, subCustCd, custCd, Date, message, db, res,"SubCustomer ["+subCustCd +"] not found !;");
      }
    });
  }catch(err){
    gomos.errorCustmHandler(NAMEOFSERVICE,"/sendto",'THIS IS TRY CATCH ERROR','',err);
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
                    gomos.errorCustmHandler(NAMEOFSERVICE,"successUpdate",'THIS IS TRY CATCH ERROR','',err);
                    process.hasUncaughtExceptionCaptureCallback();
                  } else {
                    res.json(responseTosend);
                   }
                  });
}