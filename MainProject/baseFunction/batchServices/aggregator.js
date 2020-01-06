const scheduleTemp = require("node-schedule");
const moment = require('moment');
const gomos = require("../commanUtilityFn/commanFunction");
const g = require('../commanUtilityFn/gConstant')
const aggragator = require("./aggregatorFunction");

const alertsConfigBs = require("../BusinessLogic/alertsConfigBs");
const deviceBs = require("../BusinessLogic/deviceBs");
const alertBs = require("../BusinessLogic/alertBs");
const ServiceScheduleManager = require("../ServiceScheduleManager/ServiceScheduleBs");
const MsgFactsModel = require('../model/msgFactModel')
const utilityFn = require('../commanUtilityFn/utilityFn')
const NAMEOFSERVICE = "aggreterService";
const SERVICE_VALUE = 1;
var gConsole = false;

const logger = (require('../commanUtilityFn/utilityFn')).CreateLogger(NAMEOFSERVICE)


async function processAggregator() {
  let aggreSrvcSchedul = await ServiceScheduleManager.initialize()
  console.log("min", aggreSrvcSchedul.getAggregationSchValue())
   var schPattern = `0 ${aggreSrvcSchedul.getAggregationSchValue()} * * * *`;
 //  var schPattern = `10 * * * * *`;

  var tempSchedule = scheduleTemp.scheduleJob(schPattern, async function () {
    gomos.gomosLog(logger, gConsole, g.TRACE_PROD, "Processing Started - Aggregation Service");
    try {

      let endRange = utilityFn.dateFloor(new Date());
      // console.log("moment endRange", endRange)

      let startRange = moment(endRange.toISOString()).subtract(1, "hours");
      gomos.gomosLog(logger, gConsole, g.TRACE_PROD, ` aggregation StartRange - [${startRange.toISOString()}] and EndTime - [${endRange.toISOString()}]`);

      let deviceMacDataArray = await MsgFactsModel.getDistictFactByMac(NAMEOFSERVICE, logger, gConsole, endRange, startRange);
      gomos.gomosLog(logger, gConsole, g.TRACE_PROD, " deviceMacDataArray length of ", deviceMacDataArray.length);
      gomos.gomosLog(logger, gConsole, g.TRACE_DEBUG, " deviceMacDataArray  array of mac ", deviceMacDataArray);
       let resAlert = await alertGeneratorForDevice(deviceMacDataArray, startRange.toISOString());

      if (deviceMacDataArray.length > 0) {
        let response = await aggragator.startProcess(NAMEOFSERVICE, logger, gConsole, startRange.toISOString(), endRange.toISOString(), deviceMacDataArray, "N")
        gomos.gomosLog(logger, gConsole, g.TRACE_PROD, " here end response of service", response)
      }

      gomos.gomosLog(logger, gConsole, g.TRACE_DEBUG, " alertGeneratorForDevice  array of promise ", resAlert);

    }
    catch (err) {
      gomos.errorCustmHandler(NAMEOFSERVICE, "processAggregator", 'This is Try-Catch error end of aggregator service - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);
      gomos.gomosLog(logger, gConsole, g.TRACE_PROD, " here aggregator service some error Occured end Of service in Catch", err)
    }
  });

  gomos.gomosLog(logger, gConsole, g.TRACE_PROD, "Processing End - Aggregation Service");
}


function alertGeneratorForDevice(deviceMacDataArray, startRange) {
  
  gomos.gomosLog(logger, gConsole, g.TRACE_DEBUG, " alertGeneratorForDevice with deviceMacDataArray", deviceMacDataArray)
  return new Promise(async (resolve, reject) => {
    var date =  (moment(utilityFn.calcIST(startRange))).format("YYYY-MM-DD");
    var hour = ((utilityFn.calcIST(startRange).getHours()).toString()).padStart(2, "0");

    await alertsConfigBs.getAlertConfigsdetails(NAMEOFSERVICE, logger, gConsole)
      .then(async result => {
        if (result.length > 0) {

          for (let i = 0; i < result.length; i++) {
            deviceBs.fetchDeviceBysubCustCd(NAMEOFSERVICE, logger, gConsole, result[i].subCustCd)
              .then(async result2 => {
                for (let j = 0; j < result2.length; j++) {
                  if (!deviceMacDataArray.includes(result2[j].mac)) {
                    gomos.gomosLog(logger, gConsole, g.TRACE_TEST, "deviceMacDataArray not include with this mac", result2[j].mac);

                    let alertObject = {};
                    alertObject["spCd"] = result[i]["spCd"];
                    alertObject["custCd"] = result[i]["custCd"];
                    alertObject["subCustCd"] = result[i]["subCustCd"];
                    alertObject["mac"] = result2[j]["mac"];
                    alertObject["DeviceName"] = result2[j]["DeviceName"];
                    alertObject["emailRecipientRole"] = result[i]["emailRecipientRole"];
                    alertObject["shortName"] = result[i]["shortName"];
                    alertObject["sensorNm"] =  result[i]["sensorNm"];
                    alertObject["businessNm"] = "Device"
                    alertObject["businessNmValues"] =`Date : ${date} and Hour:  ${hour}`;

                    alertObject["user"] = 'aggregatorService';
                    alertObject["type"] = result[i]["type"];
                    try {
                    alertObject["criteria"] = eval(result[i]["criteria"]);
                      
                    } catch (error) {
                    alertObject["criteria"] = result[i]["criteria"];
                      
                    }
                    try {
                    alertObject["alertText"] = eval(result[i]["alertText"])
                      
                    } catch (error) {
                      alertObject["alertText"] = result[i]["alertText"];
                    }
                    alertObject["processed"] = "N";
                //    alertObject["dtTime"] = result[i]["dtTime"];

                    await alertBs.saveAlert(NAMEOFSERVICE, logger, gConsole, alertObject)
                      .then(result3 => {
                        gomos.gomosLog(logger, gConsole, g.TRACE_TEST, "saveAlert save", result3);
                      })
                  }
                  else {
                    gomos.gomosLog(logger, gConsole, g.TRACE_TEST, "deviceMacDataArray  include with this mac", result2[j].mac)

                  }
                }
                resolve({ "processed": true });
              })
          }
        } else {
          resolve({ getAlertConfigsdetails: "length is zero " });
        }
      })
  })
    .catch(err => {
      gomos.errorCustmHandler(NAMEOFSERVICE, "alertGeneratorForDevice", 'This is Promise  Catch error in Promise Aggregator Service - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);

    })
}

module.exports = async function (app) {
  // urlConn = app.locals.urlConn;
  // dbName = app.locals.dbName;
  if (process.argv[4] == SERVICE_VALUE) {
    gConsole = true;
  }

  setTimeout(() => {
    console.log("India Time", new Date(new Date().toLocaleString('en-US', { timeZone: "Asia/Kolkata" })))
    processAggregator();
  }, 1000)

};
