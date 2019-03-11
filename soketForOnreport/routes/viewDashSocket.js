
var MongoClient = require("mongodb").MongoClient;
var urlConn, dbName, dbo;


 function onViewDashboard(socket){

     console.log("this is connected OnViewDashboard");
     socket.on('lastUpdatedValue', function(data) {
        var spCd = data.spCd;
        var custCd = data.custCd;
        var subCustCd = data.subCustCd;
        var mac = data.mac;
        var criteria = {
            spCd: spCd,
            custCd: custCd,
            subCustCd: subCustCd,
            mac: mac,
           }
        console.log(data);
     setInterval(
        () =>
       lastupdateddata(socket,criteria),
        7000
      );
     });
     socket.on('end', function (){
        socket.disconnect(0);
    });
     socket.on("disconnect", () => console.log("Client disconnected on OnViewDashboard")); 
 }

 function lastupdateddata(socket,criteria){
    // dbo.collection("MsgFacts").find(criteria,{ limit: 1 } ).sort({ createdTime : -1 }).toArray(function (err, result2) {
    //     if (err) {
    //       process.hasUncaughtExceptionCaptureCallback();
    //     }
    //   var lastCreatedTime = result2[0]["createdTime"];
    //   sensordata = result2[0]["sensors"];
    //   var lastdataObj = []
    //   var SensorNmkeys =  Object.keys(result2[0]["sensors"])
    //   for(var i= 0 ;i < SensorNmkeys.length; i++ ){
    //     var sesnorsType = SensorNmkeys[i]
    //     var name = Object.keys(sensordata[SensorNmkeys[i]])
    //     var values = Object.values(sensordata[SensorNmkeys[i]]); 
    //     for (var j = 0; j < name.length; j++) { 
    //       var obj = {}; 
     
    //     obj["sesnorsType"]  = SensorNmkeys[i];
    //     obj["sensorsName"] = name[j];
    //     obj["sensorsValues"] = values[j];
    //     lastdataObj.push(obj)
    //     }
       
    //   }
    //   var json= {lastdataObj, lastCreatedTime}
    //   console.log(json); 
    console.log("this is called ");
    //  var mac = data.mac
      dbo.collection("DeviceState")
      .find({ mac: criteria.mac})
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
      //  ActiveIdentifier['type'] = keyofCode[i];
       var devicebusinessNM = Object.keys(result[0][deviceStateKey[k]][keyofCode[i]]);
      //  gomos.gomosLog(TRACE_DEBUG,"this devicebusinessNM",devicebusinessNM); 
      var keysToRemove3 = ["sortName","displayPosition","valueChangeAt","dateTime","Type"];
      for (var l = 0; l < keysToRemove3.length; l++) {
        if (deviceStateKey.includes(keysToRemove2[l])) {
          devicebusinessNM.splice(devicebusinessNM.indexOf(keysToRemove3[l]), 1);
        }
      }     ActiveIdentifier['type'] =  result[0][deviceStateKey[k]][keyofCode[i]]["Type"];;
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

    socket.emit("onViewDashboard", json)
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

module.exports = function (app) {
    console.log("this started 2 ");
    urlConn = app.locals.urlConn;
    dbName = app.locals.dbName;
    dbConnection();
    setTimeout(function () {
        var io = app.get('io');
        var nsp = io.of('/onViewDashboard');
        nsp.on('connection',onViewDashboard);
    }, 6000);
  };