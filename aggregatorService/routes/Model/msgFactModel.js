'use strict'
const mongoose = require("mongoose");
const schemaTypes = require("mongoose").Schema.Types;
var gomos = require("../../../commanFunction/routes/commanFunction");
const g = require('../gConstant')

let MsgFactSchema = new mongoose.Schema({
    payloadId: {
        type: String,
        required: true
    },
    mac: {
        type: String,
        required: true
    },
    DeviceName: {
        type: String,
        required: true
    },
    subCustCd: {
        type: String,
        required: true
    },
    custCd: {
        type: String,
        required: true
    },
    spCd: {
        type: String,
        required: true
    },
    sensors: {
        type: schemaTypes.Mixed,
        required: true
    },
    DeviceTime: {
        type: Date,
        required: true
    },
    createdTime: {
        type: Date,
        required: true
    },
    updatedTime: {
        type: Date,
        required: true
    }
    
});

MsgFactSchema.statics.getDistictFactByMac = function (NAMEOFSERVICE,logger,gConsole,endRange,startRange) {
    let criteria = { DeviceTime: { $lt: new Date(endRange.toISOString()), $gte: new Date(startRange.toISOString()) }}
    gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," getDistictFactByMac in MsgFactModel criteria", criteria);
      return new Promise((resolve, reject) => {
            this.find(criteria).distinct("mac").then(res => {
               gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," getDistictFactByMac in MsgFactModel Result", res);
                resolve(res)
            }).catch(err =>{
                gomos.errorCustmHandler(NAMEOFSERVICE, "getDistictFactByMac", 'This is query error getDistictFactByMac and msgFactModel - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);
               reject(err)
            })
        }).catch(err=> {
            gomos.errorCustmHandler(NAMEOFSERVICE, "getDistictFactByMac", 'This is Catch error of getDistictFactByMac and  msgFactModel - ', ` `, err,g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);
        })
  }

MsgFactSchema.statics.getAggragateSensors = function (NAMEOFSERVICE,logger,gConsole,mac, endTime, startTime, bsName) {
  let criteria  =  { mac: mac, DeviceTime: { $lt: new Date(endTime), $gte: new Date(startTime) } }
  console.log("arraBsName",bsName);
      gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," getAggragateSensors in MsgFactModel Criteria", criteria);

        return new Promise((resolve, reject) => {
            this.aggregate([
                { $match:criteria},
                {
                  $group: {
                    _id: "$mac",
                    Max: { $max: `$sensors.${bsName}` },
                    Min: { $min: `$sensors.${bsName}` },
                    Avg: { $avg: `$sensors.${bsName}` },
                    Sum: { $sum: `$sensors.${bsName}` },
                    Count: { $sum: 1 }
                  }
        
                }
              ]).then( (result) => {
                gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," getAggragateSensors in MsgFactModel Result", result);
                resolve(result)
            }).catch( err =>{
                gomos.errorCustmHandler(NAMEOFSERVICE, "getAggragateSensors", 'This is Catch error rejection of getAggragateSensors and  msgFactModel - ', ` `, err, g.ERROR_DATABASE,g.ERROR_TRUE, g.EXIT_FALSE);
                reject(err)
            } )
        }).catch(err=>{
            gomos.errorCustmHandler(NAMEOFSERVICE, "getAggragateSensors", 'This is Catch error end of getAggragateSensors and  msgFactModel - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE); 
        });
}

MsgFactSchema.statics.getAggragateChannel =  function(NAMEOFSERVICE, logger, gConsole, mac, endRange, startRange, bsName){
    let criteria = { mac: mac, DeviceTime: { $lt: new Date(endRange), $gte: new Date(startRange) } }
    criteria[`sensors.${bsName}`] = { $exists: true }
    gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," getAggragateChannel in MsgFactModel Criteria", criteria);
    return new Promise ( async (resolve, reject)=> {
     this.find(criteria).sort({ "DeviceTime": 1 }).then( res => 
        {
           gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," getAggragateChannel in MsgFactModel Result", res);    
            resolve(res)
        } ).catch(err => {
            gomos.errorCustmHandler(NAMEOFSERVICE, "getAggragateChannel", 'This is Catch error rejection of getAggragateChannel and  msgFactModel - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE); 
            reject(err)
            });

    }).catch(err =>{
        gomos.errorCustmHandler(NAMEOFSERVICE, "getAggragateChannel", 'This is Catch error end of getAggragateChannel and  msgFactModel - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE); 
    })
}

MsgFactSchema.statics.getlastTimeForOn = function(NAMEOFSERVICE, logger, gConsole, mac, bsName, inputTime) {
    return new Promise((resolve, reject) => {
      let criteria = { mac: mac, DeviceTime: { $lt: new Date(inputTime) }}
      criteria[`sensors.${bsName}`] = { $exists: true }
  
     gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," getlastTimeForOn in MsgFactModel Criteria", criteria);
      
        this.find(criteria).sort({ "DeviceTime": -1 }).limit(1)
        .then(result =>{
            gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," getlastTimeForOn in MsgFactModel Result", result);
            resolve(result);
        }).catch(err => {
            gomos.errorCustmHandler(NAMEOFSERVICE, "getlastTimeForOn", 'This is Catch error rejection of getlastTimeForOn and  msgFactModel - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE); 
            reject(err)
        })
    }).catch(err => {
        gomos.errorCustmHandler(NAMEOFSERVICE, "getlastTimeForOn", 'This is Catch error end of getlastTimeForOn and  msgFactModel - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE); 
    })
  }


module.exports = mongoose.model("MsgFacts", MsgFactSchema, "MsgFacts")