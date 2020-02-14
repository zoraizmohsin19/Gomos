'use strict'
const mongoose = require("mongoose");
const g = require('../commanUtilityFn/gConstant');
var gomos = require("../../../commanfunction/routes/commanFunction");
const schemaTypes = require("mongoose").Schema.Types;
var  AlertsConfigSchema = new mongoose.Schema({
    spCd: {
        type: String
       
    },
    custCd: {
        type: String
       
    },
    subCustCd: {
        type: String
       
    },
    sensorNm: {
        type: String,
       
    },
    businessNm: {
        type: String,
        
    },
    configBNm: {
        type: String,
       
    },
    user:{
        type: String
    },
    shortName:{
        type: String
    },
   
    type:{
        type: String,
        required: true
    },
    criteria:{
        type: String
    },
    emailRecipientRole: {
        type: schemaTypes.Mixed,
       
    },
    alertText:{
        type: String
    },
   
    dtTime:{
        type: String
    }   
    
});




module.exports = mongoose.model("AlertsConfig", AlertsConfigSchema, "AlertsConfig")