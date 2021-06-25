var express = require("express");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
const gomos = require("../commanUtilityFn/commanFunction");
const g = require('../commanUtilityFn/gConstant');
const NAMEOFSERVICE = "viewDashboard";
const SERVICE_VALUE = 1;
var gConsole = false;
var urlConn, dbName;
let logger;
const utilityFn = require('../commanUtilityFn/utilityFn')











module.exports = function (app) {
    //DB Name and the url for database connection is from appConfig file in app.js
    urlConn = app.locals.urlConn;
    dbName = app.locals.dbName;
    logger = app.locals.logger;
    return router;
  };
  