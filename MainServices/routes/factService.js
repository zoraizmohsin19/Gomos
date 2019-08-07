var express = require("express");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
var scheduleTemp = require("node-schedule");
const moment = require('moment');
var urlConn, dbName;
var dataFromDevices = [],
 // dataFromAssets = [],
  dataFromSubCust = [],
  dataFromPayload = [];
var factSrvcSchedule;
const uuidv4 = require("uuid/v4");
var dbo;
var fs = require("fs");
var dateTime = require("node-datetime");
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});
const NAMEOFSERVICE = "factService";
const TRACE_PROD = 1;
const TRACE_STAGE = 2;
const TRACE_TEST = 3;
const TRACE_DEV = 4;
const TRACE_DEBUG = 5;
const ERROR_RUNTIME = "runTimeError";
const ERROR_APPLICATION = "ApplicationError";
const ERROR_DATABASE = "DataBaseError";
const EXIT_TRUE = true;
const EXIT_FALSE = false;
const ERROR_TRUE = true;
const ERROR_FALSE = false;
var gomos = require("../../commanFunction/routes/commanFunction");
let gomosSchedule = require("../../commanFunction/routes/getServiceConfig");
let gomosDevices = require("../../commanFunction/routes/getDevices");
//let gomosAssets = require("../../commanFunction/routes/getAssets");
let gomosSubCustCd = require("../../commanFunction/routes/getSubCustomers");
let goomosPayloads = require("../../commanFunction/routes/getPayloads");
var dt = dateTime.create();
var formattedDate = dt.format('Y-m-d');
const output = fs.createWriteStream(`./factStd${formattedDate}.log`, { flags: "a" });
const errorOutput = fs.createWriteStream(`./factErr${formattedDate}.log`, { flags: "a" });
var logger = gomos.createConsole(output, errorOutput);
const SERVICE_VALUE = 1;
var gConsole = false;
//method to update mqtt collection when particular data is taken from mqtt and inserted into fact.
function updateMQTT(objId, db, processedFlag) {
  return new Promise((resolve, reject) => {
    db.collection("MqttDump").updateOne(
      { _id: objId },
      { $set: { processed: processedFlag } },
      function (err, result) {
        if (err) {
          gomos.errorCustmHandler(NAMEOFSERVICE, "updateMQTT", 'This is Comman function Updatting Error in MqttLister', `objId :${objId} and processedFlag :${processedFlag}`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
          reject(err)
        }
        gomos.gomosLog(logger, gConsole, TRACE_TEST, "updateMQTT for _id", objId);
        resolve({ "updateMQTT": result.result.nModified })
      }
    );
  }
  );
}


//method to look into mqtt collection to get the messages which is not yet processed
//and insert into fact collection and also update mqtt.
function processFactMessages() {
  let sec, min;
  sec = min = "";
  let time = factSrvcSchedule / 60;

  if (time < 1) {
    sec = "*/" + factSrvcSchedule + " ";
    min = "* ";
  } else if (time >= 1 && time < 59) {
    time = Math.round(time); // round to nearest whole number
    min += "*/" + time + " ";
    sec = "";
  } else {
    gomos.gomosLog(logger, gConsole,
      TRACE_PROD,
      "Scheduling issues, Can not proceed : It can only support Seconds, Minutes up to 59",
      factSrvcSchedule
    );
    gomos.errorCustmHandler(NAMEOFSERVICE, "processFactMessages", 'Scheduling issues, Can not proceed : It can only support Seconds, Minutes up to 59',
      `factSrvcSchedule :${factSrvcSchedule}`, factSrvcSchedule, ERROR_APPLICATION, ERROR_FALSE, EXIT_TRUE);
    // process.exit(0);
  }
  let schPattern = sec + min + "* * * *";

  //var tempSchedule = scheduleTemp.scheduleJob("*/30 * * * * *", function() {
  let tempSchedule = scheduleTemp.scheduleJob(schPattern, function () {
    gomos.gomosLog(logger, gConsole, TRACE_PROD, "Processing Started - Fact Messages");
    dbo
      .collection("MqttDump")
      .find({ processed: "N" }).sort({ "createdtime": 1 })
      .limit(100)
      .toArray(async function (err, result) {
        if (err) {
          gomos.errorCustmHandler(NAMEOFSERVICE, "processFactMessages", 'This Finding Dump From Db', `getting data From Dump`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
        }
        else if (result.length > 0) {
          gomos.gomosLog(logger, gConsole,
            TRACE_PROD,
            "processFactMessages - No. of documents retrived",
            result.length
          );
          // var count = 0;
          for (let i = 0; i < result.length; i++) {
            gomos.gomosLog(logger, gConsole,
              TRACE_PROD,
              "processFactMessages - going to process for",
              result[i].mac
            );
            let processedFlag;
            let mac, createdTime, updatedTime, payloadId;
            updatedTime = result[i].updatedTime;

            let id = result[i]._id;
            gomos.gomosLog(logger, gConsole, TRACE_DEV, "processFactMessages - going to process for index", i);
            let currentTime = new Date(new Date().toISOString());
            gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is Debug For Id Of before update", id)
            let response = await mainpipeLineProcessing(mac, processedFlag, createdTime, updatedTime, payloadId, id, currentTime, i);
            gomos.gomosLog(logger, gConsole, TRACE_PROD, "This is mainpipelineProcess response", response)
            gomos.gomosLog(logger, gConsole, TRACE_TEST, "This is debug of Trace For Index ", i);
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
  });
}

function mainpipeLineProcessing(mac, processedFlag, createdTime, updatedTime, payloadId, id, currentTime, index) {
  return new Promise((resolve, reject) => {
    dbo
      .collection("MqttDump")
      .findOneAndUpdate(
        {
          $and: [{ _id: id }, { updatedTime: updatedTime }]
        },
        {
          $set: {
            processed: "I",
            updatedTime: currentTime
          }
        }
      )
      .then(async function (result1) {

        //filtering data which are obtained from Payloads Collection to get the sensors names
        //of particular mac.
        try {

         let objId = result1.value._id;
         let mac = result1.value.mac;
         let createdTime = result1.value.createdTime;
        let payloadId = result1.value.payloadId;
          let response = {}
          gomos.gomosLog(logger, gConsole, TRACE_DEV, "processFactMessages - going to process after updation for id, mac , payloadid and CreatedTime", objId + ":" + mac + ":" + payloadId + ":" + createdTime + ": " + index);
          if (dataFromPayload.filter(item => item.mac == mac).length == 0) {
            processedFlag = "E";
            response = await updateMQTT(objId, dbo, processedFlag);
            gomos.gomosLog(logger, gConsole, TRACE_TEST, "Payloads Not Present : Please associate with - ", mac);
            gomos.errorCustmHandler(NAMEOFSERVICE, "mainpipeLineProcessing", 'Payloads Not Present : Please associate with - ', `payload  not present For this mac ${mac} and Index ${index}`, "", ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);
            resolve({ "macNotFount": response })
          } else {
            let filetredPayloads = dataFromPayload.filter(item => item.mac == mac);
            gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "processFactMessages - dataFromPayload if mac present - " + mac);
            if (
              filetredPayloads.filter(item => item.payloadId == payloadId).length == 0) {
              processedFlag = "E";
              response = await updateMQTT(objId, dbo, processedFlag);
              gomos.gomosLog(logger, gConsole, TRACE_TEST, "Payloads Not Present : Please associate with", mac + ":" + payloadId);
              gomos.errorCustmHandler(NAMEOFSERVICE, "mainpipeLineProcessing", 'Payloads Not Present : Please associate with - ', `payload  not present For this mac ${mac} and ${payloadId} and Index ${index}`, "", ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);
              resolve({ "payloadNotFount": response })
            } else {
          
             let indexOfPayLoad = filetredPayloads.findIndex(element => element.payloadId == payloadId);
             let sensorNms = filetredPayloads[indexOfPayLoad].sensors;
              let processByFact = filetredPayloads[indexOfPayLoad].processByFact;
              let payloadData = filetredPayloads[indexOfPayLoad];
              gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "processFactMessages - filteredpayloads where payloadId matched " + payloadId, sensorNms);
              if (processByFact !== "Y" || processByFact == undefined) {
                processedFlag = "IG";
                response = await updateMQTT(objId, dbo, processedFlag);
                gomos.gomosLog(logger, gConsole, TRACE_TEST, " Ignoring Payload - ProcessByFact Value", processByFact + ":" + mac + ":" + payloadId);
                gomos.errorCustmHandler(NAMEOFSERVICE, "mainpipeLineProcessing", 'Ignoring Payload - ProcessByFact Value - ', `payload  not present For this processByFact ${processByFact}, mac ${mac} and ${payloadId} and Index ${index}`, "", ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);
                resolve({ "processByFact": response })

              } else if (processByFact == "Y") {
                //filtering data which are obtained from Devices Collection to get the assetId
                //of particular mac.
                if (dataFromDevices.filter(item => item.mac == mac).length == 0) {
                  processedFlag = "E";
                  response = await updateMQTT(objId, dbo, processedFlag);
                  gomos.gomosLog(logger, gConsole, TRACE_TEST, "Device Not Present : Please add a Device for - ", mac);
                  gomos.errorCustmHandler(NAMEOFSERVICE, "mainpipeLineProcessing", 'Device Not Present : Please add a Device for - ', `Device Not Present : Please add a Device for this processByFact ${processByFact}, mac ${mac} and ${payloadId} and Index ${index}`, "", ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);
                  resolve({ "DeviceNotPresent": response })
                } else {
              
                  let indexOfDevice = dataFromDevices.findIndex(element => element.mac == mac);
                  // assetsId = dataFromDevices[indexOfDevice].assetId;
                 let DeviceName = dataFromDevices[indexOfDevice].DeviceName;
                 let subCustCd = dataFromDevices[indexOfDevice].subCustCd;
                 if (dataFromSubCust.filter(item => item.subCustCd == subCustCd).length == 0
                    ) {
                      processedFlag = "E";
                      response = await updateMQTT(objId, dbo, processedFlag);
                      gomos.gomosLog(logger, gConsole, TRACE_TEST, "SubCustomers Not Present for mac ", mac + ":" + subCustCd);
                      gomos.errorCustmHandler(NAMEOFSERVICE, "mainpipeLineProcessing", 'SubCustomers Not Present for mac - ', `SubCustomers Not Present for mac  ${mac} and ${payloadId}, subCustCd ${subCustCd} and Index ${index}`, "", ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);
                      resolve({ "SubCustNotFount": response })
                    } else {
                      let indexOfSubCust = dataFromSubCust.findIndex(element => element.subCustCd == subCustCd );
                      let custCd = dataFromSubCust[indexOfSubCust].custCd;
                      let spCd = dataFromSubCust[indexOfSubCust].spCd;
                      gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "processFactMessages - dataFromDevices where subCustCd is match for DeviceName custCd and spCd ", DeviceName + ":"+ custCd + ":" + spCd);
                      //if (sensorNms && assetsId && subCustCd && custCd && spCd) {
                      if (sensorNms != undefined  && subCustCd != undefined && custCd != undefined && spCd != undefined) {
                        gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "processFactMessages -  where all conditions  passed sensorNms,subCustCd,custCd,spCd", sensorNms + ":" + subCustCd + ":" + custCd + ":" + spCd);
                        sensorKeys = Object.keys(sensorNms); //conatins only the sensor names.
                        msgFactsKeys = Object.keys(result1.value); //contains all the keys of the particular msg
                        // objId = result[index]._id;
                        gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "processFactMessages -  where msgFactsKeys and sensorsNms values", sensorKeys + ":" + msgFactsKeys);
                        //if the msg pattern changes wven these keys also changes,so it has to be manually inserted
                        // when ever there is change in the msg pattern.
                        let DeviceTime = await deviceDateFind(result1.value);
                        gomos.gomosLog(logger,gConsole,TRACE_DEV,"This is log for Device time", DeviceTime);
                        keysToRemove = ["payloadId", "mac", "createdTime", "updatedTime", "_id", "processed", "Token", "Date"];

                        //except the business names related keys all other keys has to be removed from the
                        //msgFactskeys,which is further used for mapping with payload business names.
                        for (let i = 0; i < keysToRemove.length; i++) {
                          if (msgFactsKeys.includes(keysToRemove[i])) {
                            gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "this is condition For Checking Remove key", keysToRemove[i]);
                            msgFactsKeys.splice(msgFactsKeys.indexOf(keysToRemove[i]), 1);
                          }
                        }
                        let finalSensors = {},
                          dataToInsert;

                        //mapping of msgFactskeys with their corresponding business names which we get from payloads.
                        for (let k = 0; k < sensorKeys.length; k++) {
                          let sensorName = sensorKeys[k];
                          let businessNmValue = {};
                          // Key comparisons and value replacements are done here
                          for (let j = 0; j < msgFactsKeys.length; j++) {
                            if (sensorNms[sensorKeys[k]][msgFactsKeys[j]]) {
                              let businessNm = sensorNms[sensorKeys[k]][msgFactsKeys[j]];
                              let businessValue = result1.value[msgFactsKeys[j]];
                              businessNmValue[businessNm] = businessValue;
                            }
                          }
                          finalSensors[sensorName] = businessNmValue;
                        }
                        gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "processFactMessages -  where Transeleted message ", finalSensors);
                        //modified msg to be inserted MsgFacts collection.
                        let currentTime = new Date(new Date().toISOString());
                        dataToInsert = {
                          payloadId: payloadId,
                          mac: mac,
                          DeviceName: DeviceName,
                          subCustCd: subCustCd,
                          custCd: custCd,
                          spCd: spCd,
                          sensors: finalSensors,
                          DeviceTime: new Date(DeviceTime),
                          createdTime: currentTime,
                          updatedTime: currentTime
                        };
                        gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is  payloadData", payloadData);
                        if (payloadData.processByState == "Y") {
                          response["deviceStateProcess"] = await deviceStateProcess(dbo, dataToInsert, index);
                        }
                        if (payloadData.processByDeviceUpTime == "Y") {
                          response["deviceUpTimeProcess"] = await deviceUpTimeProcess(dbo, result1.value, index);
                        }
                        if (payloadData.processByInstructionError == "Y") {
                          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is processByInstructionError True", result1.value);
                          response["processForInstructionError"] = await processForInstructionError(dbo, dataToInsert, result1.value);
                        }
                        if (dataToInsert.payloadId === "ProgramLineExecution") {
                          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is ProgramLineExecution True", result1.value);
                          response["updateDevInstructionActiveJobs"] = await updateDevInstructionActiveJobs(dbo, dataToInsert, result1.value)
                        }
                        if (payloadData.AckProcess == "Y") {
                          if (dataToInsert.payloadId == "GHPStatus") {
                            response["updateDevInstrForRActive"] = await updateDevInstrForRActive(dbo, dataToInsert, result1.value.Token);
                          } else {
                            gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is Else part of UpdateDeviceInstruction AckProcess")
                            response["updateDeviceInstruction"] = await updateDeviceInstruction(dbo, dataToInsert, result1.value.Token);
                          }
                        }
                        gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "processFactMessages -  where dataToInsert ready ", dataToInsert);
                        await dbo.collection("MsgFacts").insertOne(dataToInsert, function (err, result) {
                          if (err) {
                            gomos.errorCustmHandler(NAMEOFSERVICE, "mainpipeLineProcessing", 'This Inserting To Msg Fact Error - ', ` mac  ${mac} and ${payloadId}, subCustCd ${subCustCd} and Index ${index}`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
                          }
                          gomos.gomosLog(logger, gConsole, TRACE_TEST, "Inserted : IN MsgFacts", mac + ":" + payloadId + ":" + createdTime);
                        });
                        processedFlag = "Y";
                        response["updateMQTT"] = await updateMQTT(objId, dbo, processedFlag);
                        resolve(response);
                      } else {
                        processedFlag = "E";
                        response = await updateMQTT(objId, dbo, processedFlag);
                        gomos.gomosLog(logger, gConsole, TRACE_TEST, "Something is missing for this record - ", "sensors : " + sensorNms  + "subcust : " + subCustCd + "cust : " + custCd + "SP : " + spCd);
                        gomos.errorCustmHandler(NAMEOFSERVICE, "mainpipeLineProcessing", 'Something is missing for this record - - ', `sensors : ${sensorNms}  subcust :  ${subCustCd}  cust : ${custCd} SP :  ${spCd}`, "", ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);
                        resolve({ "SomeThingNotFound": response })
                      }
                    }
                  }
                }
              }
          }
          
        } catch (err) {
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is Log In Try catch for cheacking err", err);
          gomos.errorCustmHandler(NAMEOFSERVICE, "mainpipeLineProcessing", 'This is Genrated From Try Catch Error After updating with time stamp - ', `id : ${result1.value._id} and ${result1.value.mac}`, err, ERROR_RUNTIME, ERROR_TRUE, EXIT_FALSE);
          reject(err)
        }
      });
  });

}
function deviceDateFind(data){
  try {
    let dateTime = data.Date
    let now = moment(dateTime)
    // if(dateTime !==undefined ){

    
      return (dateTime !==undefined ) ? (now.isValid())? now.toISOString():  moment(data.createdTime).toISOString(): moment(data.createdTime).toISOString();
    // if(  now.isValid() ) {
    //   gomos.gomosLog(logger,gConsole,TRACE_DEV,"This is valid case",now.toISOString())
    //   // gomos.gomosLog(logger,gConsole,TRACE_DEV,"This is valid case",moment("sdfsfdsd"))
    //   return now.toISOString();

    // }
    // else{
    //   gomos.gomosLog(logger,gConsole,TRACE_DEV,"This is In  valid case",now.toISOString())
    //   return moment(data.createdTime).toISOString();
    // }
  // }else{
  //   gomos.gomosLog(logger,gConsole,TRACE_DEV,"This is In  valid case",now.toISOString())
  //     return moment(data.createdTime).toISOString(); 
  // }
  } catch (err) {
    gomos.gomosLog(logger,gConsole,TRACE_DEV,"This is catch ",now.toISOString())
    return moment(data.createdTime).toISOString();
  }
}
function deviceUpTimeUpdated(dbo, mac, inBootstrap, inLastbeat, duration, currentTime) {
  return new Promise((resolve, reject) => {
    dbo
      .collection("DeviceUpTime")
      .updateOne({ mac: mac, bootstrap: new Date(inBootstrap.toISOString()) }, { $set: { lastbeat: new Date(inLastbeat.toISOString()), duration: duration.asMinutes(), updatedTime: currentTime } }, function (err, result) {
        if (err) {
          gomos.errorCustmHandler(NAMEOFSERVICE, "deviceUpTimeProcess", 'This updateting To deviceUpTimeProcess Error - ', ObjTemp, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
          reject(err)
        }
        resolve({ "deviceUpTimeProcess": "success" })
        gomos.gomosLog(logger, gConsole, TRACE_DEV, "deviceUpTimeProcess This updateting first if condtion record with bootstrap" + inBootstrap.toISOString(), result.result.nModified);
      })
  })
}
function deviceUpTimeInsert(dbo, ObjTemp) {
  return new Promise((resolve, reject) => {

    dbo.collection("DeviceUpTime").insertOne(ObjTemp, function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE, "deviceUpTimeProcess", 'This Inserting To deviceUpTimeProcess Error - ', ObjTemp, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
      }
      resolve({ "deviceUpTimeProcess": "success" })
      gomos.gomosLog(logger, gConsole, TRACE_DEV, "deviceUpTimeProcess This Inserting first if condition with new Obj ", ObjTemp);

    })
  })

}
function deviceUpTimeProcess(dbo, data, index) {
  return new Promise((resolve, reject) => {
    let inBootstrap = moment.unix(data.bootstrap);
    let inLastbeat = moment.unix(data.lastbeat);
    let currentTime = new Date().toISOString()
    let dBootstrap = moment.unix(data.bootstrap).startOf('day');
    let dLastbeat = moment.unix(data.lastbeat).startOf('day');
    var Condtions = moment.duration(dLastbeat.diff(dBootstrap))
    let ObjTemp = {
      mac: data.mac,
      bootstrap: '',
      lastbeat: '',
      duration: '',
      createdTime: currentTime,
      updatedTime: currentTime
    }
    if (Condtions.asDays() == 0 && Condtions.asDays() < 1) {
      let duration = moment.duration(inLastbeat.diff(inBootstrap));
      gomos.gomosLog(logger, gConsole, TRACE_DEV, "deviceUpTimeProcess This Inserting To duration1 first if ", duration.asMinutes());
      ObjTemp["bootstrap"] = new Date(inBootstrap.toISOString());
      ObjTemp["lastbeat"] = new Date(inLastbeat.toISOString());
      ObjTemp["duration"] = duration.asMinutes();
      dbo
        .collection("DeviceUpTime")
        .find({ mac: data.mac, bootstrap: new Date(inBootstrap.toISOString()) })
        .toArray(async function (err, result) {
          if (result.length > 0) {
            gomos.gomosLog(logger, gConsole, TRACE_DEV, "deviceUpTimeProcess This is finding first if condtion record with bootstrap", inBootstrap.toISOString());
            let response = await deviceUpTimeUpdated(dbo, data.mac, inBootstrap, inLastbeat, duration, currentTime);
            resolve(response)
          }
          else {
            let response = await deviceUpTimeInsert(dbo, ObjTemp)
            resolve(response)
          }

        })
    }
    else {
      let duration2 = moment.duration(inLastbeat.diff(dLastbeat));
      ObjTemp["bootstrap"] = new Date(dLastbeat.toISOString());
      ObjTemp["lastbeat"] = new Date(inLastbeat.toISOString());
      ObjTemp["duration"] = duration2.asMinutes();
      dbo
        .collection("DeviceUpTime")
        .find({ mac: data.mac, bootstrap: new Date(dLastbeat.toISOString()) })
        .toArray(async function (err, result) {
          if (err) {
            reject(err);
          }
          if (result.length > 0) {
            gomos.gomosLog(logger, gConsole, TRACE_DEV, "deviceUpTimeProcess This is first Else part finding with bootstrap", inLastbeat.toISOString());
            let response = await deviceUpTimeUpdated(dbo, data.mac, dLastbeat, inLastbeat, duration2, currentTime);
            resolve(response)
          }
          else {
            gomos.gomosLog(logger, gConsole, TRACE_DEV, "deviceUpTimeProcess This first else else part before insert  ", dLastbeat.toISOString());
            dbo.collection("DeviceUpTime").insertOne(ObjTemp, function (err, result) {
              if (err) {
                reject(err);
                gomos.errorCustmHandler(NAMEOFSERVICE, "deviceUpTimeProcess", 'This Inserting To deviceUpTimeProcess Error - ', ObjTemp, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
              }
              gomos.gomosLog(logger, gConsole, TRACE_DEV, "deviceUpTimeProcess Thisfirst else else part after for insert ");
            })
            gomos.gomosLog(logger, gConsole, TRACE_DEV, "deviceUpTimeProcess Thisfirst else else part after for insert called");
            var criteriaBootstrap;
            (Condtions.asDays() == 1) ? criteriaBootstrap = inBootstrap : criteriaBootstrap = moment(dLastbeat).subtract(1, 'days');
            gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is log condtion DeviceUpTime" + Condtions.asDays(), criteriaBootstrap)
            gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is log condtion DeviceUpTime criteria", new Date(criteriaBootstrap.toISOString()))

            let criteriaLastbeat = moment(criteriaBootstrap.toISOString())
            let duration3 = moment.duration(criteriaLastbeat.endOf('day').diff(criteriaBootstrap))
            console.log({ mac: data.mac, bootstrap: new Date(criteriaBootstrap.toISOString()) })
            dbo
              .collection("DeviceUpTime")
              .find({ mac: data.mac, bootstrap: new Date(criteriaBootstrap.toISOString()) })
              .toArray(async function (err, result) {
                if (err) {
                  gomos.errorCustmHandler(NAMEOFSERVICE, "deviceUpTimeProcess", 'This finding To deviceUpTimeProcess Error - ', '', err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
                  reject(err);
                }
                if (result.length > 0) {
                  let response = await deviceUpTimeUpdated(dbo, data.mac, criteriaBootstrap, criteriaBootstrap.endOf('day'), duration3, currentTime);
                  resolve(response)
                }
                else {
                  resolve({ "deviceUpTimeProcess": "This is else else part error" })
                  gomos.errorCustmHandler(NAMEOFSERVICE, "deviceUpTimeProcess", 'This Is deviceUpTimeProcess Error in else Part - ', ``, '', ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);
                }
              })
          }
        })
    }
  })
}
async function deviceStateProcess(dbo, dataToInsert, index) {
  return new Promise((resolve, reject) => {
    gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is Log For Going for query in DeviceState ", index);

    dbo
      .collection("DeviceState")
      .find({ mac: dataToInsert.mac })
      .toArray(async function (err, result2) {
        if (err) {
          gomos.errorCustmHandler(NAMEOFSERVICE, "deviceStateProcess", 'This Is Query Error in DeviceState - ', `mac ${dataToInsert.mac} and Index ${index}`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
          reject(err)
        }
        try {
          var devicesStateKeyValue = result2[0];
          var _id = result2[0]._id;
          gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is Log For DeviceState  After  query", result2[0].updatedTime + ":" + _id + ": " + index);
          var dateTime = new Date(new Date().toISOString());
          var deviceStateKey = Object.keys(devicesStateKeyValue);
          var keysToRemove2 = ["_id", "mac", "DeviceName", "updatedTime", "createdTime"];
          for (var l = 0; l < keysToRemove2.length; l++) {
            if (deviceStateKey.includes(keysToRemove2[l])) {
              deviceStateKey.splice(deviceStateKey.indexOf(keysToRemove2[l]), 1);
            }
          }
          var sensorsPkey = Object.keys(dataToInsert.sensors);
          for (var i = 0; i < deviceStateKey.length; i++) {
            var deviceStatecode = Object.keys(devicesStateKeyValue[deviceStateKey[i]]);
            for (var j = 0; j < deviceStatecode.length; j++) {
              var devicebusinessNM = Object.keys(
                devicesStateKeyValue[deviceStateKey[i]][
                deviceStatecode[j]
                ]
              );
              var keyForRemove1 = ["sortName", "displayPosition", "Type", "valueChangeAt", "dateTime"];
              for (var n = 0; n < keyForRemove1.length; n++) {
                devicebusinessNM.splice(devicebusinessNM.indexOf(keyForRemove1[n]), 1);
              }
              for (var k = 0; k < sensorsPkey.length; k++) {
                var Senkey = Object.keys(dataToInsert.sensors[sensorsPkey[k]]);
                if (Senkey.includes(devicebusinessNM[0])) {
                  if (devicesStateKeyValue[deviceStateKey[i]][deviceStatecode[j]][devicebusinessNM[0]] != dataToInsert.sensors[sensorsPkey[k]][devicebusinessNM[0]]) {
                    devicesStateKeyValue[deviceStateKey[i]][deviceStatecode[j]]["valueChangeAt"] = dateTime;
                  }
                  devicesStateKeyValue[deviceStateKey[i]][deviceStatecode[j]][devicebusinessNM[0]] = dataToInsert.sensors[sensorsPkey[k]][devicebusinessNM[0]];
                  devicesStateKeyValue[deviceStateKey[i]][deviceStatecode[j]]["dateTime"] = dateTime;

                }
              }
            }
          }
          gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is Log For DeviceState  going to update" + index, result2[0].updatedTime);
          let response = await updateDeviceState(dbo, _id, devicesStateKeyValue, result2[0].updatedTime, dateTime, index);
          resolve(response)
          gomos.gomosLog(logger, gConsole, TRACE_DEV, "this is data of  deviceStateProcess In Function response : " + index, response);
        } catch (err) {
          gomos.errorCustmHandler(NAMEOFSERVICE, "deviceStateProcess", 'This Is Try Catch erroe - ', `mac ${dataToInsert.mac} and Index ${index}`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
          reject(err)
        }
      });
  });



}
function updateDevInstructionActiveJobs(dbo, dataToInsert, sourceMsgObj) {
  return new Promise((resolve, reject) => {
    gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This updateDevInstructionActiveJob Data  ", sourceMsgObj);
    let name = sourceMsgObj.name;
    let version = sourceMsgObj.version;
    let schNo = sourceMsgObj.schNo;
    let msgFactsKeys = Object.keys(sourceMsgObj)
    let keysToRemove = ["payloadId", "mac", "name", "version", "schNo", "Date", "createdTime", "updatedTime", "_id", "processed", "Token", "topic"];
    for (var i = 0; i < keysToRemove.length; i++) {
      if (msgFactsKeys.includes(keysToRemove[i])) {
        msgFactsKeys.splice(msgFactsKeys.indexOf(keysToRemove[i]), 1);
      }
    }
    gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is Value msgFactsKeys", msgFactsKeys);

    let status = getConfigchannelNameToValue(sourceMsgObj.mac, msgFactsKeys, sourceMsgObj)

    gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is Value Of Status From Device", status);

    var criteria = {
      mac: sourceMsgObj.mac,
      type: "ActiveJob",
      "sourceMsg.body.jobKey": `${name}-${version}-${schNo}`,
      "sourceMsg.body.ActionType": (status == 0) ? "OFFTime" : "ONTime"
    };

    dbo
      .collection("DeviceInstruction")
      .find(criteria)
      .toArray(async function (err, result) {
        if (err) {
          gomos.errorCustmHandler(NAMEOFSERVICE, "updateDevInstructionActiveJobs", 'This is Find data From DeviceInstruction Error - ', ` mac  ${sourceMsgObj.mac} jobKey ${sourceMsgObj.name}-${sourceMsgObj.version}-${sourceMsgObj.schNo} `, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
          reject(err)
        }
        if (result.length != 0) {
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is find Of updateDevInstructionActiveJob result length", result.length);
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is find Of updateDevInstructionActiveJob", result);
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is find Of updateDevInstructionActiveJob", result[0].sourceMsg);
          let currentTime = new Date(new Date().toISOString())
          let response = {}
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "this is Action Values in Executed Job", result[0]["sourceMsg"]["body"]["ActionValues"]);
          response["updatedDevinstWithCrteria"] = await updatedDevinstWithCrteria(dbo, { _id: result[0]["_id"] }, { updatedTime: currentTime });
          let tempobj = {
            mac: result[0]["mac"],
            DeviceName: result[0]["DeviceName"],
            type: "executedJob",
            sourceMsg: {
              body: {
                Channel: result[0]["sourceMsg"]["body"]["Channel"],
                ActionType: result[0]["sourceMsg"]["body"]["ActionType"],
                jobKey: result[0]["sourceMsg"]["body"]["jobKey"],
                State: result[0]["sourceMsg"]["body"]["State"],
                ActionValues: result[0]["sourceMsg"]["body"]["ActionValues"],
                ActionTime: compareDate(sourceMsgObj.executionDate)
              },
              referenceToken: result[0]["sourceMsg"].referenceToken,
              isDailyJob: result[0]["sourceMsg"].isDailyJob
            },
            createdTime: currentTime,
            updatedTime: currentTime
          }
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is dataStructure for tempobj", tempobj)
          response["DeviceInstructionInsert"] = await DeviceInstructionInsert(dbo, tempobj);
          resolve(response)
        }
        else{
          gomos.errorCustmHandler(NAMEOFSERVICE, "updateDevInstructionActiveJobs", 'This is generated from updateDevInstructionActiveJobs where programLineExecution like payload Process', `result Not Found`, "", ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);
          resolve({"DeviceInstructionInsert": "result Not Found"});

        }
        gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is find Of updateDevInstructionActiveJob", result);
      });
  });
}
function updateDevInstrForRActive(dbo, dataToInsert, Token) {
  return new Promise((resolve, reject) => {
    gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This updateDevInstrForRActive Data  " + Token, dataToInsert);
    var criteria = {
      mac: dataToInsert.mac,
      type: "ActiveJob",
      "sourceMsg.referenceToken": Token
    };

    dbo
      .collection("DeviceInstruction")
      .find(criteria)
      .toArray( async function (err, result) {
        if (err) {
          gomos.errorCustmHandler(NAMEOFSERVICE, "updateDevInstrForRActive", 'This is Find data From DeviceInstruction Error - ', ` mac  ${dataToInsert.mac} referenceToken ${Token} `, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
          reject(err)
        }
        if (result.length != 0) {
          gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is find Of updateDevInstrForRActive", result);
          for (var i = 0; i < result.length; i++) {
            let response = {}
            response["updatedDeviceinstruction"] = await updatedDeviceinstruction(dbo, result[i]);
            response["DeviceInstructionInsert"] = await DeviceInstructionInsert(dbo, tempobj);
            resolve(response);
          }
        }
        else{
          gomos.errorCustmHandler(NAMEOFSERVICE, "updateDevInstrForRActive", 'This is generated from updateDevInstrForRActive ', `result Not Found`, "", ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);
          resolve({"updateDevInstrForRActiveFn": "result not Found"});
        }
        gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is find Of updateDevInstrForRActive", result);
      });
  });
}

function processForInstructionError(dbo, dataToInsert, mainDatapayload) {
  return new Promise((resolve, reject) => {

    gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This updateDeviceInstruction Data  ", dataToInsert);
    var criteria = {
      mac: dataToInsert.mac,
      type: "SentInstruction",
      "sourceMsg.Token": mainDatapayload.Token
    };
    dbo
      .collection("DeviceInstruction")
      .find(criteria)
      .toArray(async function (err, result) {
        if (err) {
          gomos.errorCustmHandler(NAMEOFSERVICE, "processForInstructionError", 'This is Find data From DeviceInstruction Error - ', ` mac  ${dataToInsert.mac} Token ${mainDatapayload.Token} `, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
          reject(err);
        }
        if (result.length != 0) {
          gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is find Of DeviceInstruction", result);
          if (dataFromPayload.filter(item => item.payloadId == result[0].sourceMsg.ActionType).length != 0) {
            var index = dataFromPayload.findIndex(item => item.payloadId == result[0].sourceMsg.ActionType);
            var payloadObject = dataFromPayload[index];
            gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is Debug of payloadId Data", payloadObject);
            let response = {};
            if (payloadObject.payloadId == "SetProgramState") {
              gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is setProgrameProcess condtion True")
              response["setProgramStateErrorProcess"] = await setProgramStateErrorProcess(dbo, result[0]);
              response["deleteinstruction"] = await deleteinstruction(dbo, result[0]._id);
            }
            if (payloadObject.payloadId == "SetProgram") {
              gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is setProgrameProcess condtion True");
              response["setProgramErrorProcess"] = await setProgramErrorProcess(dbo, result[0]);
              response["deleteinstruction"] = await deleteinstruction(dbo, result[0]._id);
            }
            resolve(response);
          }
        }else{
          gomos.errorCustmHandler(NAMEOFSERVICE, "processForInstructionError", 'This is generated from processForInstructionError ', `result Not Found`, "", ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);
          resolve({"processForInstructionErrorFn": " result Not Found"});
        }
      });
  });
}
function deleteProgramIndex(dbo,data){
  return new Promise((resolve, reject)=> {
    gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is deleteProgramIndex going to delete ", `${data.mac}-${data.sourceMsg.body.programKey}`);
  dbo.collection("Instructionindex").deleteOne(
  {programKeyIndex : `${data.mac}-${data.sourceMsg.body.programKey}`},
    function(err, result) {
      if (err) {
        gomos.errorCustmHandler( NAMEOFSERVICE,"delted For ProgrameDetails Override","This is Updateting Error","", err);
        process.hasUncaughtExceptionCaptureCallback();
        reject(err)
      }
    gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is deleteProgramIndex", result.result.n);
    resolve(result)

    });
  });
}

function setProgramStateErrorProcess(dbo, dataInsruction) {
  return new Promise((resolve, reject) => {
    gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This Call ProgrameDetails data");
    dbo
      .collection("DeviceInstruction")
      .find({
        mac: dataInsruction.mac, type: "ProgramDetails",
        "sourceMsg.body.name": dataInsruction.sourceMsg.body.name,
        "sourceMsg.body.version": dataInsruction.sourceMsg.body.version

      })
      .toArray( async function (err, result) {
        if (err) {
          gomos.errorCustmHandler(NAMEOFSERVICE, "setProgramStateErrorProcess", 'This is Find data From DeviceInstruction Error - ', ` mac  ${dataInsruction.mac} Name ${dataInsruction.sourceMsg.body.name}  and Version ${dataInsruction.sourceMsg.body.version}`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
          reject(err)
        }
        if (result.length != 0) {
          let response =    await deleteProgramIndex(dbo,result[0]);
          gomos.gomosLog(logger,gConsole,TRACE_DEBUG,"This is log For deleteProgramIndex", response)
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This ProgrameDetails data", result);
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This ProgrameDetails dataInsruction.sourceMsg.body Splite data ito part", dataInsruction.sourceMsg.body);
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is ProgrameDetails after asing", result[0].sourceMsg.body);
          dbo.collection("DeviceInstruction").updateOne(
            { _id: result[0]["_id"] },
            {
              $set: {
                "sourceMsg.body.currentState": result[0].sourceMsg.body.previousState,
                "sourceMsg.body.previousState": result[0].sourceMsg.body.currentState,
                "sourceMsg.body.pendingConfirmation": false,
                updatedTime: new Date(new Date().toISOString())
              }
            },
            function (err, result) {
              if (err) {
                gomos.errorCustmHandler(NAMEOFSERVICE, "setProgramStateErrorProcess", 'updated For Programe State in ProgrameDetails Error ', ` mac  ${dataInsruction.mac} Name ${dataInsruction.sourceMsg.body.name} id ${result[0]["_id"]} and Version ${dataInsruction.sourceMsg.body.version}`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
                reject(err)
              }
              gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "updated For Programe State in ProgrameDetails   in setProgramStateErrorProcess");
              resolve({ "setProgramStateErrorProcess": result.result.nModified ,  "deleteProgramIndex": response.result.n});
            }
          );
        }else{
          gomos.errorCustmHandler(NAMEOFSERVICE, "setProgramStateErrorProcessFn", 'This is generated from setProgramStateErrorProcessFn ', `result Not Found`, "", ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);
          resolve({"setProgramStateErrorProcessFn": " result Not Found"});
        }
      });
  });
}
function setProgramErrorProcess(dbo, dataInsruction) {
  return new Promise((resolve, reject) => {

    gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This Call ProgrameDetails data");
    dbo
      .collection("DeviceInstruction")
      .find({
        mac: dataInsruction.mac, type: "ProgramDetails",
        "sourceMsg.body.name": dataInsruction.sourceMsg.body.name,
        "sourceMsg.body.version": dataInsruction.sourceMsg.body.version

      })
      .toArray(async function (err, result) {
        if (err) {
          gomos.errorCustmHandler(NAMEOFSERVICE, "setProgramErrorProcess", 'setProgramErrorProcess finding data From Data base', ` mac  ${dataInsruction.mac} Name ${dataInsruction.sourceMsg.body.name}  and Version ${dataInsruction.sourceMsg.body.version}`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
          reject(err)
        }
        if (result.length != 0) {
          let response =    await deleteProgramIndex(dbo,result[0]);
          gomos.gomosLog(logger,gConsole,TRACE_DEBUG,"This is log For deleteProgramIndex", response)
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This ProgrameDetails data", result);
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This ProgrameDetails dataInsruction.sourceMsg.body Splite data ito part", dataInsruction.sourceMsg.body);
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is ProgrameDetails after asing", result[0].sourceMsg.body);
          dbo.collection("DeviceInstruction").deleteOne(
            { _id: result[0]["_id"] },
            function (err, result) {
              if (err) {
                gomos.errorCustmHandler(NAMEOFSERVICE, "setProgramErrorProcess", 'setProgramErrorProcess delteing For ProgrameDetails Error', ` mac  ${dataInsruction.mac} Name ${dataInsruction.sourceMsg.body.name}  and Version ${dataInsruction.sourceMsg.body.version}`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
              }
              gomos.gomosLog(logger, gConsole, TRACE_DEBUG, " For ProgrameDetails Override  in setProgramErrorProcess");
              resolve({ "setProgramErrorProcess": result.result.n,
            "deleteProgramIndex": response.result.n })
            }
          );
        }else{
          gomos.errorCustmHandler(NAMEOFSERVICE, "setProgramErrorProcessFn", 'This is generated from setProgramErrorProcessFn ', `result Not Found`, "", ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);
          resolve({"setProgramErrorProcessFn": " result Not Found"});
        }
      });
  });
}
function updateDeviceInstruction(dbo, dataToInsert, Token) {
  return new Promise((resolve, reject) => {
    gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This updateDeviceInstruction Data  " + Token, dataToInsert);
    var criteria = {
      mac: dataToInsert.mac,
      type: "SentInstruction",
      "sourceMsg.Token": Token
    };

    dbo
      .collection("DeviceInstruction")
      .find(criteria)
      .toArray(async function (err, result) {
        if (err) {
          gomos.errorCustmHandler(NAMEOFSERVICE, "updateDeviceInstruction", 'DeviceInstruction find from Database error', ` mac  ${dataToInsert.mac} `, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
          reject(err)
        }
        if (result.length != 0) {
          gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is find Of DeviceInstruction", result);
          if (dataFromPayload.filter(item => item.payloadId == result[0].sourceMsg.ActionType).length != 0) {
            var index = dataFromPayload.findIndex(item => item.payloadId == result[0].sourceMsg.ActionType);
            var payloadObject = dataFromPayload[index];
            gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is Debug of payloadId Index", index);
            gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is Debug of payloadId Data", payloadObject);
            gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is processByActiveJobs checking ", payloadObject.processByActiveJobs);
            gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is payloadObject.formStructure", payloadObject.formStructure)
            if (payloadObject.formStructure == "manualOverride") {
              let response = await manualOverrideProcess(dbo, result[0]);
              resolve(response);
            }
            if (payloadObject.formStructure == "ProgramDetails") {
              gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is setProgrameProcess condtion True")
              let response = await setProgramProcess(dbo, result[0]);
              gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is response SetProgram Process", response);
              resolve(response);
            }
            if (payloadObject.processByActiveJobs == "N") {
              gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is processByActiveJobs false ", payloadObject.processByActiveJobs);
              let response = await deleteinstruction(dbo, result[0]._id);
              resolve(response);
            } else if (payloadObject.processByActiveJobs == "Y") {
              gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is processByActiveJobs True ", payloadObject.processByActiveJobs);
              let response = {}
              response["deleteinstruction"] = await deleteinstruction(dbo, result[0]._id);
              response["insertActivejob"] = await insertActivejob(dbo, result[0], dataToInsert, payloadObject);
              resolve(response)
            }
          } else {
            gomos.errorCustmHandler(NAMEOFSERVICE, "updateDeviceInstruction", 'DeviceInstruction payloadId Flag not Preset For This Action Type ', ` mac  ${dataToInsert.mac} and Action Type ${result[0].sourceMsg.ActionType}`, "", ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);
          }
        } else {
          gomos.errorCustmHandler(NAMEOFSERVICE, "updateDeviceInstruction", '"DeviceInstruction Token Not Present In SentIntruction",', ` mac  ${dataToInsert.mac} and Token ${Token}`, "", ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);
          resolve({"updateDeviceInstructionFn": "result Not Found"})
        }
        gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is find Of DeviceInstruction", result);
      });
    gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "this callig after Find Of Deviceinstruction");
  });
}

async function setProgramProcess(dbo, dataInsruction) {
  return new Promise((resolve, reject) => {
    gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This Call ProgrameDetails data");

    dbo
      .collection("DeviceInstruction")
      .find({
        mac: dataInsruction.mac, type: "ProgramDetails",
        "sourceMsg.body.name": dataInsruction.sourceMsg.body.name,
        "sourceMsg.body.version": dataInsruction.sourceMsg.body.version

      })
      .toArray(function (err, result) {
        if (err) {
          gomos.errorCustmHandler(NAMEOFSERVICE, "setProgramProcess", '"DeviceInstruction Finding Data Error",', ` mac  ${dataInsruction.mac}`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
          reject(err)
        }
        if (result.length != 0) {
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This ProgrameDetails data", result);
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This ProgrameDetails dataInsruction.sourceMsg.body Splite data ito part", dataInsruction.sourceMsg.body);

          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is ProgrameDetails after asing", result[0].sourceMsg.body);
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is ProgrameDetails after asing result", result);
          dbo.collection("DeviceInstruction").updateOne(
            { _id: result[0]["_id"] },
            {
              $set: {
                "sourceMsg.body.pendingConfirmation": false,
                updatedTime: new Date(new Date().toISOString())
              }
            },
            async function (err, result) {
              if (err) {
                reject(err)
                gomos.errorCustmHandler(NAMEOFSERVICE, "setProgramProcess", 'update For ProgrameDetails', ` mac  ${dataInsruction.mac}`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
              }
              var response2 = {};
              if (dataInsruction.sourceMsg.ActionType == "SetProgramState" && dataInsruction.sourceMsg.body.state == "delete") {
                response2 = await deleteActiveJob(dbo, dataInsruction);
              }
              else if (dataInsruction.sourceMsg.ActionType == "SetProgramState" && dataInsruction.sourceMsg.body.state != "") {
                response2 = await updateActiveJobState(dbo, dataInsruction);
              }
              else {
                let response3 = await updateSetProgramDetails(dbo, dataInsruction);
                gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is debug of response updateSetProgramDetails", response3)
                response2 = await updateProgramDetailsForExpiryDate(dbo, dataInsruction);
                gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is DEBUG OF RESponse updateActiveJForExpiryJob", response2);
                gomos.gomosLog(logger, gConsole, TRACE_DEV, "update For  setProgramProcess ");

              }
              resolve(response2)
            }
          );
        }
        else{
          gomos.errorCustmHandler(NAMEOFSERVICE, "setProgramProcessFn", 'This is generated from setProgramProcessFn ', `result Not Found`, "", ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);
          resolve({"setProgramProcessFn": "result Not Found"})
        }
      });
  });
}
function updateActiveJobState(dbo, dataInsruction) {
  return new Promise((resolve, reject) => {
    let currentTime = new Date(new Date().toISOString());
    dbo.collection("DeviceInstruction").updateMany(
      { mac: dataInsruction.mac, type: "ActiveJob", "sourceMsg.body.jobKey": { "$regex": `${dataInsruction.sourceMsg.body.name}-${dataInsruction.sourceMsg.body.version}` } },
      {
        $set: {
          "sourceMsg.body.State": dataInsruction.sourceMsg.body.state,
          updatedTime: currentTime
        }
      },
      function (err, res) {
        if (err) {
          reject(err);
          gomos.errorCustmHandler(NAMEOFSERVICE, "updateActiveJobState", 'DeviceInstruction UpdateMany ', ` mac  ${dataInsruction.mac}`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
        }
        gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "updateActiveJobState ", res.result);
        resolve({ "updatedItem": res.result.n })
      }
    );
  }
  );
}
function deleteActiveJob(dbo, dataInsruction) {
  return new Promise((resolve, reject) => {
    dbo.collection("DeviceInstruction").deleteMany(
      { mac: dataInsruction.mac, type: "ActiveJob", "sourceMsg.body.jobKey": { "$regex": `${dataInsruction.sourceMsg.body.name}-${dataInsruction.sourceMsg.body.version}` } }
      ,
      function (err, res) {
        if (err) {
          reject(err)
          gomos.errorCustmHandler(NAMEOFSERVICE, "deleteActiveJob", 'This is Updateting Error ', ` mac  ${dataInsruction.mac}`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
        }
        gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "deleteActiveJob ", res.result.n);
        resolve({ "deleteItem": res.result.n })
      }
    );
  }
  );
}
async function manualOverrideProcess(dbo, dataInsruction) {
  return new Promise((resolve, reject) => {
    dbo
      .collection("DeviceInstruction")
      .find({ mac: dataInsruction.mac, type: "SentManOverride" })
      .toArray(function (err, result) {
        if (err) {
          gomos.errorCustmHandler(NAMEOFSERVICE, "manualOverrideProcess", 'This is finding  SentManOverride Error ', ` mac  ${dataInsruction.mac}`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
          reject(err);
        }
        if (result.length != 0) {
          gomos.gomosLog(logger, gConsole, TRACE_DEV, "This ManualOverrideProcessFunction data", result);
          gomos.gomosLog(logger, gConsole, TRACE_DEV, "This ManualOverrideProcessFun Splite data ito part", result[0].sourceMsg.body);
          gomos.gomosLog(logger, gConsole, TRACE_DEV, "This ManualOverrideProcessFun dataInsruction.sourceMsg.body Splite data ito part", dataInsruction.sourceMsg.body);
          var keyOfmode = Object.keys(dataInsruction.sourceMsg.body);
          var keyOfResult = Object.keys(result[0].sourceMsg.body);
          for (let i = 0; i < keyOfmode.length; i++) {
            if (keyOfResult.includes(keyOfmode[i])) {
              result[0].sourceMsg.body[keyOfmode[i]]["activeMode"] = dataInsruction.sourceMsg.body[keyOfmode[i]]["mode"];
            }
          }
          gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is ManualOverrideProcessFun after asing", result[0].sourceMsg.body);
          dbo.collection("DeviceInstruction").updateOne(
            { _id: result[0]["_id"] },
            {
              $set: {
                "sourceMsg.body": result[0].sourceMsg.body,
                updatedTime: new Date(new Date().toISOString())
              }
            },
            function (err, result) {
              if (err) {
                gomos.errorCustmHandler(NAMEOFSERVICE, "manualOverrideProcess", 'update For Manual Override Updateting Error ', ` mac  ${dataInsruction.mac}`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
                reject(err)
              }
              resolve({ "manualOverrideProcess": result.result.nModified })
              gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "update For Manual Override ");
            }
          );
        }else{
          gomos.errorCustmHandler(NAMEOFSERVICE, "manualOverrideProcessFn", 'This is generated from manualOverrideProcessFn ', `result Not Found`, "", ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);
          resolve({ "manualOverrideProcessFn":"result Not Found" })
        }
      });
  });
}
function convertDateTimeForSetPrograme(time, addMinutes) {
  let date = new Date();
  let y = date.getFullYear();
  let m = date.getMonth();
  let d = date.getDate();
  var arr = time.split(":");
  var d2 = new Date()
  var newDate = new Date(y, m, d, arr[0], arr[1]);
  console.log(newDate);
  newDate.setMinutes(newDate.getMinutes() + addMinutes);
  return newDate;
}
function convertTochannelBsName(mac, channelName) {
  let index = dataFromDevices.findIndex(item => item.mac === mac);
  let objDevice = dataFromDevices[index];
  let keyCode = Object.keys(objDevice.channel);
  for (let i = 0; i < keyCode.length; i++) {
    gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is objDevice[keyCode[i]][configName]", objDevice.channel[keyCode[i]])
    gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is objDevice[keyCode[i]][configName]", objDevice.channel[keyCode[i]]["configName"])
    if (objDevice.channel[keyCode[i]]["configName"] === channelName) {
      return objDevice.channel[keyCode[i]].businessName;
    }
  }
}
function getConfigchannelNameToValue(mac, ArraConfigName, ConfigPayloadMsg) {
  let index = dataFromDevices.findIndex(item => item.mac === mac);
  let objDevice = dataFromDevices[index];
  let keyCode = Object.keys(objDevice.channel);
  for (let j = 0; j < ArraConfigName.length; j++) {
    for (let i = 0; i < keyCode.length; i++) {
      if (objDevice.channel[keyCode[i]]["configName"] === ArraConfigName[j]) {
        gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is TRue Condtions", ConfigPayloadMsg[ArraConfigName[j]])
        return ConfigPayloadMsg[ArraConfigName[j]];
      }
    }
  }
}

async function insertActivejob(dbo, dataInsruction, dataToInsert, payloadObject) {
  return new Promise(async function(resolve, reject) {

    gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "this is need For Insert", dataInsruction);
    gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "this is need For Insert", dataToInsert);
    let response = {}
    if (payloadObject.formStructure == "ProgramDetails") {
      gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is setProgrameProcess condtion True")
      // var keysofBNm = Object.keys(dataInsruction.sourceMsg.body);
      var Token = dataInsruction.sourceMsg["Token"];
      var startTime = dataInsruction.sourceMsg["body"].startTime;
      var name = dataInsruction.sourceMsg["body"].name;
      var version = dataInsruction.sourceMsg["body"].version;
      response["updateActiveJForExpiryJob"] = await updateActiveJForExpiryJob(dbo, dataInsruction);
      gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is DEBUG OF RESponse of updateActiveJForExpiryJob", response);
      for (let i = 0; i < dataInsruction.sourceMsg.body.schedules.length; i++) {
        let isDailyJob = true
        let dataTime = new Date(new Date().toISOString());
        //  gomos.gomosLog( logger,gConsole,TRACE_DEBUG, "this is key", keysofBNm);
        let channelName = convertTochannelBsName(dataToInsert.mac, dataInsruction.sourceMsg["body"].schedules[i][1]);
        let OffsetTime = dataInsruction.sourceMsg["body"].schedules[i][2];
        let duration = dataInsruction.sourceMsg["body"].schedules[i][3];
        let schNo = dataInsruction.sourceMsg["body"].schedules[i][0];
        gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is Line data", dataInsruction.sourceMsg["body"])
        gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is Line Number ", dataInsruction.sourceMsg["body"].schedules[i][1])

        let data = {
          mac: dataToInsert.mac,
          DeviceName: dataToInsert.DeviceName,
          type: "ActiveJob",
          sourceMsg: {
            body: {
              Channel: channelName
            },
            referenceToken: Token,
            // "Action": payloadId,
            isDailyJob: isDailyJob
          },
          createdTime: dataTime,
          updatedTime: dataTime
        };

        var dArray = ["ONTime", "OFFTime"];
        for (let j = 0; j < dArray.length; j++) {
          data["_id"] = uuidv4();
          data["sourceMsg"]["body"]["ActionType"] = dArray[j];
          data["sourceMsg"]["body"]["jobKey"] = `${name}-${version}-${schNo}`;
          data["sourceMsg"]["body"]["State"] = "Active";
          if (dArray[j] === "ONTime") {
            data["sourceMsg"]["body"]["ActionValues"] = "*:*:*:" + dateTime.create(convertDateTimeForSetPrograme(startTime, OffsetTime)).format("H:M:S");
            data["sourceMsg"]["body"]["ActionTime"] = ""
          } else {
            data["sourceMsg"]["body"]["ActionValues"] = "*:*:*:" + dateTime.create(convertDateTimeForSetPrograme(startTime, OffsetTime + duration)).format("H:M:S");
            data["sourceMsg"]["body"]["ActionTime"] = ""
          }
          data["sourceMsg"]["body"]["expiryDate"] = ""
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is log for Updateing the data base", data)
          response["DeviceInstructionInsert"] = await DeviceInstructionInsert(dbo, data);
        }

      }
    } else {
      var keysofBNm = Object.keys(dataInsruction.sourceMsg.body);
      var channelName = dataInsruction.sourceMsg["body"]["Channel"];
      var Token = dataInsruction.sourceMsg["Token"];
      var payloadId = dataInsruction.sourceMsg["body"]["ActionType"];
      var isDailyJob = dataInsruction.sourceMsg["isDailyJob"];
      var keyForRemove = ["Channel"];
      for (var i = 0; i < keyForRemove.length; i++) {
        if (keysofBNm.includes(keyForRemove[i])) {
          keysofBNm.splice(keysofBNm.indexOf(keyForRemove[i]), 1);
        }
      }
      var dataTime = new Date(new Date().toISOString());
      gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "this is key", keysofBNm);
      var data = {
        mac: dataToInsert.mac,
        DeviceName: dataToInsert.DeviceName,
        type: "ActiveJob",
        sourceMsg: {
          body: {
            Channel: channelName
          },
          referenceToken: Token,
          // "Action": payloadId,
          isDailyJob: isDailyJob
        },
        createdTime: dataTime,
        updatedTime: dataTime
      };
      var arrayBName = [];
      if (dataToInsert.payloadId == "AckSchedule") {
        var dArray = ["ONTime", "OFFTime"];
        for (var i = 0; i < keysofBNm.length; i++) {
          var dataforsplit = dataInsruction.sourceMsg["body"][keysofBNm[i]];
          var temp = dataforsplit.split(",");
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "this is split values" + temp[0], temp[1]);
          for (var j = 0; j < temp.length; j++) {
            data["_id"] = uuidv4();
            data["sourceMsg"]["body"]["ActionType"] = dArray[j];
            data["sourceMsg"]["body"]["ActionValues"] = temp[j];
            if (isDailyJob == true) {
              data["sourceMsg"]["body"]["ActionTime"] = "";
            } else {
              data["sourceMsg"]["body"]["ActionTime"] = compareDate(temp[j]);
            }
            response["DeviceInstructionInsert"] = await DeviceInstructionInsert(dbo, data);
          }
        }
      } else {
        for (var i = 0; i < keysofBNm.length; i++) {
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is key of DeviceInstruction", dataInsruction.sourceMsg["body"][keysofBNm[i]]);
          var key = keysofBNm[i];
          var value = dataInsruction.sourceMsg["body"][keysofBNm[i]];
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is key of DeviceInstruction", key + value);

          arrayBName.push({ bsName: key, value: value });
        }

        gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "this is some Array", arrayBName);

        for (var k = 0; k < arrayBName.length; k++) {
          data["_id"] = uuidv4();
          data["sourceMsg"]["body"]["ActionType"] = arrayBName[k].bsName;
          data["sourceMsg"]["body"]["ActionValues"] = arrayBName[k].value;
          // data["sourceMsg"]["ActionTime"] = new Date(arrayBName[k].value).toISOString();
          if (isDailyJob == true) {
            data["sourceMsg"]["body"]["ActionTime"] = "";
          } else {
            if (arrayBName[k].value instanceof Date) {
              data["sourceMsg"]["body"]["ActionTime"] = compareDate(
                arrayBName[k].value
              );
            } else {
              data["sourceMsg"]["body"]["ActionTime"] = arrayBName[k].value;
            }
          }
          response["DeviceInstructionInsert"] = await DeviceInstructionInsert(dbo, data);
        }
      }
    }
    resolve(response);
  })
}
function compareDate(str1) {
  gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "this what coming Date", str1);
  var arraydate = str1.split(":");
  gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "this what coming Date", arraydate[5] + "," + arraydate[4] + "," + arraydate[3] + "," + arraydate[2] + "," + arraydate[1] + "," + arraydate[0]);
  var date1 = new Date("20" + arraydate[0], arraydate[1] - 1, arraydate[2], arraydate[3], arraydate[4], arraydate[5]);
  return date1;
}
function convertDateObj(date, time, h) {
  gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "this what coming Date", date + time);
  let arraydate = date.split(":");
  let arraydate2 = time.split(":");
  gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "this what coming Date" + "," + arraydate[2] + "," + arraydate[1] + "," + arraydate[0]);
  let date1 = new Date("20" + arraydate[0], arraydate[1] - 1, arraydate[2], arraydate2[0], arraydate2[1]);
  date1.setDate(date1.getDate() + h);
  return date1;
}

function updateActiveJForExpiryJob(dbo, data) {
  return new Promise((resolve, reject) => {
    let currentTime = new Date(new Date().toISOString());
    gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is Date Object", data.sourceMsg["body"].wef);
    gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is Date Object", convertDateObj(data.sourceMsg["body"].wef, data.sourceMsg["body"].startTime, -1));

    dbo.collection("DeviceInstruction").updateMany({ mac: data.mac, type: "ActiveJob", "sourceMsg.body.expiryDate": "" },
      {
        $set: {
          "sourceMsg.body.expiryDate": convertDateObj(data.sourceMsg["body"].wef, data.sourceMsg["body"].startTime, -1),
          updatedTime: currentTime
        }
      },
      function (err, res) {
        if (err) {
          reject(err)
          gomos.errorCustmHandler(NAMEOFSERVICE, "updateActiveJForExpiryJob", 'DeviceInstruction Query Error ', ` mac  ${data.mac}`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
          gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is error update In Active Job  in DeviceInstructionInsert", err);
        }
        gomos.gomosLog(logger, gConsole, TRACE_DEV, " update In Active Job  in DeviceInstructionInsert", res.result.nModified);
        resolve({ "modified": res.result.nModified })
      }
    );
  });
}
function updateSetProgramDetails(dbo, data) {
  return new Promise((resolve, reject) => {
    dbo.collection("DeviceInstruction")
      .aggregate([{ $match: { "mac": data.mac, "type": "ProgramDetails" } },
      {
        $group: {
          _id: "$sourceMsg.body.name", version: { $max: "$sourceMsg.body.version" }
        }
      }]).toArray(function (err, result) {
        if (err) {
          reject(err)
          gomos.errorCustmHandler(NAMEOFSERVICE, "updateSetProgramDetails", 'DeviceInstruction Query Error ', ` mac  ${data.mac}`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
        }
        let data1 = result.map(item => `${item._id}-${item.version}`)
        let currentDate = new Date(new Date().toISOString());
        gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is result of find", data1)
        dbo.collection("DeviceInstruction")
          .find({
            "mac": data.mac, "type": "ProgramDetails", "sourceMsg.body.programKey": { $in: data1 },
            $or: [{ "sourceMsg.body.currentState": { $ne: "delete" } },
            { "sourceMsg.body.pendingConfirmation": { $ne: false } }]
          }).sort({ "createdTime": -1 }).limit(3).toArray(async function (err, result1) {
            if (err) {
              gomos.errorCustmHandler(NAMEOFSERVICE, "updateSetProgramDetails", 'DeviceInstruction second Query based  Error ', ` mac  ${data.mac} for Data : ${data1}`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
              reject(err)
            }
            var response = {};
            if (result1.length == 3) {

              var deleteResponse;
              gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is device Instruction for Program Details", result1);
              for (let i = 0; i < result1.length; i++) {
                gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is Result Value before in updateSetProgramDetails", result1[i].sourceMsg.body);
              }
              gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is Filter Value", `${data.sourceMsg["body"].name}-${data.sourceMsg["body"].version}`);
              let Index = result1.findIndex(item => item.sourceMsg.body.programKey == `${data.sourceMsg["body"].name}-${data.sourceMsg["body"].version}`)
              result1.splice(Index, 1)
              for (let i = 0; i < result1.length; i++) {

                gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is Result Value in updateSetProgramDetails", result1[i].sourceMsg.body);
              }
              let dateTime = new Date().toISOString()
              if (dateTime < result1[0].sourceMsg.body.wef && dateTime < result1[1].sourceMsg.body.wef) {
                gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is debug of condtion where wef is grater than date time", result1[1].sourceMsg.body);
                let id;
                if (result1[0].sourceMsg.body.wef > result1[1].sourceMsg.body.wef) {
                  id = result1[0]._id;
                  deleteResponse = await deleteActiveJob(dbo, result1[0])
                }
                else {
                  id = result1[1]._id;
                  deleteResponse = await deleteActiveJob(dbo, result1[1])
                }
                response = await programDeleteSet(dbo, id);
                gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is debug of condtion where wef is grater than date time response", response);
              }
              else if (dateTime > result1[0].sourceMsg.body.wef && dateTime < result1[1].sourceMsg.body.wef) {
                response = await programDeleteSet(dbo, result1[1]._id);
                deleteResponse = await deleteActiveJob(dbo, result1[1])
                gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is debug of condtion where wef 0 index less than  datetime and 1 index grater", result1[1].sourceMsg.body);
                gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is debug of condtion where wef 0 index less than  datetime and 1 index grater response", response);

              }
              else if (dateTime < result1[0].sourceMsg.body.wef && dateTime > result1[1].sourceMsg.body.wef) {
                response = await programDeleteSet(dbo, result1[0]._id);
                deleteResponse = await deleteActiveJob(dbo, result1[0])
                gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is debug of condtion where wef 0 index grater than  datetime and 1 index less", result1[0].sourceMsg.body);
                gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is debug of condtion where wef 0 index grater than  datetime and 1 index less response", response);

              }
              else {

                gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is debug of condtion where wef is less Than than date time", result1[0].sourceMsg.body);
                let id;
                if (result1[0].sourceMsg.body.wef > result1[1].sourceMsg.body.wef) {
                  id = result1[1]._id;
                  deleteResponse = await deleteActiveJob(dbo, result1[1])
                }
                else {
                  id = result1[0]._id;
                  deleteResponse = await deleteActiveJob(dbo, result1[0])
                }
                response = await programDeleteSet(dbo, id);
                gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is Response of delete", deleteResponse);
                gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is debug of condtion where wef is less Than than date time response", response);

              }
              resolve(response)

            }
            else {
              resolve(response)
            }


          });
      });
  });
}
function programDeleteSet(dbo, id) {
  return new Promise((resolve, reject) => {
    dbo.collection("DeviceInstruction").updateOne(
      { _id: id },
      {
        $set: {
          "sourceMsg.body.currentState": "delete",
          "sourceMsg.body.pendingConfirmation": false,
          updatedTime: new Date(new Date().toISOString())
        }
      },
      function (err, result) {
        if (err) {
          reject(err)
          gomos.errorCustmHandler(NAMEOFSERVICE, "programDeleteSet", 'DeviceInstruction Deleteing Error ', `  this is id :${id} for delete`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
        }
        if (result.result.nModified > 0) {
          gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is debug of programDeleteSet updated result Value", result.result.nModified);
          resolve({ "N": result.result.nModified })
        }else{
          resolve({ "programDeleteSetFn":"result Not Found" })
        }
      });
  });
}

function updateProgramDetailsForExpiryDate(dbo, data) {
  return new Promise((resolve, reject) => {
    let currentTime = new Date(new Date().toISOString());
    gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is Date Object", data.sourceMsg["body"].wef);
    gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is Date Object", convertDateObj(data.sourceMsg["body"].wef, data.sourceMsg["body"].startTime, -1));
    let key = `${data.sourceMsg["body"].name}-${data.sourceMsg["body"].version}`
    gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is Debug Of Key", key);
    dbo.collection("DeviceInstruction").updateMany({ mac: data.mac, type: "ProgramDetails", "sourceMsg.body.programKey": { $ne: key }, "sourceMsg.body.expiryDate": "" },
      {
        $set: {
          "sourceMsg.body.expiryDate": convertDateObj(data.sourceMsg["body"].wef, data.sourceMsg["body"].startTime, -1),
          updatedTime: currentTime
        }
      },
      function (err, res) {
        if (err) {
          reject(err)
          gomos.errorCustmHandler(NAMEOFSERVICE, "updateProgramDetailsForExpiryDate", 'This is error update In updateProgramDetailsForExpiryDate Job  in DeviceInstructionInsert', `  for This Key ${key}`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
        }
        gomos.gomosLog(logger, gConsole, TRACE_DEV, " update In updateProgramDetailsForExpiryDate Job  in DeviceInstructionInsert", res.result.nModified);
        resolve({ "modified": res.result.nModified })
      }
    );
  });
}

function DeviceInstructionInsert(dbo, data) {
  return new Promise((resolve, reject) => {

    dbo.collection("DeviceInstruction").insertOne(data, function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE, "DeviceInstructionInsert", 'this is deviceInstruction data Error ', data, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
        reject(err)
      }
      gomos.gomosLog(logger, gConsole, TRACE_DEBUG, " insert  in DeviceInstructionInsert");
      resolve({ "DeviceInstructionInsert": "inserted in DeviceInstruction " })
    });
  });
}
function deleteinstruction(dbo, id) {
  return new Promise((resolve, reject) => {
    dbo
      .collection("DeviceInstruction")
      .deleteOne({ _id: id }, function (err, result) {
        if (err) {
          gomos.errorCustmHandler(NAMEOFSERVICE, "deleteinstruction", 'This is Deleting In DeviceInstruction Error ', `This is id ${id}`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
          reject(err)
        }
        gomos.gomosLog(logger, gConsole, TRACE_DEV, "deleteinstruction ", id);
        resolve({ "deleteinstruction": result.result.n })
      });
  });
}
async function updateDeviceState(dbo, _id, devicesStateKeyValue, updatedTime, currentTime, index) {
  gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is DevicestateUpdate :" + index + ":" + _id, updatedTime)
  return new Promise((resolve, reject) => {
    dbo.collection("DeviceState").updateOne(
      { _id: _id, updatedTime: updatedTime },
      {
        $set: {
          sensors: devicesStateKeyValue.sensors,
          channel: devicesStateKeyValue.channel,
          updatedTime: currentTime
        }
      },
      function (err, res) {

        if (err) {
          reject(err)
          gomos.errorCustmHandler(NAMEOFSERVICE, "updateDeviceState", 'This is updateing error', `This is id ${_id} and ${devicesStateKeyValue}`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
        }
        if (res.result.nModified == 1) {
          resolve({ "updateDeviceState": "success" })
          gomos.gomosLog(logger, gConsole, TRACE_DEV, "updateDeviceState :" + index, currentTime);
        } else {
          gomos.errorCustmHandler(NAMEOFSERVICE, "updateDeviceState", 'This is generated from updateDeviceState ', `result Not Found`, "", ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);
          resolve({ "updateDeviceState": "Not success" })
          gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is Result Zero For DeviceUpdateMethod " + index, res.result.nModified)
        }
      }
    );
  }
  );
}
function updatedDeviceinstruction(dbo, updatedData) {
  return new Promise((resolve, reject) => {
    var id = updatedData["_id"];
    dateTime = new Date(new Date().toISOString());
    gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is  updatedDeviceinstruction true")
    dbo
      .collection("DeviceInstruction")
      .updateOne(
        { _id: id },
        { $set: { type: "executedJob", updatedTime: dateTime } },
        function (err, result) {
          if (err) {
            gomos.errorCustmHandler(NAMEOFSERVICE, "updatedDeviceinstruction", 'This is updateing error', `This is id ${id}`, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
            reject(err)
          }
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "updateDeviceState ", id);
          resolve({ "updatedDeviceinstruction": result.result.nModified })
        }
      );
  }
  );
}

function updatedDevinstWithCrteria(dbo, criteria, setUpdated) {
  return new Promise((resolve, reject) => {
    gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is  updatedDeviceinstruction true")
    dbo
      .collection("DeviceInstruction")
      .updateOne(
        criteria,
        { $set: setUpdated },
        function (err, result) {
          if (err) {
            gomos.errorCustmHandler(NAMEOFSERVICE, "updatedDevinstWithCrteria", "This is Updateing Error", criteria, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
            reject(err)
          }
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "updateDeviceInsruction ", criteria);
          resolve({ "updatedDevinstWithCrteria": result.result.nModified })
        }
      );
  }
  );
}
async function getAllconfig() {
  factSrvcSchedule = await gomosSchedule.getServiceConfig(dbo, NAMEOFSERVICE, "factSrvc", logger, gConsole);
  dataFromDevices  = await gomosDevices.getDevices(dbo, NAMEOFSERVICE, logger, gConsole);
 // dataFromAssets   = await gomosAssets.getAssets(dbo, NAMEOFSERVICE, logger, gConsole);
  dataFromSubCust  = await gomosSubCustCd.getSubCustomers(dbo, NAMEOFSERVICE, logger, gConsole);
  dataFromPayload  = await goomosPayloads.getPayloads(dbo, NAMEOFSERVICE, logger, gConsole);
}
function connectDb(){
  return new Promise((resolve,reject)=>{
    MongoClient.connect(urlConn, { useNewUrlParser: true }, function (
      err,
      connection
    ) {
      if (err) {

        gomos.errorCustmHandler(NAMEOFSERVICE, "module.exports", 'THIS IS MONGO CLIENT CONNECTION ERROR', ``, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
  reject(err)
      }
      dbo = connection.db(dbName);
      resolve(dbo)
    });
  })
 
}
var factTempInv = null;
module.exports = async function (app) {
  //const router = express.Router()

  urlConn = app.locals.urlConn;
  dbName = app.locals.dbName;
  if (process.argv[4] == SERVICE_VALUE) {
    console.log(process.argv[4]);
    gConsole = true;
    console.log(gConsole)
  }
 await connectDb()
  setTimeout(function () {
    factTempInv = app;
    getAllconfig();

    setTimeout(function () {
      processFactMessages();
    }, 5000);
  }, 7000);
};
