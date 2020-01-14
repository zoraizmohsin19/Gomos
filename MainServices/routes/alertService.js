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
let gomosSchedule = require("../../commanfunction/routes/getServiceConfig");
// Mailing Details
var mailFrom = '"Sasya Systems Alert"<sasyasystemsalert@gmail.com>';
var mailTo = 'takreem@asagrisystems.com';
var  gomos = require("../../commanfunction/routes/commanFunction");
const NAMEOFSERVICE = "alertService";
const TRACE_PROD = 1;
const TRACE_STAGE = 2;
const TRACE_TEST = 3;
const TRACE_DEV = 4;
const TRACE_DEBUG = 5;
const ERROR_RUNTIME      = "runTimeError";
const ERROR_APPLICATION  =  "ApplicationError";
const ERROR_DATABASE     = "DataBaseError";
const EXIT_TRUE  = true;
const EXIT_FALSE = false;
const ERROR_TRUE = true;
const ERROR_FALSE = false;
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
    // user: 'asagrialert@gmail.com',
    // pass: 'snch2000'
    user: 'sasyasystemsalert@gmail.com',
    pass: 'sasya123!'
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
     gomos.gomosLog( logger,gConsole, TRACE_PROD,"Scheduling issues, Can not proceed : It can only support Seconds, Minutes up to 59", alertSrvcSchedule);
     gomos.errorCustmHandler(NAMEOFSERVICE,"processAlerts",'Scheduling issues, Can not proceed : It can only support Seconds, Minutes up to 59',`alertSrvcSchedule : ${alertSrvcSchedule} `,'',ERROR_APPLICATION,ERROR_FALSE,EXIT_TRUE);
  }
  var schPattern = sec + min + "* * * *";

  // var tempSchedule = scheduleTemp.scheduleJob("*/30 * * * * *", function () {
    var tempSchedule = scheduleTemp.scheduleJob(schPattern, function () {
     gomos.gomosLog( logger,gConsole,TRACE_PROD, "Processing Started - Processing Level 1 Alerts ");
        dbo.collection("Alerts")
          .find({ processed: "N", type: "level1" })
          .toArray(
           async function (err, result) {
            if (err) {
               gomos.errorCustmHandler(NAMEOFSERVICE,"processAlerts",'This is Database Error Level1 ',``,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
            }
            try {
              if(result.length > 0){
                 gomos.gomosLog( logger,gConsole,TRACE_DEV,"This Is result length", result.length);
              for (var i = 0; i < result.length; i++) {
                gomos.gomosLog(logger,gConsole,TRACE_DEV,"This Is result length", result[i])
               
                try {
                  gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is response of getRecipientMail");
                  let response = await getRecipientMail(dbo, result[i]); 
                    gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is response of getRecipientMail",response);
                  sendAlertMail(result[i].DeviceName, result[i].alertText, result[i].type,
                    result[i].subCustCd, result[i]._id, dbo, result[i].businessNm,
                    result[i].businessNmValues,result[i].shortName, response.emailRecipient);
                } catch (err) {
                  gomos.gomosLog(logger,gConsole,TRACE_DEV,"This is Error Try catch in index level",result[i])
                  updateAlertsForError(result[i]._id, dbo);
                  gomos.errorCustmHandler(NAMEOFSERVICE,"processAlerts",'This is Try Catch Error',result[i],err,ERROR_RUNTIME,ERROR_TRUE,EXIT_FALSE);
                }
               
              }
            }
            } catch (err) {
             gomos.errorCustmHandler(NAMEOFSERVICE,"processAlerts",'This is Try Catch Error','',err,ERROR_RUNTIME,ERROR_TRUE,EXIT_FALSE);
            }
      }
    );
  });
}

function getRecipientMail(dbo, data){
   gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is call of getRecipient", data.emailRecipientRole);
  return new Promise((resolve, reject)=> { 

   dbo.collection("Devices")
  .find({"mac":data.mac})
  .toArray(
   async function (err, result1) {
    if (err) {
      gomos.errorCustmHandler(NAMEOFSERVICE,"getRecipientMail",'This is query error from Device',`mac ${mac}`,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
      reject(err)
    }
    if(result1.length > 0){
      try {
        let emailRecipientRole = data.emailRecipientRole;
        var emails = "";
        if(emailRecipientRole[0] !== "ALL"){
         
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
      } catch (err) {
        reject(err)
      }
   
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
        gomos.errorCustmHandler(NAMEOFSERVICE,"updateAlerts",'This is Updateing Error in Database',`Id ${objId}`,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
      }
    }
  );
}
//method to update Alerts collection For Error
function updateAlertsForError(objId, dbo) {
  dbo.collection("Alerts").updateOne(
    { _id: objId },
    { $set: { processed: "E" } },
    function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"updateAlertsForError",'This is Updateing Error in Database',`Id ${objId}`,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
      }
    }
  );
}

function sendAlertMail(DeviceName, strText, level, custCode, objId, dbo, businessName,businessNmValues,shortName,emailsToSend) {
  try {
    let mailOptions = {
      from: mailFrom, // sender address
      // to: emailsToSend, // list of receivers
      bcc: emailsToSend,
      subject: 'Alert : ' + level + " : " + businessName + " : " + DeviceName + " : " + shortName , // Subject line
      //text: strText + " : mac :" + mac + " subCustCode : " + custCode,
       html: '<p style="font-family:TimesNewRoman;font-size:15px"><B>Customer : </B>' + custCode + '</p>' +
       '<p style="font-family:TimesNewRoman;font-size:15px"><B> DeviceName : </B>' + DeviceName + '</p>' +
       '<p style="font-family:TimesNewRoman;font-size:15px"><B>Level : </B>' + level + '</p>' +
       '<p style="font-family:TimesNewRoman;font-size:15px"><B>Values : </B>' + businessNmValues + '</p>' +
       '<p style="font-family:TimesNewRoman;font-size:15px"><B>Message : </B>' + strText + '</p>'
    };
  
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        updateAlertsForError(objId, dbo);
        gomos.errorCustmHandler(NAMEOFSERVICE,"sendAlertMail",'This is Sending mail Error',`mailOption ${mailOptions}`,err,ERROR_APPLICATION,ERROR_TRUE,EXIT_FALSE);        
        return  gomos.gomosLog( logger,gConsole,TRACE_PROD,"this is sendMail Error",err);
      }
       gomos.gomosLog( logger,gConsole,TRACE_PROD,"This is Message Sent", info.messageId)
      //Update processed flag in 'Alerts'
      updateAlerts(objId, dbo);
    }); 
  } catch (err) {
    updateAlertsForError(objId, dbo);
    gomos.errorCustmHandler(NAMEOFSERVICE,"sendAlertMail",'This is Sending mail Error',`Id ${objId}`,err,ERROR_APPLICATION,ERROR_TRUE,EXIT_FALSE);        

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
    gomos.errorCustmHandler(NAMEOFSERVICE,"module.exports",'THIS IS MONGO CLIENT CONNECTION ERROR',``,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);        
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
  }, 5000);
}, 5000);
};
