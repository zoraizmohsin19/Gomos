var fs = require('fs');
let mongoose = require('mongoose');
let urlConn = ''
//reads the data from config file which contains DB connection url and the DB Name.
var appConfig = JSON.parse(fs.readFileSync(process.cwd() + '/appConfig.json', 'utf8'));
  
if(appConfig[process.argv[2]] !== undefined  ){
    urlConn=  appConfig[process.argv[2]][0]
    console.log(`Environment set to : ${appConfig[process.argv[2]][1]}`)
}else{
    console.log("Not a proper command to start the server!!");
        process.exit();
}

class Database {
  constructor() {
    this._connect()
  }
  
_connect() {
     mongoose.connect(urlConn,{useNewUrlParser: true})
       .then(() => {
         console.log('Database connection successful')
       })
       .catch(err => {
         console.error('Database connection error')
       })
  }
}

module.exports =  function(){ new Database()};
