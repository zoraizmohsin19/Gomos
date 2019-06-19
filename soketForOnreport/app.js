var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require("fs");
var dateTime = require("node-datetime");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var userViewDashboard = require('./routes/viewDashSocket');
var app = express();
var dt = dateTime.create();
var formattedDate = dt.format("Y-m-d");
var  gomos = require("../commanFunction/routes/commanFunction");

//creates the file to write all errors that occurs,which will be usefull for debugging.
var log_file_err = fs.createWriteStream(
  process.cwd() + "/error-" + formattedDate + ".log",
  { flags: "a" }
);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var appConfig = JSON.parse(
  fs.readFileSync(process.cwd() + "/appConfig.json", "utf8")
);
var urlConn, dbName;
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


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

indexRouter(app);
userViewDashboard(app);
app.use('/', indexRouter);
app.use('/viewDashSocket',userViewDashboard);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
//Checks whether the service is running in production mode or development mode and sets the enviroment
//accordingly.
//Error Handling
app.use(function (error, req, res, next) {
  if (!error.statusCode) {
    error.statusCode = 500;
  }
  console.log("Error handler: ", error.message, error.statusCode);
  // log_file_err.write(
  //   "Error handler: " +
  //   "Error Code:" +
  //   error.statusCode +
  //   "  " +
  //   error.stack +
  //   "\n"
  // );
  gomos.errorCustmHandler("soketForOnreport","Error Handling",'Error Handling','',err,"runTimeError",true,true)

  res.status(500).json({ error: error.message });
});

//uncaught exception handling
process.on("uncaughtException", function (err) {
  console.log("Caught exception: " + err);
  // log_file_err.write("Caught exception: " + err.stack + "\n");
  // process.exit();
  gomos.errorCustmHandler("soketForOnreport","uncaughtException",'uncaughtException error','',err,"runTimeError",true,true)

});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
