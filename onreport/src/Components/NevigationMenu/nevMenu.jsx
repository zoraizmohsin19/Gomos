import React, { Component } from 'react';
import './NevMenu.css';
import 'react-datepicker/dist/react-datepicker.css';
import swal from 'sweetalert';
import axios from "axios";
import {DropdownButton,MenuItem} from 'react-bootstrap';
import {NavItem ,Nav} from "react-bootstrap"
import URL from "../../Common/confile/appConfig.json";
// import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
class NevMenu extends Component {
    constructor(){
        super();
        this.state = {
          Menu: {
            spCd : [],
            custCd: [],
            subCustCd: [],
            sensorNm:[],
            ArrayOfSPs: [],
            ArrayOfCusts: [],
            ArrayofAsset: [],
            ArrayofDevice: [],
            ArrayOfSubCusts:[],
            DeviceMacArray: [],
            operations: [],
            tableDataToSend: [],
            selectedSPValue:'',
            selectedCustValue :'',
            selectedSubCustValue:'',
            selectedAssetValue: '',
            selectedDeviceValue: '',
            selectedMac: "",
            spDisable: null,
            custDisable: null,
            subCustDisable: null,
            assetDisable: null,
            deviceDisable: null,
            ActiveDashBoardEnable:Boolean,
            OpratingDashBoardEnable: Boolean
          }
        }
        
        }
    //THIS IS COMMON METHOD FOR INPUT FIELD FOR SETTING STATE
   onChange = e => this.setState({ [e.target.name]: e.target.value });
//ON PAGE LOAD DATA FETCH FROM SERVER FOR ALL SERVICE PROVIDER
componentDidMount() {
  var me = this;
  var configData = JSON.parse(sessionStorage.getItem("configData"));
  var mainData = JSON.parse(sessionStorage.getItem("userDetails"));
  var sessionData = mainData[0].serviceProviders.split(",");
  var ActiveData = JSON.parse(sessionStorage.getItem("configData"));
  var dashboardConfigobjData = JSON.parse(sessionStorage.getItem("dashboardConfigobj"));
  var AspCd = ActiveData.spCd;
  var AcustCd = ActiveData.custCd;
  var AsubCustCd = ActiveData.subCustCd;
  var Aasset = ActiveData.assetId;
  // var Adevice = ActiveData.Devices;
  this.state.Menu.selectedSPValue = AspCd;
  this.state.Menu.selectedCustValue = AcustCd;
  this.state.Menu.selectedSubCustValue = AsubCustCd;
  this.state.Menu.selectedAssetValue = Aasset;
  this.state.Menu.selectedDeviceValue = ActiveData.DeviceName;
  this.state.Menu.selectedMac = ActiveData.mac;
  this.state.Menu.ActiveDashBoardEnable = dashboardConfigobjData.ActiveDashBoardEnable;
  this.state.Menu.OpratingDashBoardEnable =  dashboardConfigobjData.OpratingDashBoardEnable
  this.setState({Menu : this.state.Menu});

   
  if (sessionData.length == 1 && sessionData[0] == "ALL") {
      fetch(`${URL.IP}:3992/getRegisterSP`)
      .then(response => response.json())
      .then(json =>  {
      var spCd =  json.map( x =>  { return  x.spCd  });
      this.state.Menu.spCd = spCd;
      this.setState({Menu : this.state.Menu});
      }
      ); 
}
 else {
      var  spCd = []
      for (var i = 0; i < sessionData.length; i++) {
        spCd.push(sessionData[i]);
      }
      if(spCd.length == 1){
        this.state.Menu.spDisable = true;
        this.setState({Menu : this.state.Menu});
      }
      this.state.Menu.spCd = spCd;
      this.setState({Menu : this.state.Menu});
    }

    var customers = mainData[0].customers.split(",");
    var custCd = [];
    if (customers.length == 1 && customers[0] == "ALL") {
        fetch(`${URL.IP}:3992/getCustomers?spCode=` + AspCd)
        .then(response => response.json())
        .then(json =>  {
        var custCd =  json.map( x =>  { return  x._id  });
    
        this.state.Menu.custCd = custCd;
        this.setState({Menu : this.state.Menu});
        });
    }
    else{
    for (var i = 0; i < customers.length; i++) {
         custCd.push(customers[i]);

    }
    // if(custCd.length == 1){
    //   this.state.Menu.custDisable = true;
    //   this.setState({Menu : this.state.Menu});
    // }
    this.state.Menu.custCd = custCd;
    this.setState({Menu : this.state.Menu});
    }
      var subCustomers = mainData[0].subCustomers.split(",");
      var subCustCd= [];
    if (subCustomers.length == 1 && subCustomers[0] == "ALL") {
        fetch(`${URL.IP}:3992/getSubCustomers?spCode=` + AspCd +
        "&&custCd=" + AcustCd )
        .then(response => response.json())
        .then(json =>  {
        var subCustCd =  json.map( x =>  { return  x._id  });
        //console.log(subCustCd);
        this.state.Menu.subCustCd = subCustCd;
        this.setState({Menu : this.state.Menu});

    });
    }
    else{
        for (var i = 0; i < subCustomers.length; i++) {
          subCustCd.push(subCustomers[i]);
    }
    // if(subCustCd.length == 1){
    //   this.state.Menu.subCustDisable = true;
    //   this.setState({Menu : this.state.Menu});
    // }
    this.state.Menu.subCustCd = subCustCd;
    this.setState({Menu : this.state.Menu});
    }

    var Assets = mainData[0].Assets.split(",");
    var Assetsdata= [];
    if (Assets.length == 1 && Assets[0] == "ALL") {
      axios.post(`${URL.IP}:3992/getAssetsNav` , {subCustCd:AsubCustCd})
  
    .then(json =>  {
        let Assetsdata =  json["data"].arrOfAssets;
        // console.log(json)
        // alert(json.ClientObj)
        sessionStorage.setItem("ClientObj", JSON.stringify(json["data"].ClientObj));

        this.state.Menu.ArrayofAsset = Assetsdata;
        this.setState({Menu : this.state.Menu});
  });
  }
  else{
    for (var i = 0; i < Assets.length; i++) {
      Assetsdata.push(Assets[i]);
}
//     if(Assetsdata.length == 1){
//       this.state.Menu.assetDisable = true;
//       this.setState({Menu : this.state.Menu});
// }
    this.state.Menu.ArrayofAsset = Assetsdata;
    this.setState({Menu : this.state.Menu});
 }


 var Devices = mainData[0].Devices.split(",");
 var Devicesdata= [];
 var DeviceMacArray = [];
 if (Devices.length == 1 && Devices[0] == "ALL") {
 fetch(`${URL.IP}:3992/getDevice?assetId=`+Aasset )
 .then(response => response.json())
 .then(json =>  {
  var Devicesdata =  json.map(item => {return item.DeviceName});
  var DeviceMacArray =  json.map(item => {return item.mac});
me.state.Menu.ArrayofDevice = Devicesdata;
me.state.Menu.DeviceMacArray = DeviceMacArray;
me.state.Menu.selectedDeviceValue = Devicesdata[0];
me.state.Menu.selectedMac = DeviceMacArray[0];
me.setState({Menu : me.state.Menu});
var temp = {
  mac :  DeviceMacArray[0],
  DeviceName : Devicesdata[0],
  spCd : me.state.Menu.selectedSPValue,
  custCd: me.state.Menu.selectedCustValue,
  subCustCd:me.state.Menu.selectedSubCustValue,
  assetId: me.state.Menu.selectedAssetValue
}
sessionStorage.setItem("configData", JSON.stringify(temp));

});
}
else{
 for (var i = 0; i < Devices.length; i++) {
  Devicesdata.push(Devices[i]);
}
// for (var i = 0; i < sessionData.length; i++) {
//   DeviceMacArray.push(sessionData[i].mac);
// }
me.state.Menu.ArrayofDevice = Devicesdata;
me.state.Menu.DeviceMacArray = DeviceMacArray;
me.state.Menu.selectedDeviceValue = Devicesdata[0];
me.state.Menu.selectedMac = DeviceMacArray[0];
me.setState({Menu : me.state.Menu});
var temp = {
  mac :  configData.mac,
  DeviceName :configData.DeviceName,
  spCd : me.state.Menu.selectedSPValue,
  custCd: me.state.Menu.selectedCustValue,
  subCustCd:me.state.Menu.selectedSubCustValue,
  assetId: me.state.Menu.selectedAssetValue
}
sessionStorage.setItem("configData", JSON.stringify(temp));

}

}
  //This For handler for Service Provider
  handleSp = (value) => {
  var me = this;
  me.getCustomer(value)
  me.state.Menu.custDisable = null;
  me.state.Menu.selectedSPValue = value;  
  me.setState({Menu : me.state.Menu});
 
  }
  //This IS FOR HANDLE CUSTOMER 
  handleCutMr =(value) =>{
    var me = this;
    const {selectedSPValue} = this.state.Menu;
    // // // alert(e.target.value + "customer")
    this.getSubCustmer(selectedSPValue, value  );
    me.state.Menu.subCustDisable = null;
    me.state.Menu.selectedCustValue = value;
    me.setState({Menu : me.state.Menu});
    
   }
   //THIS IS FOR HANDLE SUBCUSTOMER
   handleSubCs =(value) =>{
     var me = this;
    this.getAsset(value)
    me.state.Menu.assetDisable = null;
    me.state.Menu.selectedSubCustValue = value;
    me.setState({Menu : me.state.Menu});
   }
   handleAsset =(value) =>{
     var me = this;
    this.getDevice(value);
    me.state.Menu.deviceDisable = null;
    me.state.Menu.selectedAssetValue = value;
    me.setState({Menu : me.state.Menu});
   }
   handleDevice =(value) =>{
    var me = this;
    const {selectedSPValue,selectedCustValue,selectedSubCustValue} = this.state;
    me.state.Menu.selectedDeviceValue = value;
    var index = me.state.Menu.ArrayofDevice.findIndex(item => item == value);
    var mac = me.state.Menu.DeviceMacArray[index];
    me.setState({Menu : me.state.Menu});
    var temp = {
      mac :mac,
      DeviceName : value,
      spCd : me.state.Menu.selectedSPValue,
      custCd: me.state.Menu.selectedCustValue,
      subCustCd:me.state.Menu.selectedSubCustValue,
      assetId: me.state.Menu.selectedAssetValue
    }
    sessionStorage.setItem("configData", JSON.stringify(temp));
   }

//THIS METHOD FOR GET CUSTOMER CODE
    getCustomerApi(SendForSp){
    var me = this;
    var mainData = JSON.parse(sessionStorage.getItem("userDetails"));
    var sessionData = mainData[0].customers.split(",");
     var custCd = [];
    if (sessionData.length == 1 && sessionData[0] == "ALL") {
      fetch(`${URL.IP}:3992/getCustomers?spCode=` + SendForSp)
    .then(response => response.json())
    .then(json =>  {
    var custCd =  json.map( x =>  { return  x._id  });
    me.state.Menu.custCd = custCd;
    // console.log("This is Console")
    // console.log(custCd)
    // console.log(SendForSp)
    // console.log(custCd[0])
    me.getSubCustmer(SendForSp, custCd[0]);
    me.state.Menu.selectedCustValue = custCd[0] ;
    me.setState({Menu : me.state.Menu});
  
   });
  }
  else{
    for (var i = 0; i < sessionData.length; i++) {
      custCd.push(sessionData[i]);
    }
    this.setState({custCd: custCd, selectedCustValue:custCd[0] });
    me.state.Menu.custCd = custCd;
    me.state.Menu.selectedCustValue = custCd[0];
    me.setState({Menu : me.state.Menu});
    me.getSubCustmer(SendForSp, custCd[0]);
  }

    }
  // THIS METHOD FOR SELECT CUSTOMER CODE BASED ON SERVICE PROVIDER
  getCustomer(selectedSPValue){
      this.getCustomerApi(selectedSPValue)
  }
  //THIS IS  API FOR GET SUBCUSTOMER BASED ON SERVICE PROVIDER AND CUSTOMER CODE
  getSubCustomerApi(SendForSp,SendFroCustCD){
        var me = this;
        var mainData = JSON.parse(sessionStorage.getItem("userDetails"));
          
        var sessionData = mainData[0].subCustomers.split(",");
        var subCustCd= [];
        if (sessionData.length == 1 && sessionData[0] == "ALL") {
        fetch(`${URL.IP}:3992/getSubCustomers?spCode=` + SendForSp +
        "&&custCd=" + SendFroCustCD )
        .then(response => response.json())
        .then(json =>  {
        var subCustCd =  json.map( x =>  { return  x._id  });
        //console.log(SendForSp)
        //console.log(SendFroCustCD)
        //console.log(subCustCd)
        this.getAsset(subCustCd[0])
        me.state.Menu.subCustCd = subCustCd;
        me.state.Menu.selectedSubCustValue = subCustCd[0];
        me.setState({Menu : me.state.Menu});
        
        });
        }
        else{
          for (var i = 0; i < sessionData.length; i++) {
            subCustCd.push(sessionData[i]);
          }
          me.state.Menu.subCustCd = subCustCd;
          me.state.Menu.selectedSubCustValue = subCustCd[0];
          me.setState({Menu : me.state.Menu});
          this.getAsset(subCustCd[0])
        }
        
  }
  //THIS IS FOR SELECTION OF SUB-CUSTOMER BASED ON SERVICE PROVIDER AND CUSTOMER CODE
  getSubCustmer(selectedSPValue, selectedCustValue){
      this.getSubCustomerApi(selectedSPValue,selectedCustValue)
}
//THIS IS GET ASSET BASED CRITERIA
getAsset(subCutomerValue){
this.getAssetApi(subCutomerValue);
}
//THIS IS GET DEVICE 
getDevice(Asset){
  this.getDeviceApi(Asset);
}
//THIS API FOR GET ALL ASSET 
getAssetApi(SubCustomer){
  var me = this;
  var mainData = JSON.parse(sessionStorage.getItem("userDetails"));
          
  var sessionData = mainData[0].Assets.split(",");
  var Assets= [];
  if (sessionData.length == 1 && sessionData[0] == "ALL") {
    axios.post(`${URL.IP}:3992/getAssetsNav` , {subCustCd:SubCustomer})
  
  .then(json =>  {
  var Assets =   json["data"].arrOfAssets;
  me.state.Menu.ArrayofAsset = Assets;
  me.state.Menu.selectedAssetValue = Assets[0];
  sessionStorage.setItem("ClientObj", JSON.stringify(json["data"].ClientObj));
//console.log(json["data"])
  me.setState({Menu : me.state.Menu});
  this.getDevice(Assets[0])
});
}
else{
  for (var i = 0; i < sessionData.length; i++) {
    Assets.push(sessionData[i]);
  }
  me.setState({ArrayofAsset: Assets, selectedAssetValue: Assets[0] });
  me.state.Menu.ArrayofAsset = Assets;
  me.state.Menu.selectedAssetValue = Assets[0];
  me.setState({Menu : me.state.Menu});
  this.getDevice(Assets[0])

}
// this.getDevice(Assets[0])
}

getDeviceApi(Asset){
  var me = this;
  var mainData = JSON.parse(sessionStorage.getItem("userDetails"));
  var configData = JSON.parse(sessionStorage.getItem("configData"));
  var sessionData = mainData[0].Devices.split(",");
  var Devicesdata= [];
  var DeviceMacArray = [];
  if (sessionData.length == 1 && sessionData[0] == "ALL") {
  fetch(`${URL.IP}:3992/getDevice?assetId=`+Asset )
  .then(response => response.json())
  .then(json =>  {
    var Devicesdata =  json.map(item => {return item.DeviceName});
    var DeviceMacArray =  json.map(item => {return item.mac});
  this.state.Menu.ArrayofDevice = Devicesdata;
  this.state.Menu.DeviceMacArray = DeviceMacArray;
  this.state.Menu.selectedDeviceValue = Devicesdata[0];
  this.state.Menu.selectedMac = DeviceMacArray[0];
  this.setState({Menu : this.state.Menu});
  var temp = {
    mac :  DeviceMacArray[0],
    DeviceName : Devicesdata[0],
    spCd : me.state.Menu.selectedSPValue,
    custCd: me.state.Menu.selectedCustValue,
    subCustCd:me.state.Menu.selectedSubCustValue,
    assetId: me.state.Menu.selectedAssetValue
  }
  sessionStorage.setItem("configData", JSON.stringify(temp));
});
}
else{
  for (var i = 0; i < sessionData.length; i++) {
    Devicesdata.push(sessionData[i].DeviceName);
  }
  // for (var i = 0; i < sessionData.length; i++) {
  //   DeviceMacArray.push(sessionData[i].mac);
  // }
  this.state.Menu.ArrayofDevice = Devicesdata;
  this.state.Menu.DeviceMacArray = DeviceMacArray;
  this.state.Menu.selectedDeviceValue = configData.DeviceName;
  this.state.Menu.selectedMac = configData.mac;
  this.setState({Menu : this.state.Menu});
  var temp = {
    mac :  DeviceMacArray[0],
    DeviceName : Devicesdata[0],
    spCd : me.state.Menu.selectedSPValue,
    custCd: me.state.Menu.selectedCustValue,
    subCustCd:me.state.Menu.selectedSubCustValue,
    assetId: me.state.Menu.selectedAssetValue
  }
  sessionStorage.setItem("configData", JSON.stringify(temp));
}


}
  render() {
    const {Disabledsubmit,spCd,custCd,subCustCd,sensorNm,operations,dynInput,ArrayofAsset, ArrayofDevice} = this.state.Menu;
          return (
            <div className=" container">
                
            <div className="row">
              <div className="card2">
                    <div className=" divbac ">
                    {/* <form onSubmit={this.onSubmit} > */}
                     <div className="row">
                     <div className="col-sm-3">
                     <label className="text-center">SERVICE PROVIDER</label>
                    <div className= "divmanueDrop1">
                     <DropdownButton  className = ""  onSelect={this.handleSp}
                      disabled = {this.state.Menu.spDisable}
                        bsStyle={"white"}
                        title={this.state.Menu.selectedSPValue || "SERVICE PROVIDER"}>
                        {spCd.map( (item) =>
                        <MenuItem eventKey={item}>{item}</MenuItem>
                        )}
                        </DropdownButton>
                        </div>
                     </div>
                     <div className="col-sm-3">
                     <label className="text-center">SERVICE CUSTOMER</label>
                     <div className= "divmanueDrop1">
                     <DropdownButton  className = ""  onSelect={this.handleCutMr}
                      disabled = {this.state.Menu.custDisable}
                        bsStyle={"white"}
                        title={this.state.Menu.selectedCustValue || "CUSTOMER"}>
                        {custCd.map( (item) =>
                        <MenuItem eventKey={item}>{item}</MenuItem>
                        )}
                        </DropdownButton>
                        </div>
                     </div>
                     <div className="col-sm-3">
                     <label className="text-center">SERVICE SUBCUSTOMER</label>
                     <div className= "divmanueDrop1">
                     <DropdownButton  className = ""  onSelect={this.handleSubCs}
                      disabled = {this.state.Menu.subCustDisable}
                        bsStyle={"white"}
                        title={this.state.Menu.selectedSubCustValue || "SUBCUSTOMER"}>
                        {subCustCd.map( (item) =>
                        <MenuItem eventKey={item}>{item}</MenuItem>
                        )}
                        </DropdownButton>
                        </div>
               
                     </div>
                     {/* <div className="col-sm-3">
                     <div className= "divmanueDrop">
                     <DropdownButton  className = ""  onSelect={this.handleAsset}
                      disabled = {this.state.Menu.assetDisable}
                        bsStyle={"white"}
                        title={this.state.Menu.selectedAssetValue || "SELECT THE ASSET" }>
                        {ArrayofAsset.map( (item) =>
                        <MenuItem eventKey={item}>{item}</MenuItem>
                        )}
                        </DropdownButton>
                        </div>
                     </div>
                     <div className="col-sm-3">
                     <div className= "divmanueDrop">
                     <DropdownButton  className = ""  onSelect={this.handleDevice}
                      disabled = {this.state.Menu.deviceDisable}
                        bsStyle={"white"}
                        title={this.state.Menu.selectedDeviceValue || "SELECT THE DEVICE" }>
                        {ArrayofDevice.map( (item) =>
                        <MenuItem eventKey={item}>{item}</MenuItem>
                        )}
                        </DropdownButton>
                        </div>
                     </div> */}
                        </div>
                        <div className="row"><div className="col-lg-12">
                        <p className= "line2"></p>
          <div className="width1">
          <label className="text-center">SELECT ASSETS</label>
           <Nav bsStyle="pills"  disabled = {this.state.Menu.assetDisable} activeKey={this.state.Menu.selectedAssetValue} onSelect={this.handleAsset}>
         { ArrayofAsset.map(item =>  
          <NavItem eventKey={item} >
           {item}
          </NavItem>
         )}
        </Nav>    
         </div> 
        <p className= "line2"></p>
         <div className="width1">
         <label className="text-center">SELECT DEVICES </label>
      <Nav bsStyle="pills" activeKey={this.state.Menu.selectedDeviceValue} 
       disabled = {this.state.Menu.deviceDisable}
      onSelect={this.handleDevice}>
          { ArrayofDevice.map(item =>  
            <NavItem eventKey={item} >
            {item}
            </NavItem>
          )}

        </Nav>
         </div>
                        </div></div>
                        <div className="row">
                     <div className="col-sm-3">
                  
                     </div> 
                     <div className="col-sm-6">
                     <div className= "sensors">
                     <div className= "senosrs">
                     </div>
                     </div>
                     </div>
                     </div>
                     <div className="row">
                  <div className="col-sm-12 col-lg-12">
                     <div className="pull-right">
                     {/* <div class="btn-group btn-group-sm"> */}
                    {(this.state.Menu.ActiveDashBoardEnable)? <button   className="btn btn-success ml-1 "onClick={() =>{ 
                         this.props.history.push("/socketdashbord")
                            
                           }} hidden>View Dashboard</button>: ""}
                         {(this.state.Menu.OpratingDashBoardEnable)?  <button  className="btn btn-success ml-1 " onClick={() =>{ 
                         this.props.history.push("/activeDashbord")
                            
                           }}>Operating Dashboard</button>
                          : ""}
                           {/* </div> */}
                         
                     </div>
                     </div>
                     </div>
                      {/* </form> */}
                    </div>
                  </div>
             </div>
        
          </div>
         
          );
        }
    }

export default NevMenu;
