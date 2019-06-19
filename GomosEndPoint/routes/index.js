var express = require("express");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
const url = require("url");
var requiredDateTime = require("node-datetime");
const mongoose = require("mongoose");
var ObjectId = require('mongodb').ObjectID;
const Schema = mongoose.Schema;
const axios = require('axios');
var urlConn, dbName;
var fs = require("fs");
var dateTime = require("node-datetime");
const NAMEOFSERVICE = "GomosEndPoint";
const  TRACE_PROD = 1
const TRACE_STAGE = 2;
const TRACE_TEST  = 3;
const TRACE_DEV   = 4;
const TRACE_DEBUG = 5;
const ERROR_RUNTIME      = "runTimeError";
const ERROR_APPLICATION  =  "ApplicationError";
const ERROR_DATABASE     = "DataBaseError";
const EXIT_TRUE  = true;
const EXIT_FALSE = false;
const ERROR_TRUE = true;
const ERROR_FALSE = false;
var  gomos = require("../../commanFunction/routes/commanFunction");
var midllelayer = require("../../EndPointMiddlelayer/routes/middlelayer");
var fs = require("fs");
var dt = dateTime.create();
var formattedDate = dt.format('Y-m-d');
const output = fs.createWriteStream(`./gomosEndPointStd${formattedDate}.log`, { flags: "a" });
const errorOutput = fs.createWriteStream(`./gomosEndPointErr${formattedDate}.log`, { flags: "a" });
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

// method for for get data from client by auth...
router.post("/sendto/plateform", function (req, res, next) {
  accessPermission(res); 
  try{
  var body = req.body;
  var userId = body.userId;
  var password = body.password ;
  var identifier = body.identifier;
  var message = body.message;
   identifier = JSON.parse(body.identifier);
   message = JSON.parse(body.message);
  var payloadId = identifier.payloadId;
  var DeviceName = identifier.DeviceName;
  var subCustCd = identifier.subCustCd;
  var custCd = identifier.custCd;
  var Token = identifier.Token; 
  // var assetId = identifier.assetId;
  var Date = identifier.Date;
  gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"post method and getting following data ",userId+":"+password+":"+payloadId+":"+DeviceName+":"+custCd+":"+subCustCd); 
  }
  catch(err){
    gomos.errorCustmHandler(NAMEOFSERVICE,"/sendto/plateform",'THIS IS TRY CATCH ERROR for parsing Data ',req.body,err,ERROR_RUNTIME,ERROR_TRUE,EXIT_FALSE);

  }
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
       gomos.errorCustmHandler(NAMEOFSERVICE,"/sendto/plateform",'THIS IS MONGO CLIENT CONNECTION ERROR ','',ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
      }
      var db = connection.db(dbName);
      db.collection("Users")
        .find({ userId: userId, password: password })
        .toArray(function (err, result) {
          if (err) {
            gomos.errorCustmHandler(NAMEOFSERVICE,"/sendto/plateform",'THIS IS QUERY ERROR From Users For Validation',`userId :${userId} and password :${password}`,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
          }
          if (result.length > 0) {
                gomos.gomosLog( logger,gConsole,TRACE_DEBUG,"userId and password validation ",userId+":"+password);       
                midllelayer.endPointMiddelayerFn(urlConn,dbName,res,custCd,subCustCd,DeviceName,payloadId,dateTime,message,Token);
          }
          else{
            gomos.gomosLog( logger,gConsole,TRACE_PROD,"UserId and password not validate");     
            res.json("UserId and password not validate");
          }
  
   });
  });
});
module.exports = function (app) {
  //DB Name and the url for database connection is from appConfig file in app.js
  urlConn = app.locals.urlConn;
  dbName = app.locals.dbName;
  // gomos =app.locals;
  return router;
};

