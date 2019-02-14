var express = require("express");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
const url = require("url");
var requiredDateTime = require("node-datetime");
const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
const Schema = mongoose.Schema;
const  TRACE_PROD = 1
const TRACE_STAGE = 2;
const TRACE_TEST  = 3;
const TRACE_DEV   = 4;
const TRACE_DEBUG = 5;
var  gomos = require("../../commanFunction");
var urlConn, dbName;

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
  // var name = body.CustName;
  // var custCd = body.custCd ;
  // var spCd = body.selectedSPValue ;
  // var address = body.address ;
  // var phone = body.Phone ;
  // var email  = body.email;
  // var servicesTaken  = body.servicesTaken;
  // var mqttClient  = body.mqttClient;
 
  // var description  = body.description;
  // var status  = body.status;
  // var userId = '';
  // var Timestamp = new Date().toISOString();

  // var topics = {
    
  //     topic1 : body.topic1,
  //     topic2 : body.topic2

  // }
  // objOfsp = {
  //  name,
  //  custCd,
  //   spCd,
  //   address,
  //   phone,
  //   email,
  //   servicesTaken,
  //   mqttClient,
  //   topics,
  //   description,
  //   status ,
  //   userId,
  //   Timestamp
  // } 

 
  
  console.log(body);
  console.log("this called "+ count);
  count++;
  res.json(body.sensors);


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
   var body = req.body.body
  var userId = body.email;
  var password = body.password;
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
                email: result[index].email,
                userFN: result[index].userFN,
                userLN: result[index].userLN,
                userType : result[index].userTypegetSensorNames
              });  
              var dashboardConfigId = result[0].dashboardConfigId;
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
                  ActiveDevice: result1[0].ActiveDevice,
                  Sensors: result1[0].Sensors,
                  SensorsBgC: result1[0].SensorsBgC,
                  ActiveSensorsName: result1[0].ActiveSensorsName,
                  ActivesesnorsType: result1[0].ActivesesnorsType
                
                 }
                  console.log(dashboardConfigobj); 


                res.json({userDtls, dashboardConfigobj});
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
// router.get("/updateAlert", function (req, res, next) {
//   accessPermission(res);
//   MongoClient.connect(
//     urlConn,
//     { useNewUrlParser: true },
//     function (err, connection) {
//       if (err) {
//         next(err);
//       }
//       var db = connection.db(dbName);
  
//     //  console.log({DeviceName: DeviceName,subCustCd: subCustCd,type: type,processed: processed})
//         //query to get the last dateTime the collection was modified.This dateTime is used only in excel report.
//         db.collection("Alerts")
//         .updateMany({ 
//           "spCd": "ASAGRISY",
//           "custCd": "Cuberootz",
//           "subCustCd": "TF1",
//           "assetId": "FERTENVCONT",
//           "type": "level3",
//           "processed": "Y",
//           "lasterrorString": {
//             "$exists": false
//         },
//         "lasterrorTime": {
//             "$exists": false
//         },
//         "numberOfAttempt": {
//             "$exists": false
//         },
//          },
//         { $set: {
//                 lasterrorString: "",
//                 lasterrorTime: '',
//           numberOfAttempt: 1,
//             }},
//             function(err, res) {
//               if (err) throw err;
//               console.log(res.result.nModified + " document(s) updated");
              
//             });
    
  
//         // .toArray(function (err, result) {
      
           
//             // for(var i = 0; i < result.length ; i++){
//             //   fileWriter(i,result[i]);
//             //  var objId = result[i]._id;
//             //  var sourceMsg = result[i].message
//             // console.log(objId);
//             // console.log(i+ "this is index");
//             // var count = 1;
//             // db.collection("Alerts")
//             // .updateOne(
//             //   { _id: objId },
//             //   { $unset: {
//             //     sourceMsg:sourceMsg,
//             //       },
//             //     },
//             //   function (err, result) {
//             //     if (err) {
//             //       errorCustmHandler("updateAlertsForError",err);     
//             //       process.hasUncaughtExceptionCaptureCallback();
//             //     }
              
//             //     // console.log(result);
//             //   console.log("upadated" + count);
//             //   count ++;
//             //   // res.json(result)
//             //   }
//             // ); 
//             // .deleteOne({_id: objId},function (err,result) {  
//             //   //  console.log(result);
//             //   console.log("upadated" + i);
//             //     // res.json(result )
          
//             //     });
//             }
       
//   )
  
//   //   }
//   // );
// });
var fs = require("fs");
function fileWriter(count,data){
  // console.log(typeofError);
    let writeStream = fs.createWriteStream("../logForupdate-"+1+ ".json", { flags: "a" });
    var dateTime = new Date().toISOString();
  // write some data with a base64 encoding
  writeStream.write(count+1 +":"+ JSON.stringify(data)+ "\n" + "\n");
  
  // the finish event is emitted when all data has been flushed from the stream
  writeStream.on('finish', () => {  
    // gomos.gomosLog(TRACE_PROD,"wrote all data to file For Error"); 
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


router.get("/getAlert", function (req, res, next) {
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
      var startDate, endDate,level,assets;

      assets = query.assets;
      startDate = query.startDate;
      endDate = query.endDate;
      level = query.level;

      var criteria;
      var ServiceProvidersIds = query.spCode.split(",");
      var CustomersIds = query.custCd.split(",");
      var arSubCustomerIDs = query.subCustCd.split(",");

      // This criteria is built without sensor names for now, however a better way to filter based on sensornames
      // rather than getting everything and removing the unwanted data of other sensrors.
      criteria = {
        custCd: { $in: CustomersIds },
        subCustCd: { $in: arSubCustomerIDs },
        "assetId": assets,
        "type": level,
        createdTime: {
          $gte: startDate,
          $lte: endDate
        }
      };
      console.log("This is called in Alert");
      console.log(criteria);
        //query to get the last dateTime the collection was modified.This dateTime is used only in excel report.
        db.collection("Alerts")
        .aggregate([
          { $match: criteria },
          // {
          //         $group: {
          //           _id: { processed: "$processed"},
                    
          //           "DeviceName": {"DeviceName": "$DeviceName"},
          //           "processed": { "$sum": 1 } 
          //         }
          //       },
          //       { "$group": {
          //         "_id":"$_id.processed",
          //         "processed": { 
          //             "$push": { 
          //                 "processed": "$_id.processed",
          //             },
          //         },
          //         "count": { "$sum": "$processed" }
          //     }},
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
          if (result.length > 0) {
            console.log(result);
            res.json(result)
          }
        });
    
    }
  );
});

//get the dashoboard details of perticular Sensor based on given data
router.post("/getdashboard", function (req, res, next) {
  accessPermission(res);

  var body = req.body;
  var sensorNm = body.sensorNm;
  var spCd = body.spCd;
  var custCd = body.custCd;
  var subCustCd = body.subCustCd;
   var mac = body.mac;
  var sensorsBSN = body.sensorsBSN;
gomos.gomosLog(TRACE_DEBUG,"this is debuging in starting",sensorsBSN+"|"+mac+"|"
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
    
      // var  queryToExecute = [
      //     {
      //       $match: criteria
      //     },
      //     {
      //       $group: {
      //         _id: { _id: "$sensors." + sensorNm, mac: "$mac", createdTime: "$createdTime",name:"$DeviceName" }
      //       }
      //     },
    
      //     {
      //       $facet : {
      //         paginatedResults: [ {$sort: { "createdTime": -1 }},{ $skip: offset }, { $limit: page_size }],
      //         totalCount: [
      //           {
      //             $count: 'count'
      //           }
      //         ]
             
      //       }

      //     }   
      //   ];


  
    var sensorp = "sensors."+sensorNm
        var db = connection.db(dbName);
        db.collection("MsgFacts")
        .find(criteria,{projection: {mac:1,createdTime:1, sensors :1,DeviceName:1} }).skip( offset ).limit( page_size ).sort({createdTime:-1})
        .toArray(function (err, result1) {
          if (err) {
            process.hasUncaughtExceptionCaptureCallback();
          }
          if (result1.length > 0) {
            console.log("this is result")
          
            console.log("this is copy");
            var resultCopy = result1;
            
            console.log(resultCopy);
            result = [];
            result4 = []
            var finalResult =[];
            //copy all data from the copy of result to remove json with in json.
            for (var i = 0; i < resultCopy.length; i++) {
              var sensorNmKeys = Object.keys(resultCopy[i]["sensors"]);
              gomos.gomosLog(TRACE_DEBUG,"this is debuging for resultCopy",i);
              // for(var j =0; j< sensorNmKeys.length; j++ ){
              gomos.gomosLog(TRACE_DEBUG,"this is debuging for sensorNmKeys",sensorNmKeys[i]);

                if (sensorNmKeys.includes(sensorNm)){
              gomos.gomosLog(TRACE_DEBUG,"this is debuging for sensorNm pass Condition",sensorNm);

                  var sensorsBSNkeys = Object.keys(resultCopy[i]["sensors"][sensorNm]);
              gomos.gomosLog(TRACE_DEBUG,"this is debuging for sensorNm pass Condition sensorsBSNkeys",sensorsBSNkeys);

                      if(sensorsBSNkeys.includes(sensorsBSN) ){
                       gomos.gomosLog(TRACE_DEBUG,"this is debuging for  sensorsBSN pass",sensorsBSN);

                        // result.push(resultCopy[i]["sensors"][sensorNm][sensorsBSN]);
                        // result4.push(resultCopy[i])
                        gomos.gomosLog(TRACE_DEBUG,"this criteria after checking ", resultCopy[i].mac,resultCopy[i].DeviceName,sensorsBSN, 
                        resultCopy[i]["sensors"][sensorNm][sensorsBSN], resultCopy[i].createdTime);
                  finalResult.push([resultCopy[i].mac,resultCopy[i].DeviceName,sensorsBSN, 
                    resultCopy[i]["sensors"][sensorNm][sensorsBSN], resultCopy[i].createdTime]);

                      }

               
                 
                }
              // }
            
            }
   
            //copy all data from the copy of result to remove json with in json.
            // for (var i = 0; i < result.length; i++) {
           
            //   var formattedDate = result4[i].createdTime;
            //   var sensorNmKeys = Object.keys(result[i]);
            //   for (var j = 0; j < sensorNmKeys.length; j++) {
             
            //       finalResult.push([result4[i].mac,result4[i].DeviceName,sensorNmKeys[j], result[i][sensorNmKeys[j]], formattedDate]);
            //   }
            // }
         
           
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
)
}
);

router.post("/getdashbordlastalert",function(req,res,next){

 var body = req.body;
 var custCd = body.custCd;
 var subCustCd = body.subCustCd;
 var mac = body.mac;
var criteria = {
  custCd,subCustCd,mac
}
gomos.gomosLog(TRACE_DEBUG,"this is result of getdashbordlastalert criteria",criteria);

  accessPermission(res);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        next(err);
      }
      var db = connection.db(dbName);
      db.collection("Alerts").find(criteria,{ limit: 1 } ).sort({ createdTime : -1 }).toArray(function (err, result) {
        if (err) {
          process.hasUncaughtExceptionCaptureCallback();
        }
        if(result.length !=0){
          var alertObj ={};
          alertObj["sensorNm"] = result[0].sensorNm;
          alertObj["businessNm"] = result[0].businessNm;
          alertObj["shortName"] = result[0].shortName;
          alertObj["businessNmValues"] = result[0].businessNmValues;
          alertObj["criteria"] = result[0].criteria;
          alertObj["createdTime"] = result[0].createdTime;
          alertObj["alertText"] = result[0].alertText;
       
      gomos.gomosLog(TRACE_DEBUG,"this is result of getdashbordlastalert",result);
       
          res.json(alertObj)
        
        }
        else{
          res.json(0);
        }
      
       
    
    })
    }
  )

})
 

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
      var startDate, endDate, startFactValue = 0, endFactValue = 0, operation, sensorNm, equalsFacts;

      sensorNm = query.sensorNm;
      startDate = query.startDate;
      endDate = query.endDate;
      operation = query.operation;

      var criteria;
      var ServiceProvidersIds = query.spCode.split(",");
      var CustomersIds = query.custCd.split(",");
      var arSubCustomerIDs = query.subCustCd.split(",");

      // This criteria is built without sensor names for now, however a better way to filter based on sensornames
      // rather than getting everything and removing the unwanted data of other sensrors.
      criteria = {
        spCd: { $in: ServiceProvidersIds },
        custCd: { $in: CustomersIds },
        subCustCd: { $in: arSubCustomerIDs },
        createdTime: {
          $gte: startDate,
          $lte: endDate
        }
      };

      if (sensorNm && operation) {
        if (query.equalsFacts) {
          equalsFacts = parseFloat(query.equalsFacts);
        }
        if (query.startFactValue) {
          startFactValue = parseFloat(query.startFactValue);
        }
        if (query.endFactValue) {
          endFactValue = parseFloat(query.endFactValue);
        }

        factsOperations(db, sensorNm, startFactValue, endFactValue, connection, next,
          equalsFacts, operation, res, criteria);
      } else {
        res.json(0);
      }
    }
  );
});

function factsOperations(db, sensorNm, startFactValue, endFactValue, connection, next,
  equalsFacts, operation, res, criteria) {
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
  queryToExecute = [
    {
      $match: criteria
    },
    {
      $group: {
        _id: { _id: "$sensors." + sensorNm, mac: "$mac", createdTime: "$createdTime",name:"$name" }
      }
    },
    { $sort: { '_id.mac': 1 } }
  ];


  db.collection("MsgFacts")
    .aggregate(queryToExecute)
    .toArray(function (err, result) {
      if (err) {
        next(err);
      }
      if (result.length > 0) {
        var resultCopy = result;
        result = [];
        //copy all data from the copy of result to remove json with in json.
        for (var i = 0; i < resultCopy.length; i++) {
          var sensorNmKeys = Object.keys(resultCopy[i]._id);
          // This is with an assumtion that "_id" always comes first, if not, change the code to 
          // specifically look out for "_id".
          if (sensorNmKeys[0]=="_id"){
            result.push(resultCopy[i]._id);
          }
        }
        
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
            for (var j = 0; j < sensorNmKeys.length; j++) {
              //comparing the businessNm values(sensor's BusinessNm) with the passed range of value
              if (result[i]._id[sensorNmKeys[j]] >= startFactValue && result[i]._id[sensorNmKeys[j]] <= endFactValue) {
                finalResult.push([result[i].mac,result[i].name, sensorNmKeys[j], result[i]._id[sensorNmKeys[j]], formattedDate]);
              }
            }
          }
          if (finalResult.length != 0) {
            finalResult.push([ltdttm, 0, 0]);
            res.json(finalResult);
          } else {
            res.json(0);
          }
        }
      } else {
        res.json(0);
        connection.close();
      }
    });
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

