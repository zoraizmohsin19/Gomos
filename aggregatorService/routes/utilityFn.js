const { Console } = require('console');
const moment = require('moment');
var dateTime = require("node-datetime");
var fs = require("fs");



// THIS IS METHOD FOR CREATE LOGGER
module.exports.CreateLogger = function (serviceName) {
    let dt = dateTime.create();
    let formattedDate = dt.format('Y-m-d');
    const output = fs.createWriteStream(`./${serviceName}Std${formattedDate}.log`, { flags: "a" });
    const errorOutput = fs.createWriteStream(`./${serviceName}Err${formattedDate}.log`, { flags: "a" });
    //   gomos.createConsole(output, errorOutput);
    return new Console({ stdout: output, stderr: errorOutput });
}


// THIS IS METHOD FOR CALCULATE INDIAN STANDER TIME
module.exports.calcIST = function (date) {
    let d = new Date(date);
    let utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * 5.5));
}


// THIS IS METHOD FOR CALCULATE UTC STANDER TIME
module.exports.calcUtc = function (date) {
    let d = new Date(date);
    let utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    return new Date(utc - (3600000 * 5.5));
}



// THIS IS TAKE INT VALUE AND CONVERT TO 2 DECIMAL POINT 
module.exports.convertIntTodecPoint = function (value, decimals) {
    return Math.floor(value * (Math.pow(10, decimals))) / (Math.pow(10, decimals));
}



//THIS IS DATE SPLITE IN HOURLY AND RETURN ARRAY OF STARTTIME AND ENDTIME.
module.exports.dateSpliterInHourly = function (startRangeparam, endRangeparam) {
    let startRange = moment(startRangeparam);
    let endRange = moment(endRangeparam);
    let totalHours = endRange.diff(startRange, 'hours');
    let hoursArray = [];
    let startTime = startRange.toISOString();
    for (i = 0; i < totalHours; i++) {
        let endTime = moment(startTime).add(i + 1, "hours");
        endTime.set({ minute: 30, second: 0, millisecond: 0 })
        hoursArray.push({ startTime: startTime, endTime: endTime.toISOString() });
        startTime = endTime.toISOString();
    }
    return hoursArray;
}