
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
    dbo.collection("MsgFacts").find(criteria,{ limit: 1 } ).sort({ createdTime : -1 }).toArray(function (err, result2) {
        if (err) {
          process.hasUncaughtExceptionCaptureCallback();
        }
      var lastCreatedTime = result2[0]["createdTime"];
      sensordata = result2[0]["sensors"];
      var lastdataObj = []
      var SensorNmkeys =  Object.keys(result2[0]["sensors"])
      for(var i= 0 ;i < SensorNmkeys.length; i++ ){
        var sesnorsType = SensorNmkeys[i]
        var name = Object.keys(sensordata[SensorNmkeys[i]])
        var values = Object.values(sensordata[SensorNmkeys[i]]); 
        for (var j = 0; j < name.length; j++) { 
          var obj = {}; 
     
        obj["sesnorsType"]  = SensorNmkeys[i];
        obj["sensorsName"] = name[j];
        obj["sensorsValues"] = values[j];
        lastdataObj.push(obj)
        }
       
      }
      var json= {lastdataObj, lastCreatedTime}
      console.log(json);      
      socket.emit("onViewDashboard", json)
    })
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