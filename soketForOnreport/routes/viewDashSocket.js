const NAMEOFSERVICE = "soketForOnreport";
const  TRACE_PROD = 1
const TRACE_STAGE = 2;
const TRACE_TEST  = 3;
const TRACE_DEV   = 4;
const TRACE_DEBUG = 5;
var  gomos = require("../../commanFunction/routes/commanFunction");
var MongoClient = require("mongodb").MongoClient;
var urlConn, dbName, dbo;


 function onViewDashboard(socket){
   try {
   gomos.gomosLog(TRACE_DEV,"this is connected OnViewDashboard");
  var  checkInterval;
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
     gomos.gomosLog(TRACE_DEBUG,"this data which comming from client",data);
    setTimeout(function () {lastupdateddata(socket,data)}, 2000)
    clearInterval(checkInterval);     
    checkInterval =  setInterval(
       () =>
      lastupdateddata(socket,criteria),
       30000
     );
    });
    socket.on('end', function (){
       socket.disconnect(0);
   });
    socket.on("disconnect", () => { clearInterval(checkInterval);gomos.gomosLog(TRACE_PROD,"Client disconnected on OnViewDashboard")}); 
   } catch (err) {
     gomos.errorCustmHandler(NAMEOFSERVICE,"onViewDashboard","THIS IS TRY CATCH ERROR",'',err);
   } 
 }

 function lastupdateddata(socket,criteria){
   try {
    gomos.gomosLog(TRACE_DEBUG,"this is called ");
    dbo.collection("DeviceState")
    .find({ mac: criteria.mac})
    .toArray(function (err, result) {
      if (err) {
      }
      var deviceStateKey = Object.keys(result[0]);
      var keysToRemove2 = ["_id", "mac", "DeviceName","updatedTime","createdTime"];
      gomos.gomosLog(TRACE_DEV,"This Is key of identifire 1 Place",deviceStateKey);  
      for (var l = 0; l < keysToRemove2.length; l++) {
        if (deviceStateKey.includes(keysToRemove2[l])) {
          deviceStateKey.splice(deviceStateKey.indexOf(keysToRemove2[l]), 1);
        }
      }
    var json = {}
    for(var k =0; k < deviceStateKey.length; k++){
      var name = deviceStateKey[k]
      var keyofCode = Object.keys(result[0][deviceStateKey[k]]);
     gomos.gomosLog(TRACE_DEBUG,"This is SensorsKey",keyofCode);
    var sensorsArray= [];
    for(var i = 0; i< keyofCode.length; i++){
      var ActiveIdentifier = {};
     var devicebusinessNM = Object.keys(result[0][deviceStateKey[k]][keyofCode[i]]);
     gomos.gomosLog(TRACE_DEBUG,"this devicebusinessNM",devicebusinessNM); 
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
   } catch (err) {
    gomos.errorCustmHandler(NAMEOFSERVICE,"lastupdateddata","THIS IS TRY CATCH ERROR",'',err);
     
   }
 }


 function dbConnection(){
   try {
    MongoClient.connect(
      urlConn,
      { useNewUrlParser: true },
      function (err, connection) {
        if (err) {
          next(err);
        }
        dbo = connection.db(dbName);
      }); 
   } catch (err) {
    gomos.errorCustmHandler(NAMEOFSERVICE,"dbConnection","THIS IS TRY CATCH ERROR",'',err);
     
   }
  }

module.exports = function (app) {
    gomos.gomosLog(TRACE_PROD,"This started For View Dashboard  ");
    urlConn = app.locals.urlConn;
    dbName = app.locals.dbName;
    dbConnection();
    try {
      setTimeout(function () {
        var io = app.get('io');
        var nsp = io.of('/onViewDashboard');
        nsp.on('connection',onViewDashboard);
    }, 6000);
    } catch (err) {
    gomos.errorCustmHandler(NAMEOFSERVICE,"module.exports","THIS IS TRY CATCH ERROR",'',err);      
    }
 
  };