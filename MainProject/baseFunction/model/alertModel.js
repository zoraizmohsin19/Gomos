'use strict'
const mongoose = require("mongoose");
const g = require('../commanUtilityFn/gConstant');
var gomos = require("../../../commanFunction/routes/commanFunction");
const schemaTypes = require("mongoose").Schema.Types;
var  AlertSchema = new mongoose.Schema({
    spCd: {
        type: String
       
    },
    custCd: {
        type: String
       
    },
    subCustCd: {
        type: String
       
    },
    mac: {
        type: String,
        required: true
    },
    DeviceName: {
        type: String,
        required: true
    },
    assetId: {
        type: String 
    },
    sourceMsg: {
        type:  schemaTypes.Mixed,
    },
    translatedMsg: {
        type: schemaTypes.Mixed, 
    },
    lasterrorString: {
        type: String 
    },
    lasterrorTime: {
        type: String 
    },
    numberOfAttempt: {
        type: Number 
    },
    remark: {
        type: String 
    },
    emailRecipientRole: {
        type: String,
       
    },
    sensorNm: {
        type: String,
       
    },
    businessNm: {
        type: String,
        
    },
    businessNmValues: {
        type: String,
       
    },
    shortName:{
        type: String
    },
    user:{
        type: String
    },
    type:{
        type: String,
        required: true
    },
    criteria:{
        type: String
    },
    alertText:{
        type: String
    },
    processed:{
        type: String
    }

    
}, {
timestamps: { createdAt: 'createdTime', updatedAt: 'updatedTime' }}
);




module.exports = mongoose.model("Alerts", AlertSchema, "Alerts")