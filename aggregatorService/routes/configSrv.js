'use strict'
class ConfigurationService {

    
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

}

module.exports = ConfigurationService;