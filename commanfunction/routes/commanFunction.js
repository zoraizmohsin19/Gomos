// 'use strict';
var dateTime = require("node-datetime");
var fs = require("fs");
var dt = dateTime.create();
var formattedDate = dt.format("Y-m-d");
exports.gomosLog = function(x){
    if(process.argv[3] >= arguments[0]){
       var  currTime = new Date();
      if(arguments[2] instanceof Object){
        console.log(currTime.getHours()+":"+currTime.getMinutes()+":"+currTime.getSeconds()+"."+currTime.getMilliseconds()+"-"+arguments[1]);
        console.log(arguments[2]);
      }else if(arguments.length == 2){
        console.log( currTime.getHours()+":"+currTime.getMinutes()+":"+currTime.getSeconds()+"."+currTime.getMilliseconds()+"-"+arguments[1]);
      }
      else{
        console.log( currTime.getHours()+":"+currTime.getMinutes()+":"+currTime.getSeconds()+"."+currTime.getMilliseconds()+"-"+arguments[1]+" ["+arguments[2]+ "]");
      }
   
    }
  }
 
  exports.unWantedLog = function(functionName,message){
    var DateTime = new Date().toISOString();
    let writeStream = fs.createWriteStream("../unWantedLogCommanlog-" +  formattedDate+ ".json", { flags: "a" });
 var json ={DateTime,functionName ,message}
//  var jsonStrring = JSON.stringify(json)

  // write some data with a base64 encoding
  writeStream.write(

    json +
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
      let writeStream = fs.createWriteStream("../commanError-" + formattedDate + ".json", { flags: "a" });
      var dateTime = new Date().toISOString();
    // write some data with a base64 encoding
    // var errors = typeofError.toS
    var errorobj ={
      DateTime : dateTime,
      serviceName: arguments[0],
      functionName : arguments[1]
    }
    if(arguments[2] != ''){
      errorobj["messageInfo"] = arguments[2]
    }
    if(arguments[3] != '' || arguments[3] != undefined || arguments[3] != null){
      errorobj["message"] = arguments[3]
    }
    try {
      errorobj["ErrorCode"] =arguments[4].statusCode,
      errorobj["Error"] = arguments[4].toString(),
      errorobj["typeofErrorstack"] = arguments[4].stack  
    } catch (error) {
      errorobj["ErrorMassage"] = arguments[4]
    }
   


    var strObj = JSON.stringify(errorobj)
  // console.log(typeofError);
    writeStream.write(
      strObj+
      "\n"
      );
    
    // the finish event is emitted when all data has been flushed from the stream
    writeStream.on('finish', () => {  
        console.log('wrote all data to file');
    });
    // close the stream
    writeStream.end(); 
    }
  

