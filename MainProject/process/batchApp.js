var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// var fs = require('fs');
var aggregator = require('../baseFunction/batchServices/aggregator');
var alertSrvc = require('../baseFunction/batchServices/alertService');

var Database = require('../baseFunction/DataBaseConnection/dataBaseConnect');
// var usersRouter = require('../baseFunction/users');
// var dateTime = require('node-datetime');
var  gomos = require("../baseFunction/commanUtilityFn/commanFunction");
// var urlConn, dbName;
var app = express();

// var dt = dateTime.create();
// var formattedDate = dt.format('Y-m-d');

//creates the file to write all errors that occurs,which will be usefull for debugging.
// var log_file_err = fs.createWriteStream(process.cwd() + '/error-' + formattedDate + '.log', { flags: 'a' });



//set app level local vars
// app.locals.urlConn = urlConn;
// app.locals.dbName = dbName;
Database();
aggregator(app);
alertSrvc(app);
// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/Database', Database);
app.use('/', aggregator);
app.use('/alertSrvc', alertSrvc);

// app.use('/users', usersRouter);

//catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

//Error Handling
app.use(function (error, req, res, next) {
  if (!error.statusCode) {
    error.statusCode = 500;
  }
  // console.log("Error handler: ", error.message, error.statusCode);
  // log_file_err.write("Error handler: " + "Error Code:" + error.statusCode + "  " + error.stack + '\n');
  gomos.errorCustmHandler("mainService","error.statusCode=500","app error hander", "Error handler: " + "Error Code:" + error.statusCode + "  " + error.stack + '\n',error,"runTimeError",true,false)
  res.status(500).json({ error: error.message });
});

//uncaught exception handling
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
  // log_file_err.write('Caught exception: ' + err.stack + '\n');
  // process.exit();
  gomos.errorCustmHandler("mainService","uncaughtException","Caught exception", err.message,err,"runTimeError",true,true)

});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  gomos.errorCustmHandler("mainService","app.js","Caught exception", err.message,err,"runTimeError",true,true)
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
