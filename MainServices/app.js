var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');
var forwardNotification = require('./routes/forwardNotification');
// var alertService = require('./routes/alertService');
var factService = require('./routes/factService');
var usersRouter = require('./routes/users');
var dateTime = require('node-datetime');
var  gomos = require("../commanfunction/routes/commanFunction");

//reads the data from config file which contains DB connection url and the DB Name.
var appConfig = JSON.parse(fs.readFileSync(process.cwd() + '/appConfig.json', 'utf8'));

var urlConn, dbName;

var app = express();

var dt = dateTime.create();
var formattedDate = dt.format('Y-m-d');

//creates the file to write all errors that occurs,which will be usefull for debugging.
var log_file_err = fs.createWriteStream(process.cwd() + '/error-' + formattedDate + '.log', { flags: 'a' });

//Checks whether the service is running in production mode or development mode and sets the enviroment
//accordingly.
if (process.argv[2] == "dev") {
  urlConn = appConfig.devURL; dbName = appConfig.devDB;
  console.log("Environment set to : Development");
} 
else if (process.argv[2] == "test") {
  urlConn = appConfig.testURL; dbName = appConfig.testDB;
  console.log("Environment set to : Testing");
} 
else if (process.argv[2] == "stage") {
  urlConn = appConfig.stageURL; dbName = appConfig.stageDB;
  console.log("Environment set to : Staging");
}
else if (process.argv[2] == "prod") {
  urlConn = appConfig.prodURL; dbName = appConfig.prodDB;
  console.log("Environment set to : Production");
}
else {
  console.log("Not a proper command to start the server!!");
  process.exit();
}

//set app level local vars
app.locals.urlConn = urlConn;
app.locals.dbName = dbName;

forwardNotification(app);
// alertService(app);
factService(app);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', forwardNotification);
// app.use('/alertService', alertService);
app.use("/factService", factService)
app.use('/users', usersRouter);

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

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
