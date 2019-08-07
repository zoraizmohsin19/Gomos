'use strict'
const mongoose = require("mongoose");
const g = require('../gConstant');
var gomos = require("../../../commanFunction/routes/commanFunction");

var  AggregatorSchema = new mongoose.Schema({
    DeviceName: {
        type: String,
        required: true
    },
    mac: {
        type: String,
        required: true
    },
    Date: {
        type: String,
        required: true
    },
    Day: {
        type: String,
        required: true
    },
    Week: {
        type: String,
        required: true
    },
    Month: {
        type: String,
        required: true
    },
    Year: {
        type: String,
        required: true
    },
    Hour: {
        type: String,
        required: true
    },
    bsName: {
        type: String,
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
//THIS IS CHEAKING DATA PRESENT OR NOT  IN Aggregation 
AggregatorSchema.statics.checkingDataAvailability = function (NAMEOFSERVICE,logger,gConsole,mac, Date, Hour) {
    let criteria = {mac,Date,Hour};
    gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," getDistictFactByMac in AggregationModel Criteria", criteria);
    return new Promise((resolve, reject) => {
        this.deleteMany(criteria).then( res =>{
          gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," getDistictFactByMac in AggregationModel Result", res);    
            resolve(res)

        }).catch(err => {
            gomos.errorCustmHandler(NAMEOFSERVICE, "checkingDataAvailability", 'This is find  Catch error getDistictFactByMac and  AggregationModel - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);
            gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," getDistictFactByMac in AggregationModel err", err);    
               
        })
    }).catch(err=> {
        gomos.errorCustmHandler(NAMEOFSERVICE, "checkingDataAvailability", 'This is Promise  Catch error getDistictFactByMac and  AggregationModel - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);

    })
  
}

module.exports = mongoose.model("AggregatedData", AggregatorSchema, "AggregatedData")