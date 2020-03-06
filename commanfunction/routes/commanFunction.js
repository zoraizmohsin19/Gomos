// 'use strict';
var dateTime = require("node-datetime");
const moment = require('moment');
var fs = require("fs");
var dt = dateTime.create();
var formattedDate = dt.format("Y-m-d");
const { Console } = require('console');

// Custom simple logger
// const logger = new Console({ stdout: output, stderr: errorOutput });
exports.createConsole = function(output,errorOutput){
  return  new Console({ stdout: output, stderr: errorOutput });
}
// THIS IS METHOD FOR CALCULATE INDIAN STANDER TIME
module.exports.calcIST = function (date) {
  let d = new Date(date);
// let utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  let utc = d.getTime() + (d.getTimezoneOffset() * 60000);

  return new Date(utc + (3600000 * 5.5));
}
// THIS IS METHOD FOR CALCULATE ANY REGION TIME
module.exports.calcWATZ = function (date,offset) {
  let d = new Date(date);
// let utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  let utc = d.getTime() + (d.getTimezoneOffset() * 60000);

  return new Date(utc + (3600000 * offset));
}


// THIS IS METHOD FOR CALCULATE UTC STANDER TIME
module.exports.calcUtc = function (date) {
  let d = new Date(date);
  // let utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  let utc = d.getTime()
  return new Date(utc - (3600000 * 5.5));
}



// THIS IS TAKE INT VALUE AND CONVERT TO 2 DECIMAL POINT 
module.exports.convertIntTodecPoint = function (value, decimals) {
  if(value != null){
      return Math.floor(value * (Math.pow(10, decimals))) / (Math.pow(10, decimals));
  }
  else{
      return value
  }
}



//THIS IS DATE SPLITE IN HOURLY AND RETURN ARRAY OF STARTTIME AND ENDTIME.
module.exports.dateSpliterInHourly = function (startRangeparam, endRangeparam) {

  let startRange = moment(startRangeparam);
  let endRange = moment(endRangeparam);
  let totalHours = endRange.diff(startRange, 'hours');
  let hoursArray = [];
  let startTime = startRange.toISOString();
  for (i = 0; i < totalHours; i++) {
      let endTime = moment(startTime).add(1 , "hours");
      // endTime.set({ minute: 30, second: 0, millisecond: 0 })
      hoursArray.push({ startTime: startTime, endTime: endTime.toISOString() });
      startTime = endTime.toISOString();
  }
  return hoursArray;
}

exports.gomosLog = function(x){
  if(process.argv[3] >= arguments[2]){
     let  currTime = moment().format("HH:mm:ss:SSS");
     let logger = arguments[0];
     let logToGlobalConsole  =   arguments[1];
    if(arguments[4] instanceof Object){
      logger.log(currTime +"-"+arguments[3]);
      logger.log(arguments[4]);
      if(logToGlobalConsole == true){
        console.log(currTime+"-"+arguments[3]);
        console.log(arguments[4])
      }
    }else if(arguments.length == 4){
      logger.log( currTime+"-"+arguments[3]);
      if(logToGlobalConsole == true){
      console.log( currTime+"-"+arguments[3]);        
      }
    }
    else{
      logger.log( currTime+"-"+arguments[3]+" ["+arguments[4]+ "]");
      if(logToGlobalConsole == true){
        console.log( currTime+"-"+arguments[3]+" ["+arguments[4]+ "]");
      }
    }
 
  }
}
 
  exports.unWantedLog = function(functionName,message){
    var DateTime = moment().format("YYYY-MM-DD HH:mm:ss:SSS");
    let writeStream = fs.createWriteStream("../unWantedLogCommanlog-" +  moment().format("YYYY-MM-DD")+ ".log", { flags: "a" });

  // write some data with a base64 encoding
  writeStream.write(
   "DateTime :"+ DateTime +"\n"+
   "functionName :" + functionName +"\n"+
   "message :" + message +"\n"+
    "\n"
  );
  
  // the finish event is emitted when all data has been flushed from the stream
  writeStream.on('finish', () => {  
    console.log("wrote all data to file For Error");  
  });
  
  // close the stream
  writeStream.end(); 

  }
  exports.errorCustmHandler =  function(x){
    // console.log(typeofError);
      let writeStream = fs.createWriteStream("../commanError-" + moment().format("YYYY-MM-DD")+ ".log", { flags: "a" });
      var dateTime =  moment().format("YYYY-MM-DD HH:mm:ss:SSS");
    var errorString = "";
    
     errorString +=   "DateTime :"+ dateTime + "\n";
     errorString +=   "serviceName :"+ arguments[0] + "\n";
     errorString +=  "functionName :"+ arguments[1] + "\n";
    
    if(arguments[2] != ''){
      errorString += "messageInfo :" + arguments[2] +"\n";
    }
    if(arguments[3] != '' && arguments[3] != undefined ){
      errorString += "context :" + arguments[3] +"\n";
    }
    if(arguments[5] != '' && arguments[5] != undefined  ){
      errorString += "errorType :" + arguments[5] +"\n";
    }
    if(arguments[6] == undefined  ){
      try {
        errorString  += "ErrorCode :" + arguments[4].statusCode +"\n";
        errorString  += "Error :" + arguments[4].toString()+ "\n";
        errorString  += "typeofErrorstack :" + arguments[4].stack  +"\n";
      } catch (error) {
        errorString  += "ErrorMassage"+ arguments[4] +"\n";
      }
    }
    else{
      if(arguments[6]){
        errorString += "ErrorCode :" + arguments[4].statusCode +"\n";
        errorString += "Error :"  + arguments[4].toString() +"\n";
        errorString += "typeofErrorstack : "+ arguments[4].stack +"n";  
      }else{
        errorString += "ErrorMassage :" + arguments[4] +"\n"
      }
  }
    
    writeStream.write(
      errorString +
      "\n"
      );
    // the finish event is emitted when all data has been flushed from the stream
    writeStream.on('finish', () => {  
        console.log('wrote all data to file');
    });
    // close the stream
    writeStream.end(); 
    setTimeout(()=> { if(arguments[7]){
      process.exit()
    }},1000)
   
    }
  

