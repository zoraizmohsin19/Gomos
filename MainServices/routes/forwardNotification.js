var express = require("express");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
const url = require("url");
var dateTime = require("node-datetime");
const mongoose = require("mongoose");
var scheduleTemp = require("node-schedule");
const axios = require('axios');
var fs = require("fs");
const querystring = require("querystring");
// var dateTime = require("node-datetime");
// var ObjectId = require('mongodb').ObjectID;
// const Schema = mongoose.Schema;
let gomosSchedule = require("../../commanFunction/routes/getServiceConfig");
let gomosDevices = require("../../commanFunction/routes/getDevices");
let gomosAssets = require("../../commanFunction/routes/getAssets");
let gomosSubCustCd = require("../../commanFunction/routes/getSubCustomers");
let gomosCustCd = require("../../commanFunction/routes/getCustomer");
let goomosPayloads = require("../../commanFunction/routes/getPayloads");
const NAMEOFSERVICE = "ForwardNotification";
const  TRACE_PROD = 1
const TRACE_STAGE = 2;
const TRACE_TEST  = 3;
const TRACE_DEV   = 4;
const TRACE_DEBUG = 5;
var  gomos = require("../../commanFunction/routes/commanFunction");
var mqtt = require("mqtt");
var dbo;

var urlConn, dbName;
var dataFromDevices = [], dataFromAssets = [],dataFromCustomer=[],dataFromPayload = [];
var fNSrvcSchedule;
//var gomos2 = require("../../commanFunction/routes/commanLogger");
var dt = dateTime.create();
var formattedDate = dt.format('Y-m-d');
const output = fs.createWriteStream(`./forwardNotifStd${formattedDate}.log`, { flags: "a" });
const errorOutput = fs.createWriteStream(`./forwardNotifStd${formattedDate}.log`, { flags: "a" });
var logger = gomos.createConsole(output,errorOutput);
const SERVICE_VALUE = 3;
var gConsole = false;

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});



//method to look into Alert collection to get the messages of Level3 which is not yet processed
//and Update into Alert collection.
function processStartEvent() {
  var sec, min; sec = min = "";
  var time = fNSrvcSchedule / 60;

  if ((time) < 1) {
    sec = "*/" + fNSrvcSchedule + " ";
    min = "* ";
  }
  else if (time >= 1 && time < 59) {
    time = Math.round(time);  // round to nearest whole number
    min += "*/" + time + " ";
    sec = "";
  }
  else {
    gomos.gomosLog( logger,gConsole,TRACE_PROD,"Scheduling issues, Can not proceed : It can only support Seconds, Minutes up to 59");
    gomos.errorCustmHandler(NAMEOFSERVICE,"processStartEvent","Scheduling issues, Can not proceed : It can only support Seconds, Minutes up to 59");               
    process.exit(0);
  }
  var schPattern = sec + min + "* * * *";
  var tempSchedule = scheduleTemp.scheduleJob(schPattern, function () {
    gomos.gomosLog( logger,gConsole,TRACE_PROD,"Processing Started - ForwardNotifiction Messages");
   
        dbo.collection("Alerts")
        .aggregate([
          {
            $match: {
              $and: [
                {$or : [{type: "level3"},{type: "level4"} ]},
                {processed: "N"},
              
              ]
          }
     }])
        .toArray(function (err, result) {
          if (err) {
            gomos.errorCustmHandler(NAMEOFSERVICE,"processStartEvent","THIS IS QUERY ERROR",'',err);            
            process.hasUncaughtExceptionCaptureCallback();
          }
          if(result.length > 0){
          // // // console.log(result.length);
        gomos.gomosLog( logger,gConsole,TRACE_PROD,"Processing Started - with No. of record going to process",result.length);
          var count = 0 ;
            for (var i = 0; i < result.length ; i++) {
              try {
                var id = result[i]._id;
                var resultTime =  result[i].updatedTime;
                 var currentTime= new Date(new Date().toISOString());
                 var mac = result[i].mac;
             dbo.collection("Alerts")
             .findOneAndUpdate(
                {
                  $and: [
                  {_id: id},
                  {updatedTime:resultTime}
                  ]
                }, 
                { $set: {
                    processed: "I",
                    updatedTime: currentTime
                },
              })
              .then(function(result1) {
                  if(result[count].type === "level3"){
                        gomos.gomosLog( logger,gConsole,TRACE_TEST,"Going to process For Level3",result[count]);
                        asyncPostData(dbo,result, count);
                  }
                  else if(result[count].type === "level4"){
                    gomos.gomosLog( logger,gConsole,TRACE_TEST,"Going to process For Level4",result[count]);
                    sendToDevice(result[count],dbo,mac);
                    
                  }
                   count++;
              })  
              } catch (err) {
                 gomos.errorCustmHandler(NAMEOFSERVICE,"processStartEvent",'THIS IS TRY CATCH ERROR','',err);            
                
              }

               
              // Refreshing the collections for the next run
            //       // // console.log("hello")
            // if(i == result.length - 1){
            //   getServiceConfig();
            //   getDevices();
            //   getAssets();
            //   getCustomer();
            //   getPayloads();
              
            //   // // console.log("Refreshed the collections for the next run!")
            //   // // console.log("Processing Ended - ForwardNotification Messages - " + new Date());
            // }
           }
          } 
        });
  });
}

function sendToDevice(data,dbo,mac){
  gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"Going to process in sendToDevice method with data",data);
  var custCd = data.custCd;
  var id = data._id;
  gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"Inside sendToDevice, about to process for Id :",id);
 var translatedMsg = data.translatedMsg;
 dbo.collection("Customers")
 .find({custCd})
   .toArray(function (err, result) {
     if (err) {
       gomos.errorCustmHandler(NAMEOFSERVICE,"sendToDevice",'THIS IS QUERY ERROR','',err);            
       process.hasUncaughtExceptionCaptureCallback();
     }
   
     if (result.length > 0) { 
       try{
        var mqttClient = result[0].mqttClient;
        var SubTopic = result[0].SubTopic;
        var topic = SubTopic+"/"+mac;
       gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"Going to process in sendToDevice method with topic and mac",topic+":"+mac);
        alertToDevice(topic,mqttClient,translatedMsg,dbo,id);
       }
       catch(err){
        gomos.errorCustmHandler(NAMEOFSERVICE,"sendToDevice",'THIS IS TRY CATCH ERROR','',err);     
       }
      
     }
    });

}
   //THIS IS ALERT SEND To device;
   function alertToDevice(SubTopic,mqttClient,Message,dbo, id){
       gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"Going to process in alertToDevice method with SubTopic,mqttClient and Message "+SubTopic+":"+mqttClient,Message);
      try{
          var MessageToSend = JSON.stringify(Message)
           var processedValue ="E";
           var client = mqtt.connect(mqttClient);
          client.on("error", function (){
            var lasterrorString = "broker connection error"
            updateAlertsForError(id, dbo,processedValue,lasterrorString)
          });
          client.on("offline", function (){
            var lasterrorString = "broker offline"
            updateAlertsForError(id, dbo,processedValue,lasterrorString)
          });
          client.publish(SubTopic, MessageToSend, function (err, result){
              if(err){
                 process.hasUncaughtExceptionCaptureCallback();
              }
              gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is Db for level 4",dbo);
                updateAlerts(id, dbo)

                });
              }catch(err){
                gomos.errorCustmHandler(NAMEOFSERVICE,"alertToDevice",'THIS IS TRY CATCH ERROR','',err);
              }
  }

 function asyncPostData(dbo,result1, i) {
  try {

    var id = result1[i]._id;
    var subCustCd = result1[i].subCustCd;
    var custCd = result1[i].custCd;
    var mac = result1[i].sourceMsg["mac"];
  
    var payloadId = result1[i].sourceMsg["payloadId"];
    var Date = result1[i].createdTime;
  gomos.gomosLog( logger,gConsole,TRACE_TEST,"Going to process in asyncPostData method with subCustCd,custCd,mac,payloadId  and Date",subCustCd+":"+custCd+":"+mac+":"+Date);
  var sendToClient;
  var translatedMsgkeys = Object.keys(result1[i].translatedMsg);
  gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"checking keys of object",translatedMsgkeys.length);
  gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"checking keys of object 2",translatedMsgkeys);
  
  if( translatedMsgkeys.length == 0 ){
 
  // if(result1[i].translatedMsg == undefined ){
  //filtering data which are obtained from Payloads Collection to get the sensors names 
  //of particular mac.
    gomos.gomosLog( logger,gConsole,TRACE_TEST,"Going to process in asyncPostData method with where translatedMsg undefined",result1[i]);  
  if (dataFromPayload.filter(item => item.mac == mac).length == 0) {
     gomos.gomosLog( logger,gConsole,TRACE_TEST,"Payloads Not Present : Please associate with - ",mac);  
     }
  else { 
    var filetredPayloads = dataFromPayload.filter(item => item.mac == mac);
    if (filetredPayloads.filter(item => item.payloadId == payloadId).length == 0) {
         gomos.gomosLog( logger,gConsole,TRACE_TEST,"Payloads Not Present : Please associate with  -  ",mac+ ":" + payloadId);  
    }
    else{
      var sensorNms;
      var indexOfPayLoad = filetredPayloads.findIndex(element => element.payloadId == payloadId);
      sensorNms = filetredPayloads[indexOfPayLoad].sensors;
      //filtering data which are obtained from Devices Collection to get the assetId 
      //of particular mac.
      if (dataFromDevices.filter(item => item.mac == mac).length == 0) {
        gomos.gomosLog( logger,gConsole,TRACE_TEST,"Device Not Present dataFromDevices : Please add a Device for - ",mac);  
      }
      else {
        var assetsId, DeviceName;
        var indexOfDevice = dataFromDevices.findIndex(element => element.mac == mac);
        assetsId = dataFromDevices[indexOfDevice].assetId;
        DeviceName = dataFromDevices[indexOfDevice].DeviceName;
  
        var indexOfCustomer = dataFromCustomer.findIndex(element => element.custCd == custCd);
        customerURL =  dataFromCustomer[indexOfCustomer].urlToSend;
      //  var userId = dataFromCustomer[indexOfCustomer].userId;
      //  var password = dataFromCustomer[indexOfCustomer].password;
              objId = result1[i]._id;
             if (sensorNms != undefined && assetsId != undefined && customerURL!= undefined) {
              sensorKeys = Object.keys(sensorNms); //conatins only the sensor names.
              msgSendKeys = Object.keys(result1[i].sourceMsg);//contains all the keys of the particular msg
              gomos.gomosLog( logger,gConsole,TRACE_TEST,"sensorNms,assetsId and customerURL Not undefined _id : ", objId);  
              //if the msg pattern changes wven these keys also changes,so it has to be manually inserted
              // when ever there is change in the msg pattern.
              keysToRemove = ["payloadId", "mac"];
              //except the business names related keys all other keys has to be removed from the 
              //msgSendkeys,which is further used for mapping with payload business names.
              for (var l = 0; l < keysToRemove.length; l++) {
                if (msgSendKeys.includes(keysToRemove[l])) {
                  msgSendKeys.splice(msgSendKeys.indexOf(keysToRemove[l]), 1);
                }
              }
              var finalSensors = {},dataToInsert;
              var ConvertedSensors = {};
              for (var k = 0; k < sensorKeys.length; k++) {
                var configNMValues = {};
                var configName = Object.keys(sensorNms[sensorKeys[k]]);
                var businessName = Object.values(sensorNms[sensorKeys[k]]);
                for (var j = 0; j < configName.length; j++) {  
                  configNMValues[configName[j]] = businessName[j];
                }
                for (let [key, value] of Object.entries(configNMValues)) {  
                  ConvertedSensors[key] = value;
                }
              }
              gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is ConvertedSensors value ", ConvertedSensors);  
              for (var k = 0; k < msgSendKeys.length; k++) {
                var businessNMValues = {};
                // Key comparisons and value replacements are done here
                  if (ConvertedSensors[msgSendKeys[k]]) {
                    var businessNm = ConvertedSensors[msgSendKeys[k]];
                    var businessValue = result1[i].sourceMsg[msgSendKeys[k]];
                    businessNMValues[businessNm] = businessValue;
                  }
                else{
                  businessNMValues[msgSendKeys[k]] = result1[i].sourceMsg[msgSendKeys[k]];
                }
                for (let [key, value] of Object.entries(businessNMValues)) {  
                  finalSensors[key] = value;
                }
            }
             gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is finalSensors value ", finalSensors);  
              //modified dataToSend send to client.
              sendToClient = {
                identifier: {
                  payloadId: payloadId,
                  DeviceName: DeviceName,
                  // assetsId: assetsId,
                  subCustCd: subCustCd,
                  custCd: custCd,
                  Date: Date,
                },
                message: finalSensors,
               
              };
              updateForTranslated(objId, dbo, finalSensors, DeviceName)
            }
            else{
              gomos.gomosLog( logger,gConsole,TRACE_TEST,"sensorNms || assetsId OR customerURL undefined _id : ", objId);  
            }
          }
    }
  }
}
  else{
    gomos.gomosLog( logger,gConsole,TRACE_TEST,"where translatedMsg present : ",result1[i]);  
    var assetsId, DeviceName;
    var indexOfDevice = dataFromDevices.findIndex(element => element.mac == mac);
    DeviceName = dataFromDevices[indexOfDevice].DeviceName;
    var indexOfCustomer = dataFromCustomer.findIndex(element => element.custCd == custCd);
    customerURL =  dataFromCustomer[indexOfCustomer].urlToSend;
    sendToClient = {
      identifier: {
        payloadId: payloadId,
        DeviceName: DeviceName,
        subCustCd: subCustCd,
        custCd: custCd,
        Date: Date,
      },
      message: result1[i].translatedMsg,
     
    };
    gomos.gomosLog( logger,gConsole,TRACE_TEST,"where sendToClient created : ",sendToClient);  
  }
  gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"where  sendToClientApi call before : ", 15 - result1[i].numberOfAttempt);  
 
  sendToClientApi(customerURL, sendToClient,id ,dbo, 15 - result1[i].numberOfAttempt);
  }
  
catch (err) {
    gomos.errorCustmHandler(NAMEOFSERVICE,"asyncPostData",'THIS IS TRY CATCH ERROR','',err);    
  }
}

async function sendToClientApi(customerURL, sendToClient,id , dbo, numTries){

  var sendToClient1 = JSON.stringify(sendToClient);
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
              for(var j = 1; j <= 3; j++ ){
                    try {
                      const response = await axios.post(customerURL, "sendToClient="+ sendToClient1, config);
                      // const response = await axios.post("http://35.244.42.97:8080/deviceRest/deviceReading", body ,header);
                      updateAlerts(id, dbo);
                       gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is response part of client http : "+response);  
                      break;
                        } catch(err) {
                           gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is response In error",err);  
                           gomos.errorCustmHandler(NAMEOFSERVICE,"alertToDevice",'THIS IS ERROR FROM API OF CUSTOMER',sendToClient1,err); 
                          if(numTries == j){
                            var processedValue ="E";
                            var lasterrorString = "Exceed number of Attempt"
                            updateAlertsForError(id, dbo,processedValue,lasterrorString);
                            break;
                          }else{
                     
                            gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is response In error j  value",j);  
                            var processedValue ="N";
                            var lasterrorString = "Client connection error"
                            updateAlertsForError(id, dbo,processedValue,lasterrorString);
                        }
                      }
             }
}

//method to update Alerts collection
function updateAlertsForError(objId, dbo,processedValue, lasterrorString) {
      // gomos.gomosLog( logger,gConsole,TRACE_TEST,"this is called ",objId);
      gomos.gomosLog( logger,gConsole,TRACE_TEST,"this is called ",dbo);
      //  var dateTime =  new Date().toISOString();

       dbo.collection("Alerts").updateOne(
        { _id: objId },
        { $set: { processed: processedValue,
          updatedTime:  new Date(new Date().toISOString()),
          lasterrorString: lasterrorString,
          lasterrorTime:   new Date(new Date().toISOString()) 
            },
            $inc: { numberOfAttempt: 1 } 
          },
        function (err, result) {
          if (err) {
            gomos.gomosLog( logger,gConsole,TRACE_TEST,"This is updating Alert Error",err);
            gomos.errorCustmHandler(NAMEOFSERVICE,"updateAlertsForError",'THIS IS UPDATETING ERROR','',err);     
            process.hasUncaughtExceptionCaptureCallback();
          }
          gomos.gomosLog( logger,gConsole,TRACE_TEST,"This is updateAlertsForError");  
        }
      );  
 }

//method to update Alerts collection
function updateAlerts(objId, dbo) {
  gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is Db for level 4 2",dbo);
  gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is objid for level 4 2",objId);

  dbo.collection("Alerts").updateOne(
    { _id: objId },
    { $set: { processed: "Y" ,
    updatedTime:  new Date(new Date().toISOString())},
    $inc: { numberOfAttempt: 1 } 
   },
    function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"updateAlerts",'THIS IS UPDATETING ERROR','',err);     
        process.hasUncaughtExceptionCaptureCallback();
      }
      gomos.gomosLog( logger,gConsole,TRACE_TEST,"This is updateAlerts");  
    }
  );
}
function updateForTranslated(objId, dbo, translatedMsg, DeviceName) {
  dbo.collection("Alerts").updateOne(
    { _id: objId },
    { $set: { translatedMsg: translatedMsg,DeviceName: DeviceName,
    updatedTime:  new Date(new Date().toISOString())
    } },
    function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"updateForTranslated",'THIS IS UPDATETING ERROR','',err);     
        process.hasUncaughtExceptionCaptureCallback();
      }
      gomos.gomosLog( logger,gConsole,TRACE_TEST,"This is updateForTranslated");  
    }
  );
}
async function getAllconfig() {
  fNSrvcSchedule = await gomosSchedule.getServiceConfig(
    dbo,
    NAMEOFSERVICE,
    "factSrvc",logger,gConsole
  );
  dataFromDevices = await gomosDevices.getDevices(dbo, NAMEOFSERVICE,logger,gConsole);
  dataFromAssets = await gomosAssets.getAssets(dbo, NAMEOFSERVICE,logger,gConsole);
  dataFromCustomer = await gomosCustCd.getCustomers(dbo, NAMEOFSERVICE,logger,gConsole);
  dataFromPayload = await goomosPayloads.getPayloads(dbo, NAMEOFSERVICE,logger,gConsole);
}

module.exports = function (app) {
  //DB Name and the url for database connection is from appConfig file in app.js
  urlConn = app.locals.urlConn;
  dbName = app.locals.dbName;
  if(process.argv[4] == SERVICE_VALUE ){
    gConsole = true;
  }
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
      gomos.errorCustmHandler(NAMEOFSERVICE,"processStartEvent",'THIS MONGO CLIENT ERROR','',err);            
        process.hasUncaughtExceptionCaptureCallback();
      }
       dbo = connection.db(dbName);
    })
  // gomos =app.locals;
  // getServiceConfig();s
  // getDevices();
  // getAssets();
  // getCustomer();
  // getPayloads();
  setTimeout(function() {
  
    getAllconfig();

    setTimeout(function () {
       processStartEvent();
    }, 2000);
  }, 2000);

   return router;
};

