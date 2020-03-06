var mqtt = require("mqtt");
var MongoClient = require("mongodb").MongoClient;
var spConfig, urlConn, dbName;
var arrMQTTClients = [];
var assetsId, subCustId, custId , crTopic;
var fs = require("fs");
var dateTime = require("node-datetime");
const NAMEOFSERVICE = "MqttService";
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
var listnerDB = "";
var mainDB = "";
var  gomos = require("../../commanfunction/routes/commanFunction");
var dt = dateTime.create();
var formattedDate = dt.format('Y-m-d');
const output = fs.createWriteStream(`./mqttSrvStd${formattedDate}.log`,  { flags: "a" });
const errorOutput = fs.createWriteStream(`./mqttSrvErr${formattedDate}.log`,  { flags: "a" });
var logger = gomos.createConsole(output,errorOutput);
const SERVICE_VALUE = 1;
var gConsole = false;
if(process.argv[4] == SERVICE_VALUE ){
  gConsole = true;
}
//global method to get the assetId for the particular mac
function getDevices(db, macPassed, businessNm, businessNmValues, message) {
  try{
  db.collection("Devices")
    .aggregate([
      {
        $match: { mac: macPassed }
      },
      {
        $group: {
          _id: "$assetsId",
          assetsId: { $first: "$assetId" },
          DeviceName :{ $first: "$DeviceName" }
        }
      }
    ])
    .toArray(function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"getDevices",'THIS IS QUERY ERROR',`mac :${macPassed} and message :${message}`,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
      }
      if (result.length > 0) {
       
        let  assetsId = result[0].assetsId;
        let  DeviceName = result[0].DeviceName;
          // console.log(DeviceName)
          getAssets(db, assetsId, businessNm, businessNmValues, macPassed, message, DeviceName);
        }
    });
  }
    catch(err){
      gomos.errorCustmHandler(NAMEOFSERVICE,"getDevices",'THIS IS TRY CATCH ERROR',`mac :${macPassed} and message :${message}`,err,ERROR_RUNTIME,ERROR_TRUE,EXIT_TRUE);
      }
}

//method to get the subCustomerCode for the particular assetId.
function getAssets(db, passedAssetId, businessNm, businessNmValues, mac, message, DeviceName) {
  try{
  db.collection("Assets")
    .aggregate([
      {
        $match: { assetId: passedAssetId }
      },
      {
        $group: {
          _id: "$assetId",
          subCustCd: { $first: "$subCustCd" }
        }
      }
    ])
    .toArray(function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"getAssets",'method to get the subCustomerCode for the particular assetId',`mac :${mac} , DeviceName :${DeviceName} and passedAssetId :${passedAssetId}`,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
      }
      if (result.length > 0) {
       
         let subCustId = result[0].subCustCd;
          getSubCustomers(db,passedAssetId, subCustId, businessNm,businessNmValues, mac, message, DeviceName);
     } 
    });
  }
  catch(err){
    gomos.errorCustmHandler(NAMEOFSERVICE,"getAssets",'THIS IS TRY CATCH method to get the subCustomerCode for the particular assetId',`mac :${mac} , DeviceName :${DeviceName} and passedAssetId :${passedAssetId}`,err,ERROR_RUNTIME,ERROR_TRUE,EXIT_TRUE);

  }
}

//global method to get the customerCode for the particular subCustomerCode and call the criteria method.
function getSubCustomers(db, passedAssetId, passedSubCust, businessNm,businessNmValues, mac, message, DeviceName) {
  try{
  db.collection("SubCustomers")
    .aggregate([
      {
        $match: { subCustCd: passedSubCust }
      },
      {
        $group: {
          _id: "$subCustCd",
          custCd: { $first: "$custCd" }
        }
      }
    ])
    .toArray(function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"getSubCustomers",'get the customerCode for the particular subCustomerCode ',`mac :${mac} , DeviceName :${DeviceName} , passedAssetId : ${passedAssetId} and passedSubCust : ${passedSubCust}`,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
      }
      if (result.length > 0) {
         let custId = result[0].custCd;
          checkCriteria(db,passedAssetId, custId, passedSubCust,businessNmValues, mac, message, DeviceName);
      }
    });
  }
  catch(err){
  gomos.errorCustmHandler(NAMEOFSERVICE,"getSubCustomers",' THIS IS TRY CATCH ERROR get the customerCode for the particular subCustomerCode ',`mac :${mac} , DeviceName :${DeviceName} , passedAssetId : ${passedAssetId} and passedSubCust : ${passedSubCust}`,err,ERROR_RUNTIME,ERROR_TRUE,EXIT_TRUE);
  }
}

function connectToBroker() {
  try{
    
    mainDB.collection("ServiceProviders")
        .aggregate([
          { $match: { active: "Y",  PubTopic: {"$ne": ""},
          mqttClient:{"$ne": ""}
         } },
          {
            $group: {
              _id: { mqttClient: "$mqttClient" ,  PubTopic:  "$PubTopic" },
            } 
            }
        ])
        .toArray(  function (err, result) {
          if (err) {
            gomos.errorCustmHandler(NAMEOFSERVICE,"connectToBroker",'THIS IS QUERY ERROR for ServiceProviders','',err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
          }
            if(result.length> 0){
          spConfig = result;
          gomos.gomosLog( logger,gConsole, TRACE_PROD,"ServiceProviders No. - groupe by mqttClient and PubTopic", spConfig);
          gomos.gomosLog( logger,gConsole, TRACE_PROD,"ServiceProviders No. - groupe by mqttClient and PubTopic", spConfig.length);
          // Commect to all the queues from SERVICE PROVIDER
          for (var i = 0; i <= spConfig.length - 1; ++i) {
            arrMQTTClients.push("MQTTClient");
            arrMQTTClients[i] = mqtt.connect(spConfig[i]._id.mqttClient);
          }
           gomos.gomosLog( logger,gConsole, TRACE_DEBUG,"arrMQTTClients.length",arrMQTTClients.length);
           // Use the run time variable references in the array to hook on to mqqt events
           for (var i = 0; i <= arrMQTTClients.length - 1; ++i) {
            gomos.gomosLog( logger,gConsole, TRACE_DEBUG,"arrMQTTClients index",i);
            arrMQTTClients[i].on("connect", onMqttConnect);
            arrMQTTClients[i].on("reconnect", onMqttConnect);
            arrMQTTClients[i].on("close", onMqttDisconnect);
            arrMQTTClients[i].on("offline", onMqttDisconnect);
            arrMQTTClients[i].on("error", onMqttDisconnect);
            arrMQTTClients[i].on("message", handleMqttMessage);
          }
        }else{
          gomos.gomosLog( logger,gConsole, TRACE_PROD,"result.length",result.length);
          gomos.errorCustmHandler(NAMEOFSERVICE,"connectToBroker",'THIS IS ServiceProviders result.length',result.length,result,ERROR_APPLICATION,ERROR_FALSE,EXIT_FALSE);
        }
    }
  );
}
  catch(err){
    gomos.errorCustmHandler(NAMEOFSERVICE,"connectToBroker",'THIS IS TRY CATCH ERROR ',"",err,ERROR_RUNTIME,ERROR_TRUE,EXIT_TRUE);
   }
}

var isMqttSubscribed = false;
var isMqttConnected = false;

function onMqttConnect() {
  isMqttConnected = true;
  if (!isMqttSubscribed) {
    //THIS FOR PERTICULER SUBTOPIC SUBSCRIBTION.
    try{
      for (let i = 0; i <= arrMQTTClients.length - 1; ++i) {
        let topics = spConfig[i]._id.PubTopic
           arrMQTTClients[i].subscribe(topics);  
     }
     isMqttSubscribed = true;
    }
    catch(err){
      gomos.errorCustmHandler(NAMEOFSERVICE,"onMqttConnect",'THIS IS TRY CATCH ERROR subscribe topics',JSON.stringify(arrMQTTClients),err,ERROR_RUNTIME,ERROR_TRUE,EXIT_TRUE);
    }
  }
}

function handleMqttMessage(topic, message) {
  try {
  gomos.gomosLog( logger,gConsole, TRACE_PROD,"handleMqttMessage topic and message",topic +":"+message.toString());
    message = message.toString();
    var messKeys = []; //to store the keys of the arrived msg
    var messValues = {}; //to store the msg in json formate alog with two extra fields(i.e., processed and queueDateTime).
    messKeys = Object.keys(JSON.parse(message));
    var tempMessage = JSON.parse(message);
      
        gomos.gomosLog( logger,gConsole, TRACE_DEBUG,"This is mac ", tempMessage.mac);
        mainDB.collection("Devices").find({mac: tempMessage.mac, active: "Y" }) 
        .toArray(function (err, result) {
          if (err) {
           gomos.errorCustmHandler(NAMEOFSERVICE,"handleMqttMessage",'THIS IS QUERY ERROR IN DATA BASE FOR ACTIVE DEVICE ',tempMessage,err,ERROR_RUNTIME,ERROR_TRUE,EXIT_TRUE);
           }
           if(result.length > 0 ){
            gomos.gomosLog( logger,gConsole, TRACE_PROD,"Entry in filter of Mqqt ",message.toString());
            var dateTime = new Date(new Date().toISOString());
            for (var i = 0; i < messKeys.length; i++) {
              messValues[messKeys[i]] = JSON.parse(message)[messKeys[i]];
            }
            
            messValues["processed"] = "N";
            messValues["createdTime"] =  dateTime ;
            messValues["updatedTime"] =  dateTime ;
            messValues["topic"] = topic;
            var messResult = messValues; //stores the modified msg
            var messResultKeys = Object.keys(messResult);//stores the keys of the modified msg
            var keysNotRequired = ["payloadId", "mac", "processed", "createdTime","updatedTime"];
            //All the keys except the keys related to businessNames are removed from the array
            //This array is usefull for checking the criteria for each sensor.
            for (var i = 0; i < keysNotRequired.length; i++) {
              if (messResultKeys.includes(keysNotRequired[i])) {
                messResultKeys.splice(messResultKeys.indexOf(keysNotRequired[i]), 1);
              }
            } 
               //This is Filter for Cube Rootz Which only Take perticuler topic data 
              //  criteriaForCubeRootz(db,topic,messValues);
                getDevices(mainDB, messValues["mac"], messResultKeys, messValues, message);
                listnerDB.collection("MqttDump").insertOne(messValues, function (err, result) {
                  if (err) {
                    gomos.errorCustmHandler(NAMEOFSERVICE,"handleMqttMessage",'THIS IS INSERTING ERROR IN  MqttDump',JSON.stringify(message),err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
                   } 
                    gomos.gomosLog( logger,gConsole, TRACE_PROD,"Entry saved in MsgDump Collection",message.toString());
                  });
           } 
           else{
             gomos.gomosLog( logger,gConsole, TRACE_DEBUG,"Device Not Presents", message);
             gomos.unWantedLog("handleMqttMessage",message)
           }
          });
  }
  catch(err){
    gomos.errorCustmHandler(NAMEOFSERVICE,"handleMqttMessage",'THIS IS TRY CATCH OF LISNTER ERROR - JSON Not Valid :ERROR!',message,err,ERROR_RUNTIME,ERROR_TRUE,EXIT_FALSE);    
     gomos.gomosLog( logger,gConsole, TRACE_DEBUG,"Not VAlid JSON :ERROR!",err);  
  } 
}
  
//method to check whether the messages received is meetting the alertConfig criteria or not
function checkCriteria(db,passedAssetId, custId, subCustId,businessNmValues,  mac, message, DeviceName) {
  try{
  var message =JSON.parse(message);
  db.collection("AlertsConfig")
    .aggregate([
      {
        $match: {
          $and: [
            { custCd: custId },
            { subCustCd: subCustId },
            {$or:[
              {type: "level3"}, 
              {type: "level1",alertTriggeredBy: "sensorsValue",deleted: false}
            ]}
          ]
      }
 }])
    .toArray(function (err, result) {
      if (err) {
       gomos.errorCustmHandler(NAMEOFSERVICE,"checkCriteria",'THIS QUERY ERROR',JSON.stringify(message),err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);    
      }
      if (result.length > 0) {
        for (var i = 0; i < result.length; i++) {
         var nowDateTime = new Date(new Date().toISOString());
        if(result[i].assetId == passedAssetId){
          try{
            gomos.gomosLog( logger,gConsole, TRACE_DEBUG,"passedAssetId check for level3 passed",passedAssetId);        
          if(result[i].payloadId == message.payloadId){
            gomos.gomosLog( logger,gConsole, TRACE_TEST,"payloadId check for level3 passed",passedAssetId);        
            var alertData = {
              spCd: result[i].spCd,
              custCd: result[i].custCd,
              subCustCd: result[i].subCustCd,
              assetId: result[i].assetId,
              DeviceName: DeviceName,
              type: result[i].type,
              alertText: result[i].alertText,
              sourceMsg: message,
              translatedMsg: {},
              processed: "N",
              lasterrorString:"",
              lasterrorTime: "",
              numberOfAttempt: 0,
              createdTime: nowDateTime,
              updatedTime: nowDateTime
            };
            gomos.gomosLog( logger,gConsole, TRACE_TEST,"Object for level 3 alertData ready",alertData);        
            db.collection("Alerts").insertOne(alertData, function (err, result) {
              if (err) {
               gomos.errorCustmHandler(NAMEOFSERVICE,"checkCriteria",'THIS IS INSERTION ERROR',JSON.stringify(alertData),err,ERROR_APPLICATION,ERROR_TRUE,EXIT_TRUE);    
              }
              gomos.gomosLog( logger,gConsole, TRACE_PROD,"Alert Saved For Perticuler Payload Into Alerts collection",alertData);        
            });
          }
        } 
        catch(err){
  
          gomos.errorCustmHandler(NAMEOFSERVICE,"checkCriteria",'TRY CATCH ERROR',message,err,ERROR_RUNTIME,ERROR_TRUE,EXIT_FALSE);    
        }
      }      
      else{
            try{
          var alertsBNm = [];
          var bNmConfig  = [];
              if(result[i].businessNm == '' || result[i].configBNm == ''){
              gomos.gomosLog( logger,gConsole, TRACE_PROD,"This is warnnig  businessNm or configBNm  not present ",`businessNm : [${result[i].businessNm}] or configBNm : [${result[i].configBNm}] `)
              gomos.errorCustmHandler(NAMEOFSERVICE,"checkCriteria",'This is warnnig  businessNm or configBNm  not present',result[i],"warring for level1 alertConfig not valid",ERROR_RUNTIME,ERROR_FALSE,EXIT_FALSE);    
               return

              }else{     
                alertsBNm = result[i].businessNm.split(",");//gets all businessNms of particular message from alertsConfig
                bNmConfig =  result[i].configBNm.split(",");//gets all configBNm of particular message from alertsConfig
              }
            var strbusinessNmValues="";
            var shortName =  result[i].shortName;
            gomos.gomosLog(logger,gConsole,TRACE_DEBUG,"This is message Print",message);
          gomos.gomosLog( logger,gConsole, TRACE_DEV,"This is Criteria alert values 122", bNmConfig)
          gomos.gomosLog( logger,gConsole, TRACE_DEV,"This is Criteria alert values", message)

            for (var k = 0; k < alertsBNm.length; k++) {
            gomos.gomosLog(logger,gConsole,TRACE_DEBUG,"this is log for  message[bNmConfig[k]]", message[bNmConfig[k]])
         //   gomos.gomosLog( logger,gConsole, TRACE_DEV,"This is Criteria alertsBNm[k]", eval(alertsBNm[k]))
  
             eval("var " + alertsBNm[k] + " = " + JSON.stringify(message[bNmConfig[k]]));
             gomos.gomosLog( logger,gConsole, TRACE_DEV,"This is Criteria  message[bNmConfig[k]]", message[bNmConfig[k]])
             gomos.gomosLog( logger,gConsole, TRACE_DEV,"This is Criteria alertsBNm[k]", eval(alertsBNm[k]))

              // this is done in order to retrieve the actual vlaues of bmNames in the msg to store in Alerts.
              // Later Alerts service will pick this and add it to emails.
              strbusinessNmValues+=alertsBNm[k] + " is " + message[bNmConfig[k]];
              if (k < alertsBNm.length-1){
                strbusinessNmValues+=" and ";
              }
            }
          }catch(err)
          {
          gomos.errorCustmHandler(NAMEOFSERVICE,"checkCriteria",'TRY CATCH ERROR',message,err,ERROR_RUNTIME,ERROR_TRUE,EXIT_TRUE);    
          }
          gomos.gomosLog( logger,gConsole, TRACE_DEV,"This is Criteria", result[i].criteria)
       //   gomos.gomosLog(logger,gConsole,TRACE_DEBUG,"This is alert eval method ",eval(result[i].alertText))

          gomos.gomosLog( logger,gConsole, TRACE_DEV,"This is Criteria", eval(result[i].criteria))
          gomos.gomosLog(logger,gConsole,TRACE_DEV,"This is  result[i].emailRecipientRole", result[i].emailRecipientRole)
            // if criteria is matched the insert the required data into Alerts Collection.
            if (eval(result[i].criteria)) {
              gomos.gomosLog(logger,gConsole,TRACE_DEV,"This is Alert Condtion true",eval(result[i].criteria))
              var alertData = {
                spCd: result[i].spCd,
                custCd: result[i].custCd,
                subCustCd: result[i].subCustCd,
                mac: mac,
                DeviceName: DeviceName,
                emailRecipientRole: result[i].emailRecipientRole,
                sensorNm: result[i].sensorNm,
                businessNm: result[i].businessNm,
                businessNmValues : strbusinessNmValues,
                shortName: shortName,
                user: "mqqtService",
                type: result[i].type,
                criteria: result[i].criteria,
                alertText:  eval(result[i].alertText),
                processed: "N",
                createdTime: nowDateTime,
                updatedTime: nowDateTime
              };
              gomos.gomosLog(logger,gConsole,TRACE_DEBUG,"This is log of All Alert data", alertData);
            //  gomos.gomosLog( logger,gConsole, TRACE_DEV,"This is Debug of result[i].alertText", eval(result[i].alertText));
              db.collection("Alerts").insertOne(alertData, function (err, result) {
                if (err) {
                  gomos.errorCustmHandler(NAMEOFSERVICE,"checkCriteria",'THIS IS INSERTION ERROR LEVEL 1',JSON.stringify(alertData),err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);    
                } else {
                  gomos.gomosLog( logger,gConsole, TRACE_TEST,"Alert Saved Into Alerts collection");        
                }
              });
            } else {
              gomos.gomosLog( logger,gConsole, TRACE_TEST,"Alert criteria not match For level1");  
            }
          }
        }
      }
    })
  }
  catch(err){
    gomos.errorCustmHandler(NAMEOFSERVICE,"checkCriteria",'THIS IS TRY CATCH ERROR IN checkCriteria At Function Level',message,err,ERROR_RUNTIME,ERROR_TRUE,EXIT_FALSE);    
  }
}
function onMqttDisconnect() {
  isMqttConnected = false;
}

module.exports = function (app) {
  urlConn = app.locals.urlConn;
  dbName = app.locals.dbName;
  gomos.gomosLog( logger,gConsole, TRACE_TEST,"THIS IS DATABASE URL",urlConn);
  console.log("db", dbName)  
  
  MongoClient.connect(
    urlConn.listnerUrl,
    { useNewUrlParser: true },
    function (err, connection1) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"handleMqttMessage",'THIS IS MONGO CLIENT CONNECTION ERROR',urlConn,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);    
      }
     listnerDB = connection1.db(dbName.listnerDB);
     if(urlConn.listnerUrl != urlConn.mainUrl){
      MongoClient.connect(
        urlConn.mainUrl,
        { useNewUrlParser: true },
        function (err, connection2) {
          if (err) {
            gomos.errorCustmHandler(NAMEOFSERVICE,"handleMqttMessage",'THIS IS MONGO CLIENT CONNECTION ERROR',urlConn,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);    
          }
          mainDB = connection2.db(dbName.mainDB);
          gomos.gomosLog( logger,gConsole, TRACE_TEST," THIS IS SECOND DATABASE OPENED BECAUSE OF URL IS NOT SAME");  
        })
     }else{
     mainDB = listnerDB;
     gomos.gomosLog( logger,gConsole, TRACE_TEST," THIS IS FIRST DATABASE INSTANCE ASSIGN TO SECOND DATABASE VARIABLE BECAUSE OF URL IS  SAME");  

     }
    
    });
  
  setTimeout( ()=> { connectToBroker()}, 5000);
};