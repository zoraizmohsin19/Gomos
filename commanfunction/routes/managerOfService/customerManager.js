
let CustJson = require("../getCustomer");


exports.CustomerManager = function(db,NAMEOFSERVICE,logger,gConsole){
       
    
    this.Initialize = function (){
    return CustJson.getCustomers(db,NAMEOFSERVICE,logger,gConsole);
    }
this.Temp = 1;
this.fn = function (){
  console.log("Temp Is called")
}

}




