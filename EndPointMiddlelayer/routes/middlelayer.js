var MongoClient = require("mongodb").MongoClient;
var dateTime = require("node-datetime");
const NAMEOFSERVICE = "ENDPOINTMIDDLELAYER-AS-Func";
const TRACE_PROD = 1
const TRACE_STAGE = 2;
const TRACE_TEST = 3;
const TRACE_DEV = 4;
const TRACE_DEBUG = 5;
const ERROR_RUNTIME      = "runTimeError";
const ERROR_APPLICATION  =  "ApplicationError";
const ERROR_DATABASE     = "DataBaseError";
const EXIT_TRUE  = true;
const EXIT_FALSE = false;
const ERROR_TRUE = true;
const ERROR_FALSE = false;
var gomos = require("../../commanFunction/routes/commanFunction");
var fs = require("fs");
var dt = dateTime.create();
var formattedDate = dt.format('Y-m-d');
const output = fs.createWriteStream(`./midllelayerStd${formattedDate}.log`, { flags: "a" });
const errorOutput = fs.createWriteStream(`./midllelayerErr${formattedDate}.log`, { flags: "a" });
var logger = gomos.createConsole(output,errorOutput);
const SERVICE_VALUE = 1;
var gConsole = false;
if(process.argv[4] == SERVICE_VALUE ){
  gConsole = true;
}

function translateMethod(ConvertedSensors, message, DeviceName, payloadId, subCustCd, custCd, Date, db, res, mac, assetId, token,remark) {
  try {
    var finalSensors = {};
    finalSensors["payloadId"] = payloadId;
    var msgClientKeys = Object.keys(message);
    var sensorsNotFound = '';

    for (var k = 0; k < msgClientKeys.length; k++) {
      var configNMValues = {};
      // Key comparisons and value replacements are done here
      if (ConvertedSensors[msgClientKeys[k]]) {
        var configNm = ConvertedSensors[msgClientKeys[k]];
        var businessValue = message[msgClientKeys[k]];
        configNMValues[configNm] = businessValue;
      }
      else {
        sensorsNotFound = sensorsNotFound + "Sensor [" + msgClientKeys[k] + "] not found !; ";
      }
      for (let [key, value] of Object.entries(configNMValues)) {
        finalSensors[key] = value;
      }
    }
     gomos.gomosLog( logger,gConsole,TRACE_TEST, "translateMeg key value", finalSensors);
    if (sensorsNotFound.length == 0) {

      if (token != undefined && token.length != 0) {
        message["Token"] = token;
        finalSensors["Token"] = token;
      }
      successUpdate(DeviceName, payloadId, subCustCd, custCd, Date, message, finalSensors, res, db, "success", mac, assetId,remark)
    }
    else {
      errorUpdate(DeviceName, payloadId, subCustCd, custCd, Date, message, db, res, assetId, sensorsNotFound,remark);
    }
  } catch (err) {
    res.json("some Error is generated");
    gomos.errorCustmHandler(NAMEOFSERVICE,"translateMethod",'This Is Traslated method try catch Error ',`message: ${message} DeviceName : ${DeviceName} payloadId : ${payloadId} subCustCd : ${subCustCd}`,err,ERROR_RUNTIME,ERROR_TRUE,EXIT_FALSE);
  }
}
function successUpdate(DeviceName, payloadId, subCustCd, custCd, DateTime, message, finalSensors, res, db, responseTosend, mac, assetId,remark) {
  var nowDateTime = new Date(new Date().toISOString())
  var dataToStore = {
    DeviceName: DeviceName,
    mac: mac,
    payloadId: payloadId,
    assetId: assetId,
    subCustCd: subCustCd,
    custCd: custCd,
    Date: DateTime,
    sourceMsg: message,
    translatedMsg: finalSensors,
    type: "level4",
    processed: "N",
    lasterrorString: '',
    lasterrorTime: '',
    numberOfAttempt: 0,
    remark : remark,
    createdTime: nowDateTime,
    updatedTime: nowDateTime
  }
  // console.log(dataToStore);

  db.collection("Alerts")
    .insertOne(dataToStore, function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"successUpdate",'This is inserting error ',`message: ${message} DeviceName : ${DeviceName} payloadId : ${payloadId} subCustCd : ${subCustCd}`,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
      } else {
         gomos.gomosLog( logger,gConsole,TRACE_PROD, "Entry saved in Alert With Translated Msg Collection");
        res.json(responseTosend);

      }
    });
}
exports.endPointMiddelayerFn = function (urlConn, dbName, res, custCd, subCustCd, DeviceName, payloadId, Date, message, token) {
  urlConn = urlConn;
  dbName = dbName;
   gomos.gomosLog( logger,gConsole,TRACE_DEBUG, "Post method hit by endpoint thier value" + ":" + DeviceName + ":" + payloadId + ":" + subCustCd + ":" + payloadId + ":" + DeviceName + ":" + custCd, message);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"endPointMiddelayerFn",'THIS IS MONGOCLIENT ERROR',`message: ${message} DeviceName : ${DeviceName} payloadId : ${payloadId} subCustCd : ${subCustCd}`,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
      }
      var db = connection.db(dbName);
      try {
        db.collection("SubCustomers")
          .find({ subCustCd: subCustCd, custCd: custCd })
          .toArray(function (err, result) {
            if(err){
              gomos.errorCustmHandler(NAMEOFSERVICE,"endPointMiddelayerFn",'THIS IS valiating Subcustomer Error ',`message: ${message} DeviceName : ${DeviceName} payloadId : ${payloadId} subCustCd : ${subCustCd}`,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
            }
            var SubCustomersValidation = '';
            var remark  = ""
            if (result.length > 0) {
               gomos.gomosLog( logger,gConsole,TRACE_TEST, "SubCustomers Validation  true ", result.length);
               gomos.gomosLog( logger,gConsole,TRACE_TEST, "assetId Validation  true ", result.length);
              db.collection("Devices")
                .find({ DeviceName: DeviceName })
                .toArray(function (err, result) {
                  if (err) {
                    gomos.errorCustmHandler(NAMEOFSERVICE,"endPointMiddelayerFn",'THIS IS validating device Error',`message: ${message} DeviceName : ${DeviceName} payloadId : ${payloadId} subCustCd : ${subCustCd}`,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
                  }
                  try {
                    if (result.length > 0) {
                      var mac = result[0].mac;
                      var assetId = result[0].assetId;
                       gomos.gomosLog( logger,gConsole,TRACE_TEST, "Devices Validation  true " + mac, result.length);
                      db.collection("Payloads")
                        .find({ mac: mac, payloadId: payloadId })
                        .toArray(function (err, result) {
                          if (err) {
                            gomos.errorCustmHandler(NAMEOFSERVICE,"endPointMiddelayerFn",'THIS IS validating payload Error',`message: ${message} DeviceName : ${DeviceName} payloadId : ${payloadId} subCustCd : ${subCustCd}`,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
                          }
                          try {
                            if (result.length > 0) {
                               gomos.gomosLog( logger,gConsole,TRACE_TEST, "Payloads Validation  true " + payloadId, result.length);
                              var sensorNms;
                              sensorNms = result[0].sensors;
                              if (sensorNms != undefined) {
                                 gomos.gomosLog( logger,gConsole,TRACE_DEBUG, "sensorNms Not Undefined", sensorNms);
                                sensorKeys = Object.keys(sensorNms); //conatins only the sensor names.
                                var ConvertedSensors = {};

                                //mapping of msgClientkeys with their corresponding business names which we get from payloads.
                                for (var k = 0; k < sensorKeys.length; k++) {
                                  var configNameValue = {};
                                  var configName = Object.keys(sensorNms[sensorKeys[k]]);
                                  var businessName = Object.values(sensorNms[sensorKeys[k]]);
                                  for (var j = 0; j < configName.length; j++) {
                                    configNameValue[businessName[j]] = configName[j];
                                  }
                                  for (let [key, value] of Object.entries(configNameValue)) {

                                    ConvertedSensors[key] = value;
                                  }

                                }
                             
                                 gomos.gomosLog( logger,gConsole,TRACE_DEBUG, "ConvertedSensors  sensors key value", ConvertedSensors);
                                translateMethod(ConvertedSensors, message, DeviceName, payloadId, subCustCd, custCd, Date, db, res, mac, assetId, token,remark);
                              }
                            }
                            else {
                              errorUpdate(DeviceName, payloadId, subCustCd, custCd, Date, message, db, res, "Payload [" + payloadId + "] not Present",remark);
                            }
                          } catch (err) {
                            gomos.errorCustmHandler(NAMEOFSERVICE,"endPointMiddelayerFn",'THIS IS TRY CATCH ERROR',`message: ${message} DeviceName : ${DeviceName} payloadId : ${payloadId} subCustCd : ${subCustCd}`,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
                          }
                        });

                    }
                    else {
                      errorUpdate(DeviceName, payloadId, subCustCd, custCd, Date, message, db, res, "Device [" + DeviceName + "] not found !;",remark);
                    }
                  } catch (err) {
                    gomos.errorCustmHandler(NAMEOFSERVICE,"endPointMiddelayerFn",'THIS IS TRY CATCH ERROR',`message: ${message} DeviceName : ${DeviceName} payloadId : ${payloadId} subCustCd : ${subCustCd}`,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
                  }
                });
            } else {
              errorUpdate(DeviceName, payloadId, subCustCd, custCd, Date, message, db, res, "SubCustomer [" + subCustCd + "] not found !;",remark);
            }
          });
      } catch (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"endPointMiddelayerFn",'THIS IS TRY CATCH ERROR',`message: ${message} DeviceName : ${DeviceName} payloadId : ${payloadId} subCustCd : ${subCustCd}`,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
      }
    });

}


exports.endPointMiddelayerFnWithRemark = function (urlConn, dbName, res, custCd, subCustCd, DeviceName, payloadId, Date, message, token, remark) {
  urlConn = urlConn;
  dbName = dbName;
   gomos.gomosLog( logger,gConsole,TRACE_DEBUG, "Post method hit by endpoint thier value" + ":" + DeviceName + ":" + payloadId + ":" + subCustCd + ":" + payloadId + ":" + DeviceName + ":" + custCd, message);
   gomos.gomosLog( logger,gConsole,TRACE_DEBUG, "remarkObj", remark);
  MongoClient.connect(
    urlConn,
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"endPointMiddelayerFnWithRemark",'THIS IS MONGOCLIENT ERROR',`message: ${message} DeviceName : ${DeviceName} payloadId : ${payloadId} subCustCd : ${subCustCd}`,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
      }
      var db = connection.db(dbName);
      try {
        db.collection("SubCustomers")
          .find({ subCustCd: subCustCd, custCd: custCd })
          .toArray(function (err, result) {
            var SubCustomersValidation = '';
            if (result.length > 0) {
               gomos.gomosLog( logger,gConsole,TRACE_TEST, "SubCustomers Validation  true ", result.length);
               gomos.gomosLog( logger,gConsole,TRACE_TEST, "assetId Validation  true ", result.length);
              db.collection("Devices")
                .find({ DeviceName: DeviceName })
                .toArray(function (err, result) {
                  if (err) {
                    gomos.errorCustmHandler(NAMEOFSERVICE,"endPointMiddelayerFnWithRemark",'THIS IS query  for SubCustomers Error',`message: ${message} DeviceName : ${DeviceName} payloadId : ${payloadId} subCustCd : ${subCustCd}`,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
                  }
                  try {
                    if (result.length > 0) {
                      var mac = result[0].mac;
                      var assetId = result[0].assetId;
                       gomos.gomosLog( logger,gConsole,TRACE_TEST, "Devices Validation  true " + mac, result.length);
                      db.collection("Payloads")
                        .find({ mac: mac, payloadId: payloadId })
                        .toArray(function (err, result) {
                          if (err) {
                            gomos.errorCustmHandler(NAMEOFSERVICE,"endPointMiddelayerFnWithRemark",'THIS IS query  for Payloads Error',`message: ${message} DeviceName : ${DeviceName} payloadId : ${payloadId} subCustCd : ${subCustCd}`,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
                          }
                          try {
                            if (result.length > 0) {
                               gomos.gomosLog( logger,gConsole,TRACE_TEST, "Payloads Validation  true " + payloadId, result.length);
                              var sensorNms;
                              sensorNms = result[0].sensors;
                              if (sensorNms != undefined) {
                                 gomos.gomosLog( logger,gConsole,TRACE_DEBUG, "sensorNms Not Undefined", sensorNms);
                                sensorKeys = Object.keys(sensorNms); //conatins only the sensor names.
                                var ConvertedSensors = {};

                                //mapping of msgClientkeys with their corresponding business names which we get from payloads.
                                for (var k = 0; k < sensorKeys.length; k++) {
                                  var configNameValue = {};
                                  var configName = Object.keys(sensorNms[sensorKeys[k]]);
                                  var businessName = Object.values(sensorNms[sensorKeys[k]]);
                                  for (var j = 0; j < configName.length; j++) {
                                    configNameValue[businessName[j]] = configName[j];
                                  }
                                  for (let [key, value] of Object.entries(configNameValue)) {

                                    ConvertedSensors[key] = value;
                                  }

                                }
                                 gomos.gomosLog( logger,gConsole,TRACE_DEBUG, "ConvertedSensors  sensors key value", ConvertedSensors);
                                translateMethod(ConvertedSensors, message, DeviceName, payloadId, subCustCd, custCd, Date, db, res, mac, assetId, token,remark);
                              }
                            }
                            else {
                              errorUpdate(DeviceName, payloadId, subCustCd, custCd, Date, message, db, res, "Payload [" + payloadId + "] not Present",remark);
                            }
                          } catch (err) {
                            gomos.errorCustmHandler(NAMEOFSERVICE,"endPointMiddelayerFnWithRemark",'THIS IS try CAtch  for Payloads Error',`message: ${message} DeviceName : ${DeviceName} payloadId : ${payloadId} subCustCd : ${subCustCd}`,err,ERROR_RUNTIME,ERROR_TRUE,EXIT_TRUE);
                          }
                        });

                    }
                    else {
                      errorUpdate(DeviceName, payloadId, subCustCd, custCd, Date, message, db, res, "Device [" + DeviceName + "] not found !;",remark);
                    }
                  } catch (err) {
                    gomos.errorCustmHandler(NAMEOFSERVICE,"endPointMiddelayerFnWithRemark",'THIS IS try CAtch  for SubCustomers Error',`message: ${message} DeviceName : ${DeviceName} payloadId : ${payloadId} subCustCd : ${subCustCd}`,err,ERROR_RUNTIME,ERROR_TRUE,EXIT_TRUE);
                  }
                });
            } else {
              errorUpdate(DeviceName, payloadId, subCustCd, custCd, Date, message, db, res, "SubCustomer [" + subCustCd + "] not found !;",remark);
            }
          });
      } catch (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"endPointMiddelayerFnWithRemark",'THIS IS try CAtch  for Mongo Client Error',`message: ${message} DeviceName : ${DeviceName} payloadId : ${payloadId} subCustCd : ${subCustCd}`,err,ERROR_RUNTIME,ERROR_TRUE,EXIT_TRUE);
      }
    });

}


function errorUpdate(DeviceName, payloadId, subCustCd, custCd, DateTime, message, db, res, responseTosend,remark) {
  var nowDateTime = new Date(new Date().toISOString())
  var dataToStore = {
    DeviceName: DeviceName,
    payloadId: payloadId,
    //assetId: assetId,
    subCustCd: subCustCd,
    custCd: custCd,
    Date: DateTime,
    sourceMsg: message,
    translatedMsg: { "key": "NA" },
    type: "level4",
    processed: "E",
    lasterrorString: '',
    lasterrorTime: '',
    numberOfAttempt: 0,
    remark : remark,
    createdTime: nowDateTime,
    updatedTime: nowDateTime

  }
  // console.log(dataToStore);
  db.collection("Alerts")
    .insertOne(dataToStore, function (err, result) {
      if (err) {
        gomos.errorCustmHandler(NAMEOFSERVICE,"errorUpdate",'This is Insert in data base error',dataToStore,err,ERROR_DATABASE,ERROR_TRUE,EXIT_TRUE);
      } else {
        res.json(responseTosend);
      }
    });
}