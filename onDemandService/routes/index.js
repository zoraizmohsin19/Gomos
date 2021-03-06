var express = require("express");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
const url = require("url");
var requiredDateTime = require("node-datetime");
const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
const uuidv4 = require('uuid/v4');
const dateFormat  = require("dateformat");

const mqtt = require('mqtt')
// const  FileSaver = require("file-saver");
const  ExcelJs  = require("exceljs");
const moment = require('moment');
const Schema = mongoose.Schema;
const NAMEOFSERVICE = "OnDemandService"
const  TRACE_PROD = 1
const TRACE_STAGE = 2;
const TRACE_TEST  = 3;
const TRACE_DEV   = 4;
const TRACE_DEBUG = 5; 
var  gomos = require("../../commanfunction/routes/commanFunction");
var midllelayer = require("../../EndPointMiddlelayer/routes/middlelayer");
var aggragator = require("../../aggregatorService/routes/aggregatorFunction");
let gomosDevices = require("../../commanfunction/routes/getDevices");
let gomosAssets = require("../../commanfunction/routes/getAssets");
let gomosSubCustCd = require("../../commanfunction/routes/getSubCustomers");
let gomosCustCd = require("../../commanfunction/routes/getCustomer");
let gomosSpCd = require("../../commanfunction/routes/getServiceProviders");


//var gomosDevices = require("../../commanFunction/routes/getDevices");
var urlConn, dbName;
var  gomos = require("../../commanfunction/routes/commanFunction");
var fs = require("fs");
let dateTime = require("node-datetime");
var dt = dateTime.create();
var formattedDate = dt.format('Y-m-d');
const output = fs.createWriteStream(`./onDemandStd${formattedDate}.log`, { flags: "a" });
const errorOutput = fs.createWriteStream(`./onDemand${formattedDate}.log`, { flags: "a" });
var logger = gomos.createConsole(output,errorOutput);
const SERVICE_VALUE = 1;
var gConsole = false;
if(process.argv[4] == SERVICE_VALUE ){
  gConsole = true;
}

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

//common method to give access permission to retrive data from database
function accessPermission(res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
}
var count = 0;
router.post("/dummy", function (req, res, next){
  var body = req.body.body;
  
  console.log(body);
  console.log("this called "+ count);
  count++;
  res.json(body.sensors);


});

router.delete("/deleteSentCommand", function (req, res, next) {
  var query = url.parse(req.url, true).query;
  // var query = req.body;
  gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is id",query.id);
  var id = query.id;

  accessPermission(res);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
      db.collection("DeviceInstruction")
      .deleteOne({_id:ObjectId(id)},function (err,result) {  
        gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is result",result);
        res.json(result)
  
        });
      }
    );
    });
router.get("/flashPrograms", function (req, res, next) {
  var query = url.parse(req.url, true).query;
  var mac = query.mac;
  var response = {}
  gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is mac");

  if (mac != undefined && mac != "") {
    accessPermission(res);
    MongoClient.connect(
      urlConn,
      { useNewUrlParser: true },
      function (err, connection) {
        if (err) {
          process.hasUncaughtExceptionCaptureCallback();
        }
        //"ProgramDetails","ActiveJob"
        var db = connection.db(dbName);
        db.collection("DeviceInstruction")
          .deleteMany({ mac: mac, type: { $in: ["SentInstruction", "ProgramDetails", "ActiveJob","executedJob"] } }, function (err, result) {
            if(err){
              res.json(err)
            }
            gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is result", result);
            // res.json(result)
            db.collection("DeviceInstruction")
              .find({ mac: mac, type: "SentManOverride" })
              .toArray(function (err, result) {
                if (err) {
                  res.json(err)
                }
                if (result.length > 0) {

                  gomos.gomosLog(logger, gConsole, TRACE_DEV, "this is log for SentManOverride", result);
                  var temObj = {};
                  let keys = Object.keys(result[0].sourceMsg.body);
                  let obj = {}
                  for (let [key, value] of Object.entries(result[0].sourceMsg.body)) {
                    temObj[key] = { "activeMode": 0, "pendingMode": 0 };
                  }
                  gomos.gomosLog(logger, gConsole, TRACE_DEV, "This is Log of Object")
                  db.collection("DeviceInstruction")
                    .updateOne({ "type": "SentManOverride", "mac": mac },
                      {
                        $set: { "sourceMsg.body": temObj }
                      }
                      , function (err, result) {
                        if (err) {
                          gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "this err", err);
                          res.json(err)
                        }
                        response["SentManOverride"] = "SentManOverride updated"
                          db.collection("Instructionindex")
                          .deleteMany({ programKeyIndex: {$regex: mac} }, function (err, result) {
                                if (err) {
                                  gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "this err", err);
                                  res.json(err)
                                }
                                 response["Instructionindex"] = "Instructionindex delete : "+ result.result.n;
                                gomos.gomosLog(logger,gConsole,TRACE_DEV,"This is InstructionIndex Delete",result.result.n)
                                db.collection("DeviceUpTime")
                                .deleteMany({ mac: mac }, function (err, result) {
                                      if (err) {
                                        gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "this err", err);
                                        res.json(err)
                                      }
                                 response["DeviceUpTime"] = "DeviceUpTime delete : "+ result.result.n;
                                 gomos.gomosLog(logger,gConsole,TRACE_DEV,"This is deleteMany Delete",result.result.n)

                          // if(result.result.nModified > 0){
                         
                        db.collection("DeviceState")
                          .find({ mac: mac })
                          .toArray(function (err, result2) {
                            if (err) {
                              gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is Device State Error", err);
                              res.json(err)
                            }
                            if (result2.length > 0) {
                              let deviceStatecode = Object.keys(result2[0].channel);
                              for (let i = 0; i < deviceStatecode.length; i++) {
                                var devicebusinessNM = Object.keys(result2[0].channel[deviceStatecode[i]]);
                                var keyForRemove1 = ["sortName", "displayPosition", "Type", "valueChangeAt", "dateTime"];
                                for (var n = 0; n < keyForRemove1.length; n++) {
                                  devicebusinessNM.splice(devicebusinessNM.indexOf(keyForRemove1[n]), 1);
                                }
                                result2[0].channel[deviceStatecode[i]][devicebusinessNM[0]] = 0;

                              }
                              gomos.gomosLog(logger, gConsole, TRACE_DEV, "this is log of DEvice State Flas", result2);
                              db.collection("DeviceState")
                                .updateOne({ "mac": mac, _id: result2[0]._id },
                                  {
                                    $set: result2[0]
                                  }
                                  , function (err, result) {
                                    if (err) {
                                      gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "this err", err);
                                      res.json(err)
                                    }
                                    gomos.gomosLog(logger, gConsole, TRACE_DEBUG, "This is log of DeviceState Update", result);
                                    response["DeviceState"] = "DeviceState updated : "+ result.result.nModified;
                                 //   res.send(`successfully Flase PlateForm For Programs ${result.result.nModified}`)
                                    let client  = mqtt.connect('mqtt://mqtt.agrisensorsandcontrols.com');
                                    client.on("error", function (){
                                      gomos.gomosLog(logger,gConsole,TRACE_PROD,"This is Mqtt broker connection error");

                                    });
                                    client.on("offline", function (){
                                      gomos.gomosLog(logger,gConsole,TRACE_PROD,"This is Mqtt broker offline");
                                    
                                    });
                                    let message = JSON.stringify({"payloadId": "SystemReset",  "programs": false,   "channels": {  "mode": 0,"action": 0 }});
                                    response["client_publish"] = message;
                                    client.publish(`mqtt_rx/prod/GHC01/${mac}`, message, function (err, result){
                                      if(err){
                                        gomos.gomosLog(logger,gConsole,TRACE_DEBUG,"This is Mqtt publishing error",err);   
                                        res.json(err)                                   
                                      }
                                       
                                      gomos.gomosLog(logger,gConsole,TRACE_PROD,"This is publish Mqtt Message",result);
                                      res.json(response);
                                  });
                                });
                            }
                            else{
                              res.send("Some Things Wrong 2")
                            }
                          });
                        }); 
                      });
                      });

                }
                else{
                  res.send("Some Things Wrong 1")
                }

              });
          });
      }
    );
  }
  else {
    res.send("mac not present")
  }
});
router.post("/dummy1", function (req, res, next){
  accessPermission(res);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
      db.collection("Dummy")
        .find()
        .toArray(function (err, result) {
          if (err) {
            process.hasUncaughtExceptionCaptureCallback();
          }
          console.log(result);
          
        });
});
});
//checks whether given userId and password is valid or not if valid pass the user details
router.post("/authenticate", function (req, res, next) {
  // var query = url.parse(req.url, true).query;
   let body = req.body.body
  let userId = body.email;
  let password = body.password;
  console.log(userId +" ,"+ password );
  userDtls = [];
  accessPermission(res);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
      db.collection("Users")
        .find({ userId: userId, password: password })
        .toArray(function (err, result) {
          if (err) {
            process.hasUncaughtExceptionCaptureCallback();
          }
          if (result.length > 0) {
            for (var index = 0; index < result.length; index++) {
              userDtls.push({
                userId: result[index].userId,
                serviceProviders: result[index].spCds,
                customers: result[index].custCds,
                subCustomers: result[index].subCustCds,
                Assets: result[index].Assets,
                Devices: result[index].Devices,
                email: result[index].email,
                userFN: result[index].userFN,
                userLN: result[index].userLN,
                userType : result[index].userType
              });  
              let dashboardConfigId = result[0].dashboardConfigId;
              let clientID = result[0].clientID;
              db.collection("DashboardConfig")
              .find({ dashboardConfigId: dashboardConfigId })
              .toArray(function (err, result1) {
                if (err) {
                  process.hasUncaughtExceptionCaptureCallback();
                } 

                 dashboardConfigobj = {
                  ActiveSpCd: result1[0].ActiveSpCd,
                  ActiveCustCd: result1[0].ActiveCustCd,
                  ActiveSubCustCd: result1[0].ActiveSubCustCd,
                  Assets: result1[0].Assets,
                  ActiveAssets: result1[0].ActiveAssets,
                  Devices: result1[0].Devices,
                  ActiveDevice: result1[0].ActiveDeviceName,
                  ActiveMac:  result1[0].ActiveMac,
                  SensorsBgC: result1[0].SensorsBgC,
                  Nevigation : result1[0].Nevigation,
                  ActiveDashBoardEnable: result1[0].ActiveDashBoardEnable,
                  OpratingDashBoardEnable: result1[0].OpratingDashBoardEnable
                 }
                  gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is result1[0].deviceType", result1[0].deviceType)
                 var  configData = {
                  DeviceName: result1[0].ActiveDeviceName,
                  mac:  result1[0].ActiveMac,
                  assetId: result1[0].ActiveAssets,
                  custCd: result1[0].ActiveCustCd,
                  spCd: result1[0].ActiveSpCd,
                
                  subCustCd: result1[0].ActiveSubCustCd
                 }
                 gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is Config Data",configData )
                 db.collection("ClientMenuConfig")
                 .find({ clientID: clientID })
                 .toArray(function (err, clientData) {
                   if (err) {
                     process.hasUncaughtExceptionCaptureCallback();
                   } 

                  gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is clientID ",clientData);
                  var ClientObj =  clientData[0]
                  gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is ClientObj",ClientObj)
                res.json({userDtls, dashboardConfigobj, configData,ClientObj});
              });
            });



            }
           
          } else {
            res.json(0);
          }
        });
    }
  );
});

// method for Register Service Provider...
router.post("/registerSP", function (req, res, next) {

  accessPermission(res);
  //var query = url.parse(req.url, true).query;
  
  var body = req.body.body;

  var name = body.name;
  var spCd = body.spCd ;
  var address = body.address ;
  var phone = body.Phone ;
  var email = body.email ;
  var servicesOffered  = body.servicesOffered;
  var SubTopic  = body.SubTopic;
  var PubTopic  = body.PubTopic;
 

  console.log(servicesOffered);
  //  for( var i =0 ; i<= services.length - 1; i++)
  //  {
  //   console.log(services);

  //  }
  // console.log(services);
  // console.log(services.service1);
  objOfsp = {
   name,
    spCd,
    address,
    phone,
    email,
    servicesOffered,
    SubTopic,
    PubTopic
    
  } 

 
  
  console.log(objOfsp);
 
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
      db.collection("ServiceProviders")
      .insertOne(objOfsp, function (err, result) {
        if (err) {
          process.hasUncaughtExceptionCaptureCallback();
        } else {console.log("Entry saved in MsgDump Collection");

        res.json("Hello This is data"+objOfsp);
      }
      });
    }
  );
}
);
// method for Register Customer...
router.post("/customerReg", function (req, res, next) {

  accessPermission(res);
  //var query = url.parse(req.url, true).query;
  
  var body = req.body.body;

  var name = body.CustName;
  var custCd = body.custCd ;
  var spCd = body.selectedSPValue ;
  var address = body.address ;
  var phone = body.Phone ;
  var email  = body.email;
  var servicesTaken  = body.servicesTaken;
  var mqttClient  = body.mqttClient;
 
  var description  = body.description;
  var status  = body.status;
  var userId = '';
  var Timestamp = new Date().toISOString();

  var topics = {
    
      topic1 : body.topic1,
      topic2 : body.topic2

  }

 
  //  for( var i =0 ; i<= services.length - 1; i++)
  //  {
  //   console.log(services);

  //  }
  // console.log(services);
  // console.log(services.service1);
  objOfsp = {
   name,
   custCd,
    spCd,
    address,
    phone,
    email,
    servicesTaken,
    mqttClient,
    topics,
    description,
    status ,
    userId,
    Timestamp
  } 

 
  
  console.log(objOfsp);
 
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
      db.collection("Customers")
      .insertOne(objOfsp, function (err, result) {
        if (err) {
          process.hasUncaughtExceptionCaptureCallback();
        } else {console.log("Entry saved in MsgDump Collection");

        res.json("Hello This is data"+objOfsp);
      }
      });
    }
  );
}
);



//get Sp
router.get("/getRegisterSP", function (req, res, next) {
  accessPermission(res);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
      db.collection("ServiceProviders")
      .find().sort({ $natural: -1 }).toArray(function (err,result) {  
       console.log(result);
        res.json(result)
  
        });
      
      }
    );
    });
    //get perticuler sp api by id
router.get("/getRegisterSPbyId", function (req, res, next) {
  var query = url.parse(req.url, true).query;
  console.log(query.id);
  var id = query.id;

  accessPermission(res);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
      db.collection("ServiceProviders")
      .find({_id:ObjectId(id)}).toArray(function (err,result) {  
      //  console.log(result);
        res.json(result)
  
        });
      
      }
    );
    });
   
    // this delete sp by id
    router.delete("/delRegisterSPbyId", function (req, res, next) {
      var query = url.parse(req.url, true).query;
      console.log(query.id);
      var id = query.id;
      console.log();
    
      accessPermission(res);
      MongoClient.connect(
        urlConn,
        { useNewUrlParser: true },
        function (err, connection) {
          if (err) {
            process.hasUncaughtExceptionCaptureCallback();
          }
          var db = connection.db(dbName);
          db.collection("ServiceProviders")
          .deleteOne({_id:ObjectId(id)},function (err,result) {  
          //  console.log(result);
            res.json(result)
      
            });
          
          }
        );
        });

      //Update perticuler api by id
router.put("/UpdateRegisterSPbyId", function (req, res, next) {
  var query = url.parse(req.url, true).query;
  console.log(query.id);
  var id = query.id;
  var body = req.body.body;

  var name = body.name;
  var spCd = body.spCd ;
  var address = body.address ;
  var phone = body.Phone ;
  var email = body.email ;
  var servicesOffered  = body.servicesOffered;
  var SubTopic  = body.SubTopic;
  var PubTopic  = body.PubTopic;

  objOfsp = { 
     spCd,
     address,
     phone,
     email,
     servicesOffered,
     SubTopic,
     PubTopic
     
   } 
 
   console.log(objOfsp);
  
  accessPermission(res);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
      db.collection("ServiceProviders")
      .update({_id:ObjectId(id)},objOfsp ,function(err, res1) {
        if (err) throw err;
       console.log(res1);
        res.json(res1)
  
        });
      
      }
    );
    });
    
//get Customer for dashboard via post
router.post("/getCustomerData", function (req, res, next) {
  var data = req.body.body;
  // console.log(data);

  
  var where_query     =   {};
  if(data['spCddata']  != undefined && data['spCddata'] != null && data['spCddata'].length !=0  ){
     var dataforMongo = [],
     dataforMongo = data['spCddata']
    where_query     =   {
      spCd: { $in:  dataforMongo }
    };
}
console.log("this new data "+ data['where'])

if(data['search_query'] != undefined && data['search_query'] != null && (data['search_query']+'').length != 0){
    var query_string        =   (data['search_query'] +'').toLowerCase().trim();
    where_query['$or']      =   [
        {
            'name':{
                '$regex':'.*'+query_string+'.*',
                '$options':'i'
                
            }
        },
        {
            'email':{
                '$regex':'.*'+query_string+'.*',
                '$options':'i'
                
            }
        }
    ]
}
var options       = {};
if(data['order'] != undefined && data['order'] != null){
    options['sort']     =   data['order'];
}

var attributes  = ['_id','name', 'email','spCd','PubTopic','SubTopic','servicesOffered'];  


if(data['type'] != "all"){
    var page    =   1;
    if(data['page'] != undefined && data['page'] != null && !isNaN(data['page'])){
        page    =   parseInt(data['page']);
    }

    var page_size    =   15;
    if(data['page_size'] != undefined && data['page_size'] != null && !isNaN(data['page_size'])){
        page_size    =   parseInt(data['page_size']);
    }

    var offset          =       (page - 1)*page_size ;

    options['skip']   =   offset;
    options['limit']   =   page_size;
} 
var query={
  where_query,attributes,options
}
console.log(where_query);
console.log(attributes);
console.log(options);
  accessPermission(res);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        process.hasUncaughtExceptionCaptureCallback();
      }
      var data_count  =   0;
      var db = connection.db(dbName);
     db.collection("Customers")
      .find( where_query).count()
      .then(function (data) {
        data_count = data

      })
     

      db.collection("Customers")
      .find( where_query,options).toArray(function (err,users) {  
    
        console.log(data_count);
        var result  =   {};
            result['rows']      =   users;
            result['count']      =  data_count;
            result['page']   =       page;
            result['page_size']   =   page_size;
       console.log(result);
        res.json(result)
  
        });
      
      }
    );
    });
    



//get Sp via post
router.post("/getRegisterSP", function (req, res, next) {
  var data = req.body.body;
  // console.log(data);

  
  var where_query     =   {};
  if(data['where']  != undefined && data['where'] != null){
    where_query     =   data['where'];
}

if(data['search_query'] != undefined && data['search_query'] != null && (data['search_query']+'').length != 0){
    var query_string        =   (data['search_query'] +'').toLowerCase().trim();
    where_query['$or']      =   [
        {
            'name':{
                '$regex':'.*'+query_string+'.*',
                '$options':'i'
                
            }
        },
        {
            'email':{
                '$regex':'.*'+query_string+'.*',
                '$options':'i'
                
            }
        }
    ]
}
var options       = {};
if(data['order'] != undefined && data['order'] != null){
    options['sort']     =   data['order'];
}

var attributes  = ['_id','name', 'email','spCd','PubTopic','SubTopic','servicesOffered'];  


if(data['type'] != "all"){
    var page    =   1;
    if(data['page'] != undefined && data['page'] != null && !isNaN(data['page'])){
        page    =   parseInt(data['page']);
    }

    var page_size    =   15;
    if(data['page_size'] != undefined && data['page_size'] != null && !isNaN(data['page_size'])){
        page_size    =   parseInt(data['page_size']);
    }

    var offset          =       (page - 1)*page_size ;

    options['skip']   =   offset;
    options['limit']   =   page_size;
} 
// console.log(data['type'] +'this is data ');
var query={
  where_query,attributes,options
}
// console.log(where_query);
// console.log(attributes);
// console.log(options);
  accessPermission(res);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        process.hasUncaughtExceptionCaptureCallback();
      }
      var data_count  =   0;
      var db = connection.db(dbName);
     db.collection("ServiceProviders")
      .find( where_query).count()
      .then(function (data) {
        data_count = data

      })
     

      db.collection("ServiceProviders")
      .find( where_query,options).toArray(function (err,users) {  
    
        console.log(data_count);
        var result  =   {};
            result['rows']      =   users;
            result['count']      =  data_count;
            result['page']   =      page;
            result['page_size']   = page_size;
       console.log(result);
        res.json(result)
  
        });
      
      }
    );
    });
    router.post("/getAssetsNav", function (req, res, next) {
      var query = req.body;
 
      var SubCustomersIds = query.subCustCd;
     console.log(SubCustomersIds)
      accessPermission(res);
      MongoClient.connect(
        urlConn,
        { useNewUrlParser: true },
        function (err, connection) {
          if (err) {
            process.hasUncaughtExceptionCaptureCallback();
          }
          var db = connection.db(dbName);
          db.collection("Assets")
            .find(
              { subCustCd: SubCustomersIds } )
            .toArray(function (err, result) {
              if (err) {
                process.hasUncaughtExceptionCaptureCallback();
              }
              if (result.length > 0) {
                var arrOfAssets =[];
                for (var i = 0; i < result.length; i++) {
                  arrOfAssets.push(result[i].assetId);
                }
                db.collection("ClientMenuConfig")
                .find({ clientID: SubCustomersIds })
                .toArray(function (err, clientData) {
                  if (err) {
                    process.hasUncaughtExceptionCaptureCallback();
                  } 
  
                 gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is clientID ",clientData);
                 var ClientObj =  clientData[0]
                 let tempObj = {arrOfAssets, ClientObj}
                res.json(tempObj);
              });
               }
         
            
        }
      );
     
    });
  });
    router.get("/getAssets", function (req, res, next) {
      var query = url.parse(req.url, true).query;
      // var criteria, arrOfSensorNms = [];
      // var ServiceProvidersIds = query.spCode.split(",");
      // var CustomersIds = query.custCd.split(",");
      var SubCustomersIds = query.subCustCd;
     
      accessPermission(res);
      MongoClient.connect(
        urlConn,
        { useNewUrlParser: true },
        function (err, connection) {
          if (err) {
            process.hasUncaughtExceptionCaptureCallback();
          }
          var db = connection.db(dbName);
          db.collection("Assets")
            .find(
              { subCustCd: SubCustomersIds } )
            .toArray(function (err, result) {
              if (err) {
                process.hasUncaughtExceptionCaptureCallback();
              }
              if (result.length > 0) { }
             var arrOfAssets =[];
              for (var i = 0; i < result.length; i++) {
                arrOfAssets.push(result[i].assetId);
              }
              // connection.close();
              // console.log(arrOfAssets);
              res.json(arrOfAssets);
            });
        }
      );
     
    });

    router.get("/getDevice", function (req, res, next) {
      var query = url.parse(req.url, true).query;
      var assetId = query.assetId;
     
      accessPermission(res);
      MongoClient.connect(
        urlConn,
        { useNewUrlParser: true },
        function (err, connection) {
          if (err) {
            process.hasUncaughtExceptionCaptureCallback();
          }
          var db = connection.db(dbName);
          db.collection("Devices")
            .find(
              { assetId: assetId } )
            .toArray(function (err, result) {
              if (err) {
                process.hasUncaughtExceptionCaptureCallback();
              }
              if (result.length > 0) { }
       
              
              // console.log(result);
              res.json(result);
            });
        }
      );
     
    });

    router.get("/getSensors", function (req, res, next) {
      var query = url.parse(req.url, true).query;
      var mac = query.mac;
     
      accessPermission(res);
      MongoClient.connect(
        urlConn,
        { useNewUrlParser: true },
        function (err, connection) {
          if (err) {
            process.hasUncaughtExceptionCaptureCallback();
          }
          var db = connection.db(dbName);
          db.collection("Payloads")
            .find(
              { mac: mac } )
            .toArray(function (err, result) {
              if (err) {
                process.hasUncaughtExceptionCaptureCallback();
              }
              if (result.length > 0) { }
             var sensors =[];
              for (var i = 0; i < result.length; i++) {
                var keys = result[i].sensors
                sensors.push(keys);
              }
              // connection.close();
              console.log(sensors[0]);
              res.json(sensors[0]);
            });
        }
      );
     
    });   

    router.get("/getAssetsBySpCstSubCst", function (req, res, next) {
      var query = url.parse(req.url, true).query;
      var criteria, arrOfSensorNms = [];
      var SubCustomersIds = query.subCustCd.split(",");
      criteria = {
        subCustCd: { $in: SubCustomersIds }
      };
      accessPermission(res);
      MongoClient.connect(
        urlConn,
        { useNewUrlParser: true },
        function (err, connection) {
          if (err) {
            process.hasUncaughtExceptionCaptureCallback();
          }
          var db = connection.db(dbName);
          db.collection("Assets")
            .find(
              criteria
            )
            .toArray(function (err, result) {
              if (err) {
                process.hasUncaughtExceptionCaptureCallback();
              }
              if (result.length > 0) {
                console.log(result);
               }
              var assetId = [];
              for (var i = 0; i < result.length; i++) {
                assetId.push(result[i].assetId);
              }
              // connection.close();
              res.json(assetId);
            });
        }
      );
    });

//get the sensor names based on serviceProviderCode,CustomerCode,SubCustomerCode.
router.get("/getSensorNames", function (req, res, next) {
  var query = url.parse(req.url, true).query;
  var criteria, arrOfSensorNms = [];
  var ServiceProvidersIds = query.spCode.split(",");
  var CustomersIds = query.custCd.split(",");
  var SubCustomersIds = query.subCustCd.split(",");
  criteria = {
    spCd: { $in: ServiceProvidersIds },
    custCd: { $in: CustomersIds },
    subCustCd: { $in: SubCustomersIds }
  };
  accessPermission(res);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
      db.collection("Sensors")
        .aggregate([
          { $match: criteria },
          {
            $group: {
              _id: "$sensorNm",
              sensorNm: { $first: "$sensorNm" }
            }
          }
        ])
        .toArray(function (err, result) {
          if (err) {
            process.hasUncaughtExceptionCaptureCallback();
          }
          if (result.length > 0) { }
          for (var i = 0; i < result.length; i++) {
            arrOfSensorNms.push(result[i].sensorNm);
          }
          // connection.close();
          res.json(arrOfSensorNms);
        });
    }
  );
});
router.post("/getActiveDashBoardDevice", function (req, res, next) {
  accessPermission(res);
  var body = req.body;
var mac = body.mac;
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        next(err);
      }
      var db = connection.db(dbName);
      var query = url.parse(req.url, true).query;
      gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is called in Alert"); 
      

        db.collection("Devices")
        .find({ mac:mac })
        .toArray(function (err, result) {
          if (err) {
        gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this err",err);  
          }
          var deviceStateKey = Object.keys(result[0]);
          var keysToRemove2 = ["_id", "mac", "DeviceName","updatedTime","createdTime"];
          gomos.gomosLog( logger,gConsole,TRACE_DEV,"This Is key of identifire 1 Place",deviceStateKey);  
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
             devicebusinessNM.splice(devicebusinessNM.indexOf("dateTime"), 1);
             ActiveIdentifier["devicebusinessNM"] = result[0][deviceStateKey[k]][keyofCode[i]][devicebusinessNM[0]];
             ActiveIdentifier["Value"]    =  result[0][deviceStateKey[k]][keyofCode[i]][devicebusinessNM[0]];
             ActiveIdentifier["ConfigAndbsName"]    =  {"Bsname": result[0][deviceStateKey[k]][keyofCode[i]][devicebusinessNM[0]],"configNm": result[0][deviceStateKey[k]][keyofCode[i]]["configName"]}
             ActiveIdentifier["dateTime"] =  result[0][deviceStateKey[k]][keyofCode[i]]["dateTime"];
             sensorsArray.push(ActiveIdentifier);
        }
        json[name] = sensorsArray;
      }

        res.json(json);
        
        });
    
    }
  );
});
router.post("/getAllSateData", function (req, res, next) {
  accessPermission(res);
  var body = req.body;
var mac = body.mac;
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        next(err);
      }
      var db = connection.db(dbName);
      var query = url.parse(req.url, true).query;
      gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is called in Alert"); 
      

        db.collection("Devices")
        .find({ mac:mac })
        .toArray(function (err, result) {
          if (err) {
        gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this err",err);  
          }
          var deviceStateKey = Object.keys(result[0]);
          var keysToRemove2 = ["_id", "mac", "DeviceName","updatedTime","createdTime","assetId","deviceTemplate"];
          gomos.gomosLog( logger,gConsole,TRACE_DEV,"This Is key of identifire 1 Place",deviceStateKey);  
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
         
        //  var devicebusinessNM = Object.keys(result[0][deviceStateKey[k]][keyofCode[i]]);
        //  var keysToRemove3 = ["sortName","displayPosition","valueChangeAt","dateTime","Type"];
        //  for (var l = 0; l < keysToRemove3.length; l++) {
        //    if (deviceStateKey.includes(keysToRemove2[l])) {
        //      devicebusinessNM.splice(devicebusinessNM.indexOf(keysToRemove3[l]), 1);
        //    }
        //  } 
        //  gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this devicebusinessNM",devicebusinessNM);  
            //  devicebusinessNM.splice(devicebusinessNM.indexOf("dateTime"), 1);
             ActiveIdentifier["devicebusinessNM"] = result[0][deviceStateKey[k]][keyofCode[i]]["businessName"];
             ActiveIdentifier["configName"] = result[0][deviceStateKey[k]][keyofCode[i]]["configName"];
             ActiveIdentifier["Type"] =  result[0][deviceStateKey[k]][keyofCode[i]]["Type"];
             sensorsArray.push(ActiveIdentifier);
        }
        json[name] = sensorsArray;
      }

        res.json(json);
        
        });
    
    }
  );
});

router.post("/getStream", function (req, res, next) {
  accessPermission(res);
  var body = req.body;
var mac = body.mac;
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        next(err);
      }
      var db = connection.db(dbName);
      var query = url.parse(req.url, true).query;
      gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is called in Alert"); 
      

      const collection = db.collection("DeviceState")
      const changeStream = collection.watch({"mac": mac});
      changeStream.on("change", function(change) {
        console.log(change);
        gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is Our Data ",change)
        res.json(change);
      });  
    
    }
  );
});

function AddDay(){
  Date.prototype.addDay = function(h){
    this.setDate(this.getDate()+h);
    return this;
}
}
router.post("/PendingJob", function (req, res, next) {
  accessPermission(res);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        next(err);
      }
      var data = req.body;
      var mac = data.mac;
      var body = data.filter;
 
      var criteria = {
        mac: mac,
        type: "ActiveJob"
      }
    gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is Criteria of executedJob", body);

      if(body['Fchannel'] != undefined && body['Fchannel'] != null && body['Fchannel'] != ''){
        criteria["sourceMsg.Channel"]    =   body['Fchannel'];
        }
      // if(body['Fdate'] != undefined && body['Fdate'] != null && body['Fdate'] != ''){
        criteria["sourceMsg.ActionTime"]    =  {
          $lte: new Date(new Date().toISOString())  
      }
    // }
        if(body['Action'] != undefined && body['Action'] != null && body['Action'] != ''){
          criteria["sourceMsg.ActionType"]    =   body['Action'];
          }     
     
      gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is debug of executedJob",criteria );
      var db = connection.db(dbName);
      var data_count = 0;
      db.collection("DeviceInstruction")
      .find(criteria).count()
      .then(function (data) {
        data_count = data
      })

      db.collection("DeviceInstruction").find(criteria).toArray(function (err, result) {
        if (err) {
          gomos.errorCustmHandler(NAMEOFSERVICE,"DeviceInstruction","THis is DEvice Instruction","",err);
          gomos.gomosLog( logger,gConsole,TRACE_PROD,"This is error",err);
          process.hasUncaughtExceptionCaptureCallback();
        }
        var InActiveJobs = [];
        var json = {};
        gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is DeviceInstruction", result);
        if(result.length !=0){
            for(var i =0; i< result.length ; i++){
                  var temObj ={};
                  temObj["Channel"] =    result[i].sourceMsg.Channel;
                  temObj["isDailyJob"] = result[i].sourceMsg.isDailyJob;
                  temObj["ActionType"] = result[i].sourceMsg.ActionType;
                  if(result[i].sourceMsg.isDailyJob == true){
                    temObj["ActionTime"]  =  compareDate(result[i].sourceMsg.ActionValues);
                    
                  }else{
                    temObj["ActionTime"]  =  result[i].sourceMsg.ActionTime;
                  }
                  InActiveJobs.push(temObj);
              }
                    json["PendingJob"] = InActiveJobs;
                    json["count"] = data_count;
                    // json["page"] = page;
                    // json["page_size"] = page_size;
                    res.json(json)
                    }
                    else
                    { 
                      json["PendingJob"] = InActiveJobs;
                      gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is DeviceInstruction ",json);
                      res.json(json)
                    }
      });
    });
  });
router.post("/executedJob", function (req, res, next) {
  AddDay()
  accessPermission(res);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        next(err);
      }
      var data = req.body;
      var mac = data.mac;
      var body = data.filter;
 
      var criteria = {
        mac: mac,
        type: "executedJob"
      }
    gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is Criteria of executedJob", body);

      if(body['Fchannel'] != undefined && body['Fchannel'] != null && body['Fchannel'] != ''){
        criteria["sourceMsg.body.Channel"]    =   body['Fchannel'];
        }
      if(body['Fdate'] != undefined && body['Fdate'] != null && body['Fdate'] != ''){
        criteria["sourceMsg.body.ActionTime"]    =  {
          $gte: new Date(body['Fdate']),
          $lte: new Date(new Date().toISOString())  
      }}
        if(body['Action'] != undefined && body['Action'] != null && body['Action'] != ''){
          criteria["sourceMsg.body.ActionType"]    =   body['Action'];
          }     
        // var page    =   1;
        // if(body['page'] != undefined && body['page'] != null && !isNaN(body['page'])){
        //     page    =   parseInt(body['page']);
        // }
        // var page_size    =   15;
        // if(body['page_size'] != undefined && body['page_size'] != null && !isNaN(body['page_size'])){
        //     page_size    =   parseInt(body['page_size']);
        // }
        // var options       = {};
        // var offset          =       (page - 1)*page_size ;
        // options['skip']   =   offset;
        // options['limit']   =   page_size;
    


     
     
      gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is debug of executedJob",criteria );
      var db = connection.db(dbName);
      var data_count = 0;
      db.collection("DeviceInstruction")
      .find(criteria).count()
      .then(function (data) {
        data_count = data

      })

      db.collection("DeviceInstruction").find(criteria).toArray(function (err, result) {
        if (err) {
          gomos.errorCustmHandler(NAMEOFSERVICE,"DeviceInstruction","","",err);
          gomos.gomosLog( logger,gConsole,TRACE_PROD,"This is error",err);
          process.hasUncaughtExceptionCaptureCallback();
        }
        var InActiveJobs = [];
        var json = {};
        gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is DeviceInstruction", result);
        if(result.length !=0){
            for(var i =0; i< result.length ; i++){
                  var temObj ={};
                  temObj["Channel"] =    result[i].sourceMsg.body.Channel;
                  temObj["isDailyJob"] = result[i].sourceMsg.isDailyJob;
                  temObj["ActionType"] = result[i].sourceMsg.body.ActionType;
                  if(result[i].sourceMsg.isDailyJob == true){
                    temObj["ActionTime"]  =  compareDate(result[i].sourceMsg.body.ActionValues);
                    
                  }else{
                    temObj["ActionTime"]  =  result[i].sourceMsg.body.ActionTime;
                  }
                  InActiveJobs.push(temObj);
              }
                    json["executedJob"] = InActiveJobs;
                    json["count"] = data_count;
                    // json["page"] = page;
                    // json["page_size"] = page_size;
                    res.json(json)
                    }
                    else
                    { 
                      json["executedJob"] = InActiveJobs;
                      gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is DeviceInstruction ",json);
                      res.json(json)
                    }
      });
    });
  });

router.post("/ActiveJobs", function (req, res, next) {
  accessPermission(res);
 
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        next(err);
      }
      var body = req.body;
      var startDate = body.startDate;
      // var startDate = "2019-02-13T08:13:28.393Z";
    
      var endDate = body.endDate;
      var mac = body.mac;
      var criteria = {
        mac: mac,
        type: "ActiveJob"
      }
      criteria["$or"]= [ {"sourceMsg.isDailyJob": true},{
        "sourceMsg.body.ActionTime": {
          $gte: new Date(startDate),
          $lte: new Date(endDate)  
      }}];
      gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is start and end time of Active jobs", startDate + endDate);
      gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is debug of ActiveJobs",criteria );
      var db = connection.db(dbName);
      db.collection("DeviceInstruction").find(criteria).toArray(function (err, result) {
        if (err) {
          gomos.errorCustmHandler(NAMEOFSERVICE,"DeviceInstruction","","",err);
          gomos.gomosLog( logger,gConsole,TRACE_PROD,"This is error",err);
          process.hasUncaughtExceptionCaptureCallback();
        }
        // res.json(result)
        var ActiveJobs = [];
        var json = {};
        gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is DeviceInstruction", result);
        if(result.length !=0){
         
            for(var i =0; i< result.length ; i++){
                  var temObj ={};
                  temObj["Channel"] =result[i].sourceMsg.body.Channel;
                  temObj["isDailyJob"] = result[i].sourceMsg.isDailyJob;
                  temObj["jobKey"] = result[i].sourceMsg.body.jobKey;
                  temObj["State"] = result[i].sourceMsg.body.State;
                  temObj["ActionType"] = result[i].sourceMsg.body.ActionType;
                  if(result[i].sourceMsg.isDailyJob == true){
                    gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is Debug of result[i].sourceMsg.body.ActionValues",result[i].sourceMsg.body.ActionValues)
                    temObj["ActionTime"]  =  compareDate(result[i].sourceMsg.body.ActionValues);
                  }else{
                    temObj["ActionTime"]  =  result[i].sourceMsg.body.ActionTime;
                  }
                  ActiveJobs.push(temObj);
              }
            gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is debug of Active job Result", ActiveJobs)
           
        json["ActiveJob"] = ActiveJobs;
        // json["count"] = result.length;
        res.json(json)
        }
        else
        { 
          json["ActiveJob"] = ActiveJobs;
          res.json(json)
        }
        
        // gomos.gomosLog( logger,gConsole,TRACE_PROD," insert  in DeleteDeviceState activeJob");
      
      });


    });
  });
  router.post("/Deviceinstruction", function (req, res, next) {
    accessPermission(res);
    MongoClient.connect(
      urlConn,
      { useNewUrlParser: true },
      function (err, connection) {
        if (err) {
          next(err);
        }
        var body = req.body;
        var startDate = "2019-02-11T13:17:05.787Z";
        var endDate = "2019-02-12T13:17:05.787Z";
        var mac = "5ccf7f0015bc";
        var criteria = {
          mac: mac,
          // ActionValues: {
          //   $gte:startDate,
          //   $lte: endDate
          // }
        }
        var db = connection.db(dbName);
        db.collection("DeviceInstruction").find({ mac : "5ccf7f0015bc", type: "SentInstruction"}).toArray(function (err, result) {
          if (err) {
            gomos.errorCustmHandler(NAMEOFSERVICE,"DeviceInstruction","","",err);
            gomos.gomosLog( logger,gConsole,TRACE_PROD,"This is error",err);
            process.hasUncaughtExceptionCaptureCallback();
          }
          // res.json(result)
          if(result.length !=0){
      
            var json = {}
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
          res.json(json)
          gomos.gomosLog( logger,gConsole,TRACE_PROD," insert  in DeleteDeviceState activeJob");
        
        }
  
  
      });
    });
  });
  
function compareDate(str1){
  gomos.gomosLog( logger,gConsole,TRACE_PROD,"this what coming Date", str1)
  var arraydate = str1.split(":")

  var yr1
  var mon1
  var dt1
  if(arraydate[2]=="*" && arraydate[2]=="*" && arraydate[2]=="*" ){
   var dataTime = new Date();
   yr1 = dataTime.getFullYear();
   mon1 = dataTime.getMonth();
   dt1 = dataTime.getDate();
  var date1 = new Date(yr1, mon1, dt1,arraydate[3], arraydate[4], arraydate[5]);
  gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this Date Object if part",date1);

  }else{
    yr1 =  arraydate[0];
    mon1 =  arraydate[1];
    dt1 = arraydate[2];
  var date1 = new Date("20"+yr1, mon1 - 1, dt1,arraydate[3], arraydate[4], arraydate[5]);
  gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this Date Object elsepart",date1);

  }
  gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this Date Object return",date1);
  gomos.gomosLog( logger,gConsole,TRACE_PROD,"this what coming Date 2",arraydate[0]+"," +arraydate[1]+","+ arraydate[2]+","+arraydate[3]+","+ arraydate[4]+","+ arraydate[5])
  return date1;
  }
router.post("/ActiveActionTypeCall", function (req, res, next) {
  accessPermission(res);
  var body1 = req.body;
  var mac = body1.mac;
gomos.gomosLog( logger,gConsole,TRACE_DEV,"THis is body", req.body);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        next(err);
      }
      var db = connection.db(dbName);
      gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is called in Alert"); 
      // var temp = "sensors.Channel."+ value
      var  vari = { mac: mac};
        // vari[temp] = { "$exists": true };
        vari["originatedFrom"] = "gomos";
       // query to get the last dateTime the collection was modified.This dateTime is used only in excel report.
        db.collection("Payloads")
        // .find(vari, {projection: { "payloadId": 1} })
        .find(vari )
        .toArray(function (err, result) {
          if (err) {
        gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this err",err);  
          }
        gomos.gomosLog( logger,gConsole,TRACE_DEV,"this result",result);  
            res.json(result)
        
        });
      
    
    }
  );
});

router.post("/getAllClimateControl", function (req, res, next) {
  accessPermission(res);
  var body = req.body;
  var subCustCd = body.subCustCd;
  var custCd = body.custCd;
// gomos.gomosLog( logger,gConsole,TRACE_DEV,"THis is body", req.body);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        next(err);
      }
      var db = connection.db(dbName);
        db.collection("ClimateControlRules")
        .find({  "custCd": custCd,
        "subCustCd": subCustCd} )
        .toArray(function (err, result) {
          if (err) {
        gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this err",err);  
          }
        gomos.gomosLog( logger,gConsole,TRACE_DEV,"this result",result);  
        var arr = [];
        for(var i =0 ; i < result.length; i++){
         arr.push(result[i].sourceMsg);
        }
            res.json(arr)
        
        });
      
    
    }
  );
});

router.post("/getActiveDAction", function (req, res, next) {
  accessPermission(res);
  var body = req.body;
  var mac = body.mac;
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        next(err);
      }
      var db = connection.db(dbName);
      gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is called in Alert"); 
        db.collection("Devices")
        .find({ mac: mac})
        .toArray(function (err, result) {
          if (err) {
        gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this err",err);  
          }
          var keyofdata = Object.keys(result[0]);
          keysToRemove = ["DeviceName","mac","assetId","deviceTemplate","_id"];
          for(var k =0;k< keysToRemove.length; k++){
            keyofdata.splice(keysToRemove[k],1);
          }
          var  arrayofChennel = {}; 
          for(var j = 0; j < keyofdata.length; j++){
            var keyOfChannel = Object.keys(result[0][keyofdata[j]]);
           var temp =[];
        for(var i =0; i< keyOfChannel.length; i++){
          var json = {}
            json["businessName"] =  result[0][keyofdata[j]][keyOfChannel[i]].businessName;
            json["configName"] =    result[0][keyofdata[j]][keyOfChannel[i]].configName;
            json["sortName"] =    result[0][keyofdata[j]][keyOfChannel[i]].sortName;
            json["Type"] =    result[0][keyofdata[j]][keyOfChannel[i]].Type;
            json["climateControl"] =    result[0][keyofdata[j]][keyOfChannel[i]].climateControl;
            json["displayPosition"] =    result[0][keyofdata[j]][keyOfChannel[i]].displayPosition;
            temp.push(json);
          }
          gomos.gomosLog( logger,gConsole,TRACE_DEV,"this result",result);  
            arrayofChennel[keyofdata[j]] = temp;
          }
      
          res.json(arrayofChennel)
        });
    
    }
  );
});
router.post("/ActiveDAction", function (req, res, next) {
  accessPermission(res);
  var body = req.body;
  var message = body.dataBody;
  var payloadId = body.payloadId;
  var isDaillyJob = body.isDaillyJob;
  var ChannelName = body.ChannelName;
  var CustCd = body.CustCd;
  var subCustCd = body.subCustCd;
  var DeviceName = body.DeviceName;
  var mac = body.mac;
  gomos.gomosLog( logger,gConsole,TRACE_DEBUG, "this is message Value", message);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        next(err);
      }
      var db = connection.db(dbName);
      gomos.gomosLog( logger,gConsole,TRACE_DEBUG, "This is called in Alert");
      var dataTime = new Date(new Date().toISOString());
      var Token = uuidv4();
      gomos.gomosLog( logger,gConsole,TRACE_DEV, "This is Cheacking payloadId", payloadId)
      if (ChannelName != '' && ChannelName != undefined && ChannelName != null) {
        temobj = { "Channel": ChannelName }
      }
      gomos.gomosLog( logger,gConsole,TRACE_DEV, "This is ChannelName", ChannelName);
      var object = {
        "mac": mac,
        "type": "SentInstruction",
        "sourceMsg": {
          "body": message
        },
        "createdTime": dataTime,
        "updatedTime": dataTime,

      };
      object["sourceMsg"]["Token"] = Token;
      object["sourceMsg"]["ActionType"] = payloadId;
      if (isDaillyJob != "" && isDaillyJob != undefined && isDaillyJob != null) {
        object["sourceMsg"]["body"]["isDailyJob"] = isDaillyJob;
      }
      gomos.gomosLog( logger,gConsole,TRACE_DEV, "This is log for data submit Data", object);
      db.collection("DeviceInstruction")
        .insertOne(object
          , function (err, result) {
            if (err) {
              gomos.gomosLog( logger,gConsole,TRACE_DEBUG, "this err", err);
            }
            gomos.gomosLog( logger,gConsole,TRACE_DEBUG, "this is message Value 2", message);
            midllelayer.endPointMiddelayerFn(urlConn, dbName, res, CustCd, subCustCd, DeviceName, payloadId, dataTime, message, Token);
          })
    });
});
router.post("/ActiveAPiForLevel4", function (req, res, next) {
  accessPermission(res);
  var body = req.body;
  var message = body.dataBody;
  var payloadId = body.payloadId;
  var isDaillyJob = body.isDaillyJob;
  var ChannelName = body.ChannelName;
  var CustCd = body.CustCd;
  var subCustCd = body.subCustCd;
  var DeviceName = body.DeviceName;
  var mac = body.mac;
  gomos.gomosLog( logger,gConsole,TRACE_DEBUG, "this is message Value", message);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        next(err);
      }
      var db = connection.db(dbName);
      gomos.gomosLog( logger,gConsole,TRACE_DEBUG, "This is called in Alert");
      var dataTime = new Date(new Date().toISOString());
      var Token = uuidv4();
      gomos.gomosLog( logger,gConsole,TRACE_DEV, "This is Cheacking payloadId", payloadId)
      if (ChannelName != '' && ChannelName != undefined && ChannelName != null) {
        temobj = { "Channel": ChannelName }
      }
      gomos.gomosLog( logger,gConsole,TRACE_DEV, "This is ChannelName", ChannelName);
      var object = {
        "mac": mac,
        "type": "SentInstruction",
        "sourceMsg": {
          "body": message
        },
        "createdTime": dataTime,
        "updatedTime": dataTime,

      };
      object["sourceMsg"]["Token"] = Token;
      object["sourceMsg"]["ActionType"] = payloadId;
      if (isDaillyJob != "" && isDaillyJob != undefined && isDaillyJob != null) {
        object["sourceMsg"]["body"]["isDailyJob"] = isDaillyJob;
      }
      gomos.gomosLog( logger,gConsole,TRACE_DEV, "This is log for data submit Data", object);
      db.collection("DeviceInstruction")
        .insertOne(object
          , function (err, result) {
            if (err) {
              gomos.gomosLog( logger,gConsole,TRACE_DEBUG, "this err", err);
            }
            gomos.gomosLog( logger,gConsole,TRACE_DEBUG, "this is message Value 2", message);
            midllelayer.endPointMiddelayerFnWithRemark(urlConn, dbName, res, CustCd, subCustCd, DeviceName, payloadId, dataTime, message, Token,body.remark);
          })
    });
});


router.post("/ActiveProgramRuleUpdate", function (req,res, next){
  accessPermission(res);
  var body = req.body;
  var mac         =   body.mac;
  var name        =  body.name;
  var version     =  body.version;
  var previousState = body.previousState;
  var currentState = body.currentState;
  var pendingConfirmation = body.pendingConfirmation;


// var messageValue = message;
// gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this is message Value", message);
MongoClient.connect(
  urlConn,
  { useNewUrlParser: true },
  function (err, connection) {
    if (err) {
      next(err);
    }
    gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is for Update in Program Details", mac)
    var db = connection.db(dbName);
    var dateTime = new Date(new Date().toISOString());
    
      db.collection("DeviceInstruction")
      .updateOne( {"type": "ProgramDetails","mac": mac, "sourceMsg.body.name": name,"sourceMsg.body.version": version},
       { $set: { "sourceMsg.body.currentState":currentState,"sourceMsg.body.previousState" : previousState,
       "sourceMsg.body.pendingConfirmation": pendingConfirmation,
      "updatedTime" :dateTime
        } 
      }
      ,function (err, result) {
        if (err) {
      gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this err",err);  
        }
        gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is device Instruction for ClimateSave", result);
        res.json(result)
  });
});
});
router.post("/getDeviceUpTime", function (req,res, next){
  accessPermission(res);
  var body = req.body;
  var mac         =   body.mac;
  var name        =  body.name;
console.log(body)
MongoClient.connect(
  urlConn,
  { useNewUrlParser: true },
  function (err, connection) {
    if (err) {
      next(err);
    }
    gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is finding DeviceUpTime with this mac", mac)
    var db = connection.db(dbName);
    var dateTime = new Date(new Date().toISOString());
    
      db.collection("DeviceUpTime")
      .find({mac:body.mac ,bootstrap: {$gte: new Date(body.startTime), $lte: new Date(body.endTime)}})
      .toArray(function (err, result) {
        if (err) {
           gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this err",err);  
        }
        gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is device Instruction for ClimateSave", result);
        if(result.length > 0){
          let count =0 ;
        for(let i = 0; i < result.length; i++){
        
         count += result[i].duration;   
        }
         let value = Math.floor(count/60)+":"+Math.round(count%60);
          let data  = value.split(":");
          let data2 = ''
          if (data[0].length === 1) {
            data2 += 0 + data[0]
          }
          else {
            data2 += data[0]
          }
          data2 += ":"
          if (data[1].length === 1) {
            data2 += 0 + data[1]
          }
          else {
            data2 += data[1]
          }
          res.json(data2)

        }
        else{
        res.json("00:00")
        }
  });
});
});

router.post("/ActiveProgrameSave", function (req,res, next){
  accessPermission(res);
  var body = req.body;
  var message     =   body.dataBody; 

  var mac         =   body.mac;
var messageValue = message;
gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this is message Value", message);
MongoClient.connect(
  urlConn,
  { useNewUrlParser: true },
  function (err, connection) {
    if (err) {
      next(err);
    }
    var db = connection.db(dbName);
// var dateTime = new Date()
    gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is called in Alert"); 
    var dateTime = new Date(new Date().toISOString());
    db.collection("Instructionindex")
    .insert({"programKeyIndex": `${mac}-${message.programKey}`},function(err,result){
      gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is err", err);
      if(err){
        res.json("Error");
      }
      else{
      // if(result.length === 0){
      gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is log for data submit Data",result );
      db.collection("DeviceInstruction")
      .insert( {"mac": mac,"type": "ProgramDetails",
      sourceMsg: {body:message},
      createdTime: dateTime,
      updatedTime :dateTime
    },function (err, result) {
        if (err) {
      gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this err",err);  
        }
        gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is device Instruction for ", result["upserted"]);
        gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is device Instruction for ",result["CommandResult"]);
        gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is device Instruction for Program Details", result);
        res.json(result)
       });
      }
     });
    });
});
router.post("/ActiveProgrameFetch", function (req,res, next){
  accessPermission(res);
  var body = req.body;
  var mac         =   body.mac;
MongoClient.connect(
  urlConn,
  { useNewUrlParser: true },
  function (err, connection) {
    if (err) {
      next(err);
    }
    var db = connection.db(dbName);
    gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"THis is MAc", mac)
        db.collection("DeviceInstruction")
        .aggregate([{$match: {"mac":mac,"type": "ProgramDetails"}},{ $group : { _id: "$sourceMsg.body.name", version: { $max : "$sourceMsg.body.version" }}}]).toArray(function (err, result){
          if (err) {
            gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this err",err);  
              }   
              let data = result.map(item => `${item._id}-${item.version}`)
              let currentDate = new Date(new Date().toISOString());
              gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is result of find",data)                
               db.collection("DeviceInstruction")
              .find( {"mac":mac,"type": "ProgramDetails","sourceMsg.body.programKey": {$in: data} ,
              $and: [ {$or: [ {"sourceMsg.body.currentState":{$ne :"delete"}}, {"sourceMsg.body.pendingConfirmation": {$ne:false}} ]}, {$or: [{"sourceMsg.body.expiryDate": {$gte: currentDate}},{"sourceMsg.body.expiryDate": "" }] } ]
            
            }).toArray(function (err, result1) {
                if (err) {
              gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this err",err);  
                }
       gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is device Instruction for Program Details", result1);
        res.json(result1)
              });
  });
 });
});
// router.post("/ActiveProgrameDelete", function (req,res, next){
//   accessPermission(res);
//   var body = req.body;
//   // var message     =   body.dataBody; 

//   var mac         =   body.mac;
//   var name         =   body.name;
// MongoClient.connect(
//   urlConn,
//   { useNewUrlParser: true },
//   function (err, connection) {
//     if (err) {
//       next(err);
//     }
//     var db = connection.db(dbName);
//     gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"THis is MAc", mac)
//       db.collection("DeviceInstruction")
//       .deleteMany( {"mac":mac,"type": "ProgrameDetails", "sourceMsg.body.name": name},function (err, result) {
//         if (err) {
//       gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this err",err);  
//         }
//         gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is device Instruction for Program Details", result);
//         res.json(result)
//   });
//  });
// });

function deleteProgramIndex(dbo,data){
  return new Promise((resolve, reject)=> {
    gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is deleteProgramIndex going to delete ", `${data.mac}-${data.sourceMsg.body.programKey}`);
  dbo.collection("Instructionindex").deleteOne(
  {programKeyIndex : `${data.mac}-${data.sourceMsg.body.programKey}`},
    function(err, result) {
      if (err) {
        gomos.errorCustmHandler( NAMEOFSERVICE,"delted For ProgrameDetails Override","This is Updateting Error","", err);
        process.hasUncaughtExceptionCaptureCallback();
        reject(err)
      }
    gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is deleteProgramIndex", result.result.n);
    resolve(result)

    });
  });
}
router.post("/ActiveProgramerevert", function (req,res, next){
  accessPermission(res);
  var reqData = req.body;
  // var message     =   body.dataBody; 

  // var mac         =   body.mac;
  // var name         =   body.name;
  gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is ActiveProgramrevert");
MongoClient.connect(
  urlConn,
  { useNewUrlParser: true },
  function (err, connection) {
    if (err) {
      next(err);
    }
    var dbo = connection.db(dbName);
    gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is ActiveProgramrevert", reqData);
    dbo
    .collection("DeviceInstruction")
    .find({ mac: reqData.mac, type: "ProgramDetails",
    "sourceMsg.body.name":reqData.sourceMsg.name,
    "sourceMsg.body.version":reqData.sourceMsg.version

  })
    .toArray(function(err, resultMain) {
      if (err) {
        process.hasUncaughtExceptionCaptureCallback();
      }
          if (resultMain.length != 0) {
            gomos.gomosLog( logger,gConsole, TRACE_DEBUG,"This ProgrameDetails data",resultMain);
            gomos.gomosLog( logger,gConsole, TRACE_DEBUG, "This ProgrameDetails dataInsruction.sourceMsg.body Splite data ito part",reqData.sourceMsg);
            gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is ProgrameDetails after asing",resultMain[0].sourceMsg.body);
            if(reqData.ActionType === "SetProgramState"){
            dbo.collection("DeviceInstruction").updateOne(
              { _id: resultMain[0]["_id"],$or : [{"sourceMsg.body.pendingConfirmation":{ $ne : false}}]  },
              {$set: {
                "sourceMsg.body.currentState": resultMain[0].sourceMsg.body.previousState,
                "sourceMsg.body.previousState": resultMain[0].sourceMsg.body.currentState,
                "sourceMsg.body.pendingConfirmation": false,
                updatedTime: new Date(new Date().toISOString())
              }
            }, 
           async function(err, result1) {
                if (err) {
                  gomos.errorCustmHandler( NAMEOFSERVICE,"updated For Programe State in ProgrameDetails   in setProgramStateErrorProcess","This is Updateting Error","", err);
                  res.send("Some Things Error .");
                  process.hasUncaughtExceptionCaptureCallback();
                }
                 let response =  await deleteProgramIndex(dbo,resultMain[0])
                 gomos.gomosLog(logger,gConsole,TRACE_DEBUG,"This is resonse deleteProgramIndex", response)
                gomos.gomosLog( logger,gConsole,TRACE_DEBUG, "updated For Programe State in ProgrameDetails   in setProgramStateErrorProcess",result1);
                res.json(result1)
              }
            );
          }
        
        else if( reqData.ActionType ===  "SetProgram"){
          gomos.gomosLog( logger,gConsole, TRACE_DEBUG, "This ProgrameDetails dataInsruction.sourceMsg.body Splite data ito part",reqData.sourceMsg);
          gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is ProgrameDetails after asing",resultMain[0].sourceMsg.body);
          dbo.collection("DeviceInstruction").deleteOne(
            { _id: resultMain[0]["_id"] ,$or : [{"sourceMsg.body.pendingConfirmation":{ $ne : false}}] },
            async function(err, result) {
              if (err) {
                gomos.errorCustmHandler( NAMEOFSERVICE,"delted For ProgrameDetails Override","This is Updateting Error","", err);
                res.send("Some Things Error .");
                process.hasUncaughtExceptionCaptureCallback();
              }
              gomos.gomosLog( logger,gConsole,TRACE_DEBUG, " For ProgrameDetails Override  in setProgramErrorProcess");
              let response =  await deleteProgramIndex(dbo,resultMain[0])
              gomos.gomosLog(logger,gConsole,TRACE_DEBUG,"This is resonse deleteProgramIndex", response)
              res.json(result)
            }
          );
        }

        }
        else{
          res.send("No Record Found .");
        }
        
          
        }
    );
 });
});
router.post("/ActiveClimatesave", function (req,res, next){
  accessPermission(res);
  var body = req.body;
  var message     =   body.dataBody; 

  var mac         =   body.mac;
var messageValue = message;
gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this is message Value", message);
MongoClient.connect(
  urlConn,
  { useNewUrlParser: true },
  function (err, connection) {
    if (err) {
      next(err);
    }
    var db = connection.db(dbName);
var dateTime = new Date()
    gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is called in Alert"); 
    var dataTime = new Date(new Date().toISOString());
      var temobj={}
      for (let [key, value] of Object.entries(message)) {  
        temobj[key]= value;
      }
       var object = {

        "sourceMsg": {
          "body":temobj 
        },
        
        "updatedTime": dataTime,
     
       } ;
      //  object["sourceMsg"]["ActionType"]  = payloadId;
      
       gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is log for data submit Data",object );
      db.collection("DeviceInstruction")
      .updateOne( {"type": "SentClimateParameter","mac": mac},
       { $set: { "sourceMsg.body":temobj,
      updatedTime :dateTime
        } 
      }
      ,function (err, result) {
        if (err) {
      gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this err",err);  
        }
        gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is device Instruction for ClimateSave", result);
        res.json(result)
  });
});
});
router.post("/ActivesaveForManualOverForTiles", function (req,res, next){
  accessPermission(res);
  var body = req.body;
  var message     =   body.dataBody; 

  var mac         =   body.mac;
gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this is message Value ActivesaveForManualOverForTiles", message);
MongoClient.connect(
  urlConn,
  { useNewUrlParser: true },
  function (err, connection) {
    if (err) {
      next(err);
    }
    var db = connection.db(dbName);
var dateTime = new Date()
    gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is called in Alert"); 
    var dataTime = new Date(new Date().toISOString());
      var temobj={}
      
       var businessNameKey = Object.keys(message);
      // for (let [key, value] of Object.entries(message)) {  
      //   temobj[key]= value;
      // }
       var object = {

        "sourceMsg": {
          "body":temobj 
        },
        
        "updatedTime": dataTime,
     
       } ;
       temobj[`sourceMsg.body.${businessNameKey[0]}.pendingMode`] = message[businessNameKey[0]]["mode"]; 
       gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is log for data submit Data ActivesaveForManualOverForTiles",temobj );
      db.collection("DeviceInstruction")
      .updateOne( {"type": "SentManOverride","mac": mac},
       { $set: temobj 
      }
      ,function (err, result) {
        if (err) {
      gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this err",err);  
        }
        gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is device Instruction for ClimateSave", result);
        res.json(result)
  });
});
});
router.post("/ActivesaveForManualOver", function (req,res, next){
  accessPermission(res);
  var body = req.body;
  var message     =   body.dataBody; 

  var mac         =   body.mac;
gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this is message Value", message);
MongoClient.connect(
  urlConn,
  { useNewUrlParser: true },
  function (err, connection) {
    if (err) {
      next(err);
    }
    var db = connection.db(dbName);
var dateTime = new Date()
    gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is called in Alert"); 
    var dataTime = new Date(new Date().toISOString());
      var temobj={}
      for (let [key, value] of Object.entries(message)) {  
        temobj[key]= value;
      }
       var object = {

        "sourceMsg": {
          "body":temobj 
        },
        
        "updatedTime": dataTime,
     
       } ;
      //  object["sourceMsg"]["ActionType"]  = payloadId;
      
       gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is log for data submit Data",object );
      db.collection("DeviceInstruction")
      .updateOne( {"type": "SentManOverride","mac": mac},
       { $set: { "sourceMsg.body":temobj,
      updatedTime :dateTime
        } 
      }
      ,function (err, result) {
        if (err) {
      gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this err",err);  
        }
        gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is device Instruction for ClimateSave", result);
        res.json(result)
  });
});
});
router.post("/getAClimateparameter", function (req,res, next){
  accessPermission(res);
  var body = req.body;
  var message     =   body.dataBody; 
  var mac         =   body.mac;
// gomos.gomosLog( logger,gConsole,TRACE_TEST,"this is message Value", message);
gomos.gomosLog( logger,gConsole,TRACE_TEST,"this is message Value", mac);
MongoClient.connect(
  urlConn,
  { useNewUrlParser: true },
  function (err, connection) {
    if (err) {
      next(err);
    }
    var db = connection.db(dbName);
      db.collection("DeviceInstruction")
      .findOne( {"type": "SentClimateParameter","mac": mac}
      ,function (err, result) {
        if (err) {
      gomos.gomosLog( logger,gConsole,TRACE_TEST,"this err",err);  
        }
        gomos.gomosLog( logger,gConsole,TRACE_TEST,"This is device Instruction for ClimateSave", result);
        try {
          res.json(result["sourceMsg"]["body"]);
        } catch (error) {
          gomos.errorCustmHandler(NAMEOFSERVICE,"getAClimateparameter", "Sending DataDeviceInstruction ","",error);
          res.json(error);
        }
       
  });
});

});
router.post("/getAManualOverride", function (req,res, next){
  accessPermission(res);
  var body = req.body;
  var message     =   body.dataBody; 
  var mac         =   body.mac;
// gomos.gomosLog( logger,gConsole,TRACE_TEST,"this is message Value", message);
gomos.gomosLog( logger,gConsole,TRACE_TEST,"this is message Value", mac);
MongoClient.connect(
  urlConn,
  { useNewUrlParser: true },
  function (err, connection) {
    if (err) {
      next(err);
    }
    var db = connection.db(dbName);
      db.collection("DeviceInstruction")
      .findOne( {"type": "SentManOverride","mac": mac}
      ,function (err, result) {
        if (err) {
      gomos.gomosLog( logger,gConsole,TRACE_TEST,"this err",err);  
        }
        gomos.gomosLog( logger,gConsole,TRACE_TEST,"This is device Instruction for ClimateSave", result);
        try {
          res.json(result["sourceMsg"]["body"]);
        } catch (error) {
          gomos.errorCustmHandler(NAMEOFSERVICE,"getAClimateparameter", "Sending DataDeviceInstruction ","",error);
          res.json(error);
        }
       
  });
});

});

//get the operations based on serviceProviderCode,CustomerCode,SubCustomerCode and SensorName.
router.get("/getOperations", function (req, res, next) {
  var query = url.parse(req.url, true).query;
  accessPermission(res);
  var criteria;
  var ServiceProvidersIds = query.spCode.split(",");
  var CustomersIds = query.custCd.split(",");
  var SubCustomersIds = query.subCustCd.split(",");
  criteria = {
    spCd: { $in: ServiceProvidersIds },
    custCd: { $in: CustomersIds },
    subCustCd: { $in: SubCustomersIds },
    sensorNm: query.sensorNm
  };

  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
      db.collection("Sensors")
        .aggregate([
          { $match: criteria },
          {
            $group: {
              _id: "$operations",
              operations: {
                $first: "$operations"
              }
            }
          }
        ])
        .toArray(function (err, result) {
          if (err) {
            process.hasUncaughtExceptionCaptureCallback();
          }
          arrOfOperations = [];
          for (var i = 0; i < result.length; i++) {
            arrOfOperations.push(result[i].operations);
          }
          //connection.close();
          res.json(arrOfOperations);
        });
    }
  );
});
router.post("/getAlertFlag", function (req, res, next) {
  accessPermission(res);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        next(err);
      }
      var db = connection.db(dbName);
      var body = req.body.body;
      var subCustCd = body.subCustCd;
      var DeviceName = body.DeviceName;
      var type = body.type;
      var processed = body.processed
      criteria = { 
        DeviceName: DeviceName,
        subCustCd: subCustCd,
        type: type,
        // processed: processed
         }
      if(body.processed != undefined && body.processed != null){
        criteria['processed']    =  body.processed ;
    // console.log('processedValue');
      }
      var page    =   1;

      if(body.page != undefined && body.page != null && !isNaN(body.page)){
          page    =   parseInt(body.page);
       
      }
  
      var page_size    =   10;
      if(body.page_size != undefined && body.page_size != null && !isNaN(body.page_size)){
          page_size    =   parseInt(body.page_size);
      }
  
      var offset          =       (page - 1)*page_size ;

      console.log("This is called in Alert");
     console.log(criteria)
 
        //query to get the last dateTime the collection was modified.This dateTime is used only in excel report.
        db.collection("Alerts")
        .find(criteria)
        .skip(offset).limit( page_size ).sort({createdTime:-1})
        .toArray(function (err, finalResult) {
          if (err) {
           console.log("this err");
           console.log(err);
          }
          console.log("hello this is response");
          // console.log(finalResult);
          // var arrayOfObject = [];
          // if (result.length > 0) {
            db.collection("Alerts")
          .find(criteria).count()
          .then(function (data) {
          var data_count = data
            var json= {finalResult, data_count}
            res.json(json);
          })
          
            // console.log(result);
            // res.json(result)
        
        });
    
    }
  );
});
var fs = require("fs");
function fileWriter(count,data){
  // console.log(typeofError);
    let writeStream = fs.createWriteStream("../logForupdate-"+1+ ".json", { flags: "a" });
    var dateTime = new Date().toISOString();
  // write some data with a base64 encoding
  writeStream.write(count+1 +":"+ JSON.stringify(data)+ "\n" + "\n");
  
  // the finish event is emitted when all data has been flushed from the stream
  writeStream.on('finish', () => {  
    // gomos.gomosLog( logger,gConsole,TRACE_PROD,"wrote all data to file For Error"); 
    console.log("wrote all data to file For Error"); 
  });
  
  // close the stream
  writeStream.end();
  
  }
router.get("/getAlertDevices", function (req, res, next) {
  accessPermission(res);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        next(err);
      }
      var db = connection.db(dbName);
      var query = url.parse(req.url, true).query;
      var subCustCd = query.subCustCd;
      var DeviceName = query.DeviceName;
      var type = query.type;

      console.log("This is called in Alert");
     console.log({DeviceName: DeviceName,subCustCd: subCustCd,type: type})
        //query to get the last dateTime the collection was modified.This dateTime is used only in excel report.
        db.collection("Alerts")
        .find({DeviceName: DeviceName,subCustCd: subCustCd,type: type})
        .skip( 0 ).limit( 100 ).sort({createdTime:-1})
        .toArray(function (err, result) {
          if (err) {
           console.log("this err");
           console.log(err);
          }
          console.log("hello this is response");
          console.log(result);
          // var arrayOfObject = [];
          // if (result.length > 0) {
            console.log(result);
            res.json(result)
        
        });
    
    }
  );
});



router.post("/getAlert", function (req, res, next) {
  accessPermission(res);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        next(err);
      }
      var db = connection.db(dbName);
      var query = url.parse(req.url, true).query;
      var body = req.body
      var startDate, endDate,level,assets;
      console.log(body)
      assets = body.selectedAssetsValue;
      startDate = body.dateTime1;
      endDate = body.dateTime2;
      level = body.selectedlevelValue;

      var criteria;
      // var ServiceProvidersIds = body.spToSend.split(",");
      var CustomersIds = body.custToSend;
      var arSubCustomerIDs = body.subCustToSend;

      // This criteria is built without sensor names for now, however a better way to filter based on sensornames
      // rather than getting everything and removing the unwanted data of other sensrors.
      criteria = {
        custCd: { $in: CustomersIds },
        subCustCd: { $in: arSubCustomerIDs },
        assetId: assets,
        type: level,
        createdTime: {
          $gte:startDate,
          $lte: endDate
        }
      };
      console.log("This is called in Alert");
      console.log(criteria);
        //query to get the last dateTime the collection was modified.This dateTime is used only in excel report.
        db.collection("Alerts")
        .aggregate([
          { $match: criteria },
          { "$group": {
            "_id": {
                "DeviceName": "$DeviceName",
                "processed": "$processed"
            },
            "DeviceCount": { "$sum": 1 }
        }},
        { "$group": {
            "_id": "$_id.DeviceName",
            "processedData": { 
                "$push": { 
                    "processed": "$_id.processed",
                    "count": "$DeviceCount"
                },
            },
            "totalCount": { "$sum": "$DeviceCount" }
        }},
          {
            $limit: 2,
          
          },
          {
            $skip : 1,
          }
        ])
        // .sort({ $natural: -1 })
        .toArray(function (err, result) {
          if (err) {
           console.log("this err");
           console.log(err);
          }
          console.log("hello this is response");
          console.log(result);
          var arrayOfObject = [];
          // if (result.length > 0) {
            console.log(result);
            res.json(result)
          // }
        });
    
    }
  );
});

//get the dashoboard details of perticular Sensor based on given data
router.post("/getdashboard", function (req, res, next) {
  accessPermission(res);

  var body = req.body;
  gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"THIS IS DEBUG OF GET DASHBOARD", body);
  var sensorNm = body.sensorNm;
  var spCd = body.spCd;
  var custCd = body.custCd;
  var subCustCd = body.subCustCd;
   var mac = body.mac;
  var sensorsBSN = body.sensorsBSN;
gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this is debuging in starting",sensorsBSN+"|"+mac+"|"
+subCustCd+"|"+custCd+"|"+spCd+"|"+sensorNm);
  
    var page    =   1;

    if(body.page != undefined && body.page != null && !isNaN(body.page)){
        page    =   parseInt(body.page);
     
    }

    var page_size    =   10;
    if(body.page_size != undefined && body.page_size != null && !isNaN(body.page_size)){
        page_size    =   parseInt(body.page_size);
    }

    var offset          =       (page - 1)*page_size ;

  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
 
     var criteria = {
        spCd: spCd,
        custCd: custCd,
        subCustCd: subCustCd,
        mac: mac,
       }
    if(body.startTime != "" && body.startTime != undefined && body.startTime != null && body.endTime != "" && body.endTime != undefined && body.endTime != null ){
      criteria["createdTime"] = {$lte : new Date(body.endTime) , $gte: new Date(body.startTime)}
    }

    // if( body.TypeOfData === "Normal"){
    //   normalDataProcessing(db,res,criteria,offset,sensorsBSN,sensorNm ,page_size);
    // }
      switch (body.TypeOfData) {
        case "Normal":
          normalDataProcessing(db, res, criteria, offset, sensorsBSN, sensorNm, page_size);
          break;
        case "Hourly":
          gomos.gomosLog(logger, gConsole, TRACE_DEV, "this is Log for Hourly");
          hourlyDataProcessing(db, res, criteria, offset, page_size);
          break;
        case "Daily":
          gomos.gomosLog(logger, gConsole, TRACE_DEV, "this is Log for Daily");
          dailyDataProcessing(db, res, criteria, offset, page_size);
          break;
        case "Weekly":
          gomos.gomosLog(logger, gConsole, TRACE_DEV, "this is Log for Weekly");
          weeklyDataProcessing(db, res, criteria, offset, page_size);
          break;
        case "Monthly":
          gomos.gomosLog(logger, gConsole, TRACE_DEV, "this is Log for Monthly");
          monthlyDataProcessing(db, res, criteria, offset, page_size);
          break;
          default: 
          gomos.gomosLog(logger, gConsole, TRACE_DEV, "this is Log for Nothing Is Selected");
          res.json(0);
          break;
      }
    
}
)
}
);
function monthlyDataProcessing(db, res, criteria, offset, page_size) {

  let NewCriteria = { mac: criteria.mac };
  if (criteria.createdTime != "" && criteria.createdTime != undefined && criteria.createdTime != null) {
    NewCriteria["createdTime"] = criteria["createdTime"];
  }
  console.log(NewCriteria)
  db.collection("AggregatedData")
    .aggregate([{$match: NewCriteria},
    { $group : { _id:  {  "Month":"$Month","Year": "$Year","bsName":"$bsName" } ,"max" : { $max :"$Max"} ,"min" : { $min :"$Min"}, 
      mac: {"$first": "$mac"} ,"DeviceName": {"$first":"$DeviceName" },"Date": {"$first":"$Date" }
      ,"sum1" : { $sum :"$Sum"} ,"Count" : { $sum :"$Count"}, Duration: {$sum: "$duration"}}}, 
      {"$group": { "_id":{"Month":"$_id.Month","Year": "$_id.Year"},
       "processedData": {
        "$push": {
           "Date": "$Date"  ,
           "bsName": "$_id.bsName",
           "Max" :  "$max" ,
           "Min" : "$min",
           "Sum": "$sum1",
           "Avg": { $divide: [ "$sum1", "$Count" ] },
           "Duration": "$Duration",
           "Count": "$Count",
          //  "createdTime": "$createdTime",
        // "DateTime": {$dateToString: { format: "%Y-%m-%d", date: "$Date" } },
           "mac": "$mac",
           "DeviceName": "$DeviceName"

        }
    
      }
    }
    },
    {
      $sort:{ "_id.Month": -1, "_id.Year":-1}
    },
   
    {
      $limit: offset + page_size,
    
    },
    {
      $skip : offset,
    }
    ]).toArray(function (err, result1){
     //  console.log(result1)
      if (err) {
        console.log(err)
        process.hasUncaughtExceptionCaptureCallback();
      }

      else if (result1.length > 0) {
        let array = []
        for (let i = 0; i < result1.length; i++) {


          let tempObj = {};
          let createdTime = result1[i]._id.Year+"-"+result1[i]._id.Month;
          let mac ="";
          let DeviceName ="";
         // let hours = result1[i]._id.Hour;
          let hours = "";

          let tempArray = result1[i].processedData;
          for (let j = 0; j < tempArray.length; j++) {
            let bsName = tempArray[j].bsName;
            let tempNewObj = {
              Avg: (tempArray[j].Avg == null) ? "" : (tempArray[j].Avg).toFixed(2),
              Min: (tempArray[j].Min == null) ? "" : (tempArray[j].Min).toFixed(2),
              Max: (tempArray[j].Max == null) ? "" : (tempArray[j].Max).toFixed(2),
              Durations: (tempArray[j].Duration == null) ? "" : tempArray[j].Duration,
              Count: (tempArray[j].Count == null) ? "" : tempArray[j].Count
            };
            // if(0 == j){
           
             // createdTime = tempArray[j].Date
              //console.log(tempArray[j].Date)
              mac =  tempArray[j].mac;
              DeviceName = tempArray[j].DeviceName;
            // }

            tempObj[bsName] = tempNewObj;
          }
         // console.log(tempObj)
          array.push([mac, DeviceName, "", tempObj, createdTime])
        }
       //console.log(result1)
        let finalResult = array;
        let data_count;
        let lastdataObj = {};
        let lastCreatedTime = "";
        db.collection("AggregatedData")
          .aggregate([{$match: NewCriteria},
    //     {
      { $group : { _id:  {"Month":"$Month","Year": "$Year","bsName":"$bsName" }}}, 
      {"$group": { "_id": { "Month":"$_id.Month","Year": "$_id.Year" }
    }},
    {
      $count: "totalCount"
    },
  
    ]).toArray(function (err, result2){
      data_count  = result2[0].totalCount;
       console.log(result1)
      let json = { finalResult, data_count, lastdataObj, lastCreatedTime,result1}
      res.json(json)
    });
 }else{
  res.json(0);
 }
    });

}
function weeklyDataProcessing(db, res, criteria, offset, page_size) {

  let NewCriteria = { mac: criteria.mac };
  if (criteria.createdTime != "" && criteria.createdTime != undefined && criteria.createdTime != null) {
    NewCriteria["createdTime"] = criteria["createdTime"];
  }
  console.log(NewCriteria)
  db.collection("AggregatedData")
    .aggregate([{$match: NewCriteria},
    { $group : { _id:  {  "Week":"$Week","Year": "$Year","bsName":"$bsName" } ,"max" : { $max :"$Max"} ,"min" : { $min :"$Min"}, 
      mac: {"$first": "$mac"} ,"DeviceName": {"$first":"$DeviceName" },"Date": {"$first":"$Date" }
      ,"sum1" : { $sum :"$Sum"} ,"Count" : { $sum :"$Count"}, Duration: {$sum: "$duration"}}}, 
      {"$group": { "_id":{"Week":"$_id.Week","Year": "$_id.Year"},
       "processedData": {
        "$push": {
           "Date": "$Date"  ,
           "bsName": "$_id.bsName",
           "Max" :  "$max" ,
           "Min" : "$min",
           "Sum": "$sum1",
           "Avg": { $divide: [ "$sum1", "$Count" ] },
           "Duration": "$Duration",
           "Count": "$Count",
          //  "createdTime": "$createdTime",
        // "DateTime": {$dateToString: { format: "%Y-%m-%d", date: "$Date" } },
           "mac": "$mac",
           "DeviceName": "$DeviceName"

        }
    
      }
    }
    },
    {
      $sort:{ "_id.Week": -1,"_id.Year":-1}
    },
   
    {
      $limit: offset + page_size,
    
    },
    {
      $skip : offset,
    }
    ]).toArray(function (err, result1){
     //  console.log(result1)
      if (err) {
        console.log(err)
        process.hasUncaughtExceptionCaptureCallback();
      }

      else if (result1.length > 0) {
        let array = []
        for (let i = 0; i < result1.length; i++) {


          let tempObj = {};
          let createdTime = result1[i]._id.Year+"-"+ result1[i]._id.Week;
          let mac ="";
          let DeviceName ="";
         // let hours = result1[i]._id.Hour;
          let hours = "";

          let tempArray = result1[i].processedData;
          for (let j = 0; j < tempArray.length; j++) {
            let bsName = tempArray[j].bsName;
            let tempNewObj = {
              Avg: (tempArray[j].Avg == null) ? "" : (tempArray[j].Avg).toFixed(2),
              Min: (tempArray[j].Min == null) ? "" : (tempArray[j].Min).toFixed(2),
              Max: (tempArray[j].Max == null) ? "" : (tempArray[j].Max).toFixed(2),
              Durations: (tempArray[j].Duration == null) ? "" : tempArray[j].Duration,
              Count: (tempArray[j].Count == null) ? "" : tempArray[j].Count
            };
            // if(0 == j){
           
            //  createdTime = tempArray[j].Date
              //console.log(tempArray[j].Date)
              mac =  tempArray[j].mac;
              DeviceName = tempArray[j].DeviceName;
            // }

            tempObj[bsName] = tempNewObj;
          }
         // console.log(tempObj)
          array.push([mac, DeviceName, "", tempObj, createdTime])
        }
       //console.log(result1)
        let finalResult = array;
        let data_count;
        let lastdataObj = {};
        let lastCreatedTime = "";
        db.collection("AggregatedData")
          .aggregate([{$match: NewCriteria},
    //     {
      { $group : { _id:  {"Week":"$Week","Year": "$Year","bsName":"$bsName" }}}, 
      {"$group": { "_id": {"Week":"$_id.Week", "Year": "$_id.Year" }
    }},
    {
      $count: "totalCount"
    },
  
    ]).toArray(function (err, result2){
      data_count  = result2[0].totalCount;
     //  console.log(result1)
      let json = { finalResult, data_count, lastdataObj, lastCreatedTime}
      res.json(json)
    });
 }else{
  res.json(0);
 }
    });

}
function dailyDataProcessing(db, res, criteria, offset, page_size) {

  let NewCriteria = { mac: criteria.mac };
  if (criteria.createdTime != "" && criteria.createdTime != undefined && criteria.createdTime != null) {
    NewCriteria["createdTime"] = criteria["createdTime"];
  }
  console.log(NewCriteria)
  db.collection("AggregatedData")
    .aggregate([{$match: NewCriteria},
    { $group : { _id:  {"Date": "$Date","Day":"$Day","bsName":"$bsName" } ,"max" : { $max :"$Max"} ,"min" : { $min :"$Min"}, 
      mac: {"$first": "$mac"} ,"DeviceName": {"$first":"$DeviceName" }
      ,"sum1" : { $sum :"$Sum"} ,"Count" : { $sum :"$Count"}, Duration: {$sum: "$duration"}}}, 
      {"$group": { "_id":"$_id.Day",
       "processedData": {
        "$push": {
           "Date": "$_id.Date"  ,
           "bsName": "$_id.bsName",
           "Max" :  "$max" ,
           "Min" : "$min",
           "Sum": "$sum1",
           "Avg": { $divide: [ "$sum1", "$Count" ] },
           "Duration": "$Duration",
           "Count": "$Count",
          //  "createdTime": "$createdTime",
        // "DateTime": {$dateToString: { format: "%Y-%m-%d", date: "$Date" } },
           "mac": "$mac",
           "DeviceName": "$DeviceName"

        }
    
      }
    }
    },
    {
      $sort:{ "_id": -1,}
    },
   
    {
      $limit: offset + page_size,
    
    },
    {
      $skip : offset,
    }
    ]).toArray(function (err, result1){
     //  console.log(result1)
      if (err) {
        console.log(err)
        process.hasUncaughtExceptionCaptureCallback();
      }

      else if (result1.length > 0) {
        let array = []
        for (let i = 0; i < result1.length; i++) {


          let tempObj = {};
          let createdTime = "";
          let mac ="";
          let DeviceName ="";
         // let hours = result1[i]._id.Hour;
          let hours = "";

          let tempArray = result1[i].processedData;
          for (let j = 0; j < tempArray.length; j++) {
            let bsName = tempArray[j].bsName;
            let tempNewObj = {
              Avg: (tempArray[j].Avg == null) ? "" :(tempArray[j].Avg).toFixed(2),
              Min: (tempArray[j].Min == null) ? "" : (tempArray[j].Min).toFixed(2),
              Max: (tempArray[j].Max == null) ? "" : (tempArray[j].Max).toFixed(2),
              Durations: (tempArray[j].Duration == null) ? "" : tempArray[j].Duration,
              Count: (tempArray[j].Count == null) ? "" : tempArray[j].Count
            };
            // if(0 == j){
           
              createdTime = tempArray[j].Date
              //console.log(tempArray[j].Date)
              mac =  tempArray[j].mac;
              DeviceName = tempArray[j].DeviceName;
            // }

            tempObj[bsName] = tempNewObj;
          }
         // console.log(tempObj)
          array.push([mac, DeviceName, "", tempObj, createdTime])
        }
       //console.log(result1)
        let finalResult = array;
        let data_count;
        let lastdataObj = {};
        let lastCreatedTime = "";
        db.collection("AggregatedData")
          .aggregate([{$match: NewCriteria},
    //     {
      { $group : { _id:  {"Date": "$Date","Day":"$Day","bsName":"$bsName" }}}, 
      {"$group": { "_id": "$_id.Day" 
    }},
    {
      $count: "totalCount"
    },
  
    ]).toArray(function (err, result2){
      data_count  = result2[0].totalCount;
    //   console.log(result1)
      let json = { finalResult, data_count, lastdataObj, lastCreatedTime}
      res.json(json)
    });
 }else{
  res.json(0);
 }
    });

}


function hourlyDataProcessing(db, res, criteria, offset, page_size) {
 
  let NewCriteria = { mac: criteria.mac };
  if (criteria.createdTime != "" && criteria.createdTime != undefined && criteria.createdTime != null) {
    NewCriteria["createdTime"] = criteria["createdTime"];
  }
  console.log(NewCriteria)
  db.collection("AggregatedData")
    .aggregate([{$match: NewCriteria},
    
      // { $group : { _id:  {"Date": "$Date", "Hour": "$Hour","bsName":"$bsName" } ,"Max" : { $max :"$Max"} ,"Min" : { $min :"$Min"}, "Avg" : { $first :"$Avg"}, 
      // "createdTime": {"$first":"$createdTime" }, mac: {"$first": "$mac"} ,"DeviceName": {"$first":"$DeviceName" }
      // ,"Count" : { $first :"$Count"}, duration: {$first: "$duration"}}}, 
       
      {"$group": { "_id":{"Date": "$Date","Hour":"$Hour"},
      "processedData": {
        "$push": {
           "Date": "$Date",
           "bsName": "$bsName",
           "Max" :  "$Max" ,
           "Min" : "$Min",
           "Avg": "$Avg",
           "Duration": "$duration",
           "Count": "$Count",
          //  "createdTime": "$createdTime",
        //   "DateTime": {$dateToString: { format: "%Y-%m-%d", date: "$Date" } },
           "mac": "$mac",
           "DeviceName": "$DeviceName"

        }
    
      }
    }},
    {
      $sort:{ "_id.Date": -1, "_id.Hour": -1}
    },
   
    {
      $limit: offset + page_size,
    
    },
    {
      $skip : offset,
    }
    ]).toArray(function (err, result1){
     //  console.log(result1)
      if (err) {
        console.log(err)
        process.hasUncaughtExceptionCaptureCallback();
      }

      else if (result1.length > 0) {
        let array = []
        for (let i = 0; i < result1.length; i++) {


          let tempObj = {};
          let createdTime = "";
          let mac ="";
          let DeviceName ="";
            createdTime = result1[i]._id.Date + " "+ result1[i]._id.Hour+":00";
          let tempArray = result1[i].processedData;
          for (let j = 0; j < tempArray.length; j++) {
            let bsName = tempArray[j].bsName;
            let tempNewObj = {
              Avg: (tempArray[j].Avg == null) ? "" : (tempArray[j].Avg).toFixed(2),
              Min: (tempArray[j].Min == null) ? "" : (tempArray[j].Min).toFixed(2),
              Max: (tempArray[j].Max == null) ? "" : (tempArray[j].Max).toFixed(2),
              Durations: (tempArray[j].Duration == null) ? "" : tempArray[j].Duration,
              Count: (tempArray[j].Count == null) ? "" : tempArray[j].Count
            };
            // if(0 == j){
           
              // createdTime = createdTime;
              mac =  tempArray[j].mac;
              DeviceName = tempArray[j].DeviceName;
            // }

            tempObj[bsName] = tempNewObj;
          }
         // console.log(tempObj)
          array.push([mac, DeviceName, "", tempObj, createdTime])
        }
       //console.log(result1)
        let finalResult = array;
        let data_count;
        let lastdataObj = {};
        let lastCreatedTime = "";
        db.collection("AggregatedData")
          .aggregate([{$match: NewCriteria},
    //     {
    //   $sort:{"Date": -1,"hours": -1}
    // },
      { $group : {"_id":{"Date": "$Date","Hour":"$Hour"}}},
    {
      $count: "totalCount"
    },
  
    ]).toArray(function (err, result2){
      data_count  = result2[0].totalCount;
    //   console.log(result1)
      let json = { finalResult, data_count, lastdataObj, lastCreatedTime}
      res.json(json)
    });
 }else{
  res.json(0);
 }
    });

}
function normalDataProcessing(db,res,criteria,offset,sensorsBSN,sensorNm,page_size){
  criteria["sensors."+sensorNm+"."+sensorsBSN]  = {$exists: true}

  gomos.gomosLog(logger,gConsole,TRACE_DEV,"This is Log of Criteria for getdashboard ", criteria)
  var sensorp = "sensors."+sensorNm

      db.collection("MsgFacts")
      .find(criteria,{projection: {mac:1,createdTime:1, sensors :1,DeviceName:1} }).skip( offset ).limit( page_size ).sort({createdTime:-1})
      .toArray(function (err, result1) {
        if (err) {
          process.hasUncaughtExceptionCaptureCallback();
        }
        if (result1.length > 0) {
          var resultCopy = result1;
          // console.log(resultCopy);
          result = [];
          result4 = []
          var finalResult =[];
          //copy all data from the copy of result to remove json with in json.
          for (let i = 0; i < resultCopy.length; i++) {
            var sensorNmKeys = Object.keys(resultCopy[i]["sensors"]);
            gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this is debuging for resultCopy",i);
            gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this is debuging for sensorNmKeys",sensorNmKeys);
              // if (sensorNmKeys.includes(sensorNm)){
                let  tempArray = {}
                for(let j = 0 ;  j< sensorNmKeys.length; j++){
                  gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is Debug For sensorNmKeys[j]",sensorNmKeys[j]);
                  gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this is debuging for resultCopy[i][sensors][sensorNmKeys[j]]",resultCopy[i]["sensors"][sensorNmKeys[j]]);
          
                  for (let [key, value] of Object.entries(resultCopy[i]["sensors"][sensorNmKeys[j]])){
                    tempArray[key] = value;
                   
                  }
                
                  }
                finalResult.push([resultCopy[i].mac,resultCopy[i].DeviceName,sensorsBSN, 
                  tempArray, resultCopy[i].createdTime]);
                
          }

         db.collection("MsgFacts").find(criteria,{ limit: 1 } ).sort({ createdTime : -1 }).toArray(function (err, result2) {
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
       
        db.collection("MsgFacts")
        .find(criteria).count()
        .then(function (data) {
        var data_count = data
          var json= {finalResult, data_count, lastdataObj, lastCreatedTime}
          gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is All Data OF json in getDashBoard", json);
          res.json(json);
        })
        })
    }
    else{
      res.json(0);
    }
  }

);
}
router.post("/adminAggregator", function (req, res, next) {
  accessPermission(res);

  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
  async  function (err, connection) {
      if (err) {
        next(err);
      }
     dbo = connection.db(dbName);
   
   let  dataFromDevices           = await gomosDevices.getDevices(dbo, NAMEOFSERVICE, logger, gConsole);
   let  dataFromAssets            = await gomosAssets.getAssets(dbo, NAMEOFSERVICE, logger, gConsole);
   let  dataFromSubCust           = await gomosSubCustCd.getSubCustomers(dbo, NAMEOFSERVICE, logger, gConsole);
   let  dataFromCustomers         = await gomosCustCd.getCustomers(dbo, NAMEOFSERVICE, logger, gConsole);
   let  dataFromServiceProviders  = await gomosSpCd.getServiceProviders(dbo, NAMEOFSERVICE, logger, gConsole);

    //  console.log(dataFromServiceProviders)
     let response     = await joinToAllDetail(dataFromDevices,dataFromAssets,dataFromSubCust,dataFromCustomers,dataFromServiceProviders)
     response.sort((a,b)=>{
       let spCdA = a.spCd;
       let spCdB = b.spCd;
       let custCdA = a.custCd;
       let custCdB = b.custCd;
       let assetIdA = a.assetId;
       let assetIdB = b.assetId;
       if(spCdA < spCdB || spCdA == spCdB){
         if(custCdA < custCdB || custCdA  == custCdB){
          if(assetIdA < assetIdB || assetIdA  == assetIdA){
            return -1;
          }
          else{
            assetIdA - assetIdB;
          }
        }
        else{
          custCdA - custCdB;
        }
       }
       else{
        spCdA -spCdB;
       }


     })
   gomos.gomosLog(logger,gConsole,TRACE_DEV,"This is Response of allJoined Data", response)
   connection.close();
   res.json(response)

    });
  
  
  });

  function joinToAllDetail(dataFromDevices,dataFromAssets,dataFromSubCust,dataFromCustomers,dataFromServiceProviders){
    let ArrayOfjson = [];
for(let i = 0 ; i< dataFromAssets.length; i++){
let assetId = dataFromAssets[i].assetId;
let subCustCd = dataFromAssets[i].subCustCd;
let AssetName  = dataFromAssets[i].name;
if(dataFromDevices.filter(item => item.assetId == assetId && item.subCustCd == subCustCd).length !== 0){
 let devices = dataFromDevices.filter(item => item.assetId == assetId && item.subCustCd == subCustCd);
 for(let j = 0 ; j< devices.length; j++ ){
 let DeviceName = devices[j].DeviceName;
 let mac   = devices[j].mac;
 let channelLength =  Object.keys(devices[j].channel).length;
 let sensorsLength =  Object.keys(devices[j].sensors).length;
 if (dataFromSubCust.filter(item => item.subCustCd == subCustCd).length !== 0) {
  let indexOfSubCust = dataFromSubCust.findIndex( element => element.subCustCd == subCustCd);
  let SubCustomerName = dataFromSubCust[indexOfSubCust].name;
  let custCd = dataFromSubCust[indexOfSubCust].custCd;
  let spCd = dataFromSubCust[indexOfSubCust].spCd;
  if (dataFromCustomers.filter(item => item.custCd == custCd && item.spCd == spCd).length !== 0) {
    let indexOfCust = dataFromCustomers.findIndex( item => item.custCd == custCd && item.spCd == spCd);
    let CustomerName = dataFromCustomers[indexOfCust].name;
    if (dataFromServiceProviders.filter(item => item.spCd == spCd).length !== 0) {
      let indexOfSp = dataFromServiceProviders.findIndex( item => item.spCd == spCd);
      let ServiceName = dataFromCustomers[indexOfSp].name;
       ArrayOfjson.push({DeviceName,mac,channelLength,sensorsLength, assetId,AssetName,subCustCd,SubCustomerName,custCd,CustomerName,spCd,ServiceName})  
    }
  }
  }
 }
}
}


    
    
    return ArrayOfjson; 
    }
function joinToAllDetailTemp(dataFromDevices,dataFromAssets,dataFromSubCust){
let ArrayOfjson = [];
for(let i =0;  i < dataFromDevices.length; i++){
let DeviceName = dataFromDevices[i].DeviceName;
let mac = dataFromDevices[i].mac;
let assetId = dataFromDevices[i].assetId;
if(dataFromAssets.filter(item => item.assetId == assetId).length !== 0){
 
  let indexOfAsset = dataFromAssets.findIndex(element => element.assetId == assetId);
  let AssetName = dataFromAssets[indexOfAsset].name;
  let subCustCd = dataFromAssets[indexOfAsset].subCustCd;
  if (dataFromSubCust.filter(item => item.subCustCd == subCustCd).length !== 0) {
   let indexOfSubCust = dataFromSubCust.findIndex( element => element.subCustCd == subCustCd);
   let SubCustomerName = dataFromSubCust[indexOfSubCust].name;
   let custCd = dataFromSubCust[indexOfSubCust].custCd;
   let spCd = dataFromSubCust[indexOfSubCust].spCd;
   ArrayOfjson.push({DeviceName,mac,assetId,AssetName,subCustCd,SubCustomerName,custCd,spCd})  
}
}


}
return ArrayOfjson; 
}
   
router.post("/apiAggregator", function (req, res, next) {
  accessPermission(res);

  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
   async function (err, connection) {
      if (err) {
        next(err);
      }
      let dbo = connection.db(dbName);
      let body = req.body;
       let macArray = body.macArray;
       let startRenge = body.startRenge;
       let endRenge = body.endRenge;
       let totalHours = moment(endRenge).diff(moment(startRenge), 'hours');
   if(Math.sign(totalHours) !== -1 && Math.sign(totalHours) !== 0){


       gomos.gomosLog(logger,gConsole,TRACE_TEST,`This is Criteria for ApiAggregator startRenge : [${startRenge}] -  endRenge :[${endRenge}] and macArray`,macArray, "Y")

         // let  dataFromDevices = await gomosDevices.getDevices(dbo, NAMEOFSERVICE, logger, gConsole);
    aggragator.startProcess(NAMEOFSERVICE,logger, gConsole ,dbo,connection,startRenge,endRenge,macArray)
  //  console.log(response)
  //  if(response === "completed"){
  //       // connection.close();
  //        res.send(response+ "   Successfully")
  //  }
        res.send("Send To Client")
          
  }else{
            res.send("Not Valid Renge")
          }
          });
       
    
    
});
router.post("/getDevicesIdentifier", function (req, res, next) {
  accessPermission(res);

  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        next(err);
      }
      var db = connection.db(dbName);
      var body = req.body;
      console.log(body)
      var mac = body.mac;
        db.collection("Devices")
        .find({mac: mac})
        .toArray(function (err, result) {
          if (err) {
          }
          var deviceStateKey = Object.keys(result[0]);
          var keysToRemove2 = ["_id", "mac","deviceTemplate","active","assetId","subCustCd" ,"DeviceName","defaultGroupInfo","roles"];
          gomos.gomosLog( logger,gConsole,TRACE_DEV,"This Is key of identifire 1 Place",deviceStateKey);  
          for (var l = 0; l < keysToRemove2.length; l++) {
            if (deviceStateKey.includes(keysToRemove2[l])) {
              deviceStateKey.splice(deviceStateKey.indexOf(keysToRemove2[l]), 1);
            }
          }
          gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is key left in result",deviceStateKey );
          var json = {}
          for(var k =0; k < deviceStateKey.length; k++){
            var name = deviceStateKey[k]
            var keyofCode = Object.keys(result[0][deviceStateKey[k]]);
           gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is SensorsKey",keyofCode);
          var sensorsArray= [];
          for(var i = 0; i< keyofCode.length; i++){
            var ActiveIdentifier = {};
           gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"this devicebusinessNM"); 
               ActiveIdentifier["devicebusinessNM"] = result[0][deviceStateKey[k]][keyofCode[i]]["businessName"];
               ActiveIdentifier["group"]    =  result[0][deviceStateKey[k]][keyofCode[i]]["group"];
               ActiveIdentifier["Type"]    =  result[0][deviceStateKey[k]][keyofCode[i]]["Type"];
               sensorsArray.push(ActiveIdentifier);
          }
          json[name] = sensorsArray;
        }
        json["defaultGroupInfo"]  = result[0]["defaultGroupInfo"];
        json["deviceTypes"]  = result[0]["deviceTypes"];
        gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is json which i want send to front end", json);
            res.json(json)
        
        });
    
    }
  );
});
 //export To Excel and Save it to server and add the Details to Collection
 function exportToExcel(arColumns, arKeys, arWidths, reportName, dataSet,selectedCustValue,selectedSubCustValue,selectedAssetValue,selectedDeviceValue,selectedSensorValueArray,startDate,endDate,res) {
  var workbook = new ExcelJs.Workbook();
  workbook.created = new Date();

  // create a sheet with blue tab colour
  var ws = workbook.addWorksheet("DATA_RECORDING", {
    properties: { tabColor: { argb: "1E1E90FF" } }
  });
var sensorType = selectedSensorValueArray;
// if(this.state.selectedDeviceValue !=0){
// for(var i = 0; i< this.state.selectedDeviceValue.length; i++){
//   sensorType = sensorType + this.state.selectedDeviceValue[i];
// }
// }
  // Add initial set of rows
  var titleRows = [
    ["ReportName", "Sensors Data Recording"],
    ["Report Generated On", dateFormat("dd-mmm HH:MM")],
    ["Customer Name",  selectedCustValue],
    ["Sub Customer Name", selectedSubCustValue],
    ["Asset Name", selectedAssetValue],
    ["Device Name", selectedDeviceValue],
    ["Sensors Type", sensorType.join(",")],
    ["Time Interval", dateFormat(startDate,"dd-mmm HH:MM")+","+dateFormat(endDate,"dd-mmm HH:MM")]
    // ["Class", this.std]
  ];

  // Add title rows
  ws.addRows(titleRows);

  for (i = 1; i <= titleRows.length; ++i) {
    ws.getRow(i).font = { size: 12, bold: true };
    ws.getRow(i).alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true
    };
    ws.getCell("A" + i).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "8787CEFA" }
    };
    ws.getCell("A" + i).border = ws.getCell("B" + i).border = {
      left: { style: "thin" },
      top: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" }
    };
  }

  /*Set Column headers and keys*/
  for (let i = 0; i < arColumns.length; ++i) {
    ws.getColumn(i + 1).key = arKeys[i];
    ws.getColumn(i + 1).width = arWidths[i];
  }

  ws.getRow(titleRows.length + 2).height = 40;
  ws.getRow(titleRows.length + 2).font = { size: 12, bold: true };
  ws.getRow(titleRows.length + 2).values = arColumns;

  // add all the rows in datasource to sheet - make sure keys are matching
  ws.addRows(dataSet);

  // loop through and style all the cells - Optimize this loop later.
  var j = titleRows.length + 2;
  for (
    var i = titleRows.length + 2;
    i <= dataSet.length + titleRows.length + 2;
    ++i
  ) {
    ws.getRow(i).alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true
    };
    if (i == titleRows.length + 2) {
      var strDataCol = "A";
      for (var k = 0; k < arColumns.length; ++k) {
        if (k == 0) {
          ws.getCell(strDataCol + j).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "8787CEFA" }
          };
          ws.getCell(strDataCol + j).border = {
            left: { style: "medium" },
            top: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "thin" }
          };
        } else if (k == arColumns.length - 1) {
          ws.getCell(strDataCol + j).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "8787CEFA" }
          };
          ws.getCell(strDataCol + j).border = {
            left: { style: "thin" },
            top: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "medium" }
          };
        } else {
          ws.getCell(strDataCol + j).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "8787CEFA" }
          };
          ws.getCell(strDataCol + j).border = {
            left: { style: "thin" },
            top: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "thin" }
          };
        }
        strDataCol = String.fromCharCode(strDataCol.charCodeAt(0) + 1);
      }
    } else {
      if (i == dataSet.length + titleRows.length + 2) {
        strDataCol = "A";
        ws.getRow(j).alignment = { vertical: "middle", horizontal: "center" };
        for (var k = 0; k < arColumns.length; ++k) {
          if (k == 0) {
            ws.getCell(strDataCol + j).border = {
              left: { style: "medium" },
              top: { style: "thin" },
              bottom: { style: "medium" },
              right: { style: "thin" }
            };
          } else if (k == arColumns.length - 1) {
            ws.getCell(strDataCol + j).border = {
              left: { style: "thin" },
              top: { style: "thin" },
              bottom: { style: "medium" },
              right: { style: "medium" }
            };
          } else {
            ws.getCell(strDataCol + j).border = {
              left: { style: "thin" },
              top: { style: "thin" },
              bottom: { style: "medium" },
              right: { style: "thin" }
            };
          }
          strDataCol = String.fromCharCode(strDataCol.charCodeAt(0) + 1);
        }
      } else {
        var strDataCol = "A";
        for (var k = 0; k < arColumns.length; ++k) {
          if (k == 0) {
            ws.getCell(strDataCol + j).border = {
              left: { style: "medium" },
              top: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" }
            };
          } else if (k == arColumns.length - 1) {
            ws.getCell(strDataCol + j).border = {
              left: { style: "thin" },
              top: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "medium" }
            };
          } else {
            ws.getCell(strDataCol + j).border = {
              left: { style: "thin" },
              top: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" }
            };
          }
          strDataCol = String.fromCharCode(strDataCol.charCodeAt(0) + 1);
        }
      }
    }
    j = j + 1;
  }
  var dt = new Date();
  var strdt;
    strdt = dt
      .toString()
      .split("GMT")[0]
      .trim();
      let tempFilename  = reportName+dateFormat("yyyymmdd-HHMM") +".xlsx";
  var fileName = "excelData/"+tempFilename;
  workbook.xlsx.writeFile(fileName).then(data => {
    // const blob = new Blob([data], { type: "application/octet-stream" });
     // var dt = new Date();
     // var strdt;
     // strdt = dt
     //   .toString()
     //   .split("GMT")[0]
     //   .trim();
     // var fileName =  "takreem.xlsx";
     // FileSaver.saveAs(data, fileName);
     res.json({fileName: tempFilename})
     console.log("inner functions")
   });
}
function downloadToExcel(result,selectedCustValue,selectedSubCustValue,selectedDeviceValue,selectedSensorValueArray,assetId,startDate,endDate,res) {
  
  //HERE PUTING RESULT DATA WHICH STORED IN STATE VARIABLE AND ASSIGN TO LOCAL VARIABLE dataForExcel
 var dataForExcel = result;
 // // alert("This is Cliked ");
 if (dataForExcel) {
   // // alert("This is Cliked data  is here ");
//THIS  HEADER OF COLUMN FOR EXCEL DATASHEET
   var arColumns = Object.keys(result[0])
   var arKeys = Object.keys(result[0]);
   var arWidths = [];
   for(var i =0; i< arKeys.length ; i++){
   arWidths.push(35)
   }
   var reportName =   "Sensors_Data_Recording-"+selectedSubCustValue+"-"+selectedDeviceValue+ "Report";

  //  var reportName =   "Sensors Data Recording-"+selectedSubCustValue+"-"+selectedDeviceValue+ "Report";
   var dataSet = dataForExcel;
    // exportToExcel(arColumns, arKeys, arWidths, reportName, dataSet);
    exportToExcel(arColumns, arKeys, arWidths, reportName, dataSet,selectedCustValue,selectedSubCustValue,assetId,selectedDeviceValue,selectedSensorValueArray,startDate,endDate,res) 
 } else {

 }
}
//get the reporting details of perticular Sensor based on given data
router.get("/getFacts", function (req, res, next) {
  accessPermission(res);
  
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        next(err);
      }
      var db = connection.db(dbName);
      var query = url.parse(req.url, true).query;
      var startDate, endDate, startFactValue = 0, endFactValue = 0, operation, sensorNm, equalsFacts,assetId,deviceName ;

      sensorNm = query.sensorNm.split(",");
      startDate = query.startDate;
      endDate = query.endDate;
      operation = query.operation;
      assetId = query.Asset;
      deviceName = query.Device;

      var criteria;
      var ServiceProvidersIds = query.spCode;
      var CustomersIds = query.custCd;
      var arSubCustomerIDs = query.subCustCd;

      // This criteria is built without sensor names for now, however a better way to filter based on sensornames
      // rather than getting everything and removing the unwanted data of other sensrors.
      criteria = {
        spCd:  ServiceProvidersIds ,
        custCd:  CustomersIds ,
        subCustCd: arSubCustomerIDs ,
        DeviceName : deviceName, 
        createdTime: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is gomos get messageFact",  criteria);
      // if (operation) {
      //   if (query.equalsFacts) {
      //     equalsFacts = parseFloat(query.equalsFacts);
      //   }
      //   if (query.startFactValue) {
      //     startFactValue = parseFloat(query.startFactValue);
      //   }
      //   if (query.endFactValue) {
      //     endFactValue = parseFloat(query.endFactValue);
      //   }

      //   factsOperations(db, sensorNm, startFactValue, endFactValue, connection, next,
      //     equalsFacts, operation, res, criteria);
      // } else {
        factsOperations(db, sensorNm, startFactValue, endFactValue, connection, next,
          equalsFacts, operation, res, criteria,assetId,startDate,endDate);
        // res.json(0);
      // }
    }
  );
});

function factsOperations(db, sensorNm, startFactValue, endFactValue, connection, next,
  equalsFacts, operation, res, criteria,assetId,startDate,endDate) {
  var finalResult = [], ltdttm, queryToExecute;
 
  //query to get the last dateTime the collection was modified.This dateTime is used only in excel report.
  db.collection("MsgFacts")
    .find({}, { limit: 1 })
    .sort({ $natural: -1 })
    .toArray(function (err, res) {
      if (err) {
        next(err);
      }
      if (res.length > 0) {
        ltdttm = res[0].createdTime;
      }
    });

  //query to get the mac,sensors,dateTime of the given criteria
  // queryToExecute = [
  //   {
  //     $match: criteria
  //   },
  //   {
  //     $group: {
  //       _id: { _id: "$sensors." + sensorNm, mac: "$mac", createdTime: "$createdTime",DeviceName:"$DeviceName" }
  //     }
  //   },
  //   { $sort: { '_id.mac': 1 } }
  // // ];
  // queryToExecute = [
  //   {
  //     $match: criteria
  //   },
  //   {
  //     projection: { "sensors": 1,"mac":1,"DeviceName": 1,"createdTime":1} 
  //   }
  //   // { $sort: { '_id.mac': 1 } }
  // ];



  db.collection("MsgFacts")
    .find(criteria,{
      projection: { "sensors": 1,"mac":1,"DeviceName": 1,"createdTime":1} 
    }).sort({createdTime:-1})
    .toArray(function (err, result) {
      if (err) {
        next(err);
      }
      if (result.length > 0) {
        // var resultCopy = result;
        // result = [];
        // console.log(resultCopy);
        //copy all data from the copy of result to remove json with in json.
        // for (var i = 0; i < resultCopy.length; i++) {
        //   var allkey = Object.keys(resultCopy[i]);
        //   // This is with an assumtion that "_id" always comes first, if not, change the code to 
        //   // specifically look out for "_id".
        //   gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"THis is Debug of getMessageFact for check result",sensorNmKeys[0]);
        //   if (sensorNmKeys[0]=="_id"){
        //     result.push(resultCopy[i]._id);
        //   }
        // }
        if(operation != ""){
          processOperation( startFactValue, endFactValue, connection, next, equalsFacts, operation, res ,finalResult,result,ltdttm)
        }else{
          console.log('This is else part')
          for (i = 0; i < result.length; i++) {
            var dt = requiredDateTime.create(result[i].createdTime);
            var formattedDate = dt.format("d-m-Y H:M:S");
            var sensorNmKeys = Object.keys(result[i].sensors);
            // console.log(sensorNmKeys);
            var temp ={}
            for(var l = 0; l < sensorNm.length; l++){
            if(sensorNmKeys.includes(sensorNm[l])){
            // for (var j = 0; j < sensorNmKeys.length; j++) {
            
              //comparing the businessNm values(sensor's BusinessNm) with the passed range of value
              var businessNameKey = Object.keys(result[i]["sensors"][sensorNm[l]]);
              for(var k = 0; k < businessNameKey.length; k++){
               
                // if(businessNameKey.includes(sensorNm)){
                  temp[businessNameKey[k]] = result[i]["sensors"][sensorNm[l]][businessNameKey[k]]
                
                }

              // }
              
              }

            }
            finalResult.push([result[i].mac,result[i].DeviceName, temp, formattedDate]);
             
                // finalResult.push([result[i].mac,result[i].name, sensorNmKeys[j], result[i]._id[sensorNmKeys[j]], formattedDate]);
            }
        
          }
          if (finalResult.length != 0) {
            finalResult.push([ltdttm, 0, 0]);
            gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"This is Final result of GetFact", finalResult);


            finalResult.pop();
            //MAKING A ARRAY FOR STRUCTURE DATA ARRAY FOR CHART AND EXCEL 
              var FdataArray =[];
         
              for (var i = 0; i < finalResult.length - 1; i++) {
                var tempobj ={}
                var  keysofbussinessName = Object.keys(finalResult[i][2]);
                for(var j = 0; j< keysofbussinessName.length; j++){
                  tempobj[keysofbussinessName[j]] = finalResult[i][2][keysofbussinessName[j]];
                }
                tempobj["CreatedTime"] =  finalResult[i][3]
                FdataArray.push(tempobj)}

                downloadToExcel(FdataArray,criteria.custCd,criteria.subCustCd,criteria.DeviceName,sensorNm,assetId,startDate,endDate,res)
            // res.json(finalResult);
          }
          else {
            res.json(0);
         }
          // }
        } else {
          res.json(0);
          connection.close();
        
       }
      
    });
}
function processOperation( startFactValue, endFactValue, connection, next,equalsFacts, operation, res ,finalResult,result,ltdttm){
//Result is calculated based on the operation.It can be Average , Equals or Range
if (operation == "AVG") {
  // for (var i = 0; i < result.length; i++) {
  // var dt = requiredDateTime.create(result[i].createdTime);
  // var formattedDate = dt.format("d-m-Y H:M:S");
  // console.log(result);
  for (var i = 0; i < result.length; i++) {
    var dt = requiredDateTime.create(result[i].createdTime);
    var formattedDate = dt.format("d-m-Y H:M:S");
    var sensorNmKeys = Object.keys(result[i]._id);//business names of different sensors
    for (var j = 0; j < sensorNmKeys.length; j++) {
      finalResult.push([result[i].mac,result[i].name, sensorNmKeys[j], result[i]._id[sensorNmKeys[j]], formattedDate]);
    }
    // }
  }
  var removeArr = [], avg = 0, count = 0, resultToSend = [];
  console.log(finalResult);
  for (var j = 0; j <= finalResult.length; j++) {
    avg = 0; count = 0; j = 0;
    for (var i = 0; i < finalResult.length; i++) {
      //comparing with the macId and businessNm of first row with all others mac and businessNm
      //if matched hold the matched row in one array and also calculate the avg of businessNm values.
      if (finalResult[i][0] == finalResult[0][0] && finalResult[i][1] == finalResult[0][1]) {
        avg = avg + finalResult[i][3];
        count++;
        removeArr.push(i);
      }
    }

    //avg is calculated with the sum of businessNm values and the count of matched rows
    avg = avg / count;

    resultToSend.push([finalResult[0][0], finalResult[0][1], finalResult[0][2], avg, finalResult[0][4]]);
    //Remove the rows from the final result array for which already average is calculated.
    //Always splice the data from an array in descending order of index
    for (var k = removeArr.length - 1; k >= 0; k--) {
      finalResult.splice(removeArr[k], 1);
    }
    removeArr = [];
  }

  if (resultToSend.length != 0) {
    resultToSend.push([ltdttm, 0, 0]);
    res.json(resultToSend);
  }
  else {
    res.json(0);
  }
}
else if (operation == "EQUALS") {
  for (var i = 0; i < result.length; i++) {
    var dt = requiredDateTime.create(result[i].createdTime);
    var formattedDate = dt.format("d-m-Y H:M:S");
    var sensorNmKeys = Object.keys(result[i]._id);
    for (var j = 0; j < sensorNmKeys.length; j++) {
      //comparing the businessNm(sensor's BusinessNm) values with the passed equal value in the query
      if (result[i]._id[sensorNmKeys[j]] == equalsFacts)
        finalResult.push([result[i].mac,result[i].name, sensorNmKeys[j], result[i]._id[sensorNmKeys[j]], formattedDate]);
    }
  }
  if (finalResult.length != 0) {
    finalResult.push([ltdttm, 0, 0]);
    res.json(finalResult);
  }
  else {
    res.json(0);
  }
}
else {
  for (i = 0; i < result.length; i++) {
    var dt = requiredDateTime.create(result[i].createdTime);
    var formattedDate = dt.format("d-m-Y H:M:S");
    var sensorNmKeys = Object.keys(result[i]._id);
    var temp ={}
    for (var j = 0; j < sensorNmKeys.length; j++) {
      //comparing the businessNm values(sensor's BusinessNm) with the passed range of value
      if (result[i]._id[sensorNmKeys[j]] >= startFactValue && result[i]._id[sensorNmKeys[j]] <= endFactValue) {
        // gomos.gomosLog( logger,gConsole,TRACE_DEV,"This is Debug of Menu", result);
        temp[sensorNmKeys[j]] = result[i]._id[sensorNmKeys[j]]
        // finalResult.push([result[i].mac,result[i].name, sensorNmKeys[j], result[i]._id[sensorNmKeys[j]], formattedDate]);
      }

    }
    finalResult.push([result[i].mac,result[i].DeviceName, temp, formattedDate]);

  }
  if (finalResult.length != 0) {
    finalResult.push([ltdttm, 0, 0]);
    res.json(finalResult);
  } else {
    res.json(0);
  }
}
}
//gets the customers for perticular ServiceProviders
router.get("/getCustomers", function (req, res, next) {
  var query = url.parse(req.url, true).query;
  var criteria;
  var ServiceProvidersIds = query.spCode.split(",");
  criteria = { spCd: { $in: ServiceProvidersIds } };
  var resultToSend = [];
  accessPermission(res);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
      db.collection("Customers")
        .aggregate([
          { $match: criteria },
          {
            $group: {
              _id: "$custCd",
              name: { $first: "$name" },
              spCd: { $first: "$custCd" }
            }
          },
          {
            $sort: {
              name: -1
            }
          }
        ])
        .toArray(function (err, result) {
          if (err) {
            process.hasUncaughtExceptionCaptureCallback();
          }
          for (var i = 0; i < result.length; i++) {
            resultToSend.push(result[i]);
          }
          //connection.close();
          res.json(resultToSend);
        });
    }
  );
});

//gets the SubCustomers for perticular ServiceProviders and Customers
router.get("/getSubCustomers", function (req, res, next) {
  var query = url.parse(req.url, true).query;
  var criteria;
  var ServiceProvidersIds = query.spCode.split(",");
  var CustomersIds = query.custCd.split(",");
  criteria = { spCd: { $in: ServiceProvidersIds }, custCd: { $in: CustomersIds } };
  var resultToSend = [];
  accessPermission(res);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
      db.collection("SubCustomers")
        .aggregate([
          { $match: criteria },
          {
            $group: {
              _id: "$subCustCd",
              name: { $first: "$name" },
              spCd: { $first: "$subCustCd" }
            }
          },
          {
            $sort: {
              name: -1
            }
          }
        ])
        .toArray(function (err, result) {
          if (err) {
            process.hasUncaughtExceptionCaptureCallback();
          }
          for (var i = 0; i < result.length; i++) {
            resultToSend.push(result[i]);
          }
          //connection.close();
          res.json(resultToSend);
        });
    }
  );
});

//gets All the serviceProviders of the platform
router.get("/getAllServiceProviders", function (req, res, next) {
  var query = url.parse(req.url, true).query;
  var resultToSend = [];
  accessPermission(res);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
      db.collection("ServiceProviders")
        .aggregate([
          {
            $group: {
              _id: "$spCd",
              name: { $first: "$name" },
              spCd: { $first: "$spCd" }
            }
          },
          {
            $sort: {
              name: -1
            }
          }
        ])
        .toArray(function (err, result) {
          if (err) {
            process.hasUncaughtExceptionCaptureCallback();
          }
          for (var i = 0; i < result.length; i++) {
            resultToSend.push(result[i]);
          }
          //connection.close();
          res.json(resultToSend);
        });
    }
  );
});

module.exports = function (app) {
  //DB Name and the url for database connection is from appConfig file in app.js
  urlConn = app.locals.urlConn;
  dbName = app.locals.dbName;
  return router;
};

