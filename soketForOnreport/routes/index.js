const NAMEOFSERVICE = "soketForOnreport";
const  TRACE_PROD = 1
const TRACE_STAGE = 2;
const TRACE_TEST  = 3;
const TRACE_DEV   = 4;
const TRACE_DEBUG = 5;
var  gomos = require("../../commanFunction/routes/commanFunction");
var MongoClient = require("mongodb").MongoClient;
var urlConn, dbName, dbo;
var fs = require("fs");
let dateTime = require("node-datetime");
var dt = dateTime.create();
var formattedDate = dt.format('Y-m-d');
const output = fs.createWriteStream(`./mqqtSvrStd${formattedDate}.log`, { flags: "a" });
const errorOutput = fs.createWriteStream(`./mqqtSvrErr${formattedDate}.log`, { flags: "a" });
var logger = gomos.createConsole(output,errorOutput);
const SERVICE_VALUE = 1;
var gConsole = false;
if(process.argv[4] == SERVICE_VALUE ){
  gConsole = true;
}
function LastPayloadDataFn(socket){
try {
 //gomos.gomosLog( logger,gConsole,TRACE_PROD,"New client connected  lastPayloadData comming");
  var checkInterval;
  socket.on('lastPayloadClient', function(data) {
    var tempArray = [];
   gomos.gomosLog( logger,gConsole,TRACE_PROD,"This is lastPayloadClient",data);
    setTimeout(function () {lastPayloadDataCall(socket,data,tempArray)}, 1000); 
    clearInterval(checkInterval);
    
    checkInterval =  setInterval(
      () =>
        // socket.on("disconnect", () => {clearInterval(checkInterval)
        //  gomos.gomosLog( logger,gConsole,TRACE_TEST,"Client disconnected on onDeviceinstruction")
        // }),

      lastPayloadDataCall(socket,data,tempArray),
      1000
    );
});
socket.on("disconnect", () =>{
 clearInterval(checkInterval)
gomos.gomosLog(TRACE_TEST,"Client disconnected on onDeviceinstruction")}); 

} catch (err) {
  gomos.errorCustmHandler(NAMEOFSERVICE,"LastPayloadDataFn"," THIS IS TRY CATCH ERROR",'',err)
}
}
async  function lastPayloadDataCall(socket,data,tempArray){
  try {
    var mac = data.mac;
    var subCustCd = data.subCustCd;
    var custCd = data.custCd;
    var Arrayofpayload = data.Arrayofpayload;
    var maindata = [];
   var flag = false;
    for(var i = 0; i < Arrayofpayload.length; i++ ){
      var criteria = {
        mac: mac,
        subCustCd: subCustCd,
        custCd: custCd
      }
      criteria["payloadId"] = Arrayofpayload[i]
         var response = await getlastpayloadData(criteria);
        gomos.gomosLog( logger,gConsole,TRACE_DEV,"THIS IS RESPONSE",response);
        //  if(Object.keys(response).length !== 0 ){
        //   maindata.push(response);
        //   if(tempArray.length == 0){
        //     flag == true;
        //    gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is check tempArray.length", response);
        //     tempArray.push(response)
        //   }
        //  }
        if(Object.keys(response).length !== 0 ){
          maindata.push(response);
         }

    }
    // for(let i = 0 ; i < maindata.length ; i++ ){
      //gomos.gomosLog( logger,gConsole,TRACE_PROD,"This is check tempArray value", tempArray[i].createdTime);
      //gomos.gomosLog( logger,gConsole,TRACE_PROD,"This is check maindata value", maindata[i].createdTime);
      //  if( maindata[i].createdTime.getTime() !== tempArray[i].createdTime.getTime() || flag == true){
        // if( maindata[i].createdTime.getTime() == tempArray[i].createdTime.getTime() || flag == true){
        // tempArray = maindata;
       gomos.gomosLog( logger,gConsole,TRACE_PROD,"This is lastError data cheacking", maindata);
        socket.emit("lastPayloadServerData", maindata);
      //   break;
      //  }
    // }
  
  
    
  } catch (err) {
  gomos.errorCustmHandler(NAMEOFSERVICE,"LastPayloadDataFn"," THIS IS TRY CATCH ERROR",'',err)
    
  }
 
}

async function getlastpayloadData(criteria){
  try {
    return new Promise((resolve, reject)=> {
      dbo.collection("MsgFacts").find(criteria,{ limit: 1 } ).sort({ createdTime : -1 }).toArray(function (err, result) {
        if (err) {
          reject(err);
        }
        let object1 = {};
       gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is resultqwqw", result);
        if(result.length > 0){
           object1 = {
            payloadId : result[0].payloadId,
            createdTime: result[0].createdTime
          } 
        }
        resolve(object1);
      })
  
    })
  } catch (err) {
  gomos.errorCustmHandler(NAMEOFSERVICE,"LastPayloadDataFn"," THIS IS TRY CATCH ERROR",'',err)
    
  }
 
}
function ActivelastError(socket){
  try {
   gomos.gomosLog( logger,gConsole,TRACE_TEST,"New client connected  ActivelastError");
    var checkInterval;
    socket.on('lastErrorClientEmit', function(data) {
     gomos.gomosLog( logger,gConsole,TRACE_TEST,"This is LastErrorClientEmit",data);
      setTimeout(function () {ActivelastErrorEmiter(socket,data)}, 1000)
      clearInterval(checkInterval);
      checkInterval = setInterval(
        () =>
        ActivelastErrorEmiter(socket,data),
        30000
      );
  });
    socket.on("disconnect", () =>{   clearInterval(checkInterval);
     gomos.gomosLog( logger,gConsole,TRACE_TEST,"Client disconnected on onDeviceinstruction")}); 
  } catch (err) {
    gomos.errorCustmHandler(NAMEOFSERVICE,"ActivelastError"," THIS IS TRY CATCH ERROR",'',err)
  }
}
function ActivelastErrorEmiter(socket,data){
try {
  var custCd = data.custCd;
  var subCustCd = data.subCustCd;
  var mac = data.mac;
  
 var criteria = {
   custCd: custCd,subCustCd: subCustCd,mac: mac, type: "level1"
 }

 dbo.collection("Alerts").find(criteria,{ limit: 1 } ).sort({ createdTime : -1 }).toArray(function (err, result) {
  if (err) {
    gomos.errorCustmHandler(NAMEOFSERVICE,"ActivelastErrorEmiter"," THIS IS Query ERROR",'',err)
    // process.hasUncaughtExceptionCaptureCallback();
  }else{
  var alertObj ={};
  if(result.length !=0){
   gomos.gomosLog( logger,gConsole,TRACE_TEST,"THis is Data Which I sending To Last Error",result )
    alertObj["sensorNm"] = result[0].sensorNm;
    alertObj["businessNm"] = result[0].businessNm;
    alertObj["shortName"] = result[0].shortName;
    alertObj["businessNmValues"] = result[0].businessNmValues;
    alertObj["criteria"] = result[0].criteria;
    alertObj["createdTime"] = result[0].createdTime;
    alertObj["alertText"] = result[0].alertText;
   gomos.gomosLog( logger,gConsole,TRACE_TEST,"THis is Data Which I sending To Last Error",alertObj )
    socket.emit("lastErrorServerEmit", alertObj);
  }
  // else{
  //  gomos.gomosLog( logger,gConsole,TRACE_TEST,"THis is Data Which I sending To Last Error",alertObj )
  //   socket.emit("lastErrorServerEmit", alertObj);
  // }
}
})
} catch (err) {
  gomos.errorCustmHandler(NAMEOFSERVICE,"ActivelastErrorEmiter"," THIS IS TRY CATCH ERROR",'',err)
}
}

function onDeviceinstruction(socket){
  try {
   gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"New client connected  onDeviceinstruction");
    var checkInterval;
    socket.on('onDeviceinstructionClientEvent', function(data) {
     gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is onDeviceinstructionClientEvent Data",data);
      setTimeout(function () {DeviceinstructionEmiter(socket,data)}, 1000)
      clearInterval(checkInterval);
      checkInterval = setInterval(
        () =>
        DeviceinstructionEmiter(socket,data),
        5000
      );
    });
      socket.on("disconnect", () =>{ clearInterval(checkInterval);gomos.gomosLog( logger,gConsole,TRACE_PROD,"Client disconnected on onDeviceinstruction")}); 
  } catch (err) {
  gomos.errorCustmHandler(NAMEOFSERVICE,"onDeviceinstruction"," THIS IS TRY CATCH ERROR",'',err)
  }
}

function DeviceinstructionEmiter(socket,data){
  try {
    var criteria = {
      mac : data.mac,
      type: data.type
    }
  gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this is second DeviceInstruction");
    dbo.collection("DeviceInstruction").find(criteria).sort({"createdTime": -1}).toArray(function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"DeviceinstructionEmiter"," THIS IS QUERY ERROR ",'',err)
        // process.hasUncaughtExceptionCaptureCallback();
      }
      var json = {};
      json["DeviceInstruction"]= [];
      if(result.length !=0){
  
     
        var DeviceInstructionArray = [];
          for(var i =0; i< result.length ; i++){
            if(result[i].type == "SentInstruction"){
             gomos.gomosLog( logger,gConsole,TRACE_PROD,"This is result data For sentInstruction",result[i]);
              var sentcommand= {};
              var channelName =result[i].sourceMsg.body.Channel;
              var ActionType =result[i].sourceMsg.ActionType;
              var createdTime =result[i].createdTime;
              sentcommand["_id"] = result[i]._id
              sentcommand["Channel"] = channelName;
              sentcommand["ActionType"] = ActionType;
              sentcommand["createdTime"] = createdTime;
              sentcommand["referencekey"] = result[i].sourceMsg.Token;
              sentcommand["sourceMsg"]= {};
              var keysofJson = Object.keys(result[i].sourceMsg["body"]);
              var keysNeedToRemove = ["Channel"];
              for(var j =0; j< keysNeedToRemove.length; j++){
                if(keysofJson.includes(keysNeedToRemove[j])){
                keysofJson.splice(keysofJson.indexOf(keysNeedToRemove[j]), 1); 
                }
              }
              for(var k =0; k< keysofJson.length; k++){
                sentcommand["sourceMsg"][keysofJson[k]]  =   result[i].sourceMsg.body[keysofJson[k]];
              }
             
              DeviceInstructionArray.push(sentcommand);
              json["DeviceInstruction"] = DeviceInstructionArray
            }
      }
      socket.emit("DeviceInstruction", json);
    }
    else{
   
      socket.emit("DeviceInstruction", json);
    }
  });
  } catch (err) {
    gomos.errorCustmHandler(NAMEOFSERVICE,"DeviceinstructionEmiter"," THIS IS TRY CATCH ERROR",'',err)
    
  }

}
function onConnection(socket) {
  try{
    var checkInterval;
    socket.on('clientEvent', function(data) {
   gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is ClientsData",data);
    setTimeout(function () {getApiAndEmit(socket,data)}, 1000)
    checkInterval = clearInterval(checkInterval);
      setInterval(
        () =>
       getApiAndEmit(socket,data),
       10000
      );
   });
    socket.on("disconnect", () => { clearInterval(checkInterval); gomos.gomosLog( logger,gConsole,TRACE_DEV,"Client disconnected")});
  }
  catch(err){
gomos.errorCustmHandler(NAMEOFSERVICE,"onConnection","THIS IS Try Catch OF Function","",err);
  }
 
}

  const getApiAndEmit =  async function(socket,data){ 
    try{
     gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is getApiAndEmit Function");   
      var mac = data.mac;
      var ObjectofModeData = await getmode({mac: mac,type: "SentManOverride"});
     gomos.gomosLog( logger,gConsole,TRACE_DEV, "This is debug for ObjectofModeData",ObjectofModeData)

       dbo.collection("DeviceState")
       .find({ mac: mac})
       .toArray(function (err, result) {
         if (err) {
         gomos.errorCustmHandler(NAMEOFSERVICE,"getApiAndEmit","THIS IS Query of DeviceState","",err);
         }else{
         var deviceStateKey = Object.keys(result[0]);
         var keysToRemove2 = ["_id", "mac", "DeviceName","updatedTime","createdTime"];
         //gomos.gomosLog( logger,gConsole,TRACE_DEV,"This Is key of identifire 1 Place",deviceStateKey);  
         for (var l = 0; l < keysToRemove2.length; l++) {
           if (deviceStateKey.includes(keysToRemove2[l])) {
             deviceStateKey.splice(deviceStateKey.indexOf(keysToRemove2[l]), 1);
           }
         }
       var json = {}
       
        for(var k =0; k < deviceStateKey.length; k++){
          var name = deviceStateKey[k]
          var keyofCode = Object.keys(result[0][deviceStateKey[k]]);
         gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is SensorsKey",keyofCode);
          var sensorsArray= [];
          for(var i = 0; i< keyofCode.length; i++){
            var ActiveIdentifier = {};
            ActiveIdentifier['type'] = keyofCode[i];
          var devicebusinessNM = Object.keys(result[0][deviceStateKey[k]][keyofCode[i]]);
         gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this devicebusinessNM",devicebusinessNM); 
          var keysToRemove3 = ["sortName","displayPosition","valueChangeAt","dateTime","Type"];
            for (var l = 0; l < keysToRemove3.length; l++) {
              if (deviceStateKey.includes(keysToRemove2[l])) {
                devicebusinessNM.splice(devicebusinessNM.indexOf(keysToRemove3[l]), 1);
              }
            } 
            ActiveIdentifier["devicebusinessNM"] = devicebusinessNM[0];
            try {
              ActiveIdentifier["mode"] =     ObjectofModeData[devicebusinessNM[0]]["activeMode"];
            } catch (error) {
              
            }
            ActiveIdentifier["Value"]    =  result[0][deviceStateKey[k]][keyofCode[i]][devicebusinessNM[0]];
            ActiveIdentifier["sortName"]    =  result[0][deviceStateKey[k]][keyofCode[i]]["sortName"];
            ActiveIdentifier["position"]    =  result[0][deviceStateKey[k]][keyofCode[i]]["displayPosition"];
            ActiveIdentifier["valueChangeAt"]    =  result[0][deviceStateKey[k]][keyofCode[i]]["valueChangeAt"];
            ActiveIdentifier["dateTime"] =  result[0][deviceStateKey[k]][keyofCode[i]]["dateTime"];
            sensorsArray.push(ActiveIdentifier);
       }
       json[name] = sensorsArray;
     }
     socket.emit("FromAPI", json);
    }
   }
 );
    }
    catch(err){
      gomos.errorCustmHandler(NAMEOFSERVICE,"getApiAndEmit","THIS IS TRY CATCH ERROR","",err);
      
    }  
       
  }
 
  async  function getmode(criteria){
    try{
     gomos.gomosLog( logger,gConsole,TRACE_DEV,"Cheacking Criteria",criteria )
return new Promise((resolve, reject)=>{
  dbo.collection("DeviceInstruction").find(criteria).toArray(function (err, result) {
    if (err) {
      reject(err);
    }
   gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is for ManulaOverride", result);
    if(result.length > 0){ 

       var  data = result[0].sourceMsg.body; 
    }
    resolve(data);
  })
}
)
    }
    catch(err){

    }
  }
function dbConnection(){
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"dbConnection","This is mongo Client Error")
        next(err);
      }
      dbo = connection.db(dbName);
    });
}
var mBoxApp = null;
module.exports = function (app) {
gomos.gomosLog( logger,gConsole,TRACE_PROD,"this started For Operating DashBoard");
  urlConn = app.locals.urlConn;
  dbName = app.locals.dbName;
  
  dbConnection();
  setTimeout(function () {
    try{
      var io = app.get('io');
      io.on('connection', onConnection);
      var nsp = io.of('/onDeviceinstruction');
      nsp.on('connection',onDeviceinstruction);
      var nsp2 = io.of('/ActivelastError');
      nsp2.on('connection',ActivelastError);
      var nsp3 = io.of('/LastPayloadData');
      nsp3.on('connection',LastPayloadDataFn);
      mBoxApp = app;
    }
    catch(err){
      gomos.errorCustmHandler(NAMEOFSERVICE,"module.exports","This is Main Try catch Error","", err)
    }
  }, 6000);
};