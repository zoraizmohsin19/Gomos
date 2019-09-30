'use strict'
const ServiceSchedules = require('./serviceSchedleModel');
var gomosSrvDefn;

module.exports.initialize = async function(){

        let arrObject =  await ServiceSchedules.find();
        gomosSrvDefn = new ServiceSchedules(arrObject[0]);
      return  gomosSrvDefn;
 
}
// class ServiceScheduleManager {
//     constructor(){

//     }

//    static async initialize(){

//         let arrObject =  await ServiceSchedules.find();
//         gomosSrvDeff = new ServiceSchedules(arrObject[0]);
//       return  gomosSrvDeff;
 
// }


// }
// module.exports = ServiceScheduleManager;



