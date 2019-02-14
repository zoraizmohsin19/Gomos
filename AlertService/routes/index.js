var express = require("express");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
var scheduleTemp = require("node-schedule");
const nodemailer = require('nodemailer');
var mqtt = require("mqtt");
var arrMQTTClients =[];
var urlConn, dbName;
var alertSrvcSchedule;
var fs = require("fs");
var dateTime = require("node-datetime");

// Mailing Details
var mailFrom = '"Vidzai IOT"<vidzai.iot@gmail.com>';
var mailTo = 'takreem96@gmail.com';

var transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true,
  auth: {
    user: 'vidzai.iot@gmail.com',
    pass: 'vidzai123'
  }
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});


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
              if (keys.includes("alertSrvc")) {
                alertSrvcSchedule = result[0]["alertSrvc"];
                console.log(alertSrvcSchedule);
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


// //global method to get the assetId for the particular mac
// function getDevices(db, macPassed,Message) {
//   db.collection("Devices")
//     .aggregate([
//       {
//         $match: { mac: macPassed }
//       },
//       {
//         $group: {
//           _id: "$assetsId",
//           assetsId: { $first: "$assetId" }
//         }
//       }
//     ])
//     .toArray(function (err, result) {
//       if (err) {
//         errorCustmHandler("getDevices",err);
//         process.hasUncaughtExceptionCaptureCallback();
//       }
//       if (result.length > 0) {
//         assetsId = result[0].assetsId;
//         getAssets(db, assetsId, macPassed, Message);
//       }
//     });
// }

// //method to get the subCustomerCode for the particular assetId.
// function getAssets(db, passedAssetId, mac, Message) {
//   db.collection("Assets")
//     .aggregate([
//       {
//         $match: { assetId: passedAssetId }
//       },
//       {
//         $group: {
//           _id: "$assetId",
//           subCustCd: { $first: "$subCustCd" }
//         }
//       }
//     ])
//     .toArray(function (err, result) {
//       if (err) {
//         errorCustmHandler("getAssets",err);
//         process.hasUncaughtExceptionCaptureCallback();
//       }
//       if (result.length > 0) {
//         subCustId = result[0].subCustCd;
//         getSubCustomers(db, subCustId,mac, Message);
//       }
//     });
// }

// //global method to get the customerCode for the particular subCustomerCode and call the criteria method.
// function getSubCustomers(db, passedSubCust, mac, Message) {
//   db.collection("SubCustomers")
//     .aggregate([
//       {
//         $match: { subCustCd: passedSubCust }
//       },
//       {
//         $group: {
//           _id: "$subCustCd",
//           custCd: { $first: "$custCd" }
//         }
//       }
//     ])
//     .toArray(function (err, result) {
//       if (err) {
//         errorCustmHandler("getSubCustomers",err);
//         process.hasUncaughtExceptionCaptureCallback();
//       }
//       if (result.length > 0) {
//         custId = result[0].custCd;
//         // for (var i = 0; i < businessNm.length; i++) {
//         //   checkCriteria(db, custId, subCustId, businessNm[i], businessNmValues[businessNm[i]], mac);
//         // }
//        getCustomer(db, custId, mac, Message);
//       }
//     });
// }
// function getCustomer(db, custCd, mac, Message){
//   db.collection("Customers")
//     .aggregate([
//       {
//         $match: { custCd: custCd }
//       }
//     ])
//     .toArray(function (err, result) {
//       if (err) {
//         errorCustmHandler("getCustomer",err);
//         process.hasUncaughtExceptionCaptureCallback();
//       }
//       if (result.length > 0) {
//        var  SubTopic = result[0].SubTopic;
//        var   mqttClient  = result[0].mqttClient; 
//         alertToDevice(SubTopic,mqttClient,Message );
   
//       }
    
//     });


// }
//THIS IS ALERT SEND TO BOX;
// function alertToDevice(SubTopic,mqttClient,Message ){
//   console.log(mqttClient,SubTopic)
//     // var json  = { "message ": Message }
//     var MessageToSend = JSON.stringify( Message)
//   mqtt.connect(mqttClient).publish(SubTopic, MessageToSend, function (err, result){
//     if(err){
//       process.hasUncaughtExceptionCaptureCallback();
//     }
//    console.log(result);
// }) 

// }

// //This for send alert to device 
// function processAlertToDevice(db,mac,Message){

//   getDevices(db, mac, Message);
 
// }
      

function processAlerts() {
  var sec, min; sec = min = "";
  var time = alertSrvcSchedule / 60;

  if ((time) < 1) {
    sec = "*/" + alertSrvcSchedule + " ";
    min = "* ";
  }
  else if (time >= 1 && time < 59) {
    time = Math.round(time);  // round to nearest whole number
    min += "*/" + time + " ";
    sec = "";
  }
  else {
    console.log("Scheduling issues, Can not proceed : It can only support Seconds, Minutes up to 59");
    errorCustmHandler("processAlerts","Scheduling issues, Can not proceed : It can only support Seconds, Minutes up to 59");  
    process.exit(0);
  }
  var schPattern = sec + min + "* * * *";

  // var tempSchedule = scheduleTemp.scheduleJob("*/30 * * * * *", function () {
    var tempSchedule = scheduleTemp.scheduleJob(schPattern, function () {
    console.log("Processing Level 1 Alerts - " + new Date());
    MongoClient.connect(
      urlConn,
      { useNewUrlParser: true },
      function (err, connection) {
        if (err) {
          errorCustmHandler("processAlerts",err);
          process.hasUncaughtExceptionCaptureCallback();
        }
        var db = connection.db(dbName);
        db.collection("Alerts")
          .find({ processed: "N", type: "level1" })
          .toArray(function (err, result) {
            if (err) {
              errorCustmHandler("processAlerts",err);
              process.hasUncaughtExceptionCaptureCallback();
            }
            try {
              for (var i = 0; i <= result.length - 1; i++) {
                sendAlertMail(result[i].DeviceName, result[i].alertText, result[i].type,
                  result[i].subCustCd, result[i]._id, db, result[i].businessNm,
                  result[i].businessNmValues);
                // processAlertToDevice( db, result[i].mac,result[i].alertText);
              }
            } catch (err) {
             errorCustmHandler("processAlerts",err);           
            }
            
          });
      }
    );
  });
}

//method to update Alerts collection
function updateAlerts(objId, db) {
  db.collection("Alerts").updateOne(
    { _id: objId },
    { $set: { processed: "Y" } },
    function (err, result) {
      if (err) {
        errorCustmHandler("updateAlerts",err); 
        process.hasUncaughtExceptionCaptureCallback();
      }
    }
  );
}

function sendAlertMail(DeviceName, strText, level, custCode, objId, db, businessName,businessNmValues) {
  try {
    let mailOptions = {
      from: mailFrom, // sender address
      to: mailTo, // list of receivers
      subject: 'Alert : ' + level + " : " + businessName + " : " + DeviceName, // Subject line
      //text: strText + " : mac :" + mac + " subCustCode : " + custCode,
      html: '<p style="font-family:TimesNewRoman;font-size:15px"><B>Customer : ' + custCode + '</B></p>' +
        '<p style="font-family:TimesNewRoman;font-size:15px"><B> DeviceName : ' + DeviceName + '</B></p>' +
        '<p style="font-family:TimesNewRoman;font-size:15px"><B>Level : ' + level + '</B></p>' +
        '<p style="font-family:TimesNewRoman;font-size:15px"><B>Values : ' + businessNmValues + '</B></p>' +
        '<p style="font-family:TimesNewRoman;font-size:15px"><B>Message : ' + strText + '</B></p>'
    };
  
    // send mail with defined transport object
    transprter.sendMail(mailOptions, (err, info) => {
      if (err) {
        errorCustmHandler("sendAlertMail",err); 
        return console.log(err);
      }
      console.log("Message Sent : " + info.messageId)
      //Update processed flag in 'Alerts'
      updateAlerts(objId, db);
    }); 
  } catch (err) {
    errorCustmHandler("sendAlertMail",err); 
  }

}

var dt = dateTime.create();
var formattedDate = dt.format("Y-m-d");
function errorCustmHandler(functionName,typeofError){
  // console.log(typeofError);
    let writeStream = fs.createWriteStream("../commanError-" + formattedDate + ".log", { flags: "a" });
    var dateTime = new Date().toISOString();
  // write some data with a base64 encoding
  // var errors = typeofError.toS
  var errorobj ={
    DateTime : dateTime,
    serviceName: "AlertService",
    functionName : functionName,
    ErrorCode :typeofError.statusCode,
     Error : typeofError.toString(),
     typeofErrorstack: typeofError.stack

  }
  var strObj = JSON.stringify(errorobj)
// console.log(typeofError);
  writeStream.write(
    strObj+"\n"
    );
  
  // the finish event is emitted when all data has been flushed from the stream
  writeStream.on('finish', () => {  
      console.log('wrote all data to file');
  });
  // close the stream
  writeStream.end(); 
  }


var alertSrvc = null;
module.exports = function (app) {
  //const router = express.Router()
  urlConn = app.locals.urlConn;
  dbName = app.locals.dbName;
  // connectToDb();
  setTimeout(function () {
  getServiceConfig();
  setTimeout(function () {
    alertSrvc = app;
   
     processAlerts();
  }, 2000);
}, 100);
};
