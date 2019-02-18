var mqtt = require("mqtt");
var MongoClient = require("mongodb").MongoClient;
var spConfig, urlConn, dbName;
var arrMQTTClients = [];
var assetsId, subCustId, custId , crTopic;
var fs = require("fs");
var dateTime = require("node-datetime");
const  TRACE_PROD = 1
const TRACE_STAGE = 2;
const TRACE_TEST  = 3;
const TRACE_DEV   = 4;
const TRACE_DEBUG = 5;
var  gomos = require("../../commanFunction/routes/commanFunction");;
//global method to get the assetId for the particular mac
function getDevices(db, macPassed, businessNm, businessNmValues, message) {
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
        gomos.errorCustmHandler("getDevices",err)
        process.hasUncaughtExceptionCaptureCallback();
      }
      if (result.length > 0) {
        try{
          assetsId = result[0].assetsId;
          DeviceName = result[0].DeviceName;
          // console.log(DeviceName)
          getAssets(db, assetsId, businessNm, businessNmValues, macPassed, message, DeviceName);
        }
        catch(err){
          gomos.errorCustmHandler("getDevices",err)
        }
      
      }
    });
}

//method to get the subCustomerCode for the particular assetId.
function getAssets(db, passedAssetId, businessNm, businessNmValues, mac, message, DeviceName) {
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
        gomos.errorCustmHandler("getAssets",err)
        process.hasUncaughtExceptionCaptureCallback();
      }
      if (result.length > 0) {
        try{
          subCustId = result[0].subCustCd;
          getSubCustomers(db,passedAssetId, subCustId, businessNm,businessNmValues, mac, message, DeviceName);
        }
        catch(err){
          gomos.errorCustmHandler("getAssets",err)
        }
     } 
    });
}

//global method to get the customerCode for the particular subCustomerCode and call the criteria method.
function getSubCustomers(db, passedAssetId, passedSubCust, businessNm,businessNmValues, mac, message, DeviceName) {
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
        gomos.errorCustmHandler("getSubCustomers",err)
        process.hasUncaughtExceptionCaptureCallback();
      }
      if (result.length > 0) {
        try{
          custId = result[0].custCd;
          // for (var i = 0; i < businessNm.length; i++) {
          //   checkCriteria(db, custId, subCustId, businessNm[i], businessNmValues[businessNm[i]], mac);
          // }
         
          checkCriteria(db,passedAssetId, custId, subCustId,businessNmValues, mac, message, DeviceName);
        }
        catch(err){
          gomos.errorCustmHandler("getSubCustomers",err)
        }
        
      }
    });
}

function connectToDb() {
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        gomos.errorCustmHandler("connectToDb",err)
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
      db.collection("ServiceProviders")
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
        .toArray(function (err, result) {
          if (err) {
            gomos.errorCustmHandler("connectToDb",err)
            process.hasUncaughtExceptionCaptureCallback();
          }
          try{
          spConfig = result;
          gomos.gomosLog(TRACE_PROD,"ServiceProviders No. - groupe by mqttClient and PubTopic", spConfig.length);
          // Commect to all the queues from SERVICE PROVIDER
          for (var i = 0; i <= spConfig.length - 1; ++i) {
            // arrMQTTClients.push("MQTTClient" + spConfig[i].spCd);
            arrMQTTClients.push("MQTTClient");
            arrMQTTClients[i] = mqtt.connect(spConfig[i]._id.mqttClient);
          }
           gomos.gomosLog(TRACE_DEBUG,"arrMQTTClients.length",arrMQTTClients.length);
           // Use the run time variable references in the array to hook on to mqqt events
           for (var i = 0; i <= arrMQTTClients.length - 1; ++i) {
            gomos.gomosLog(TRACE_DEBUG,"arrMQTTClients index",i);
            arrMQTTClients[i].on("connect", onMqttConnect);
            arrMQTTClients[i].on("reconnect", onMqttConnect);
            arrMQTTClients[i].on("close", onMqttDisconnect);
            arrMQTTClients[i].on("offline", onMqttDisconnect);
            arrMQTTClients[i].on("error", onMqttDisconnect);
            arrMQTTClients[i].on("message", handleMqttMessage);
          }
          }
          catch(err){
            gomos.errorCustmHandler("connectToDb",err);
          }
        });
    }
  );
}

var isMqttSubscribed = false;
var isMqttConnected = false;

function onMqttConnect() {
  isMqttConnected = true;
  // console.log("onMqttConnect");
  if (!isMqttSubscribed) {
    // console.log("isMqttSubscribed");
    // Subscribe to a topic here, # will get all the msgs inside the topic
    // for (var i = 0; i <= arrMQTTClients.length - 1; ++i) {
    //   var topicKeyLength = Object.keys(spConfig[i].topics).length;
    //   for (var j = 0; j <= topicKeyLength - 1; j++) {
    //     var topicKeys = Object.keys(spConfig[i].topics)[j];
    //     arrMQTTClients[i].subscribe(spConfig[i].topics[topicKeys]);
    //   }
    // } 
    //THIS FOR PERTICULER SUBTOPIC SUBSCRIBTION.
    try{
      for (var i = 0; i <= arrMQTTClients.length - 1; ++i) {
        var topics = spConfig[i]._id.PubTopic
           arrMQTTClients[i].subscribe(topics);  
     }
     isMqttSubscribed = true;
    }
    catch(err){
      gomos.errorCustmHandler("onMqttConnect",err);
    }
  }
}

function handleMqttMessage(topic, message) {
  gomos.gomosLog(TRACE_PROD,"handleMqttMessage topic and message",topic +":"+message.toString());
  try {
    message = message.toString();
    var messKeys = []; //to store the keys of the arrived msg
    var messValues = {}; //to store the msg in json formate alog with two extra fields(i.e., processed and queueDateTime).
    messKeys = Object.keys(JSON.parse(message));
    var tempMessage = JSON.parse(message);
    MongoClient.connect(
      urlConn,
      { useNewUrlParser: true },
      function (err, connection) {
        if (err) {
          // console.log(err);
          gomos.errorCustmHandler("handleMqttMessage",err)
          process.hasUncaughtExceptionCaptureCallback();
        }
        var db = connection.db(dbName);
        gomos.gomosLog(TRACE_DEBUG,"This is mac ", tempMessage.mac);
        db.collection("Devices").find({mac: tempMessage.mac, active: "Y" }) 
        .toArray(function (err, result) {
          if (err) {
            gomos.errorCustmHandler("handleMqttMessage",err)
             process.hasUncaughtExceptionCaptureCallback();
           }
           if(result.length > 0 ){
            gomos.gomosLog(TRACE_PROD,"Entry in filter of Mqqt ",message.toString());
            var dateTime = new Date().toISOString();
            for (var i = 0; i < messKeys.length; i++) {
              messValues[messKeys[i]] = JSON.parse(message)[messKeys[i]];
            }
            
            messValues["processed"] = "N";
            messValues["createdTime"] = "" + dateTime + "";
            messValues["updatedTime"] = "" + dateTime + "";
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
          
            //mongoDb query to dump the modified messages in MqttDump Collection.
          
              
               //This is Filter for Cube Rootz Which only Take perticuler topic data 
              //  criteriaForCubeRootz(db,topic,messValues);
                getDevices(db, messValues["mac"], messResultKeys, messValues, message);
                db.collection("MqttDump").insertOne(messValues, function (err, result) {
                  if (err) {
                    gomos.errorCustmHandler("handleMqttMessage",err)
                     process.hasUncaughtExceptionCaptureCallback();
                   } 
                    gomos.gomosLog(TRACE_PROD,"Entry saved in MsgDump Collection",message.toString());
                  });
           } 
           else{
             gomos.gomosLog(TRACE_DEBUG,"Device Not Presents", message);
             gomos.unWantedLog("handleMqttMessage",message)
            //  console.log(gomos)
           }
         
          });
     
  
    }
  );
  }
  catch(err){
    gomos.errorCustmHandler("handleMqttMessage",err,message);
     gomos.gomosLog(TRACE_DEBUG,"Not VAlid JSON :ERROR!",err);  
  } 
}
  
//method to check whether the messages received is meetting the alertConfig criteria or not
function checkCriteria(db,passedAssetId, custId, subCustId,businessNmValues,  mac, message, DeviceName) {
  var message =JSON.parse(message);
  db.collection("AlertsConfig")
    .aggregate([
      {
        $match: {
          $and: [
            { custCd: custId },
            { subCustCd: subCustId },
            // { configBNm: businessNm },
            {$or:[
              {type: "level3"}, 
              {type: "level1"}
            ]}
          ]
      }
 }])
    .toArray(function (err, result) {
      if (err) {
        gomos.errorCustmHandler("checkCriteria",err)
        process.hasUncaughtExceptionCaptureCallback();
      }
      if (result.length > 0) {
        for (var i = 0; i < result.length; i++) {
         var nowDateTime = new Date().toISOString();
        if(result[i].assetId == passedAssetId){
          try{
            gomos.gomosLog(TRACE_DEBUG,"passedAssetId check for level3 passed",passedAssetId);        
          if(result[i].payloadId == message.payloadId){
            // console.log("second If");
            gomos.gomosLog(TRACE_TEST,"payloadId check for level3 passed",passedAssetId);        
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
            gomos.gomosLog(TRACE_TEST,"Object for level 3 alertData ready",alertData);        
            db.collection("Alerts").insertOne(alertData, function (err, result) {
              if (err) {
                gomos.errorCustmHandler("checkCriteria",err)
                process.hasUncaughtExceptionCaptureCallback();
              }
              gomos.gomosLog(TRACE_PROD,"Alert Saved For Perticuler Payload Into Alerts collection",alertData);        
            });
          }
        } 
        catch(err){
          gomos.errorCustmHandler("checkCriteria",err)  
        }
      }      
      else{
            try{
            var alertsBNm = [];
            alertsBNm = result[i].businessNm.split(",");//gets all businessNms of particular message from alertsConfig
            var bNmConfig = [];
            bNmConfig = result[i].configBNm.split(",");//gets all configBNm of particular message from alertsConfig
            var strbusinessNmValues="";
            var shortName =  result[i].shortName;
            for (var k = 0; k < alertsBNm.length; k++) {
              eval("var " + alertsBNm[k] + " = " + businessNmValues[bNmConfig[k]]);
              // this is done in order to retrieve the actual vlaues of bmNames in the msg to store in Alerts.
              // Later Alerts service will pick this and add it to emails.
              strbusinessNmValues+=alertsBNm[k] + " is " + businessNmValues[bNmConfig[k]];
              if (k < alertsBNm.length-1){
                strbusinessNmValues+=" and ";
              }
            }
          }catch(err)
          {
            gomos.errorCustmHandler("checkCriteria",err)
          }
            // if criteria is matched the insert the required data into Alerts Collection.
            if (eval(result[i].criteria)) {
              var alertData = {
                spCd: result[i].spCd,
                custCd: result[i].custCd,
                subCustCd: result[i].subCustCd,
                mac: mac,
                DeviceName: DeviceName,
                sensorNm: result[i].sensorNm,
                businessNm: result[i].businessNm,
                businessNmValues : strbusinessNmValues,
                shortName: shortName,
                user: result[i].user,
                type: result[i].type,
                criteria: result[i].criteria,
                alertText: result[i].alertText,
                processed: "N",
                dtTime: result[i].dtTime,
                createdTime: nowDateTime,
                updatedTime: nowDateTime
              };
              db.collection("Alerts").insertOne(alertData, function (err, result) {
                if (err) {
                  gomos.errorCustmHandler("checkCriteria",err)
                  process.hasUncaughtExceptionCaptureCallback();
                } else gomos.gomosLog(TRACE_TEST,"Alert Saved Into Alerts collection");        

              });
            } else {
              gomos.gomosLog(TRACE_TEST,"Alert criteria not match For level1");  
            }
          }
        }
      }
    });
}
// var dt = dateTime.create();
// var formattedDate = dt.format("Y-m-d");

// function gomos.errorCustmHandler(functionName,typeofError){
// // console.log(typeofError);
//   let writeStream = fs.createWriteStream("../commanError-" + formattedDate + ".log", { flags: "a" });
//   var dateTime = new Date().toISOString();
// // write some data with a base64 encoding
// writeStream.write(
//   "DateTime: " +dateTime+ "\n"+  
//   "Error handler: " + "\n"+
//   "serviceName:"+ "Mqtt_listener"+"\n"+
//   "functionName:"+ functionName +"\n"+
//   // "lineNo: " + lineNo  +"\n"+
//   "Error Code:" + typeofError.statusCode +"\n"+
//   " Error: " + typeofError + "\n"+
//   "typeofError.stack"+ typeofError.stack +
//   "\n"
// );

// // the finish event is emitted when all data has been flushed from the stream
// writeStream.on('finish', () => {  
//   gomos.gomosLog(TRACE_PROD,"wrote all data to file For Error");  
// });

// // close the stream
// writeStream.end(); 

  // MongoClient.connect(
  //   urlConn,
  //   { useNewUrlParser: true },
  //   function (err, connection) {
  //     if (err) {
  //       // console.log(err);
  //       process.hasUncaughtExceptionCaptureCallback();
  //     }
  //     var createdTime = new Date();
  //     errorobj = {
  //       lineNo,
  //       functionName,
  //       Error,
  //       typeofError,
  //       createdTime
  //     }
  //     var db = connection.db(dbName);
  //     db.collection("MqttErrorhandler")
  //     .insert(errorobj, function (err, result) {
  //       if (err) {
  //         // console.log(err);
  //          process.hasUncaughtExceptionCaptureCallback();
  //       } else console.log("Entry saved in MqttErrorhandler Collection");
  //     });
  //   }
  // )

// }

function onMqttDisconnect() {
  isMqttConnected = false;
}

var mBoxApp = null;
module.exports = function (app) {
  urlConn = app.locals.urlConn;
  dbName = app.locals.dbName;
  // gomos =app.locals;
   // CubeRootsCustomer();
  connectToDb();
  setTimeout(function () {
    mBoxApp = app;
  }, 3000);
};