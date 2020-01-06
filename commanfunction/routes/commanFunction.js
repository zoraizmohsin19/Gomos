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
  

