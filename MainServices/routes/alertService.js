var express = require("express");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require('mongodb').ObjectID;

var scheduleTemp = require("node-schedule");
const nodemailer = require('nodemailer');
var mqtt = require("mqtt");
var arrMQTTClients =[];
var urlConn, dbName;
var alertSrvcSchedule;
var fs = require("fs");
var dateTime = require("node-datetime");
var dbo ;
let gomosSchedule = require("../../commanFunction/routes/getServiceConfig");
// Mailing Details
var mailFrom = '"AS Agri Alert"<asagrialert@gmail.com>';
var mailTo = 'takreem@asagrisystems.com';
var  gomos = require("../../commanFunction/routes/commanFunction");
const NAMEOFSERVICE = "alertService";
const TRACE_PROD = 1;
const TRACE_STAGE = 2;
const TRACE_TEST = 3;
const TRACE_DEV = 4;
const TRACE_DEBUG = 5;
var dt = dateTime.create();
var formattedDate = dt.format('Y-m-d');
const output = fs.createWriteStream(`./alertStd${formattedDate}.log`,  { flags: "a" });
const errorOutput = fs.createWriteStream(`./alertErr${formattedDate}.log` ,{ flags: "a" });
var logger = gomos.createConsole(output,errorOutput);
const SERVICE_VALUE = 2;
var gConsole = false;


var transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true,
  auth: {
    // user: 'vidzai.iot@gmail.com',
    // pass: 'vidzai123'
    user: 'asagrialert@gmail.com',
    pass: 'snch2000'
  }
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

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
     gomos.gomosLog( logger,gConsole,
      TRACE_PROD,
      "Scheduling issues, Can not proceed : It can only support Seconds, Minutes up to 59",
      alertSrvcSchedule
    );
     gomos.gomosLog( logger,gConsole,
      TRACE_PROD,
      "Scheduling issues, Can not proceed : It can only support Seconds, Minutes up to 59",
      factSrvcSchedule
    );
    gomos.errorCustmHandler(
      NAMEOFSERVICE,
      "processAlerts",
      "Scheduling issues, Can not proceed : It can only support Seconds, Minutes up to 59"
    );
   
    process.exit(0);
  }
  var schPattern = sec + min + "* * * *";

  // var tempSchedule = scheduleTemp.scheduleJob("*/30 * * * * *", function () {
    var tempSchedule = scheduleTemp.scheduleJob(schPattern, function () {
     gomos.gomosLog( logger,gConsole,TRACE_PROD, "Processing Started - Processing Level 1 Alerts ");

   
      // dbo = connection.db(dbName);
        dbo.collection("Alerts")
          .find({ processed: "N", type: "level1" })
          .toArray(
           async function (err, result) {
            if (err) {
              gomos.errorCustmHandler(NAMEOFSERVICE,"processAlerts","",err);
              process.hasUncaughtExceptionCaptureCallback();
            }
            try {
              if(result.length > 0){
                 gomos.gomosLog( logger,gConsole,TRACE_DEV,"This Is result length", result.length);
              for (var i = 0; i < result.length; i++) {
                 gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is response of getRecipientMail");
                let response = await getRecipientMail(dbo, result[i]); 
                  gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is response of getRecipientMail",response);
                sendAlertMail(result[i].DeviceName, result[i].alertText, result[i].type,
                  result[i].subCustCd, result[i]._id, dbo, result[i].businessNm,
                  result[i].businessNmValues, response.emailRecipient);
              }
            }
            } catch (err) {
             gomos.errorCustmHandler(NAMEOFSERVICE,"processAlerts","",err);           
            }
            
        
      }
    );
  });
}

function getRecipientMail(dbo, data){
   gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is call of getRecipient", data.referenceConfig);
  return new Promise((resolve, reject)=> { 

   dbo.collection("Devices")
  .find({"mac":data.mac})
  .toArray(
   async function (err, result1) {
    if (err) {
      gomos.errorCustmHandler(NAMEOFSERVICE,"processAlerts","",err);
      process.hasUncaughtExceptionCaptureCallback();
      reject(err)
    }
    if(result1.length > 0){
      let emailRecipientRole = data.emailRecipientRole;
      var emails = "";
      if(emailRecipientRole !== "ALL"){
       
        for(let i =0 ; i< emailRecipientRole.length; i++){
          emails += result1[0].roles[emailRecipientRole[i]] +",";
        }
       
      }
      else{
        let arrayOfemailrecipientRole = Object.keys(result1[0].roles);
        for(let i = 0; i< arrayOfemailrecipientRole.length ; i++){
          emails += result1[0].roles[arrayOfemailrecipientRole[i]] +",";
        }

      }
     gomos.gomosLog( logger,gConsole,TRACE_DEV,"This log of email of recipient ", emails);
      resolve({emailRecipient: emails.substring(0, emails.length - 1)
      });
    }
  });
});
}
//method to update Alerts collection
function updateAlerts(objId, dbo) {
  dbo.collection("Alerts").updateOne(
    { _id: objId },
    { $set: { processed: "Y" } },
    function (err, result) {
      if (err) {
        gomos.errorCustmHandler("updateAlerts",err); 
        process.hasUncaughtExceptionCaptureCallback();
      }
    }
  );
}

function sendAlertMail(DeviceName, strText, level, custCode, objId, dbo, businessName,businessNmValues,emailsToSend) {
  try {
    let mailOptions = {
      from: mailFrom, // sender address
      // to: emailsToSend, // list of receivers
      bcc: emailsToSend,
      subject: 'Alert : ' + level + " : " + businessName + " : " + DeviceName, // Subject line
      //text: strText + " : mac :" + mac + " subCustCode : " + custCode,
      html: '<p style="font-family:TimesNewRoman;font-size:15px"><B>Customer : ' + custCode + '</B></p>' +
        '<p style="font-family:TimesNewRoman;font-size:15px"><B> DeviceName : ' + DeviceName + '</B></p>' +
        '<p style="font-family:TimesNewRoman;font-size:15px"><B>Level : ' + level + '</B></p>' +
        '<p style="font-family:TimesNewRoman;font-size:15px"><B>Values : ' + businessNmValues + '</B></p>' +
        '<p style="font-family:TimesNewRoman;font-size:15px"><B>Message : ' + strText + '</B></p>'
    };
  
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"sendAlertMail","",err); 
        return  gomos.gomosLog( logger,gConsole,TRACE_PROD,"this is sendMail Error",err);
      }
       gomos.gomosLog( logger,gConsole,TRACE_PROD,"This is Message Sent", info.messageId)
      //Update processed flag in 'Alerts'
      updateAlerts(objId, dbo);
    }); 
  } catch (err) {
    gomos.errorCustmHandler(NAMEOFSERVICE,"sendAlertMail","",err); 
  }

}

async function getAllconfig() {
  alertSrvcSchedule = await gomosSchedule.getServiceConfig(
    dbo,
    NAMEOFSERVICE,
    "alertSrvc",logger,gConsole
  );

}
var alertSrvc = null;
module.exports = function (app) {
  //const router = express.Router()
  urlConn = app.locals.urlConn;
  dbName = app.locals.dbName;
  // connectToDb();
  MongoClient.connect(urlConn, { useNewUrlParser: true }, function(
    err,
    connection
  ) {
    if (err) {
      // console.log(err);
      gomos.errorCustmHandler(
        NAMEOFSERVICE,
        "handleMqttMessage",
        "THIS IS MONGO CLIENT CONNECTION ERROR",
        "",
        err
      );
      process.hasUncaughtExceptionCaptureCallback();
    }
    dbo = connection.db(dbName);
  });
  setTimeout(function () {
  //getServiceConfig();
  if(process.argv[4] == SERVICE_VALUE ){
    console.log(process.argv[4]);
    gConsole = true;
    console.log(gConsole)
  }
  getAllconfig()
  setTimeout(function () {
    alertSrvc = app;
   
     processAlerts();
  }, 2000);
}, 2000);
};
