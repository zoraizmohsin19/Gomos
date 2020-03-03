
const scheduleTemp = require("node-schedule");
const nodemailer = require('nodemailer');
const webpush = require('web-push');


var alertSrvcSchedule;
const utilityFn = require('../commanUtilityFn/utilityFn');
const NAMEOFSERVICE = "alertService";
const gomos = require("../commanUtilityFn/commanFunction");
const g = require('../commanUtilityFn/gConstant')
var mailFrom = '"Sasya Systems Alert"<sasyasystemsalert@gmail.com>';
const SERVICE_VALUE = 2;
var gConsole = false;
const logger = (require('../commanUtilityFn/utilityFn')).CreateLogger(NAMEOFSERVICE);


const ServiceScheduleManager = require("../ServiceScheduleManager/ServiceScheduleBs");
const alertBs = require("../BusinessLogic/alertBs");
const deviceBs = require("../BusinessLogic/deviceBs");
const userBs   = require("../BusinessLogic/userBs")
const vapid = {"publicKey":"BE_IJC5_N-vgC_biBJAN8G7SJB6PQuZEYWequiSuQ1o35RMTT9aRjgpjWbp03-t2QssM-nsTB8g_Mcw3f8gutwQ","privateKey":"EFNLlXDg_4-pGhZIA7S-9nhqVM1buDaH-BM_Kq8kzlY"};


webpush.setVapidDetails(
  'mailto:takreem@sasyasystems.com',
  vapid.publicKey,
  vapid.privateKey
)


var transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true,
  auth: {
    // user: 'vidzai.iot@gmail.com',
    // pass: 'vidzai123'
    user: 'sasyasystemsalert@gmail.com',
    pass: 'sasya123!'
    // user: 'asagrialert@gmail.com',
    // pass: 'snch2000'
  }
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
     gomos.gomosLog( logger,gConsole, g.TRACE_PROD,"Scheduling issues, Can not proceed : It can only support Seconds, Minutes up to 59", alertSrvcSchedule);
     gomos.errorCustmHandler(NAMEOFSERVICE,"processAlerts",'Scheduling issues, Can not proceed : It can only support Seconds, Minutes up to 59',`alertSrvcSchedule : ${alertSrvcSchedule} `,'',g.g.ERROR_APPLICATION,g.g.ERROR_FALSE,g.EXIT_TRUE);
  }
  var schPattern = sec + min + "* * * *";

  // var tempSchedule = scheduleTemp.scheduleJob("*/30 * * * * *", function () {
    var tempSchedule = scheduleTemp.scheduleJob(schPattern, function () {
     gomos.gomosLog( logger,gConsole,g.TRACE_PROD, "Processing Started - Processing Level 1 Alerts ");

     alertBs.fetchAlertLevel1(NAMEOFSERVICE, logger, gConsole)
        . then(  async function (result) {
            try {
              if(result.length > 0){
                 gomos.gomosLog( logger,gConsole,g.TRACE_DEBUG,"THIS IS  ALL RESULT OF LEVEL 1 RESULT", result);
                 gomos.gomosLog( logger,gConsole,g.TRACE_PROD,"THIS IS  ALL RESULT OF LEVEL 1 RESULT LENGTH", result.length);
              for (var i = 0; i < result.length; i++) {
                gomos.gomosLog(logger,gConsole,g.TRACE_PROD,`THIS IS GOING TO PROCESS MAC : ${result[i].mac} - DEVICENAME : ${result[i].DeviceName} - SUBCUSTOMER CODE : ${result[i].subCustCd};`)
                   let response_1 =  await emailSendToUser(result[i]);
                gomos.gomosLog(logger,gConsole,g.TRACE_PROD,` THIS IS RESPONSE OF EMAILSENDTOUSER`,response_1)
                   let response_2 = await pushNotificationToUsers(result[i]);
                   gomos.gomosLog(logger,gConsole,g.TRACE_PROD,` THIS IS RESPONSE OF POSHNOTIFICATIONTOUSERS`,response_2)
              }
            }
            } 
            catch (err) {
             gomos.errorCustmHandler(NAMEOFSERVICE,"processAlerts",'This is Try Catch Error','',err,g.ERROR_RUNTIME,g.ERROR_TRUE,g.EXIT_FALSE);
            }
      }
    ).catch( err => {
      gomos.errorCustmHandler(NAMEOFSERVICE,"processAlerts",'This is Database Error Level1 ',``,err,g.ERROR_DATABASE,g.ERROR_TRUE,g.EXIT_TRUE);

    })
  });
}

function emailSendToUser(data){
  return new Promise( async (resolve, reject)=> { 
  try {
    gomos.gomosLog( logger,gConsole,g.TRACE_DEV,`THIS IS EMAILSENDTOUSER FUNCTION FOR MAC : ${data.mac} - DEVICENAME : ${data.DeviceName} - SUBCUSTOMERS CODE : ${data.subCustCd} `);
    let mailRecipient = await getRecipientMail(data); 
    if(mailRecipient.emailRecipient.length > 0){
      gomos.gomosLog( logger,gConsole,g.TRACE_DEV,"THIS IS MAILRECIPIENT",mailRecipient);
      let res =  await sendAlertMail(data.DeviceName, data.alertText, data.type,
      data.subCustCd, data._id, data.businessNm,
      data.businessNmValues, data.shortName, mailRecipient.emailRecipient);
      resolve(res)
    }else{
    gomos.gomosLog( logger,gConsole,g.TRACE_DEV,`THIS IS EMAILSENDTOUSER FUNCTION  SKIP TO SEND  FOR MAC : ${data.mac} - DEVICENAME : ${data.DeviceName} - SUBCUSTOMERS CODE : ${data.subCustCd} `);
    gomos.errorCustmHandler(NAMEOFSERVICE,"getRecipientMail",'This is skip of userId',`MAC  ${data.mac} - DEVICENAME : ${data.DeviceName} - SUBCUSTOMERS CODE : ${data.subCustCd}`,"",g.ERROR_DATABASE,g.ERROR_FALSE,g.EXIT_FALSE);
     let updatedvalue =   await  alertBs.updateAlertsErrorL1(NAMEOFSERVICE, logger, gConsole,data._id);
    resolve(updatedvalue)
    }
  } catch (err) {
    gomos.gomosLog(logger,gConsole,g.TRACE_DEV,"This is Error Try catch in index level",data)
      let updatedvalue =   await  alertBs.updateAlertsErrorL1(NAMEOFSERVICE, logger, gConsole,data._id);
      gomos.gomosLog(logger,gConsole,g.TRACE_DEV,"This is response of updateValue",updatedvalue);
    gomos.errorCustmHandler(NAMEOFSERVICE,"processAlerts",'This is Try Catch Error',data,err,g.ERROR_RUNTIME,g.ERROR_TRUE,g.EXIT_FALSE);
    resolve(updatedvalue)
  }
});
}


function getRecipientMail(data){
   gomos.gomosLog( logger,gConsole,g.TRACE_DEV,"This is call of getRecipient", data.emailRecipientRole);
  return new Promise((resolve, reject)=> { 
    deviceBs.fetchDeviceBymac(NAMEOFSERVICE, logger, gConsole,data.mac)
  .then( async function (result1) {
    if(result1.length > 0){
      try {
        let emailRecipientRole = data.emailRecipientRole;
        var emails = "";
        if(emailRecipientRole[0] !== "ALL"){
         
          for(let i =0 ; i< emailRecipientRole.length; i++){
          let promise  =  await userBs.activeUers(NAMEOFSERVICE, logger, gConsole,result1[0].roles[emailRecipientRole[i]]);
           gomos.gomosLog( logger,gConsole,g.TRACE_DEBUG,`THIS IS RESPONSE OF ACTIVE USER `, promise);
          if(promise.status){
            emails += result1[0].roles[emailRecipientRole[i]] +","
          }else{
            gomos.errorCustmHandler(NAMEOFSERVICE,"getRecipientMail",'This is skip of userId',`Email ${result1[0].roles[emailRecipientRole[i]]}`,"Error",g.ERROR_DATABASE,g.ERROR_FALSE,g.EXIT_FALSE);
             }
          }
        }
        else{
          let arrayOfemailrecipientRole = Object.keys(result1[0].roles);
          for(let i = 0; i< arrayOfemailrecipientRole.length ; i++){
            gomos.gomosLog( logger,gConsole,g.TRACE_DEBUG,`THIS IS  EMAIL : ${result1[0].roles[arrayOfemailrecipientRole[i]]} `);

            let promise  =  await userBs.activeUers(NAMEOFSERVICE, logger, gConsole,result1[0].roles[arrayOfemailrecipientRole[i]]);
            gomos.gomosLog( logger,gConsole,g.TRACE_DEBUG,`THIS IS RESPONSE OF ACTIVE USER `, promise);
            if(promise.status){
            emails += result1[0].roles[arrayOfemailrecipientRole[i]] +",";
            }else{
           gomos.errorCustmHandler(NAMEOFSERVICE,"getRecipientMail",'This is skip of userId',`mac ${result1[0].roles[arrayOfemailrecipientRole[i]]}`,"error",g.ERROR_DATABASE,g.ERROR_FALSE,g.EXIT_FALSE);
            }
          }
        }
       gomos.gomosLog( logger,gConsole,g.TRACE_DEV,"This log of email of recipient ", emails);
      } catch (err) {
        reject(err)
      }
   
      resolve({emailRecipient: emails.substring(0, emails.length - 1)});
    }
  }).catch(err =>{
      gomos.errorCustmHandler(NAMEOFSERVICE,"getRecipientMail",'This is query error from Device',`mac ${data.mac}`,err,g.ERROR_DATABASE,g.ERROR_TRUE,g.EXIT_TRUE);
      reject(err)
  })
});
}


 function sendAlertMail(DeviceName, strText, level, custCode, objId, businessName,businessNmValues,shortName,emailsToSend) {
  return new Promise( async (resolve, reject)=> { 
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
    transporter.sendMail(mailOptions, async (err, info) => {
      if (err) {
       // updateAlertsForError(objId, dbo);
       let updatedvalue =   await  alertBs.updateAlertsErrorL1(NAMEOFSERVICE, logger, gConsole,objId);
       gomos.gomosLog(logger,gConsole,g.TRACE_DEV,"This is response of updateValue",updatedvalue);
        gomos.errorCustmHandler(NAMEOFSERVICE,"sendAlertMail",'This is Sending mail Error',`mailOption ${mailOptions}`,err,g.ERROR_APPLICATION,g.ERROR_TRUE,g.EXIT_FALSE);        
       // return  gomos.gomosLog( logger,gConsole,g.TRACE_PROD,"this is sendMail Error",err);
       resolve(updatedvalue);
      }
       gomos.gomosLog( logger,gConsole,g.TRACE_PROD,"This is Message Sent", info.messageId)
      //Update processed flag in 'Alerts'
     let updatedvalue =   await  alertBs.updateAlertsSuccessL1(NAMEOFSERVICE, logger, gConsole,objId);
     gomos.gomosLog(logger,gConsole,g.TRACE_DEV,"This is response of updateValue",updatedvalue);
     resolve(updatedvalue);
    }); 
  } catch (err) {
  //  updateAlertsForError(objId, dbo);
  let updatedvalue =   await  alertBs.updateAlertsErrorL1(NAMEOFSERVICE, logger, gConsole,objId);
  gomos.gomosLog(logger,gConsole,g.TRACE_DEV,"This is response of updateValue",updatedvalue);
    gomos.errorCustmHandler(NAMEOFSERVICE,"sendAlertMail",'This is Sending mail Error',`Id ${objId}`,err,g.ERROR_APPLICATION,g.ERROR_TRUE,g.EXIT_FALSE);
    resolve(updatedvalue);        

  }
});

}


function pushNotificationToUsers(data){
  return new Promise( async (resolve, reject)=> { 
 let response = await getRecipientPushNotf(data);
 gomos.gomosLog(logger,gConsole,g.TRACE_PROD,`THIS IS RESPONSE OF RECIPIENT OF  POSH NOTIFICATION FOR MAC : ${data.mac} - DEVICENAME : ${data.DeviceName} AND LENGTH : ${response.length}`);
 gomos.gomosLog(logger,gConsole,g.TRACE_DEV,`THIS IS RESPONSE OF RECIPIENT OF  POSH NOTIFICATION FOR MAC : ${data.mac} - DEVICENAME : ${data.DeviceName} `,response);
 if(response.length > 0){
for(let i =0 ; i < response.length ; i++ ){
  let flag = false;
  for(let j =0 ; j < response[i].subscription.length ; j++ ){
  gomos.gomosLog(logger,gConsole,g.TRACE_TEST,`THIS IS SUBSCRIPTION INDEX  ${i}`,response[i].subscription[j]);
   let txt = `This is Notification Device ${ data.DeviceName} and ${data.alertText};`
  gomos.gomosLog(logger,gConsole,g.TRACE_DEV,`THIS IS TEST ${i}`,txt);
   let p = await webpush.sendNotification( response[i].subscription[j], txt)
     .catch( status => {
       // Check for "410 - Gone" status and mark for deletion
       gomos.gomosLog(logger,gConsole,g.TRACE_TEST,"This is catch of pushNotificationTo Users statusCode",status.statusCode);
       if (status.statusCode === 410) { 
         flag = true;
         response[i].subscription[j]['delete'] = true }
         gomos.errorCustmHandler(NAMEOFSERVICE,"pushNotificationToUsers",'This is pushNotificationToUsers Error',`Id ${data._id}`,status,g.ERROR_RUNTIME,g.ERROR_FALSE,g.EXIT_FALSE);
     })
     gomos.gomosLog(logger,gConsole,g.TRACE_TEST,`THIS  PUSHNOTIFICATIONS  RESPONSE OF mac ${data.mac}  AND SUBSCRIBE USER : ${response[i].userId}`,p.statusCode);

    }
   
    response[i].subscription = response[i].subscription.filter(subscription => !subscription.delete)
 gomos.gomosLog(logger,gConsole,g.TRACE_TEST,`THIS RESULT OF LAST FILTERED  SUBCRIPTION `, response[i]);
    if(flag){
     let RES = await updateUserForPushSubcription( response[i]);
     gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG,`THIS RESULT OF LAST FILTERED  SUBCRIPTION UPDATE RESPONSE `, RES);
    }
    }
    }
    resolve({"PushNotification": "Success"})
  });
}
function updateUserForPushSubcription(data){
  return new Promise((resolve, reject) => {
    let query = { _id : data._id};
    let updateData = { $set: { subscription:data.subscription }};
    userBs.updateUser(NAMEOFSERVICE, logger, gConsole,query,updateData)
    .then(resolve)
    .catch(reject);
  });
}
function getRecipientPushNotf(data){
  return new Promise( async (resolve, reject)=> { 
   let res = await userBs.getUsersBymac(NAMEOFSERVICE, logger, gConsole,data.mac);
    gomos.gomosLog(logger,gConsole,g.TRACE_DEV,"This is response getRecipientPushNotf",res);
    resolve(res);
  });
}



module.exports =  async function (app) {

  if(process.argv[4] == SERVICE_VALUE ){
    console.log(process.argv[4]);
    gConsole = true;
    console.log(gConsole)
  }
  console.log("alertService")

let alertSchedule = await ServiceScheduleManager.initialize()
alertSrvcSchedule = alertSchedule.getAlertSchValue();
console.log("min", alertSchedule.getAlertSchValue())
setTimeout(() =>{    
processAlerts()
   }, 5000)

};
