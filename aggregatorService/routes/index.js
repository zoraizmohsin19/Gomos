
var MongoClient = require("mongodb").MongoClient;
var scheduleTemp = require("node-schedule");
const moment = require('moment');
const uuidv4 = require('uuid/v4');

var urlConn, dbName;
var dateTime = require("node-datetime");
var dataFromDevices = [];

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

let  aggragator = require("./aggregatorFunction");
var dt = dateTime.create();
var formattedDate = dt.format('Y-m-d');
const output = fs.createWriteStream(`./aggStd${formattedDate}.log`, { flags: "a" });
const errorOutput = fs.createWriteStream(`./aggErr${formattedDate}.log`, { flags: "a" });
var logger = gomos.createConsole(output, errorOutput);
const SERVICE_VALUE = 1;
var gConsole = false;

function processAggregater() {
  var min = aggreSrvcSchedule.min;
// second place must be 0 
  var schPattern = `10 ${"*"} * * * *`;
  var tempSchedule = scheduleTemp.scheduleJob(schPattern,function () {
    MongoClient.connect(urlConn, { useNewUrlParser: true }, async function (
      err,
      connection
    ) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE, "module.exports", 'THIS IS MONGO CLIENT CONNECTION ERROR', ``, err, ERROR_DATABASE, ERROR_TRUE, EXIT_TRUE);
  
      }
      dbo = connection.db(dbName);
    gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is Scheduler process started in Aggregater service")
   // startProcess();
   let endRenge = moment();
   // minute 30 for server and 0 for local machine;
   endRenge.set({ minute: 30, second: 0, millisecond: 0 })
   let startRenge = moment(endRenge.toISOString()).subtract(1, "hours");
   let deviceMacDataArray = await getDistinctArrayOfmacHourly(dbo, endRenge, startRenge);
    let response   = await aggragator.startProcess(NAMEOFSERVICE,logger, gConsole ,dbo,startRenge.toISOString(),endRenge.toISOString(),deviceMacDataArray,"N")
    if(response === "completed"){
      connection.close();
   //  gomos.gomosLog(logger,gConsole,TRACE_PROD," here end response of service", response)
      // res.send(response+ "   Successfully")
 }
 gomos.gomosLog(logger,gConsole,TRACE_PROD," here end response of service", response)
  });
});
}
function getDistinctArrayOfmacHourly(dbo, endTime, startTime) {
  return new Promise((resolve, reject) => {
    gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "Entered Function - getDistinctArrayOfmacHourly");
    dbo.collection("MsgFacts")
      .distinct(
        "mac", { DeviceTime: { $lte: new Date(endTime.toISOString()), $gte: new Date(startTime.toISOString()) } }
        , function (err, result) {
          if (err) {
            gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "Exiting Function - getDistinctArrayOfmacHourly Error");
            reject(err)
            //process.hasUncaughtExceptionCaptureCallback();
          }
          gomos.gomosLog(logger, gConsole, TRACE_TEST, `These are the devices for which aggregation needs to be done `, result);
          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "Exiting Function - getDistinctArrayOfmacHourly Success");
          resolve(result);
        });
  });
}

async function getAllconfig() {
  aggreSrvcSchedule = await gomosSchedule.getServiceConfig(dbo, NAMEOFSERVICE, "aggrSrvc", logger, gConsole);
  //dataFromDevices = await gomosDevices.getDevices(dbo, NAMEOFSERVICE, logger, gConsole);
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
  setTimeout(() => {
    getAllconfig(); setTimeout(() => {
    processAggregater();

    }
      , 1000)
  }, 5000);
};
