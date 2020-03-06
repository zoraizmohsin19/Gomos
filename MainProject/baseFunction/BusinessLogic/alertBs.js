'use strict'
const AlertModel = require('../model/alertModel');
const g = require('../commanUtilityFn/gConstant');
const gomos = require("../../../commanfunction/routes/commanFunction");

//THIS IS FTECH DATA PRESENT  FROM ALERTS . 
module.exports.fetchAlertLevel1 = function (NAMEOFSERVICE,logger,gConsole) {
    let criteria = { processed: "N", type: "level1" };
    gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," fetch all level1  Alerts  Criteria", criteria);
    return new Promise((resolve, reject) => {
        AlertModel.find(criteria).then( res =>{
          gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," fetched all level1  Alerts  Result", res);    
            resolve(res)

        }).catch(err => {
             gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," fetchAlertLevel1 in AlertModel err", err);    
            gomos.errorCustmHandler(NAMEOFSERVICE, "AlertModel", 'This is find  Catch error fetchAlertLevel1 and  Alert Model - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);
           
            reject(err); 
        })
    }).catch(err=> {
        gomos.errorCustmHandler(NAMEOFSERVICE, "AlertModel", 'This is Promise  Catch error fetchAlertLevel1 and  AlertModel - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);
      
    })
  
}

module.exports.updateAlertsSuccessL1 = function (NAMEOFSERVICE,logger,gConsole, objId) {
    return new Promise((resolve, reject) => {
        AlertModel.updateOne( { _id: objId },
            { $set: { processed: "Y" } },(err,res)=>{
                if(err){
                    gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," updateAlertsSuccessL1 in AlertModel err", err);    
                    gomos.errorCustmHandler(NAMEOFSERVICE, "AlertModel", 'This is find  Catch error fetchAlertLevel1 and  Alert Model - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);
                    reject(err); 
                }
             gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," fetched all level1  Alerts  Result", res);    
            resolve(res)

        })
    }).catch(err=> {
        gomos.errorCustmHandler(NAMEOFSERVICE, "AlertModel", 'This is Promise  Catch error fetchAlertLevel1 and  AlertModel - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);
      
    })
}


module.exports.updateAlertsErrorL1 = function (NAMEOFSERVICE,logger,gConsole, objId) {
    return new Promise((resolve, reject) => {
        AlertModel.updateOne( { _id: objId },
            { $set: { processed: "E" } },(err,res)=>{
                if(err){
                    gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," updateAlertsSuccessL1 in AlertModel err", err);    
                    gomos.errorCustmHandler(NAMEOFSERVICE, "AlertModel", 'This is find  Catch error fetchAlertLevel1 and  Alert Model - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);
                    reject(err); 
                }
             gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," fetched all level1  Alerts  Result", res);    
            resolve(res)

        })
    }).catch(err=> {
        gomos.errorCustmHandler(NAMEOFSERVICE, "AlertModel", 'This is Promise  Catch error fetchAlertLevel1 and  AlertModel - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);
      
    })
}

module.exports.saveAlert = function (NAMEOFSERVICE,logger,gConsole, alertObject) {
    return new Promise((resolve, reject) => {
        let alertInstance =  new AlertModel(alertObject);
        alertInstance.save((err,res)=>{
                if(err){
                    gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," saveAlert in AlertModel err", err);    
                    gomos.errorCustmHandler(NAMEOFSERVICE, "AlertModel", 'This is find  Catch error saveAlert and  Alert Model - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);
                    reject(err); 
                }
             gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," fetched all level1  saveAlert  Result", res);    
            resolve(res)

        })
    }).catch(err=> {
        gomos.errorCustmHandler(NAMEOFSERVICE, "AlertModel", 'This is Promise  Catch error saveAlert and  AlertModel - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);
      
    })
}