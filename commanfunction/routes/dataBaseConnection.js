var MongoClient = require("mongodb").MongoClient;


function connect(url,Option) {
    return MongoClient.connect(url,Option).then(client => client)
  }


  module.exports = async function(url,Option) {
    
    let databases = await  connect(url,Option);
    return databases
  }