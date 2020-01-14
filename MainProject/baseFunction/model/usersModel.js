'user strict'
const mongoose = require("mongoose");
const schemaTypes = require("mongoose").Schema.Types;
var gomos = require("../../../commanfunction/routes/commanFunction");
const g = require('../commanUtilityFn/gConstant')

var UsersSchema = new mongoose.Schema({
    dashboardConfigId: {
        type: schemaTypes.Mixed,
        
    },
    clientID: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    spCds: {
        type: String,
        required: true
    },
    custCds: {
        type: String
       
    },
    subCustCds: {
        type: String,
        required: true
    },
    Assets: {
        type: String
    
    },
    Devices: {
        type: String
       
    },
    userFN: {
        type: String
   
    },
    userLN: {
        type: String
       
    },
    Devicepreference: {
     type: schemaTypes.Mixed
    },
    subscription: {
        type: schemaTypes.Mixed
    },

    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
   ,
   status: {
    type: String,
    required: true
}

    
});





module.exports = mongoose.model("Users", UsersSchema, "Users")