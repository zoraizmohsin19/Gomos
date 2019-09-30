var express = require("express");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
const gomos = require("../commanUtilityFn/commanFunction");
const g = require('../commanUtilityFn/gConstant');
const NAMEOFSERVICE = "login";
const SERVICE_VALUE = 1;
var gConsole = false;
var urlConn, dbName;
let logger;
const utilityFn = require('../commanUtilityFn/utilityFn')
router.post("/authenticate", function (req, res, next) {
    // var query = url.parse(req.url, true).query;
     let body = req.body.body
    let userId = body.email;
    let password = body.password;
    console.log(userId +" ,"+ password );
    userDtls = [];
    utilityFn.accessPermission(res);
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
                    gomos.gomosLog( logger,gConsole,g.TRACE_DEBUG,"This is result1[0].deviceType", result1[0].deviceType)
                   var  configData = {
                    DeviceName: result1[0].ActiveDeviceName,
                    mac:  result1[0].ActiveMac,
                    assetId: result1[0].ActiveAssets,
                    custCd: result1[0].ActiveCustCd,
                    spCd: result1[0].ActiveSpCd,
                  
                    subCustCd: result1[0].ActiveSubCustCd
                   }
                   gomos.gomosLog( logger,gConsole,g.TRACE_DEBUG,"This is Config Data",configData )
                   db.collection("ClientMenuConfig")
                   .find({ clientID: clientID })
                   .toArray(function (err, clientData) {
                     if (err) {
                       process.hasUncaughtExceptionCaptureCallback();
                     } 
  
                    gomos.gomosLog( logger,gConsole,g.TRACE_DEV,"This is clientID ",clientData);
                    var ClientObj =  clientData[0]
                    gomos.gomosLog( logger,gConsole,g.TRACE_DEV,"This is ClientObj",ClientObj)
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
module.exports = function (app) {
    //DB Name and the url for database connection is from appConfig file in app.js
    urlConn = app.locals.urlConn;
    dbName = app.locals.dbName;
    logger = app.locals.logger;
    return router;
  };
  