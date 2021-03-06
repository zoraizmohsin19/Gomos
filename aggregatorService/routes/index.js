const scheduleTemp = require("node-schedule");
const moment = require('moment');
const gomos = require("../../commanFunction/routes/commanFunction");
const g = require('./gConstant')
const aggragator = require("./aggregatorFunction");

const ServiceScheduleManager = require("./ServiceScheduleManager/ServiceScheduleBs");
const MsgFactsModel = require('./Model/msgFactModel')

const NAMEOFSERVICE = "aggreterService";
const SERVICE_VALUE = 1;
var gConsole = false;

const logger = (require('./utilityFn')).CreateLogger(NAMEOFSERVICE)


async function processAggregator() {
  let aggreSrvcSchedul = await ServiceScheduleManager.initialize()
  console.log("min", aggreSrvcSchedul.getAggregationSchValue())
  var schPattern = `10 ${"*"} * * * *`;

  var tempSchedule = scheduleTemp.scheduleJob(schPattern, async function () {
    gomos.gomosLog(logger, gConsole, g.TRACE_PROD, "Processing Started - Aggregation Service");
    try {
      let endRange = moment();
      // minute 30 for server and 0 for local machine;
      endRange.set({ minute: 30, second: 0, millisecond: 0 })
      let startRange = moment(endRange.toISOString()).subtract(1, "hours");
      gomos.gomosLog(logger, gConsole, g.TRACE_PROD, ` aggregation StartRange - [${startRange.toISOString()}] and EndTime - [${endRange.toISOString()}]`);

      let deviceMacDataArray = await MsgFactsModel.getDistictFactByMac(NAMEOFSERVICE, logger, gConsole, endRange, startRange);
      gomos.gomosLog(logger, gConsole, g.TRACE_PROD, " deviceMacDataArray length of ", deviceMacDataArray.length);
      gomos.gomosLog(logger, gConsole, g.TRACE_DEBUG, " deviceMacDataArray  array of mac ", deviceMacDataArray);

      if (deviceMacDataArray.length > 0) {
        let response = await aggragator.startProcess(NAMEOFSERVICE, logger, gConsole, startRange.toISOString(), endRange.toISOString(), deviceMacDataArray, "N")
        gomos.gomosLog(logger, gConsole, g.TRACE_PROD, " here end response of service", response)
      }
    }
    catch (err) {
      gomos.errorCustmHandler(NAMEOFSERVICE, "processAggregator", 'This is Try-Catch error end of aggregator service - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);
      gomos.gomosLog(logger, gConsole, g.TRACE_PROD, " here aggregator service some error Occured end Of service in Catch", err)
    }
  });

  gomos.gomosLog(logger, gConsole, g.TRACE_PROD, "Processing End - Aggregation Service");
}
module.exports = async function (app) {
  urlConn = app.locals.urlConn;
  dbName = app.locals.dbName;
  if (process.argv[4] == SERVICE_VALUE) {
    gConsole = true;
  }

  setTimeout(() => {
    processAggregator();
  }, 1000)

};
