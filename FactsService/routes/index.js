var express = require("express");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
var scheduleTemp = require("node-schedule");
var urlConn, dbName;
var dataFromDevices = [], dataFromAssets = [], dataFromSubCust = [], dataFromPayload = [];
var factSrvcSchedule;
const uuidv4 = require('uuid/v4');
var dbo;
var fs = require("fs");
var dateTime = require("node-datetime");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});
const NAMEOFSERVICE = "factService"
const  TRACE_PROD = 1
const TRACE_STAGE = 2;
const TRACE_TEST  = 3;
const TRACE_DEV   = 4;
const TRACE_DEBUG = 5;
var  gomos          =   require("../../commanFunction/routes/commanFunction");
let gomosSchedule   =   require("../../commanFunction/routes/getServiceConfig");
let gomosDevices    =   require("../../commanFunction/routes/getDevices");
let gomosAssets     =   require("../../commanFunction/routes/getAssets");
let gomosSubCustCd  =   require("../../commanFunction/routes/getSubCustomers");
let goomosPayloads  =   require("../../commanFunction/routes/getPayloads");


//method to update mqtt collection when particular data is taken from mqtt and inserted into fact.
function updateMQTT(objId, db,processedFlag ) {
  db.collection("MqttDump").updateOne(
    { _id: objId },
    { $set: { processed: processedFlag } },
    function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"updateMQTT","This is Comman function Updatting Error",objId,err);
        process.hasUncaughtExceptionCaptureCallback();
      }
      gomos.gomosLog(TRACE_TEST,"updateMQTT for _id", objId);
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
    gomos.errorCustmHandler(NAMEOFSERVICE,"processFactMessages","Scheduling issues, Can not proceed : It can only support Seconds, Minutes up to 59");  
    process.exit(0);
  }
  var schPattern = sec + min + "* * * *";

  //var tempSchedule = scheduleTemp.scheduleJob("*/30 * * * * *", function() {
  var tempSchedule = scheduleTemp.scheduleJob(schPattern, function () {
    gomos.gomosLog(TRACE_PROD,"Processing Started - Fact Messages");
    // MongoClient.connect(
    //   urlConn,
    //   { useNewUrlParser: true },
    //   function (err, connection) {
    //     if (err) {
    //        gomos.errorCustmHandler(NAMEOFSERVICE,"processFactMessages","This Mongo Client  Error","",err);  
    //       process.hasUncaughtExceptionCaptureCallback();
    //     }
    //     var db = connection.db(dbName);
    dbo.collection("MqttDump")
          .find({ processed: "N" }).limit( 100 )
          .toArray(function (err, result) {
            if (err) {
              gomos.errorCustmHandler(NAMEOFSERVICE,"processFactMessages","This Finding Dump From Db","",err); 
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
              var currentTime = new Date(new Date().toISOString());
                dbo.collection("MqttDump")
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
                   
                //filtering data which are obtained from Payloads Collection to get the sensors names 
                //of particular mac.
               try{
                objId = result[count]._id;
                mac = result[count].mac;
                createdTime = result[count].createdTime;
                payloadId = result[count].payloadId;
             
                gomos.gomosLog(TRACE_DEV,"processFactMessages - going to process after updation for id, mac , payloadid and CreatedTime",objId+":"+mac+":"+payloadId+":"+createdTime );
                if (dataFromPayload.filter(item => item.mac == mac).length == 0 ) {
                  processedFlag = "E"
                  updateMQTT(objId, dbo, processedFlag);
                  gomos.gomosLog(TRACE_TEST,"Payloads Not Present : Please associate with - " , mac );
                }
                else {
                  var filetredPayloads = dataFromPayload.filter(item => item.mac == mac);
                  gomos.gomosLog(TRACE_DEBUG,"processFactMessages - dataFromPayload if mac present - "+ mac,filetredPayloads);
                  if (filetredPayloads.filter(item => item.payloadId == payloadId).length == 0  ) {
                    processedFlag = "E"
                    updateMQTT(objId, dbo, processedFlag);
                    gomos.gomosLog(TRACE_TEST,"Payloads Not Present : Please associate with", mac + ":" + payloadId );
            
                  }
                  else{
                    var sensorNms;
                    var indexOfPayLoad = filetredPayloads.findIndex(element => element.payloadId == payloadId);
                    sensorNms = filetredPayloads[indexOfPayLoad].sensors;
                    var processByFact = filetredPayloads[indexOfPayLoad].processByFact;
                    var payloadData = filetredPayloads[indexOfPayLoad];
                    gomos.gomosLog(TRACE_DEBUG,"processFactMessages - filteredpayloads where payloadId matched "+ payloadId,sensorNms);          
                    if(processByFact !== "Y" || processByFact == undefined){
                      processedFlag = "IG"
                      updateMQTT(objId, dbo, processedFlag);
                      gomos.gomosLog(TRACE_TEST," Ignoring Payload - ProcessByFact Value", processByFact +":"+ mac + ":" + payloadId);
                    }
                    else if(processByFact == "Y"){
                   
                    //filtering data which are obtained from Devices Collection to get the assetId 
                    //of particular mac.
                    if (dataFromDevices.filter(item => item.mac == mac).length == 0) {
                      processedFlag = "E";
                      updateMQTT(objId, dbo, processedFlag);
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
                        updateMQTT(objId, dbo, processedFlag);
                        gomos.gomosLog(TRACE_PROD,"Assets Not Present for mac ", mac +":"+ assetsId);
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
                        updateMQTT(objId, dbo, processedFlag);                         
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
                            keysToRemove = ["payloadId", "mac", "createdTime","updatedTime","_id", "processed","Token"];

                            //except the business names related keys all other keys has to be removed from the 
                            //msgFactskeys,which is further used for mapping with payload business names.
                            for (var i = 0; i < keysToRemove.length; i++) {
                              if (msgFactsKeys.includes(keysToRemove[i])) {
                                gomos.gomosLog(TRACE_DEBUG,"this is condition For Checking Remove key",keysToRemove[i]);
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
                        // var index = dataFromPayload.findIndex( item => item.payloadId == dataToInsert.payloadId);
                        // var payloadObject = dataFromPayload[index];
                        gomos.gomosLog(TRACE_DEBUG,"This is  payloadData",payloadData);
                        if(payloadData.processByState == "Y"){
                        activeDevice(dbo,dataToInsert);
                        }
                        if(payloadData.AckProcess == "Y"){
                         if(dataToInsert.payloadId == "GHPStatus"){
                          updateDevInstrForRActive(dbo,dataToInsert,result[count].Token);
                         }else{
                          updateDeviceInstruction(dbo,dataToInsert ,result[count].Token);
                         }
                        }
                            gomos.gomosLog(TRACE_DEBUG,"processFactMessages -  where dataToInsert ready ",dataToInsert);
                            dbo.collection("MsgFacts").insertOne(dataToInsert, function (
                              err,
                              result) {
                              if (err) {
                                gomos.errorCustmHandler(NAMEOFSERVICE,"processFactMessages","This Inserting To Msg Fact Error","",err);  
                                process.hasUncaughtExceptionCaptureCallback();
                              }
                              gomos.gomosLog(TRACE_TEST,"Inserted : IN MsgFacts",mac +":"+payloadId +":"+ createdTime);
                            });

                            //Update processed flag in 'MqttDump'
                            // updateMQTT(objId, dbo);
                            processedFlag = "Y"
                            updateMQTT(objId, dbo, processedFlag);
                          }
                          else{
                            processedFlag = "E";  
                            updateMQTT(objId, dbo, processedFlag);
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
              gomos.errorCustmHandler(NAMEOFSERVICE,"processFactMessages","This is Genrated From Try Catch Error","",err);  

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
    // });
}

function activeDevice(dbo,dataToInsert){

       dbo.collection("DeviceState").find({"mac": dataToInsert.mac})
       .toArray(function (err, result2) {
         if (err) {
             gomos.errorCustmHandler(NAMEOFSERVICE,"activeDevice","This Is Query Error","",err);  
           process.hasUncaughtExceptionCaptureCallback();
              }
           try{
            var currentTime = new Date(new Date().toISOString());
            dbo.collection("DeviceState").findOneAndUpdate({
              $and: [
                {_id: result2[0]["_id"]},
                {updatedTime:result2[0].updatedTime}
                ]},
                { $set: {
                  updatedTime: currentTime
              },
            })
            .then(function (result3) {
              if (err) {
                  gomos.errorCustmHandler(NAMEOFSERVICE,"activeDevice","This IS Updateting TimeStamp Error","",err);  
                process.hasUncaughtExceptionCaptureCallback();
                   }
                try{
                  gomos.gomosLog(TRACE_DEBUG,"This is result of Update ", dataToInsert.mac)
                 dbo.collection("Devices").find({"mac":dataToInsert.mac})
                 .toArray(function (err, result1) {
                   if (err) {
                       gomos.errorCustmHandler(NAMEOFSERVICE,"activeDevice","This is Query Error",err);  
                       process.hasUncaughtExceptionCaptureCallback();
                        }
                     try{ 
                       var devicesStateKeyValue = result3.value;
                       var _id = result3.value._id;
                       var dateTime = new Date(new Date().toISOString());
                        gomos.gomosLog(TRACE_DEBUG,"this is data of DevicesSate : ",devicesStateKeyValue);
                         var deviceStateKey = Object.keys(devicesStateKeyValue);
                    
                      var keysToRemove2 = ["_id", "mac", "DeviceName","updatedTime","createdTime"];
                      gomos.gomosLog(TRACE_DEBUG,"This Is key of identifire 1 Place",deviceStateKey);  
                      for (var l = 0; l < keysToRemove2.length; l++) {
                        if (deviceStateKey.includes(keysToRemove2[l])) {
                          deviceStateKey.splice(deviceStateKey.indexOf(keysToRemove2[l]), 1);
                        }
                      }
                      gomos.gomosLog(TRACE_DEBUG,"This Is key of deviceStateKey",deviceStateKey);  

                      var sensorsPkey = Object.keys(dataToInsert.sensors);
                      gomos.gomosLog(TRACE_DEBUG,"This Is key of sensorsPkey",sensorsPkey);  
                      gomos.gomosLog(TRACE_DEBUG,"This Is key of devicesStateKeyValue out Loop",devicesStateKeyValue); 
                      for(var i = 0; i < deviceStateKey.length ; i++){
                        gomos.gomosLog(TRACE_DEBUG,"This Is key of deviceStateKey In Loop",deviceStateKey); 
                       

                         var deviceStatecode  =  Object.keys(devicesStateKeyValue[deviceStateKey[i]]);
                         gomos.gomosLog(TRACE_DEBUG,"This Is key of deviceStatecode",deviceStatecode);  

                           for(var j = 0;  j < deviceStatecode.length; j++ ){
                                
                              var devicebusinessNM = Object.keys(devicesStateKeyValue[deviceStateKey[i]][deviceStatecode[j]]);
                              var keyForRemove1 = ["sortName","displayPosition","valueChangeAt","dateTime"];
                              for(var n =0; n <keyForRemove1.length; n++ ){
                                devicebusinessNM.splice(devicebusinessNM.indexOf(keyForRemove1[n]), 1);
                              }
                              gomos.gomosLog(TRACE_DEBUG,"this is  deviceStatecode  2 loop ",devicebusinessNM);

                              for(var k =0; k < sensorsPkey.length; k++){
                                  gomos.gomosLog(TRACE_DEBUG,"this is  devicebusinessNM  3 loop ",devicebusinessNM);
                                  gomos.gomosLog(TRACE_DEBUG,"this is dataToInsert.sensors  3 loop ",dataToInsert.sensors);
                                  var Senkey = Object.keys(dataToInsert.sensors[sensorsPkey[k]])
                                 if(Senkey.includes(devicebusinessNM[0])){
                                    gomos.gomosLog(TRACE_DEBUG,"this is Condition Satisfied 4 ",devicebusinessNM);
                                    if( devicesStateKeyValue[deviceStateKey[i]][deviceStatecode[j]][devicebusinessNM[0]] == dataToInsert.sensors[sensorsPkey[k]][devicebusinessNM[0]]){
                                      devicesStateKeyValue[deviceStateKey[i]][deviceStatecode[j]][devicebusinessNM[0]] = dataToInsert.sensors[sensorsPkey[k]][devicebusinessNM[0]];
                                      devicesStateKeyValue[deviceStateKey[i]][deviceStatecode[j]]["dateTime"] = dateTime;
                                    }else{
                                      devicesStateKeyValue[deviceStateKey[i]][deviceStatecode[j]][devicebusinessNM[0]] = dataToInsert.sensors[sensorsPkey[k]][devicebusinessNM[0]];
                                      devicesStateKeyValue[deviceStateKey[i]][deviceStatecode[j]]["valueChangeAt"] = dateTime;
                                      devicesStateKeyValue[deviceStateKey[i]][deviceStatecode[j]]["dateTime"] = dateTime;
                                    }
                              
                                      gomos.gomosLog(TRACE_DEBUG,"This Is key of devicesStateKeyValue 1",devicesStateKeyValue);  
                                    }
                              }
                           }
                         gomos.gomosLog(TRACE_DEBUG,"this is data of DevicesSate",devicesStateKeyValue);  
                           
                      }
                      
                      // if(Token != '' && Token != undefined ){
                      //     var index = dataFromPayload.findIndex( item => item.payloadId == dataToInsert.payloadId);
                      //     var payloadObject = dataFromPayload[index];
                        
                      // if(payloadObject.AckProcess == "Y"){
                      //  if(dataToInsert.payloadId == "GHPStatus"){
                      //   updateDevInstrForRActive(dbo,dataToInsert,Token);
                      //  }else{
                      //   updateDeviceInstruction(dbo,dateTime,dataToInsert ,Token);
                      //  }
                      // }
                       gomos.gomosLog(TRACE_DEBUG,"This Is key of devicesStateKeyValue Last",devicesStateKeyValue);  
                       updateDeviceState(dbo,_id,devicesStateKeyValue,dateTime);
                     
                 }
                catch(err){

              }
             
            }) 
            gomos.gomosLog(TRACE_DEBUG,"this is data of deviceState : ",result2);
            }
           catch(err){
         }
        
       }) 
       }
      catch(err){
    }
   
  }) 
     
 gomos.gomosLog(TRACE_DEBUG,"this is called",dataToInsert);
}

function updateDevInstrForRActive(dbo,dataToInsert,Token){
  gomos.gomosLog(TRACE_PROD,"This updateDevInstrForRActive Data  "+Token , dataToInsert);
  var criteria = {
    "mac": dataToInsert.mac,
    "type":"ActiveJob",
    "sourceMsg.referenceToken": Token
  }
  
  dbo.collection("DeviceInstruction")
  .find(criteria)
  .toArray(function (err, result) {
    if (err) {
      process.hasUncaughtExceptionCaptureCallback();
    }
    if(result.length!=0){
      gomos.gomosLog(TRACE_DEV,"This is find Of updateDevInstrForRActive",result);
      for(var i =0; i< result.length; i++){

  updatedDeviceinstruction(dbo,result[i]); 
  DeviceInstructionInsert(dbo,tempobj);
 
      }
    }
    gomos.gomosLog(TRACE_DEV,"This is find Of updateDevInstrForRActive",result);
  });
}
function updateDeviceInstruction(dbo,dataToInsert,Token){
gomos.gomosLog(TRACE_DEBUG,"This updateDeviceInstruction Data  "+Token , dataToInsert);
var criteria = {
  "mac": dataToInsert.mac,
  "type":"SentInstruction",
  "sourceMsg.Token": Token
}

dbo.collection("DeviceInstruction")
.find(criteria)
.toArray(async function (err, result) {
  if (err) {
    process.hasUncaughtExceptionCaptureCallback();
  }
  if(result.length!=0){
    gomos.gomosLog(TRACE_DEV,"This is find Of DeviceInstruction",result);
    if (dataFromPayload.filter(item => item.payloadId == result[0].sourceMsg.ActionType).length != 0 ) {
      var index = dataFromPayload.findIndex( item => item.payloadId == result[0].sourceMsg.ActionType);
      var payloadObject = dataFromPayload[index];
      gomos.gomosLog(TRACE_DEV,"This is Debug of payloadId Index", index);
      gomos.gomosLog(TRACE_DEV,"This is Debug of payloadId Data", payloadObject);
      gomos.gomosLog(TRACE_DEV,"This is processByActiveJobs checking ",payloadObject.processByActiveJobs );
      if(payloadObject.formStructure == "manualOverride"){
       await manualOverrideProcess(dbo,result[0]);
      }
      if(payloadObject.processByActiveJobs == "N"){
        gomos.gomosLog(TRACE_DEV,"This is processByActiveJobs false ",payloadObject.processByActiveJobs );
        deleteinstruction(dbo,result[0]._id);
      }else if(payloadObject.processByActiveJobs =="Y") {
        gomos.gomosLog(TRACE_DEV,"This is processByActiveJobs True ",payloadObject.processByActiveJobs );
        deleteinstruction(dbo,result[0]._id);
        insertActivejob(dbo,result[0],dataToInsert);
      } 
    }
    else{
      gomos.errorCustmHandler(NAMEOFSERVICE,"updateDeviceInstruction","DeviceInstruction payloadId Flag not Preset For This Action Type","", result[0].sourceMsg.ActionType);
    }
   
  }else{
    gomos.errorCustmHandler(NAMEOFSERVICE,"updateDeviceInstruction","DeviceInstruction Token Not Present In SentIntruction",'',Token,);
  }
  gomos.gomosLog(TRACE_DEBUG,"This is find Of DeviceInstruction",result);
});
gomos.gomosLog(TRACE_DEBUG,"this callig after Find Of Deviceinstruction");
} 

 async function  manualOverrideProcess(dbo,dataInsruction){

  dbo.collection("DeviceInstruction")
  .find({mac : dataInsruction.mac, type: "SentManOverride" })
  .toArray(function (err, result) {
    if (err) {
      process.hasUncaughtExceptionCaptureCallback();
    }
    if(result.length!=0){
    gomos.gomosLog(TRACE_DEV,"This ManualOverrideProcessFunction data", result);
    gomos.gomosLog(TRACE_DEV,"This ManualOverrideProcessFun Splite data ito part", result[0].sourceMsg.body);
    gomos.gomosLog(TRACE_DEV,"This ManualOverrideProcessFun dataInsruction.sourceMsg.body Splite data ito part", dataInsruction.sourceMsg.body);
    var keyOfmode = Object.keys(dataInsruction.sourceMsg.body);
    var keyOfResult = Object.keys(result[0].sourceMsg.body);
    for(let i =0 ; i< keyOfmode.length ; i++ ){
      if(keyOfResult.includes(keyOfmode[i])){
      result[0].sourceMsg.body[keyOfmode[i]]["activeMode"] =  dataInsruction.sourceMsg.body[keyOfmode[i]]["mode"];
    }
  }
  gomos.gomosLog(TRACE_DEV,"This is ManualOverrideProcessFun after asing",  result[0].sourceMsg.body) 
  dbo.collection("DeviceInstruction")
  .updateOne(
    { _id: result[0]["_id"]},
    { $set: { "sourceMsg.body": result[0].sourceMsg.body,
      updatedTime :new Date(new Date().toISOString())
     } },
    function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"update For Manual Override","This is Updateting Error","",err);
        process.hasUncaughtExceptionCaptureCallback();
      }
      gomos.gomosLog(TRACE_DEBUG,"update For Manual Override ");
    }
  );
  }
})
}

function insertActivejob(dbo,dataInsruction,dataToInsert){ 
  gomos.gomosLog(TRACE_DEBUG,"this is need For Insert", dataInsruction);
  gomos.gomosLog(TRACE_DEBUG,"this is need For Insert", dataToInsert);
  var keysofBNm = Object.keys(dataInsruction.sourceMsg.body);
  var channelName = dataInsruction.sourceMsg["body"]["Channel"];
  var Token =  dataInsruction.sourceMsg["Token"];
  var payloadId =  dataInsruction.sourceMsg["body"]["ActionType"];
  var isDailyJob = dataInsruction.sourceMsg["isDailyJob"];
  var keyForRemove = ["Channel"];
for(var i = 0 ; i< keyForRemove.length; i++){
    if (keysofBNm.includes(keyForRemove[i])) {
      keysofBNm.splice(keysofBNm.indexOf(keyForRemove[i]), 1);
    }
  }
  var dataTime = new Date(new Date().toISOString());
  gomos.gomosLog(TRACE_DEBUG,"this is key",keysofBNm);
  var data = {
    "mac": dataToInsert.mac,
    "DeviceName": dataToInsert.DeviceName,
    "type" : "ActiveJob",
    "sourceMsg": {"body":{
    "Channel":channelName},
    "referenceToken": Token,
    // "Action": payloadId,
    "isDailyJob": isDailyJob 
  },
    "createdTime": dataTime,
    "updatedTime": dataTime
   
  }
  var arrayBName = []
  if(dataToInsert.payloadId ==  "AckSchedule"){
    
    var dArray = ["ONTime","OFFTime"];
    for(var i =0; i< keysofBNm.length; i++){
      var dataforsplit =  dataInsruction.sourceMsg["body"][keysofBNm[i]];
      var temp = dataforsplit.split(",");
      gomos.gomosLog(TRACE_PROD,"this is split values"+temp[0],temp[1]);
     for(var j =0; j< temp.length; j++){
      data["_id"] =uuidv4();
      data["sourceMsg"]["body"]["ActionType"] = dArray[j];
      data["sourceMsg"]["body"]["ActionValues"] = temp[j];
      if(isDailyJob == true ){
        data["sourceMsg"]["body"]["ActionTime"] = "";
      }
      else{
        data["sourceMsg"]["body"]["ActionTime"] = compareDate(temp[j]);
     
      }
      DeviceInstructionInsert(dbo,data);
     }
    }
  }else{
    for(var i = 0; i< keysofBNm.length; i++ ){
    gomos.gomosLog(TRACE_DEBUG,"This is key of DeviceInstruction",dataInsruction.sourceMsg["body"][keysofBNm[i]])
      var key = keysofBNm[i];
      var value =  dataInsruction.sourceMsg["body"][keysofBNm[i]]
    gomos.gomosLog(TRACE_DEBUG,"This is key of DeviceInstruction",key+ value)
  
        arrayBName.push({"bsName": key, "value": value});
      }
  
  gomos.gomosLog(TRACE_DEBUG,"this is some Array",arrayBName);
 
    for(var k = 0 ; k < arrayBName.length ;k++ ){
      data["_id"] =uuidv4();
      data["sourceMsg"]["body"]["ActionType"] = arrayBName[k].bsName;
      data["sourceMsg"]["body"]["ActionValues"] = arrayBName[k].value;
      // data["sourceMsg"]["ActionTime"] = new Date(arrayBName[k].value).toISOString();
      if(isDailyJob == true ){
        data["sourceMsg"]["body"]["ActionTime"] = "";
        }
        else{
          if(arrayBName[k].value instanceof Date){
            data["sourceMsg"]["body"]["ActionTime"] = compareDate(arrayBName[k].value);
          }
          else{
            data["sourceMsg"]["body"]["ActionTime"] = arrayBName[k].value;
          }
        }
      DeviceInstructionInsert(dbo,data);
   
    }  
  }
} 
function compareDate(str1){
  gomos.gomosLog(TRACE_DEBUG,"this what coming Date", str1)
  var arraydate = str1.split(":")
  gomos.gomosLog(TRACE_DEBUG,"this what coming Date",arraydate[5]+"," +arraydate[4]+","+ arraydate[3]+","+arraydate[2]+","+ arraydate[1]+","+ arraydate[0])
  var date1 = new Date("20"+arraydate[5], arraydate[4] - 1, arraydate[3],arraydate[2], arraydate[1], arraydate[0]);
  return date1;
  }
function DeviceInstructionInsert(dbo,data){
  dbo.collection("DeviceInstruction").insertOne(data, function (err, result) {
    if (err) {
      gomos.errorCustmHandler(NAMEOFSERVICE,"DeviceInstruction","This Query Error","",err);
      gomos.gomosLog(TRACE_DEV,"This is error",err);
      process.hasUncaughtExceptionCaptureCallback();
    }
    gomos.gomosLog(TRACE_DEV," insert  in DeviceInstructionInsert activeJob");
  
  });
} 
function deleteinstruction(dbo,id){
  dbo.collection("DeviceInstruction")
  .deleteOne({"_id": id},
    function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"updateDeviceState","This is Deleting Error","",err);
        process.hasUncaughtExceptionCaptureCallback();
      }
      gomos.gomosLog(TRACE_DEV,"deleteinstruction ", id);
    }
  );
}
function updateDeviceState(dbo,_id,devicesStateKeyValue, dateTime) {
  dbo.collection("DeviceState").updateOne(
    { _id: _id },
    { $set: { sensors: devicesStateKeyValue.sensors,
      channel:  devicesStateKeyValue.channel,
      updatedTime :dateTime
     } },
    function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"updateDeviceState","This is Updateting Error","",err);
        process.hasUncaughtExceptionCaptureCallback();
      }
      gomos.gomosLog(TRACE_DEBUG,"updateDeviceState ", _id);
    }
  );
}
function updatedDeviceinstruction(dbo,updatedData){
  var id = updatedData["_id"];
  dateTime = new Date(new Date().toISOString())

  dbo.collection("DeviceInstruction").updateOne(
    { _id: id },
    { $set: { type: "executedJob",
      updatedTime :dateTime
     } },
    function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"updateDeviceState","This is Updateing Error","",err);
        process.hasUncaughtExceptionCaptureCallback();
      }
      gomos.gomosLog(TRACE_DEBUG,"updateDeviceState ", id);
    }
  );
}


async  function getAllconfig(){
  factSrvcSchedule  =  await gomosSchedule.getServiceConfig(dbo,NAMEOFSERVICE,"factSrvc");
  dataFromDevices   =  await gomosDevices.getDevices(dbo,NAMEOFSERVICE);
  dataFromAssets    =  await gomosAssets.getAssets(dbo,NAMEOFSERVICE);
  dataFromSubCust   =  await gomosSubCustCd.getSubCustomers(dbo,NAMEOFSERVICE);
  dataFromPayload   =  await goomosPayloads.getPayloads(dbo,NAMEOFSERVICE)

}
var factTempInv = null;
module.exports = function (app) {
  //const router = express.Router()
  
  urlConn = app.locals.urlConn;
  dbName = app.locals.dbName;
  // gomos =app.locals;
  // gomos.gomosLog(TRACE_DEBUG,urlConn);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        // console.log(err);
        gomos.errorCustmHandler(NAMEOFSERVICE,"handleMqttMessage",'THIS IS MONGO CLIENT CONNECTION ERROR','',err)
        process.hasUncaughtExceptionCaptureCallback();
      }
     dbo = connection.db(dbName);
    });
  setTimeout(function () {
    factTempInv = app;
    getAllconfig();
   
    setTimeout(function () {
      processFactMessages();
    }, 2000);
  }, 2000);
};
