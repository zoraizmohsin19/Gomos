'use strict';
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
