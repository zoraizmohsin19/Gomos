'user strict'
const mongoose = require("mongoose");
const schemaTypes = require("mongoose").Schema.Types;
var gomos = require("../../../commanFunction/routes/commanFunction");
const g = require('../commanUtilityFn/gConstant')

var DevicesSchema = new mongoose.Schema({
    DeviceName: {
        type: String,
        required: true
    },
    mac: {
        type: String,
        required: true
    },
    assetId: {
        type: String,
        required: true
    },
    deviceTemplate: {
        type: String,
        required: true
    },
    subCustCd: {
        type: String,
        required: true
    },
    active: {
        type: String,
        required: true
    },
    sensors: {
        type: schemaTypes.Mixed,
        required: true
    },
    channel: {
        type: schemaTypes.Mixed,
        required: true
    }
    
});


DevicesSchema.statics.readAllDevices = function (NAMEOFSERVICE,logger,gConsole) {

    return new Promise((resolve, reject) => {
        this.find().then(res =>{
          gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," readAllDevices in DeviceModel result", res);
            resolve(res)
        }).catch(err => {
            gomos.gomosLog(logger,gConsole,g.TRACE_DEBUG," readAllDevices in DeviceModel err", err);
       gomos.errorCustmHandler(NAMEOFSERVICE, "readAllDevices", 'This is Catch error end of readAllDevices and  DeviceModle - ', ` `, err, g.ERROR_DATABASE, g.ERROR_TRUE, g.EXIT_FALSE);
        })
    });
}

module.exports = mongoose.model("Devices", DevicesSchema, "Devices")