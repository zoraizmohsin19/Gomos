'use strict'
const mongoose = require("mongoose");
const schemaTypes = require("mongoose").Schema.Types;
let ServiceSchema = new mongoose.Schema({
    "comments": String,
    "factSrvc": Number,
    "alertSrvc": Number,
    "forwardNotification": Number,
    "aggrSrvc": schemaTypes.Mixed
});

ServiceSchema.methods.getFactSchValue = function(){
  return this.factSrvc;
}
ServiceSchema.methods.getAlertSchValue = function(){
    return this.alertSrvc;
}
ServiceSchema.methods.getForwardNotificationSchValue = function(){
    return this.forwardNotification;
}
ServiceSchema.methods.getAggregationSchValue = function(){
    return this.aggrSrvc.min;
}

ServiceSchema.statics.getServiceScheduleObjects = function () {
    return new Promise((resolve, reject) => {
        this.find((err, res) => {
            if (err) { reject(err) }
            resolve(res)
        })
    });
}


module.exports = mongoose.model("ServiceSchedules", ServiceSchema, "ServiceSchedules")
