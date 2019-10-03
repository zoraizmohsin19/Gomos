
'use strict'
const DeviceModel = require("../model/deviceModel");
const g = require('../commanUtilityFn/gConstant');
const gomos = require("../../../commanFunction/routes/commanFunction");

module.exports.fetchDeviceBymac = function (NAMEOFSERVICE,logger,gConsole,mac) {
 
    return new Promise((resolve, reject) => {
        DeviceModel.find({mac}).then(res =>{
          gomos.gomosLog(logger,gConsole,g.TRACE_TEST,"fetchDeviceBymac in DeviceModel result length", res.length);
          gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG,"fetchDeviceBymac in DeviceModel result", res);
            resolve(res)
        }).catch(err => {
            gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," fetchDeviceBymac in DeviceModel err", err);
       gomos.errorCustmHandler(NAMEOFSERVICE, "fetchDeviceBymac", 'This is Catch error end of fetchDeviceBymac and  DeviceModle - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);
       reject(err)
        })
    });
}

module.exports.fetchDeviceBysubCustCd = function (NAMEOFSERVICE,logger,gConsole,subCustCd) {
 
    return new Promise((resolve, reject) => {
        DeviceModel.find({subCustCd: subCustCd}).then(res =>{
          gomos.gomosLog(logger,gConsole,g.TRACE_TEST,"fetchDeviceBysubCustCd in DeviceModel result length", res.length);
          gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG,"fetchDeviceBysubCustCd in DeviceModel result", res);
            resolve(res)
        }).catch(err => {
            gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," fetchDeviceBysubCustCd in DeviceModel err", err);
       gomos.errorCustmHandler(NAMEOFSERVICE, "fetchDeviceBysubCustCd", 'This is Catch error end of fetchDeviceBysubCustCd and  DeviceModle - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);
       reject(err)
        })
    });
}

