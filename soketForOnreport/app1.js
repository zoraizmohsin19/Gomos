const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const port = process.env.PORT || 4001;
const index = require("./routes/index");
const app = express();
app.use(index);
var MongoClient = require("mongodb").MongoClient;

const server = http.createServer(app);
const io = socketIo(server);
io.on("connection", socket => {
  console.log("New client connected"), setInterval(
    () => getApiAndEmit(socket),
    10000
  );
  socket.on("disconnect", () => console.log("Client disconnected"));
});
const getApiAndEmit = function(socket) {
  // try {
    // const res = await axios.post(
    //   "https://localhost:3992/getActiveDAction"
    // );
   var temp = Math.random();
console.log(temp);
MongoClient.connect(
    "mongodb://gomosdev:gomos123@ds253284.mlab.com:53284/gomosdev",
    { useNewUrlParser: true },
    function (err, connection) {
      if (err) {
        // next(err);
      }
      var db = connection.db("gomosdev");
      // gomos.gomosLog(TRACE_DEBUG,"This is called in Alert"); 
        db.collection("Devices")
        .find({ mac: "5ccf7f0015bc"})
        .toArray(function (err, result) {
          if (err) {
        gomos.gomosLog(TRACE_DEBUG,"this err",err);  
          }
          var keyOfChannel = Object.keys(result[0].channel);
          var  arrayofChennel = []; 
      for(var i =0; i< keyOfChannel.length; i++){
        var json = {}
          json["businessName"] =  result[0].channel[keyOfChannel[i]].businessName;
          json["configName"] =  result[0].channel[keyOfChannel[i]].configName;
          arrayofChennel.push(json);
        }
        // gomos.gomosLog(TRACE_DEV,"this result",result);  
            // res.json(arrayofChennel)
            console.log("this result");
            console.log(result);
            socket.emit("FromAPI", result);
        
        });
    
    }
  )
    // socket.emit("FromAPI", temp);
  // } catch (error) {
  //   console.error(`Error: ${error.code}`);
  // }
};
server.listen(port, () => console.log(`Listening on port ${port}`));