var express = require("express");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
var scheduleTemp = require("node-schedule");
var urlConn, dbName;
var dataFromDevices = [], dataFromAssets = [], dataFromSubCust = [], dataFromPayload = [];
var factSrvcSchedule;
var fs = require("fs");
var dateTime = require("node-datetime");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});
const  TRACE_PROD = 1
const TRACE_STAGE = 2;
const TRACE_TEST  = 3;
const TRACE_DEV   = 4;
const TRACE_DEBUG = 5;
var  gomos = require("../../commanFunction");

//method to update mqtt collection when particular data is taken from mqtt and inserted into fact.
function updateMQTT(objId, db,processedFlag ) {
  db.collection("MqttDump").updateOne(
    { _id: objId },
    { $set: { processed: processedFlag } },
    function (err, result) {
      if (err) {
        errorCustmHandler("updateMQTT",err);
        process.hasUncaughtExceptionCaptureCallback();
      }
      gomos.gomosLog(TRACE_TEST,"updateMQTT for _id", objId);
    }
  );
}

//global method to get All the devices data.
function getDevices() {
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        errorCustmHandler("getDevices",err);
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
      db.collection("Devices")
        .find()
        .toArray(function (err, result) {
          if (err) {
            errorCustmHandler("getDevices",err);
            process.hasUncaughtExceptionCaptureCallback();
          }
          try{
            for (var i = 0; i < result.length; i++) {
              dataFromDevices.push(result[i]);
            }
            gomos.gomosLog(TRACE_PROD,"getDevices - No. of devices read from collection", dataFromDevices.length);
          }
          catch(err){
            errorCustmHandler("getDevices",err);
          }
         
          connection.close();
        });
    }
  );
}

//global method to get All the Assets data.
function getAssets() {
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
      db.collection("Assets")
        .find()
        .toArray(function (err, result) {
          if (err) {
            errorCustmHandler("getAssets",err);
            process.hasUncaughtExceptionCaptureCallback();
          }
          try{
            for (var i = 0; i < result.length; i++) {
              dataFromAssets.push(result[i]);
            }
            gomos.gomosLog(TRACE_PROD,"getAssets - No. of assets read from collection", dataFromAssets.length);
          }
          catch(err){
            errorCustmHandler("getAssets",err);            
          }
         
          connection.close();
        });
    }
  );
}

//global method to get All the SubCustomers data.
function getSubCustomers() {
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        errorCustmHandler("getSubCustomers",err);            
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
      db.collection("SubCustomers")
        .find()
        .toArray(function (err, result) {
          if (err) {
            errorCustmHandler("getSubCustomers",err);
            process.hasUncaughtExceptionCaptureCallback();
          }
          try{
            for (var i = 0; i < result.length; i++) {
              dataFromSubCust.push(result[i]);
            }
            gomos.gomosLog(TRACE_PROD,"getSubCustomers - No. of subeCustomer read from collection", dataFromSubCust.length);
          }
          catch(err){
            errorCustmHandler("getSubCustomers",err);    
          }
          connection.close();
        });
    }
  );
}

//global method to get All the Payloads data.
function getPayloads() {
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        errorCustmHandler("getPayloads",err);  
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
      db.collection("Payloads")
        .find()
        .toArray(function (err, result) {
          if (err) {
            errorCustmHandler("getPayloads",err);  
            process.hasUncaughtExceptionCaptureCallback();
          }
          try{
            for (var i = 0; i < result.length; i++) {
              dataFromPayload.push(result[i]);
            }
            gomos.gomosLog(TRACE_PROD,"getPayload - No. of payload read from collection", dataFromPayload.length);
          }
          catch(err){
            errorCustmHandler("getPayloads",err);  
          }
          
          connection.close();
        });
      // db.on('close', () => { console.log('-> lost connection'); });
      // db.on('reconnect', () => { console.log('-> reconnected'); });
    }
  );
}

//method to look into mqtt collection to get the messages which is not yet processed
//and insert into fact collection and also update mqtt.
function processFactMessages() {
  var sec, min; sec = min = "";
  var time = factSrvcSchedule / 60;

  if ((time) < 1) {
    sec = "*/" + factSrvcSchedule + " ";
    min = "* ";
  }
  else if (time >= 1 && time < 59) {
    time = Math.round(time);  // round to nearest whole number
    min += "*/" + time + " ";
    sec = "";
  }
  else {
    gomos.gomosLog(TRACE_PROD,"Scheduling issues, Can not proceed : It can only support Seconds, Minutes up to 59",factSrvcSchedule);
    errorCustmHandler("processFactMessages","Scheduling issues, Can not proceed : It can only support Seconds, Minutes up to 59");  
    process.exit(0);
  }
  var schPattern = sec + min + "* * * *";

  //var tempSchedule = scheduleTemp.scheduleJob("*/30 * * * * *", function() {
  var tempSchedule = scheduleTemp.scheduleJob(schPattern, function () {
    gomos.gomosLog(TRACE_PROD,"Processing Started - Fact Messages");
    MongoClient.connect(
      urlConn,
      { useNewUrlParser: true },
      function (err, connection) {
        if (err) {
           errorCustmHandler("processFactMessages",err);  
          process.hasUncaughtExceptionCaptureCallback();
        }
        var db = connection.db(dbName);
        db.collection("MqttDump")
          .find({ processed: "N" }).limit( 100 )
          .toArray(function (err, result) {
            if (err) {
              errorCustmHandler("processFactMessages",err); 
              process.hasUncaughtExceptionCaptureCallback();
            }
            if (result.length > 0) {
              gomos.gomosLog(TRACE_PROD,"processFactMessages - No. of documents retrived",result.length);    
              var count = 0 ;
              for (this.index = 0; this.index < result.length; this.index++) {
                gomos.gomosLog(TRACE_PROD,"processFactMessages - going to process for",result[index].mac);
                var processedFlag; 
                var mac, createdTime,updatedTime, payloadId;          
                updatedTime = result[this.index].updatedTime;

               var id  = result[this.index]._id
               gomos.gomosLog(TRACE_DEBUG,"processFactMessages - going to process for index",this.index );
              var currentTime= new Date().toISOString();
                db.collection("MqttDump")
                .findOneAndUpdate(
                   {
                     $and: [
                     {_id: id},
                     {updatedTime:updatedTime}
                     ]
                   }, 
                   { $set: {
                       processed: "I",
                       updatedTime: currentTime
                   },
                 })
                 .then(function(result1) {
                  // db.collection("MqttDump").updateOne(
                  //   { _id: id },
                  //   { $set: { processed: "I" } },
                  //   function (err, result1) {
                  //     if (err) {
                  //       process.hasUncaughtExceptionCaptureCallback();
                  //     }
                      // console.log("Updated : "+ this.index + result.length);
                   
                //filtering data which are obtained from Payloads Collection to get the sensors names 
                //of particular mac.
               try{
                objId = result[count]._id;
                mac = result[count].mac;
                createdTime = result[count].createdTime;
                payloadId = result[count].payloadId;
                gomos.gomosLog(TRACE_DEBUG,"processFactMessages - going to process after updation for id, mac , payloadid and CreatedTime",objId+":"+mac+":"+payloadId+":"+createdTime );
                if (dataFromPayload.filter(item => item.mac == mac).length == 0 ) {
                  processedFlag = "E"
                  updateMQTT(objId, db, processedFlag);
                  gomos.gomosLog(TRACE_TEST,"Payloads Not Present : Please associate with - " , mac );
                }
                else {
                  var filetredPayloads = dataFromPayload.filter(item => item.mac == mac);
                  gomos.gomosLog(TRACE_DEBUG,"processFactMessages - dataFromPayload if mac present - "+ mac,filetredPayloads);
                  if (filetredPayloads.filter(item => item.payloadId == payloadId).length == 0  ) {
                    processedFlag = "E"
                    updateMQTT(objId, db, processedFlag);
                    gomos.gomosLog(TRACE_TEST,"Payloads Not Present : Please associate with", mac + ":" + payloadId );
            
                  }
                  else{
                    var sensorNms;
                    var indexOfPayLoad = filetredPayloads.findIndex(element => element.payloadId == payloadId);
                    sensorNms = filetredPayloads[indexOfPayLoad].sensors;
                    var processByFact = filetredPayloads[indexOfPayLoad].processByFact;
                    gomos.gomosLog(TRACE_DEBUG,"processFactMessages - filteredpayloads where payloadId matched "+ payloadId,sensorNms);          
                    if(processByFact !== "Y" || processByFact == undefined){
                      processedFlag = "IG"
                      updateMQTT(objId, db, processedFlag);
                      gomos.gomosLog(TRACE_TEST," Ignoring Payload - ProcessByFact Value", processByFact +":"+ mac + ":" + payloadId);
                    }
                    else if(processByFact == "Y"){
                   
                    //filtering data which are obtained from Devices Collection to get the assetId 
                    //of particular mac.
                    if (dataFromDevices.filter(item => item.mac == mac).length == 0) {
                      processedFlag = "E";
                      updateMQTT(objId, db, processedFlag);
                      gomos.gomosLog(TRACE_TEST,"Device Not Present : Please add a Device for - " , mac);
                    }
                    else {
                      var assetsId, DeviceName;
                      var indexOfDevice = dataFromDevices.findIndex(element => element.mac == mac);
                      assetsId = dataFromDevices[indexOfDevice].assetId;
                      DeviceName = dataFromDevices[indexOfDevice].DeviceName;
                      gomos.gomosLog(TRACE_DEBUG,"processFactMessages - dataFromDevices where mac is match ",mac+":"+assetsId+":"+DeviceName); 
                      //filtering data which are obtained from Assets Collection to get the subCustomerCd 
                      //of particular assetId.
                      if (dataFromAssets.filter(item => item.assetId == assetsId).length == 0) {
                        processedFlag = "E";
                        updateMQTT(objId, db, processedFlag);
                        gomos.gomosLog(TRACE_TEST,"Assets Not Present for mac ", mac +":"+ assetsId);
                      }
                      else {
                        var sensorKeys, msgFactsKeys,subCustCd, custCd, spCd, objId;
                        var indexOfAsset = dataFromAssets.findIndex(
                          element => element.assetId == assetsId
                        );
                        subCustCd = dataFromAssets[indexOfAsset].subCustCd;
                        gomos.gomosLog(TRACE_DEBUG,"processFactMessages - dataFromAssets where assetsId is match for subCustCd ",assetsId+":"+subCustCd);                           
                        //filtering data which are obtained from SubCustomer Collection to get the customerCd
                        //and serviceProviderCd of particular subCustomerCd.
                        if (dataFromSubCust.filter(item => item.subCustCd == subCustCd).length == 0) {
                        processedFlag = "E"; 
                        updateMQTT(objId, db, processedFlag);                         
                        gomos.gomosLog(TRACE_TEST,"SubCustomers Not Present for mac ", mac +":"+ subCustCd);
                        }
                        else {
                          var indexOfSubCust = dataFromSubCust.findIndex(
                            element => element.subCustCd == subCustCd
                          );
                          custCd = dataFromSubCust[indexOfSubCust].custCd;
                          spCd = dataFromSubCust[indexOfSubCust].spCd;
                          gomos.gomosLog(TRACE_DEBUG,"processFactMessages - dataFromSubCust where subCustCd is match for custCd and spCd ",custCd+":"+spCd);                          
                          //if (sensorNms && assetsId && subCustCd && custCd && spCd) {
                          if (sensorNms != undefined && assetsId != undefined && subCustCd != undefined &&
                            custCd != undefined && spCd != undefined) {
                            gomos.gomosLog(TRACE_DEBUG,"processFactMessages -  where all conditions  passed sensorNms,assetsId,subCustCd,custCd,spCd",sensorNms+":"+assetsId+":"+subCustCd+":"+custCd+":"+spCd); 
                            sensorKeys = Object.keys(sensorNms); //conatins only the sensor names.
                            msgFactsKeys = Object.keys(result[count]);//contains all the keys of the particular msg
                            // objId = result[index]._id;
                            gomos.gomosLog(TRACE_DEBUG,"processFactMessages -  where msgFactsKeys and sensorsNms values",sensorKeys+":"+msgFactsKeys);                             
                            //if the msg pattern changes wven these keys also changes,so it has to be manually inserted
                            // when ever there is change in the msg pattern.
                            keysToRemove = ["payloadId", "mac", "createdTime","updatedTime","_id", "processed"];

                            //except the business names related keys all other keys has to be removed from the 
                            //msgFactskeys,which is further used for mapping with payload business names.
                            for (var i = 0; i < keysToRemove.length; i++) {
                              if (msgFactsKeys.includes(keysToRemove[i])) {
                                msgFactsKeys.splice(msgFactsKeys.indexOf(keysToRemove[i]), 1);
                              }
                            }
                            var finalSensors = {},dataToInsert;

                            //mapping of msgFactskeys with their corresponding business names which we get from payloads.
                            for (var k = 0; k < sensorKeys.length; k++) {
                              var sensorName = sensorKeys[k]; var businessNmValue = {};
                              // Key comparisons and value replacements are done here
                              for (var j = 0; j < msgFactsKeys.length; j++) {
                                if (sensorNms[sensorKeys[k]][msgFactsKeys[j]]) {
                                  var businessNm = sensorNms[sensorKeys[k]][msgFactsKeys[j]];
                                  var businessValue = result[count][msgFactsKeys[j]];
                                  businessNmValue[businessNm] = businessValue;
                                }
                              }
                              finalSensors[sensorName] = businessNmValue;
                            }
                            gomos.gomosLog(TRACE_DEBUG,"processFactMessages -  where Transeleted message ",finalSensors);
                            //modified msg to be inserted MsgFacts collection.
                            dataToInsert = {
                              payloadId: payloadId,
                              mac: mac,
                              DeviceName: DeviceName,
                              subCustCd: subCustCd,
                              custCd: custCd,
                              spCd: spCd,
                              sensors: finalSensors,
                              createdTime: createdTime,
                              updatedTime: updatedTime
                            };
                            gomos.gomosLog(TRACE_DEBUG,"processFactMessages -  where dataToInsert ready ",dataToInsert);
                            db.collection("MsgFacts").insertOne(dataToInsert, function (
                              err,
                              result) {
                              if (err) {
                                errorCustmHandler("processFactMessages",err);  
                                process.hasUncaughtExceptionCaptureCallback();
                              }
                              gomos.gomosLog(TRACE_TEST,"Inserted : IN MsgFacts",mac +":"+payloadId +":"+ createdTime);
                            });
                            //Update processed flag in 'MqttDump'
                            // updateMQTT(objId, db);
                            processedFlag = "Y"
                            updateMQTT(objId, db, processedFlag);
                          }
                          else{
                            processedFlag = "E";  
                            updateMQTT(objId, db, processedFlag);
                            gomos.gomosLog(TRACE_TEST,"Something is missing for this record - ",
                            "sensors : " + sensorNms + "assets : " + assetsId + "subcust : " + subCustCd + "cust : " + custCd 
                            + "SP : " + spCd);
                          }
                        }
                      }
                    }
                  }
                }
              }
               }
               catch(err){
              errorCustmHandler("processFactMessages",err);  

               }    
                  count++;
                });
                 // Refreshing the collections for the next run
                  // console.log("hello")
                  // if(this.index == result.length-1){
                  //   getServiceConfig();
                  //   getDevices();
                  //   getAssets();
                  //   getSubCustomers();
                  //   getPayloads();
                  //   console.log("Refreshed the collections for the next run!")
                  //   console.log("Processing Ended - Fact Messages - " + new Date());
                  // }
              }
            }
          });
        }
      );
    });
}

function getServiceConfig() {
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        errorCustmHandler("getServiceConfig",err);  
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
      db.collection("ServiceSchedules")
        .find()
        .toArray(function (err, result) {
          if (err) {
        errorCustmHandler("getServiceConfig",err);  
            process.hasUncaughtExceptionCaptureCallback();
          }
          if (result.length > 0) {
            try{
              var keys = Object.keys(result[0]);
              if (keys.includes("factSrvc")) {
                factSrvcSchedule = result[0]["factSrvc"];
                gomos.gomosLog(TRACE_PROD,"ServiceConfig freq. of Fact srvcs",factSrvcSchedule); 
              }
            }
            catch(err){
              errorCustmHandler("getServiceConfig",err);
            }
           
          }
          connection.close();
        });
    }
  );
}
var dt = dateTime.create();
var formattedDate = dt.format("Y-m-d");
function errorCustmHandler(functionName,typeofError){
  // console.log(typeofError);
    let writeStream = fs.createWriteStream("../commanError-" + formattedDate + ".log", { flags: "a" });
    var dateTime = new Date().toISOString();
  // write some data with a base64 encoding
  writeStream.write(
    "DateTime: " +dateTime+ "\n"+  
    "Error handler: " + "\n"+
    "serviceName:"+ "FactsService"+"\n"+
    "functionName:"+ functionName +"\n"+
    // "lineNo: " + lineNo  +"\n"+
    "Error Code:" + typeofError.statusCode +"\n"+
    " Error: " + typeofError + "\n"+
    "typeofError.stack"+ typeofError.stack +
    "\n"
  );
  
  // the finish event is emitted when all data has been flushed from the stream
  writeStream.on('finish', () => {  
    gomos.gomosLog(TRACE_TEST,'wrote all data to file');
  });
  
  // close the stream
  writeStream.end();
  
  }


var factTempInv = null;
module.exports = function (app) {
  //const router = express.Router()
  
  urlConn = app.locals.urlConn;
  dbName = app.locals.dbName;
  // gomos =app.locals;
  // gomos.gomosLog(TRACE_DEBUG,urlConn);
  setTimeout(function () {
    factTempInv = app;
    getServiceConfig();
    getDevices();
    getAssets();
    getSubCustomers();
    getPayloads();
  
    //gomos.gomosLog(TRACE_TEST,"hello TAkreem", {name: "some"});
    
     
    
    setTimeout(function () {
      processFactMessages();
    }, 2000);
  }, 100);
};
