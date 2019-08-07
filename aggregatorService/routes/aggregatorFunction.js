// 'use strict';

const moment = require('moment');
const utilityFn = require('./utilityFn')

var gomos = require("../../commanFunction/routes/commanFunction");
const MsgFactModel = require('./Model/msgFactModel')
const g = require('./gConstant')
var logger;
var gConsole;

const DeviceModel = require("./Model/deviceManagerModel");
const AggregatorModel = require("./Model/aggregatorModel");



// THIS IS MAIN STARTING FUNCTION FOR HOUR AGGREGATION
module.exports.startProcess = async function (serviceName, serviceLog, logTerminalConsole, startRange, endRange, deviceMacDataArray, deleteExistingDocs) {
  logger = serviceLog;
  gConsole = logTerminalConsole;
  NAMEOFSERVICE = serviceName;

  gomos.gomosLog(logger, gConsole, g.TRACE_DEV, `startProcess called`)

  let dataFromDevices = await DeviceModel.readAllDevices(NAMEOFSERVICE, logger, gConsole);

  gomos.gomosLog(logger, gConsole, g.TRACE_DEV, `#[${dataFromDevices.length}] - dataFromDevice Array`, dataFromDevices);
  gomos.gomosLog(logger, gConsole, g.TRACE_DEV, `#[${deviceMacDataArray.length}] - deviceMacDataArray Array`, deviceMacDataArray);

  let rengeOfTime = await utilityFn.dateSpliterInHourly(startRange, endRange);
  gomos.gomosLog(logger, gConsole, g.TRACE_PROD, `rengeOfTime length - [${rengeOfTime.length}] and Array of Time`, rengeOfTime);

  for (let t = 0; t < rengeOfTime.length; t++) {
    let endTime = rengeOfTime[t].endTime;
    let startTime = rengeOfTime[t].startTime
    gomos.gomosLog(logger, gConsole, g.TRACE_PROD, `startTime [${startTime}] endTime - [${endTime}] - Date - [${moment(utilityFn.calcIST(startTime)).format("YYYY-MM-DD")}]  Hour - [${utilityFn.calcIST(startTime).getHours()}]  - going to process aggregation for this period.`);


    for (let i = 0; i < deviceMacDataArray.length; i++) {
      let headerInfo = {};
      //     //THIS IS MAKING IDENTIFIRES FOR HOURS AGGREGATION
      let DeviceIndex = dataFromDevices.findIndex(item => item.mac == deviceMacDataArray[i])
      gomos.gomosLog(logger, gConsole, g.TRACE_TEST, `[${dataFromDevices[DeviceIndex].mac}] - [${i}]  DeviceIndex [${DeviceIndex}] - This is Device Going Process `)
      headerInfo["mac"] = dataFromDevices[DeviceIndex].mac;
      headerInfo["DeviceName"] = dataFromDevices[DeviceIndex].DeviceName;
      let temDate = moment(utilityFn.calcIST(startTime))
      headerInfo["Date"] = temDate.format("YYYY-MM-DD");
      headerInfo["Day"] = ((temDate.dayOfYear()).toString()).padStart(2, "0");
      headerInfo["Week"] = ((temDate.isoWeek()).toString()).padStart(2, "0");
      headerInfo["Month"] = ((temDate.month() + 1).toString()).padStart(2, "0");
      headerInfo["Year"] = (temDate.year()).toString()

      headerInfo["Hour"] = ((utilityFn.calcIST(startTime).getHours()).toString()).padStart(2, "0");

      //THIS IS startMainProcessSensors FOR SENSORS DATA PROCESSING AND startMainProcessForChannel FOR CHANNEL PROCESS
      if (deleteExistingDocs !== "N") {
        let responseDeletedRecord = await AggregatorModel.checkingDataAvailability(NAMEOFSERVICE, logger, gConsole, dataFromDevices[DeviceIndex].mac, headerInfo["Date"], headerInfo["Hour"]);
        gomos.gomosLog(logger, gConsole, g.TRACE_TEST, `[${dataFromDevices[DeviceIndex].mac}] -total # record deleted `, responseDeletedRecord);
      }

      let sensorsData = await startMainProcessSensors(dataFromDevices[DeviceIndex], dataFromDevices[DeviceIndex].mac, "sensors", endTime, startTime);

      let channelData = await startMainProcessForChannel(dataFromDevices[DeviceIndex], dataFromDevices[DeviceIndex].mac, "channel", endTime, startTime);

      let Data = (sensorsData["sensors"]).concat(channelData["channel"]);
      gomos.gomosLog(logger, gConsole, g.TRACE_DEBUG, "This mai startProcess1", headerInfo);
      gomos.gomosLog(logger, gConsole, g.TRACE_TEST, `[${dataFromDevices[DeviceIndex].mac}] - [${Data.length}]  DeviceIndex [${DeviceIndex}] -total # records - ready to insert `);

      if (sensorsData !== undefined && channelData !== undefined && (Data.length !== 0)) {
        //THIS IS inserIntoAggregation FOR INSERTING DATA OF AGGRAGATION HOURS  
        let currentTime = new Date(new Date().toISOString());
        let ArrayOfObject = [];
        for (let l = 0; l < Data.length; l++) {
          let json = JSON.parse(JSON.stringify(headerInfo))

          let key = Object.keys(Data[l]);
          for (let j = 0; j < key.length; j++) {
            json[key[j]] = Data[l][key[j]];
          }
          json["flag"] = deleteExistingDocs;
          json["createdTime"] = currentTime;
          json["updatedTime"] = currentTime;
          // let aggregator =  new AggregatorModel(json);
          // let saveValue = await aggregator.save();
          // console.log("save",saveValue)
          gomos.gomosLog(logger, gConsole, g.TRACE_TEST, `[${json.mac}] - [${json.bsName}] - About to insert for this Sensor/Channel`);
          gomos.gomosLog(logger, gConsole, g.TRACE_DEBUG, "This main Document Insert in Aggrageter And Index" + l, json);
          ArrayOfObject.push(json)
        }

        let infoInsert = await AggregatorModel.insertMany(ArrayOfObject)
        gomos.gomosLog(logger, gConsole, g.TRACE_TEST, "Inserted : aggregation", infoInsert.length);
      } else if (Data.length === 0) {
        //  this condition never meet
        //  await inserIntoAlert(dbo, json);
      }
      else {
        gomos.errorCustmHandler(NAMEOFSERVICE, "startProcess", 'This key not found for processing - ', channelData, sensorsData, g.ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);
      }
    }
  }
  gomos.gomosLog(logger, gConsole, g.TRACE_PROD, "This is End OF Aggregator Function");
  return "completed"

}

function getBsNameAndType(dataFromDevices, TypeOf) {
  let arrayBSName = [];
  let bsName = [];
  let Type = [];
  let = json = {};
  let codeKeys = Object.keys(dataFromDevices[TypeOf]);
  for (let k = 0; k < codeKeys.length; k++) {
    if (dataFromDevices[TypeOf][codeKeys[k]].aggregationProcesse !== undefined && dataFromDevices[TypeOf][codeKeys[k]].aggregationProcesse === "Y") {
      let temp = dataFromDevices[TypeOf][codeKeys[k]].Type + "." + dataFromDevices[TypeOf][codeKeys[k]].businessName;
      bsName.push(dataFromDevices[TypeOf][codeKeys[k]].businessName)
      Type.push(dataFromDevices[TypeOf][codeKeys[k]].Type)
      arrayBSName.push(temp);
    }
    else {
      gomos.gomosLog(logger, gConsole, g.TRACE_DEV, "This is not Definde", dataFromDevices[TypeOf][codeKeys[k]].businessName);
      gomos.errorCustmHandler(NAMEOFSERVICE, "getBsNameAndType", 'This is not Definde  for processing', ` `, dataFromDevices[TypeOf][codeKeys[k]].businessName, g.ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);

    }

  }
  json["arrayBSName"] = arrayBSName;
  json["bsName"] = bsName;
  json["Type"] = Type;
  return json;
}
//THIS IS startMainProcessForChannel DEFINATION FOR CHANNEL PROCESSING
async function startMainProcessForChannel(dataFromDevices, mac, TypeOf, endTime, startTime) {
  return new Promise(async (resolve, reject) => {
    let arrayBSName = [];
    let bsName = [];
    let Type = [];
    let = json = {};
    let channelInfo = await getBsNameAndType(dataFromDevices, TypeOf);
    gomos.gomosLog(logger, gConsole, g.TRACE_TEST, `[${mac}] - [${channelInfo["arrayBSName"].length}] -  # of channels associated with Device `);
    arrayBSName = channelInfo["arrayBSName"];
    bsName = channelInfo["bsName"];
    Type = channelInfo["Type"];
    json["channel"] = [];
    if (arrayBSName.length != 0) {

      for (let j = 0; j < arrayBSName.length; j++) {
        let tempObj = { "bsName": bsName[j] }
        let response = await aggragateChannel(mac, endTime, startTime, arrayBSName[j], Type[j], bsName[j]);
        if (response.result !== "err") {
          gomos.gomosLog(logger, gConsole, g.TRACE_DEV, "This is Response of Channel", response)
          tempObj["duration"] = response["duration"];
          tempObj["noOfStart"] = response["noOfStart"];
          tempObj["Count"] = response["Count"];
          json["channel"].push(tempObj)
        }
        else {
          gomos.gomosLog(logger, gConsole, g.TRACE_DEBUG, "This is else part Data not found", tempObj);

        }
      }
      gomos.gomosLog(logger, gConsole, g.TRACE_TEST, `[${mac}] - [${json["channel"].length}] - # of channels with activity in the current period `);
      gomos.gomosLog(logger, gConsole, g.TRACE_DEBUG, "This is sensors result", json);
      resolve(json)
    } else {
      resolve(json)
    }

  });
}
function aggragateChannel(mac, endRange, startRange, arrayBSName, Type, bsName) {
  return new Promise((resolve, reject) => {
    MsgFactModel.getAggragateChannel(NAMEOFSERVICE, logger, gConsole, mac, endRange, startRange, arrayBSName)
      .then(async function (result) {

        gomos.gomosLog(logger, gConsole, g.TRACE_DEV, "This is result of aggregation", result);
        if (result.length > 0) {
          let dateArray = [];
          let duration = 0;
          let Count = result.length;
          let noOfStart = 0;
          for (let i = 0; i < result.length; i++) {
            if (result[i]["sensors"][Type][bsName] == 1) {
              if (i === 0 && result[0]["sensors"][Type][bsName] == 1) {
                let response = await MsgFactModel.getlastTimeForOn(NAMEOFSERVICE, logger, gConsole, mac, arrayBSName, startRange);
                if (response.length !== 0 && response[0]["sensors"][Type][bsName] == 1) {
                  dateArray.push(new Date(startRange))
                }
              }
              dateArray.push(result[i].DeviceTime)

              if (i === result.length - 1) {
                if (result[result.length - 1]["sensors"][Type][bsName] == 1) {
                  dateArray.push(new Date(endRange))
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
      }).catch(err => { console.log("error", err) });
  });
}

async function startMainProcessSensors(dataFromDevices, mac, TypeOf, endTime, startTime) {
  return new Promise(async (resolve, reject) => {
    let arrayBSName = [];
    let bsName = [];
    let Type = [];
    let = json = {};
    let sensorsInfo = await getBsNameAndType(dataFromDevices, TypeOf);
    gomos.gomosLog(logger, gConsole, g.TRACE_TEST, `[${mac}] - [${sensorsInfo["arrayBSName"].length}] - # of sensors associated with Device`)

    arrayBSName = sensorsInfo["arrayBSName"];
   
    bsName = sensorsInfo["bsName"];
    Type = sensorsInfo["Type"];
    json["sensors"] = [];
    if (arrayBSName.length != 0) {

      for (let j = 0; j < arrayBSName.length; j++) {
        let tempObj = { "bsName": bsName[j] }
        // let response = await aggragateSensors(dbo, mac, endTime, startTime, arrayBSName[j])
        let response = await MsgFactModel.getAggragateSensors(NAMEOFSERVICE, logger, gConsole, mac, endTime, startTime, arrayBSName[j]);

        gomos.gomosLog(logger, gConsole, g.TRACE_DEBUG, "This is Response", response)
        if (response.result !== "err") {

          tempObj["Max"] = utilityFn.convertIntTodecPoint(response[0]["Max"], 2);
          tempObj["Min"] = utilityFn.convertIntTodecPoint(response[0]["Min"], 2);
          tempObj["Avg"] = utilityFn.convertIntTodecPoint(response[0]["Avg"], 2);
          tempObj["Sum"] = utilityFn.convertIntTodecPoint(response[0]["Sum"], 2);
          tempObj["Count"] = response["Count"]
          json["sensors"].push(tempObj)
        } else {
          gomos.gomosLog(logger, gConsole, g.TRACE_DEBUG, "This is else part Data not found", tempObj);
          //  gomos.errorCustmHandler(NAMEOFSERVICE, "startMainProcessSensors", 'This is not data for processing', ` `, '', g.ERROR_APPLICATION, ERROR_FALSE, EXIT_FALSE);
        }
      }
      gomos.gomosLog(logger, gConsole, g.TRACE_TEST, `[${mac}] - [${json["sensors"].length}] -  # of sensors with activity in the current period`);

      gomos.gomosLog(logger, gConsole, g.TRACE_DEBUG, "This is sensors result", json)
      resolve(json)
    } else {

      resolve(json)
    }

  });
}