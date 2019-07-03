
var MongoClient = require("mongodb").MongoClient;
var scheduleTemp = require("node-schedule");
const moment = require('moment');
var urlConn, dbName;
var dateTime = require("node-datetime");
var dataFromDevices = [],
dataFromAssets = [],
dataFromSubCust = [],
dataFromPayload = [];
var aggreSrvcSchedule;
var dbo;
var fs = require("fs");
const NAMEOFSERVICE = "aggreterService";
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
var gomosSchedule = require("../../commanFunction/routes/getServiceConfig");
var gomosDevices = require("../../commanFunction/routes/getDevices");
let gomosAssets = require("../../commanFunction/routes/getAssets");
let gomosSubCustCd = require("../../commanFunction/routes/getSubCustomers");
let goomosPayloads = require("../../commanFunction/routes/getPayloads");
var dt = dateTime.create();
var formattedDate = dt.format('Y-m-d');
const output = fs.createWriteStream(`./aggStd${formattedDate}.log`, { flags: "a" });
const errorOutput = fs.createWriteStream(`./aggErr${formattedDate}.log`, { flags: "a" });
var logger = gomos.createConsole(output, errorOutput);
const SERVICE_VALUE = 1;
var gConsole = false;


function processAggregater() {
  var min = aggreSrvcSchedule.min;

  var schPattern =  `0 ${min} * * * *`;
  var tempSchedule = scheduleTemp.scheduleJob(schPattern, async function () {
    gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is Scheduler process in Aggregater service")
    gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is Console of Device")

    startProcess();
  });
}
// THIS IS MAIN STARTING FUNCTION FOR HOUR AGGREGATION
async function startProcess() {
  for (let i = 0; i < dataFromDevices.length; i++) {
    let json = {};
    //THIS IS MAKING IDENTIFIRES FOR HOURS AGGREGATION
    json["mac"] = dataFromDevices[i].mac;
    json["DeviceName"] = dataFromDevices[i].DeviceName;
    json["Date"] = new Date(moment().format("YYYY-MM-DD"));
    let startTime = moment();
    startTime.set({ minute: 0, second: 0, millisecond: 0 })
    let endTime = moment(startTime.toISOString()).subtract(1, "hours");
    json["hours"] = moment(moment(startTime.toISOString()).subtract(1, "hours")).hour();
    //THIS IS startMainProcessSensors FOR SENSORS DATA PROCESSING AND startMainProcessForChannel FOR CHANNEL PROCESS
    let sensorsData = await startMainProcessSensors(dataFromDevices[i], dataFromDevices[i].mac, "sensors", startTime, endTime)
    let channelData = await startMainProcessForChannel(dataFromDevices[i], dataFromDevices[i].mac, "channel", startTime, endTime);
    json["sensors"] = sensorsData["sensors"];
    json["channel"] = channelData["channel"];
    let currentTime =  new Date(new Date().toISOString());
    json["createdTime"] = currentTime;
    json["updatedTime"] = currentTime;


    gomos.gomosLog(logger, gConsole, TRACE_PROD, "This mai startProcess", json);
    if (sensorsData !== undefined && channelData !== undefined && (sensorsData["sensors"].length !== 0 || channelData["channel"].length !== 0 ) ) {
      //THIS IS inserIntoAggregation FOR INSERTING DATA OF AGGRAGATION HOURS
      await inserIntoAggregation(dbo, json);
    }else if (sensorsData["sensors"].length === 0 && channelData["channel"].length == 0 ){
      await inserIntoAlert(dbo, json);
    }
    else{
      gomos.errorCustmHandler(NAMEOFSERVICE, "startProcess", 'This key not found for processing - ', channelData,sensorsData , ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);
    }
  }


}
//THIS IS DEFINATION OF inserIntoAggregation 
function inserIntoAggregation(dbo, dataToInsert) {
  return new Promise(async (resolve, reject) => {
    dbo.collection("AggregatedData").insertOne(dataToInsert, function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE, "inserIntoAggregation", 'This Inserting To  aggregation Error - ', ` `, err, ERROR_DATABASE, ERROR_TRUE, EXIT_FALSE);
        reject(err)
      } else {

        gomos.gomosLog(logger, gConsole, TRACE_PROD, "Inserted : aggregation");
        resolve(result)
      }
    });
  })
}
function inserIntoAlert(dbo, dataToInsert) {
  return new Promise(async (resolve, reject) => {
    if (dataFromDevices.filter(element => element.mac == dataToInsert.mac).length == 0) {
   gomos.gomosLog(logger,gConsole,TRACE_DEV,"Mac Is not Found ",dataToInsert);
   resolve({err: "mac is Not Defind"})
  }else{

    let indexOfDevice = dataFromDevices.findIndex(element => element.mac == dataToInsert.mac);
    assetsId = dataFromDevices[indexOfDevice].assetId;
    if (dataFromAssets.filter(item => item.assetId == assetsId).length == 0){
      gomos.gomosLog(logger,gConsole,TRACE_DEV,"assetId Is not Found ", dataToInsert);
      resolve({err: "assetsId is Not Defind"})
    }
    else{
      let   subCustCd, custCd, spCd;
      let indexOfAsset = dataFromAssets.findIndex(element => element.assetId == assetsId);
      subCustCd = dataFromAssets[indexOfAsset].subCustCd;
      if (dataFromSubCust.filter(item => item.subCustCd == subCustCd).length == 0){
        gomos.gomosLog(logger,gConsole,TRACE_DEV,"subCustCd Is not Found ", dataToInsert)
        resolve({err: "subCustCd is Not Defind"})
      }else{
        let indexOfSubCust = dataFromSubCust.findIndex(element => element.subCustCd == subCustCd);
        custCd = dataFromSubCust[indexOfSubCust].custCd;
        spCd = dataFromSubCust[indexOfSubCust].spCd;
let jsonObj = {
  spCd: spCd,
  custCd: custCd,
  subCustCd: subCustCd,
  mac: dataToInsert.mac,
  DeviceName: dataToInsert.DeviceName,
  body: {
    Date: dataToInsert.Date,
    hours: dataToInsert.hours,
    alertText: "Data Not Found In MsgFacts",
    sensors: dataToInsert.sensors,
    channel: dataToInsert.channel
  },
  type: "level2",
  subType : "Notification1",
  createdTime : dataToInsert.createdTime,
  updatedTime: dataToInsert.updatedTime,
}

        await inserIntoAlertLeve2(dbo, jsonObj);
        resolve(jsonObj)
      }
    }
    
  }
    

  })
}
function inserIntoAlertLeve2(dbo, dataToInsert) {
  return new Promise(async (resolve, reject) => {
    dbo.collection("Alerts").insertOne(dataToInsert, function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE, "inserIntoAggregation", 'This Inserting To  inserIntoAlert Error - ', ` `, err, ERROR_DATABASE, ERROR_TRUE, EXIT_FALSE);
        reject(err)
      } else {

        gomos.gomosLog(logger, gConsole, TRACE_PROD, "Inserted : Alerts");
        resolve(result)
      }
    });
  })
}
function getBsNameAndType(dataFromDevices, TypeOf) {
  let arrayBSName = [];
  let bsName = [];
  let Type = [];
  let = json = {};
  let codeKeys = Object.keys(dataFromDevices[TypeOf]);
  for (let k = 0; k < codeKeys.length; k++) {
    if (dataFromDevices[TypeOf][codeKeys[k]].aggregationProcesse !== undefined || dataFromDevices[TypeOf][codeKeys[k]].aggregationProcesse === "Y") {
      let temp = dataFromDevices[TypeOf][codeKeys[k]].Type + "." + dataFromDevices[TypeOf][codeKeys[k]].businessName;
      bsName.push(dataFromDevices[TypeOf][codeKeys[k]].businessName)
      Type.push(dataFromDevices[TypeOf][codeKeys[k]].Type)
      arrayBSName.push(temp);
    }
    else {
      gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is not Definde", dataFromDevices[TypeOf][codeKeys[k]].businessName);
      gomos.errorCustmHandler(NAMEOFSERVICE, "getBsNameAndType", 'This is not Definde  for processing', ` `, dataFromDevices[TypeOf][codeKeys[k]].businessName, ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);

    }

  }
  json["arrayBSName"] = arrayBSName;
  json["bsName"] = bsName;
  json["Type"] = Type;
  return json;
}
//THIS IS startMainProcessForChannel DEFINATION FOR CHANNEL PROCESSING
async function startMainProcessForChannel(dataFromDevices, mac, TypeOf, startTime, endTime) {
  return new Promise(async (resolve, reject) => {
    let arrayBSName = [];
    let bsName = [];
    let Type = [];
    let = json = {};
    let channelInfo = await getBsNameAndType(dataFromDevices, TypeOf);
    arrayBSName = channelInfo["arrayBSName"];
    bsName = channelInfo["bsName"];
    Type = channelInfo["Type"];
    json["channel"] = [];
    if (arrayBSName.length != 0) {
     
      for (let j = 0; j < arrayBSName.length; j++) {
        let tempObj = { "bsName": bsName[j] }
        let response = await aggragateChannel(dbo, mac, startTime, endTime, arrayBSName[j], Type[j], bsName[j]);
        if(response.result !== "err"){
        gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is Response of Channel", response)
        tempObj["duration"] = response["duration"];
        tempObj["noOfStart"] = response["noOfStart"];
        tempObj["Count"] = response["Count"];
        json["channel"].push(tempObj)
        }
        else{
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is else part Data not found",tempObj);

         // gomos.errorCustmHandler(NAMEOFSERVICE, "startMainProcessForChannel", 'This is not data for processing', ` `, '', ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);
        }
      }
      gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is main result", json)
      resolve(json)
    } else {
      resolve(json)
    }

  });
}
function aggragateChannel(dbo, mac, dt, dt2, arrayBSName, Type, bsName) {
  return new Promise((resolve, reject) => {
    let tempCriteria = { mac: mac, DeviceTime: { $lte: new Date(dt.toISOString()), $gte: new Date(dt2.toISOString()) } }
    tempCriteria[`sensors.${arrayBSName}`] = { $exists: true }

    dbo.collection("MsgFacts")
      .find(tempCriteria).sort({ "DeviceTime": 1 })
      .toArray(async function (err, result) {
        if (err) {
          reject(err)
          //process.hasUncaughtExceptionCaptureCallback();
        }
        gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is result of aggregation", result);
        if (result.length > 0) {
          let dateArray = [];
          let duration = 0;
          let Count = result.length;
          let noOfStart = 0;
          for (let i = 0; i < result.length; i++) {
            if (result[i]["sensors"][Type][bsName] == 1) {
              if (i === 0 && result[0]["sensors"][Type][bsName] == 1) {
                let response = await getlastTimeForOn(dbo, mac, arrayBSName, { $lt: new Date(dt2.toISOString()) });
                if (response.length !== 0 && response[0]["sensors"][Type][bsName] == 1) {
                  dateArray.push(new Date(dt2.toISOString()))
                }
              }
              dateArray.push(result[i].DeviceTime)

              if (i === result.length - 1) {
                if (result[result.length - 1]["sensors"][Type][bsName] == 1) {
                  dateArray.push(new Date(dt.toISOString()))
                }
                if (dateArray.length != 0) {
                  duration += moment.duration(moment(dateArray[dateArray.length - 1]).diff(moment(dateArray[0]))).asMinutes();
                  dateArray = [];
                }
                if (noOfStart === 0) {
                  noOfStart++;
                }
              }
            }
            else if (result[i]["sensors"][Type][bsName] == 0) {
              if (dateArray.length != 0) {
                duration += moment.duration(moment(result[i].DeviceTime).diff(moment(dateArray[0]))).asMinutes();
                dateArray = [];
                noOfStart++;
              }
            }
          }
          resolve({ duration, noOfStart, Count })

        }
        else {
          resolve({ result: "err" })
        }
      });
  });
}

function getlastTimeForOn(dbo, mac, arrayBSName, DeviceTime) {
  return new Promise((resolve, reject) => {
    let tempCriteria = { mac: mac, DeviceTime: DeviceTime }
    tempCriteria[`sensors.${arrayBSName}`] = { $exists: true }

    dbo.collection("MsgFacts")
      .find(tempCriteria).sort({ "DeviceTime": -1 }).limit(1)
      .toArray(function (err, result) {
        if (err) {
          reject(err)
        }
        else {
          resolve(result);
        }

      })
  })
}

async function startMainProcessSensors(dataFromDevices, mac, TypeOf, startTime, endTime) {
  return new Promise(async (resolve, reject) => {
    let arrayBSName = [];
    let bsName = [];
    let Type = [];
    let = json = {};
    let sensorsInfo = await getBsNameAndType(dataFromDevices, TypeOf);
    arrayBSName = sensorsInfo["arrayBSName"];
    bsName = sensorsInfo["bsName"];
    Type = sensorsInfo["Type"];
    json["sensors"] = [];
    if (arrayBSName.length != 0) {
      
      for (let j = 0; j < arrayBSName.length; j++) {
        let tempObj = { "bsName": bsName[j] }
        let response = await aggragateSensors(dbo, mac, startTime, endTime, arrayBSName[j])
        gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is Response", response)
        if (response.result !== "err") {
          tempObj["Max"] = response["Max"]
          tempObj["Min"] = response["Min"]
          tempObj["Avg"] = response["Avg"]
          tempObj["Sum"] = response["Sum"]
          tempObj["Count"] = response["Count"]
          json["sensors"].push(tempObj)
        } else {
           gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is else part Data not found",tempObj);
        //  gomos.errorCustmHandler(NAMEOFSERVICE, "startMainProcessSensors", 'This is not data for processing', ` `, '', ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);
        }
      }
      gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is main result", json)
      resolve(json)
    } else {
      resolve(json)
    }

  });
}
function aggragateSensors(dbo, mac, dt, dt2, arrayBSName) {
  return new Promise((resolve, reject) => {
    dbo.collection("MsgFacts")
      .aggregate([
        { $match: { mac: mac, DeviceTime: { $lte: new Date(dt.toISOString()), $gte: new Date(dt2.toISOString()) } } },
        {
          $group: {
            _id: "$mac",
            Max: { $max: `$sensors.${arrayBSName}` },
            Min: { $min: `$sensors.${arrayBSName}` },
            Avg: { $avg: `$sensors.${arrayBSName}` },
            Sum: { $sum: `$sensors.${arrayBSName}` },
            Count: { $sum: 1 }
          }

        }
      ])
      .toArray(function (err, result) {
        if (err) {
          reject(err)
          //process.hasUncaughtExceptionCaptureCallback();
        }
        gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is result of aggregation", result);
        if (result[0] !== undefined) {
          resolve(result[0])
        }
        else {
          resolve({ result: "err" })
        }
      });
  });
}


async function getAllconfig() {
  aggreSrvcSchedule = await gomosSchedule.getServiceConfig(dbo, NAMEOFSERVICE, "aggrSrvc", logger, gConsole);
  dataFromDevices = await gomosDevices.getDevices(dbo, NAMEOFSERVICE, logger, gConsole);
  dataFromAssets   = await gomosAssets.getAssets(dbo, NAMEOFSERVICE, logger, gConsole);
  dataFromSubCust  = await gomosSubCustCd.getSubCustomers(dbo, NAMEOFSERVICE, logger, gConsole);
  dataFromPayload  = await goomosPayloads.getPayloads(dbo, NAMEOFSERVICE, logger, gConsole);

}
module.exports = function (app) {
  //const router = express.Router()

  urlConn = app.locals.urlConn;
  dbName = app.locals.dbName;
  if (process.argv[4] == SERVICE_VALUE) {
    console.log(process.argv[4]);
    gConsole = true;
    console.log(gConsole)
  }
  MongoClient.connect(urlConn, { useNewUrlParser: true }, function (
    err,
    connection
  ) {
    if (err) {
      gomos.errorCustmHandler(NAMEOFSERVICE, "module.exports", 'THIS IS MONGO CLIENT CONNECTION ERROR', ``, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);

    }
    dbo = connection.db(dbName);
  });
  setTimeout(() =>{getAllconfig(); setTimeout(()=> {processAggregater(); 
//     setTimeout( () =>  
//     //startProcess()
// , 5000)
}
, 1000)}, 5000);
};
