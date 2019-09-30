var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var loggerm = require("morgan");
var fs = require("fs");
// var indexRouter = require("./routes/index");
var Database = require('../baseFunction/DataBaseConnection/dataBaseConnect');
// var usersRouter = require("../baseFunction/users");
var dateTime = require("node-datetime");
var cors = require("cors");

//reads the data from config file which contains DB connection url and the DB Name.
var appConfig = JSON.parse(
  fs.readFileSync(process.cwd() + "/appConfig1.json", "utf8")
);
var urlConn, dbName;

var app = express();

var dt = dateTime.create();
var formattedDate = dt.format("Y-m-d");
const logger = (require("../baseFunction/commanUtilityFn/utilityFn")).CreateLogger("OnDemandService")
//creates the file to write all errors that occurs,which will be usefull for debugging.
// var log_file_err = fs.createWriteStream(
//   process.cwd() + "/error-" + formattedDate + ".log",
//   { flags: "a" }
// );

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
app.locals.logger = logger;
Database();
var indexRouter = require("../baseFunction/onDemand/Ondemand")(app);
var login = require("../baseFunction/onDemand/login")(app);
// var viewDashboard = require("../baseFunction/onDemand/viewDashBoard")(app);
//cors access permissions are important to perform curd operations.
app.options("*", cors());
app.use(cors());

// view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "jade");

app.use(loggerm("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));
app.use('/Database', Database);
app.use("/", indexRouter);
app.use("/login", login);
// app.use("/viewDashboard", viewDashboard);
// app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

//Error Handling
app.use(function (error, req, res, next) {
  if (!error.statusCode) {
    error.statusCode = 500;
  }
  console.log("Error handler: ", error.message, error.statusCode);
  log_file_err.write(
    "Error handler: " +
    "Error Code:" +
    error.statusCode +
    "  " +
    error.stack +
    "\n"
  );
  res.status(500).json({ error: error.message });
});

//uncaught exception handling
process.on("uncaughtException", function (err) {
  console.log("Caught exception: " + err);
  log_file_err.write("Caught exception: " + err.stack + "\n");
  process.exit();
});

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  req.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  req.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  req.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  // req.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;