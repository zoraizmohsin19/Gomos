var express = require('express');
// var router = express.Router();
const axios = require("axios");
/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });
var MongoClient = require("mongodb").MongoClient;
var urlConn, dbName, dbo;

function onDeviceinstruction(socket){
  console.log("New client connected  onDeviceinstruction");
socket.on('onDeviceinstructionClientEvent', function(data) {
  console.log(data);
  setInterval(
    () =>
    DeviceinstructionEmiter(socket,data),
    4000
  );
});
  socket.on("disconnect", () => console.log("Client disconnected on onDeviceinstruction")); 
}

function DeviceinstructionEmiter(socket,data){
  var criteria = {
    mac : data.mac,
    type: data.type
  }
  console.log("this is second DeviceInstruction");
  dbo.collection("DeviceInstruction").find(criteria).toArray(function (err, result) {
    if (err) {
    //  gomos.errorCustmHandler("DeviceInstruction",err);
      // gomos.gomosLog(TRACE_PROD,"This is error",err);
      console.log(err)
      process.hasUncaughtExceptionCaptureCallback();
    }
    // res.json(result)
    var json = {};
    json["DeviceInstruction"]= [];
    if(result.length !=0){

   
      var DeviceInstructionArray = [];
        for(var i =0; i< result.length ; i++){
          if(result[i].type == "SentInstruction"){
            var sentcommand= {};
            var channelName =result[i].sourceMsg.Channel;
            var ActionType =result[i].sourceMsg.ActionType;
            var createdTime =result[i].createdTime;
            sentcommand["Channel"] = channelName;
            sentcommand["ActionType"] = ActionType;
            sentcommand["createdTime"] = createdTime;
            sentcommand["sourceMsg"]= {};
            var keysofJson = Object.keys(result[i].sourceMsg);
            var keysNeedToRemove = ["Channel","Token","ActionType","isDailyJob"];
            for(var j =0; j< keysNeedToRemove.length; j++){
              if(keysofJson.includes(keysNeedToRemove[j])){
              keysofJson.splice(keysofJson.indexOf(keysNeedToRemove[j]), 1); 
              }
            }
            for(var k =0; k< keysofJson.length; k++){
              sentcommand["sourceMsg"][keysofJson[k]]  =   result[i].sourceMsg[keysofJson[k]];
            }
            DeviceInstructionArray.push(sentcommand);
            json["DeviceInstruction"] = DeviceInstructionArray
          }
    }
    // res.json(json)
    // console.log(json);
    socket.emit("DeviceInstruction", json);
    // gomos.gomosLog(TRACE_PROD," insert  in DeleteDeviceState activeJob");
  
  }
  else{
    // console.log(json);
    socket.emit("DeviceInstruction", json);
  }
});

}
function onConnection(socket) {
  socket.on('clientEvent', function(data) {
    console.log(data);
    setInterval(
      () =>
     getApiAndEmit(socket,data),
     4000
    );
 });
//  socket.on("takreem", function(data){console.log("This takreem");console.log(data)})
//   console.log("New client connected");
  
 
  socket.on("disconnect", () => console.log("Client disconnected"));
}

  const getApiAndEmit =  function(socket,data){
   console.log("this is called ");
   
  
        // gomos.gomosLog(TRACE_DEBUG,"This is called in Alert"); 
        
         var mac = data.mac
        //  console.log(dbo);
        //  const collection1    = dbo.collection("DeviceState");
        //  const changeStream = collection1.watch([{"$match":{mac: mac}}]);
          //query to get the last dateTime the collection was modified.This dateTime is used only in excel report.
          dbo.collection("DeviceState")
          .find({ mac: mac})
          .toArray(function (err, result) {
            if (err) {
          // gomos.gomosLog(TRACE_DEBUG,"this err",err);  
            }
            var deviceStateKey = Object.keys(result[0]);
            var keysToRemove2 = ["_id", "mac", "DeviceName","updatedTime","createdTime"];
            // gomos.gomosLog(TRACE_DEV,"This Is key of identifire 1 Place",deviceStateKey);  
            for (var l = 0; l < keysToRemove2.length; l++) {
              if (deviceStateKey.includes(keysToRemove2[l])) {
                deviceStateKey.splice(deviceStateKey.indexOf(keysToRemove2[l]), 1);
              }
            }
          var json = {}
          for(var k =0; k < deviceStateKey.length; k++){
            var name = deviceStateKey[k]
            var keyofCode = Object.keys(result[0][deviceStateKey[k]]);
          //  gomos.gomosLog(TRACE_DEBUG,"This is SensorsKey",keyofCode);
          var sensorsArray= [];
          for(var i = 0; i< keyofCode.length; i++){
            var ActiveIdentifier = {};
           ActiveIdentifier['type'] = keyofCode[i];
           var devicebusinessNM = Object.keys(result[0][deviceStateKey[k]][keyofCode[i]]);
          //  gomos.gomosLog(TRACE_DEBUG,"this devicebusinessNM",devicebusinessNM); 
          var keysToRemove3 = ["sortName","displayPosition","valueChangeAt","dateTime","Type"];
          for (var l = 0; l < keysToRemove3.length; l++) {
            if (deviceStateKey.includes(keysToRemove2[l])) {
              devicebusinessNM.splice(devicebusinessNM.indexOf(keysToRemove3[l]), 1);
            }
          } 
               ActiveIdentifier["devicebusinessNM"] = devicebusinessNM[0];
               ActiveIdentifier["Value"]    =  result[0][deviceStateKey[k]][keyofCode[i]][devicebusinessNM[0]];
               ActiveIdentifier["sortName"]    =  result[0][deviceStateKey[k]][keyofCode[i]]["sortName"];
               ActiveIdentifier["position"]    =  result[0][deviceStateKey[k]][keyofCode[i]]["displayPosition"];
               ActiveIdentifier["valueChangeAt"]    =  result[0][deviceStateKey[k]][keyofCode[i]]["valueChangeAt"];
               ActiveIdentifier["dateTime"] =  result[0][deviceStateKey[k]][keyofCode[i]]["dateTime"];
               sensorsArray.push(ActiveIdentifier);
          }
          json[name] = sensorsArray;
        }
        // changeStream.on('change', next => {
        //   // process next document
        //   console.log(next);
        socket.emit("FromAPI", json);
      }
    );
  }

function dbConnection(){
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        next(err);
      }
      dbo = connection.db(dbName);
    });
}
var mBoxApp = null;
module.exports = function (app) {
  console.log("this started");
  urlConn = app.locals.urlConn;
  dbName = app.locals.dbName;
  
  dbConnection();
  setTimeout(function () {
      var io = app.get('io');
      io.on('connection', onConnection);
      var nsp = io.of('/onDeviceinstruction');
      nsp.on('connection',onDeviceinstruction);
      // console.log(dbo);
      mBoxApp = app;
  }, 6000);
  // console.log(io)
};