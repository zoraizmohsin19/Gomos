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
const  TRACE_PROD = 1
const TRACE_STAGE = 2;
const TRACE_TEST  = 3;
const TRACE_DEV   = 4;
const TRACE_DEBUG = 5;
var  gomos = require("../../commanFunction");
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
  // var assetId = identifier.assetId;
  var Date = identifier.Date;
  gomos.gomosLog(TRACE_DEBUG,"post method and getting following data ",userId+":"+password+":"+payloadId+":"+DeviceName+":"+custCd+":"+subCustCd); 
  }
  catch(err){
    errorCustmHandler("/sendto/plateform",err);
  }
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        errorCustmHandler("/sendto/plateform",err)
        process.hasUncaughtExceptionCaptureCallback();
      }
      var db = connection.db(dbName);
      db.collection("Users")
        .find({ userId: userId, password: password })
        .toArray(function (err, result) {
          if (err) {
            errorCustmHandler("/sendto/plateform",err)
            process.hasUncaughtExceptionCaptureCallback();
          }
          if (result.length > 0) {
                gomos.gomosLog(TRACE_DEBUG,"userId and password validation ",userId+":"+password);     
                dataToStore = {
                          payloadId,
                          DeviceName,
                          subCustCd,
                          custCd,
                          // assetId,
                          Date,
                          message
                            }
                gomos.gomosLog(TRACE_DEBUG," After userId and password validation dataToStore sendToMidlelayer",dataToStore);     
                asyncPostData(res,dataToStore);            
          }
          else{
            gomos.gomosLog(TRACE_PROD,"UserId and password not validate");     
            res.json("UserId and password not validate");
          }
  
   });
  });
});
async function asyncPostData(res,dataToStore) {
  try {
    const response = await axios.post('http://localhost:3996/sendto', {body: dataToStore});
    gomos.gomosLog(TRACE_PROD,"success in endPoint and response value come from middlelayer :", response["data"]);     
    res.json(response["data"])
      } catch(err) {
        errorCustmHandler("asyncPostData",err)
        res.json("somthing wrong");
      }

}

var dt = dateTime.create();
var formattedDate = dt.format("Y-m-d");
function errorCustmHandler(functionName,typeofError){
  // console.log(typeofError);
    let writeStream = fs.createWriteStream("../commanError-" + formattedDate + ".log", { flags: "a" });
    var dateTime = new Date().toISOString();
  // write some data with a base64 encoding
  writeStream.write(
  "DateTime: " +dateTime+ "\n"+  
  "Error handler: " + "\n"+
  "serviceName:"+ "GomosEndPoint" +"\n"+
  "functionName:"+ functionName +"\n"+
  // "lineNo: " + lineNo  +"\n"+
  "Error Code:" + typeofError.statusCode +"\n"+
  " Error: " + typeofError + "\n"+
  "typeofError.stack"+ typeofError.stack +
  "\n"
  );
  
  // the finish event is emitted when all data has been flushed from the stream
  writeStream.on('finish', () => {  
    gomos.gomosLog(TRACE_PROD,"wrote all data to file For Error log");     
  });
  
  // close the stream
  writeStream.end(); 
  
    // MongoClient.connect(
    //   urlConn,
    //   { useNewUrlParser: true },
    //   function (err, connection) {
    //     if (err) {
    //       // console.log(err);
    //       process.hasUncaughtExceptionCaptureCallback();
    //     }
    //     var createdTime = new Date();
    //     errorobj = {
    //       lineNo,
    //       functionName,
    //       Error,
    //       typeofError,
    //       createdTime
    //     }
    //     var db = connection.db(dbName);
    //     db.collection("MqttErrorhandler")
    //     .insert(errorobj, function (err, result) {
    //       if (err) {
    //         // console.log(err);
    //          process.hasUncaughtExceptionCaptureCallback();
    //       } else console.log("Entry saved in MqttErrorhandler Collection");
    //     });
    //   }
    // )
  
  }

module.exports = function (app) {
  //DB Name and the url for database connection is from appConfig file in app.js
  urlConn = app.locals.urlConn;
  dbName = app.locals.dbName;
  // gomos =app.locals;
  return router;
};

