'use strict'
const AlertsConfigModel = require('../model/alertsConfigModel');
const g = require('../commanUtilityFn/gConstant');
const gomos = require("../../../commanFunction/routes/commanFunction");

module.exports.getAlertConfigsdetails = function (NAMEOFSERVICE,logger,gConsole) {
    let criteria = {"type": "level1","alertTriggeredBy": "deviceActivity" };
    gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," fetch all alertConfig ", criteria);
    return new Promise((resolve, reject) => {
        AlertsConfigModel.find(criteria).then( res =>{
          gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," fetch all alertConfig  Result", res);    
            resolve(res)

        }).catch(err => {
             gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," fetch all alertConfig  err", err);    
            gomos.errorCustmHandler(NAMEOFSERVICE, "AlertsConfigbs", 'This is find  Catch error alertConfig  - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);
           
            reject(err); 
        })
    }).catch(err=> {
        gomos.errorCustmHandler(NAMEOFSERVICE, "AlertsConfigbs", 'This is Promise  Catch error alertConfig  - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);
      
    })
  
}