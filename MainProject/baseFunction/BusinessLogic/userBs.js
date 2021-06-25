
'use strict'
const UsersModel = require("../model/usersModel");
const g = require('../commanUtilityFn/gConstant');
const gomos = require("../../../commanfunction/routes/commanFunction");



module.exports.activeUers = function (NAMEOFSERVICE,logger,gConsole,email) {
 
    return new Promise((resolve, reject) => {
      //  console.log("email",email)
        UsersModel.find({email: email, "status": "Y"}).then(res =>{
            // console.log("this is  called ", res)
           
            if(res.length == 1){
            gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG,"activeUsers query result", res);
            resolve({"status": true})
            }else{
              gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG,"activeUsers query result", res);
              resolve({"status": false}) 
            }
        }).catch(err => {
            gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," activeUsers error", err);
       gomos.errorCustmHandler(NAMEOFSERVICE, "activeBs", 'This is Catch error end of activeUsers - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);
       reject(err)
        })
    });
}



module.exports.getUsersBymac = function (NAMEOFSERVICE,logger,gConsole,mac) {
  return new Promise((resolve, reject) => {
    //  console.log("email",email)
      UsersModel.find({devicePreference:{"$elemMatch" :{mac: mac, pusNotification: true}} }).then(res =>{
           console.log("this is  getUsersBymac ", res)
         
        
          gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG,"activeUsers query result", res);
          resolve(res)
        
      }).catch(err => {
          gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," activeUsers error", err);
     gomos.errorCustmHandler(NAMEOFSERVICE, "activeBs", 'This is Catch error end of activeUsers - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);
     reject(err)
      })
  });
}
module.exports.updateUser = function (NAMEOFSERVICE,logger,gConsole,query,updateData) {
  return new Promise((resolve, reject) => {
    UsersModel.updateOne(query,updateData ).then(res =>{
          gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG,"updateUser Update result", res);
          resolve(res)
        
      }).catch(err => {
          gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," updateUser error", err);
     gomos.errorCustmHandler(NAMEOFSERVICE, "activeBs", 'This is Catch error end of updateUser - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);
     reject(err)
      })
  });
}