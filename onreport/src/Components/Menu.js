import React, { Component } from 'react';
// import logo from './logo.svg';
import './Menu.css';
import Header from "../layout/Header"
import SelectionInput from '../layout/SelectionInput';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
// import TableCom from './Components/TableCom'
// import Table from 'react-responsive-data-table';
import * as FileSaver from "file-saver";
import * as ExcelJs from "exceljs/dist/exceljs.min.js";
import swal from 'sweetalert';
import {DropdownButton,MenuItem} from 'react-bootstrap';
import dateFormat  from  "dateformat";
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import URL from "../Common/confile/appConfig.json";

class Menu extends Component {
    constructor(){
        super();
        this.state = {
            spCd : [],
            custCd: [],
            subCustCd: [],
            sensorNm:[],
            ArrayOfSPs: [],
            ArrayOfCusts: [],
            ArrayofAsset: [],
            ArrayofDevice: [],
            ArrayOfSubCusts:[],
            operations: [],
            tableDataToSend: [],
            result: [],
            selectedSPValue:'',
            selectedCustValue :'',
            selectedSubCustValue:'',
            selectedAssetValue: '',
            selectedDeviceValue: '',
            selectedSensorValueArray: [],
            operationSelected: '',
            endRange: '',
            startRange: '',
            equalsValue: '',
            spDisable: true,
            custDisable: true,
            subCustDisable:  true,
            assetDisable: true,
            deviceDisable: true,
            sensorDisable : true,
            parameterDisable : true,
            disableFromDt: true,
            disableToDt : true,
            unabledatepiker:true,
            Disabledsubmit: true,
            DynamicInput: '',
            startDate: moment(),
            endDate :  moment(),
            // options : [
            //   { label: 'Thing 1', value: 1},
            //   { label: 'Thing 2', value: 2},
            // ]
        }
        this.handleOperation = this.handleOperation.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChange2 = this.handleChange2.bind(this);
    }
    //THIS IS COMMON METHOD FOR INPUT FIELD FOR SETTING STATE
   onChange = e => this.setState({ [e.target.name]: e.target.value });
   //THIS FOR START DATE VALUE SET IN STATE
   handleChange(date) {
    this.setState({
      startDate: date
    });
  }
  //THIS FOR END DATE VALUE SET IN STATE
  handleChange2(date) {
    this.setState({
      endDate: date
    });
  }
//ON PAGE LOAD DATA FETCH FROM SERVER FOR ALL SERVICE PROVIDER
componentDidMount() {
  try {
    var configData = JSON.parse(sessionStorage.getItem("configData"));
    var userDetails = JSON.parse(sessionStorage.getItem("userDetails"));
    var spData = userDetails[0].serviceProviders.split(",");
if(spData.length ==  1 && spData[0] == "ALL"){
  this.setState({ spDisable : null})
  fetch(`${URL.IP}:3992/getRegisterSP`)
  .then(response => response.json())
  .then(json =>  {
  var spCd =  json.map( x =>  { return  x.spCd  });
  this.setState({spCd : spCd});
 }
  );
}
else{
  var  spCd = []
  for (var i = 0; i < spData.length; i++) {
    spCd.push(spData[i]);
  }
  this.setState({spCd : spCd,spDisable : null});
}
this.handleSp(configData.spCd);
this.handleCutMr(configData.custCd);
this.handleSubCs(configData.subCustCd);
this.handleAsset(configData.assetId);
// this.handleDevice(configData.DeviceName);
var json = {DeviceName: configData.DeviceName}
this.handleDevice(json);
    // this.setState({
    //     selectedSPValue      : configData.spCd,
    //     selectedCustValue    : configData.custCd,
    //     selectedSubCustValue : configData.subCustCd,
    //     selectedAssetValue   : configData.assetId,
    //     selectedDeviceValue  : configData.DeviceName,
    //     sensorDisable : null
    //   })
    this.getSensor(configData.spCd,configData.custCd,configData.subCustCd )




  } catch (error) {
   
  }
 
  
    
    
}
// This is Submit Function
onSubmit = (e) => {
  e.preventDefault();
  this.getAllDetails();
  }
  //This For handler for Service Provider
  handleSp = (value) => {
  this.setState({ selectedSPValue : value })
  this.getCustomer(value)
  this.setState({ custDisable : null})
 
  }
  //This IS FOR HANDLE CUSTOMER 
  handleCutMr =(value) =>{
    const {selectedSPValue} = this.state;
    // // // alert(e.target.value + "customer")
    this.setState({ selectedCustValue :value })
    this.getSubCustmer(selectedSPValue, value  );
    this.setState({  subCustDisable : null})
   }
   //THIS IS FOR HANDLE SUBCUSTOMER
   handleSubCs =(value) =>{
 
    // // // alert(e.target.value + "SubCustomer")
    this.setState({ selectedSubCustValue : value })
    this.getAsset(value)
    this.setState({ assetDisable : null})
   }
   handleAsset =(value) =>{
    // // // alert(e.target.value + "SubCustomer")
    this.setState({ selectedAssetValue : value })
    this.getDevice(value);
    this.setState({ deviceDisable : null})
   }
   handleDevice =(value) =>{
    const {selectedSPValue,selectedCustValue,selectedSubCustValue} = this.state;
      // alert(value)
    this.setState({ selectedDeviceValue : value.DeviceName, })
    this.getSensor(selectedSPValue,selectedCustValue,selectedSubCustValue )
    this.setState({ sensorDisable : null})
   }
 //THIS IS FOR HANDLE  SENSOR  
   handleSensorNm(obj){
    const {selectedSPValue,selectedCustValue,selectedSubCustValue} = this.state;
    // // // alert(e.target.value)
    var tempArray= []
    for(var i =0; i< obj.length; i++){
      tempArray.push(obj[i].label);
    }
    this.setState({ selectedSensorValueArray : tempArray,Disabledsubmit : null })
    // this.selectOpertion(selectedSPValue,selectedCustValue,selectedSubCustValue,value)
    // // console.log(this.state.selectedSPValue , "hello sensorNm");
    
    this.setState({parameterDisable : null, unabledatepiker : null})
   }
   //THIS HANDER OF OPERATION SELECTION
   handleOperation =(value) => {
     var me = this;
     me.setState({ dynInput : value, operationSelected :  value,
      })
    }
//THIS METHOD FOR GET CUSTOMER CODE
    getCustomerApi(SendForSp){
      var userDetails = JSON.parse(sessionStorage.getItem("userDetails"));
      var CustData = userDetails[0].customers.split(",");
      if(CustData.length == 1 && CustData[0] == "ALL"){
        fetch(`${URL.IP}:3992/getCustomers?spCode=` + SendForSp)
        .then(response => response.json())
        .then(json =>  {
        var custCd =  json.map( x =>  { return  x._id  });
         this.setState({custCd : custCd});
       });
      }else{
        var custCd = [];
        for(let i = 0; i < CustData.length; i++){
          custCd.push(CustData[i]);
        }
        this.setState({custCd:custCd});
      }
   
    }
  // THIS METHOD FOR SELECT CUSTOMER CODE BASED ON SERVICE PROVIDER
  getCustomer(selectedSPValue){
     
      this.getCustomerApi(selectedSPValue)
    
  }
  //THIS IS  API FOR GET SUBCUSTOMER BASED ON SERVICE PROVIDER AND CUSTOMER CODE
  getSubCustomerApi(SendForSp,SendFroCustCD){
    var userDetails = JSON.parse(sessionStorage.getItem("userDetails"));
    var SubCustData = userDetails[0].subCustomers.split(",");
    if(SubCustData.length ==1 && SubCustData[0] == "ALL"){
      fetch(`${URL.IP}:3992/getSubCustomers?spCode=` + SendForSp +
      "&&custCd=" + SendFroCustCD )
      .then(response => response.json())
      .then(json =>  {
      var subCustCd =  json.map( x =>  { return  x._id  });
      this.setState({subCustCd : subCustCd});
});
    }else{
      var subCustCd = [];
      for(let i = 0; i < SubCustData.length; i++){
        subCustCd.push(SubCustData[i]);
      }
      this.setState({subCustCd:subCustCd})
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
  var userDetails = JSON.parse(sessionStorage.getItem("userDetails"));
  var AssetData = userDetails[0].Assets.split(",");
  if(AssetData.length == 1 && AssetData[0] =="ALL"){
    fetch(`${URL.IP}:3992/getAssets?subCustCd=`+SubCustomer )
    .then(response => response.json())
    .then(json =>  {
    me.setState({ArrayofAsset: json });
    
  });
  }
  else{
    var ArrayofAsset = [];
    for(let i = 0; i < AssetData.length; i++){
      ArrayofAsset.push(AssetData[i]);
    }
    this.setState({ArrayofAsset:ArrayofAsset});
  }
 
}

getDeviceApi(Asset){
  var me = this;
  var userDetails = JSON.parse(sessionStorage.getItem("userDetails"));
  var DeviceData = userDetails[0].Devices.split(",");
  if(DeviceData.length == 1 && DeviceData[0] == "ALL"){
    fetch(`${URL.IP}:3992/getDevice?assetId=`+Asset )
    .then(response => response.json())
    .then(json =>  {
    me.setState({ArrayofDevice: json });
  });
  }
  else{
    var ArrayofDevice = [];
    for(let i = 0; i < DeviceData.length; i++){
      ArrayofDevice.push(DeviceData[i]);
    }
    this.setState({ArrayofDevice:ArrayofDevice});
  }
  
 
}
//THIS API FOR GET SENSOR  BASED ON SERVICE PROVIDER , CUSTOMER CODE, SUBCUSTOMER CODE
getSensorApi(SendForSp,SendFroCustCD,SendForSbCd){
  fetch(`${URL.IP}:3992/getSensorNames?spCode=` +SendForSp +
         "&&custCd=" + SendFroCustCD + "&&subCustCd=" + SendForSbCd)
       .then(response => response.json())
       .then(json =>  {
       var sensorNm =  json.map( x =>  { return  x  });
       this.setState({sensorNm : sensorNm});
       // console.log(json );
     });
}

//THIS IS SELECTION OF SENSORE BASED ON SERVICE PROVIDER , CUSTOMER CODE, SUBCUSTOMER CODE
  getSensor( selectedSPValue,selectedCustValue, selectedSubCustValue){
        this.getSensorApi(selectedSPValue, selectedCustValue,selectedSubCustValue)
      
  }
  //THIS IS API FOR OPERTION SELECTION BASED ON SERVICE PROVIDER , CUSTOMER CODE, SUBCUSTOMER AND SELECTED SENSORE CODE
  opertionApi(SendForSp,SendFroCustCD,SendForSbCd,SendForSensor){
    fetch(`${URL.IP}:3992/getOperations?spCode=` + SendForSp + "&&custCd=" +
    SendFroCustCD + "&&subCustCd=" + SendForSbCd + "&&sensorNm=" + SendForSensor)
     .then(response => response.json())
     .then(json =>  {
       var operations=[];
       if(json[0] !== null && json[0]!== undefined ){
        operations = Object.values(json[0]);
        this.setState({operations : operations});
        // console.log(json[0]);
        // console.log(operations);
       }
      
   });  
  }
  //THIS METHOD FOR SELECTE OPERTION BASED ON SERVICE PROVIDER , CUSTOMER CODE, SUBCUSTOMER AND SELECTED SENSORE CODE
  selectOpertion(selectedSPValue,selectedCustValue,selectedSubCustValue,selectedSensorValueArray){
     this.opertionApi(selectedSPValue, selectedCustValue ,selectedSubCustValue,selectedSensorValueArray)      
  }

//THIS METHOD USE FOR FETCH ALL DATA FROM SERVER BASED ON SELECTED CRITERIA.
getAllDetails(){
  //THIS WAY OF GETTING DATA FROM STATE
  const {startDate,endDate,selectedSPValue,
    selectedCustValue,selectedSubCustValue,
    selectedSensorValueArray,ArrayOfSPs,selectedAssetValue,selectedDeviceValue,
    ArrayOfCusts,ArrayOfSubCusts ,operationSelected ,equalsValue, startRange, endRange } =this.state;
    var dateTime1 = new Date(startDate).toISOString();
    var dateTime2 = new Date(endDate).toISOString();
  var spToSend = [], custToSend = [], subCustToSend = [];
  spToSend.push(selectedSPValue);
  custToSend.push(selectedCustValue);
  subCustToSend.push(selectedSubCustValue);
      this.getAllDataApi(spToSend,custToSend,subCustToSend,selectedSensorValueArray,dateTime1,
        dateTime2, operationSelected,equalsValue,startRange,endRange,selectedAssetValue,selectedDeviceValue)
  // }
}
//THIS IS API METHOD FOR FETCH ALL DATA FROM SERVER BASED ON SELECTED CRITERIA.
getAllDataApi(SendForSp,SendFroCustCD,SendForSbCd,SendForSensor,SendForStartDate,
  SendForEndDate,SendForOperation,SendForEqual,SendForStartRange,SendforEndRange,sendforAsset,sendforDevice){
    fetch(`${URL.IP}:3992/getFacts?spCode=` + SendForSp + "&&custCd=" +
    SendFroCustCD + "&&subCustCd=" + SendForSbCd + "&&sensorNm=" + SendForSensor +
  "&&startDate=" + SendForStartDate + "&&endDate=" + SendForEndDate + 
  "&&operation=" + SendForOperation + "&&equalsFacts=" +
  SendForEqual + "&&startFactValue=" + SendForStartRange + "&&Asset="+sendforAsset + "&&Device=" + sendforDevice +
  "&&endFactValue=" +  SendforEndRange)
    .then(response => response.json())
    .then(json =>  {
      if(json !=0){
        swal("Success!", "", "success");
        //HERE WE REMOVE LAST ELEMENT JSON ARRAY
        json.pop();
      //MAKING A ARRAY FOR STRUCTURE DATA ARRAY FOR CHART AND EXCEL 
        var FdataArray =[];
   
        for (var i = 0; i < json.length - 1; i++) {
          var tempobj ={}
          var  keysofbussinessName = Object.keys(json[i][2]);
          for(var j = 0; j< keysofbussinessName.length; j++){
            tempobj[keysofbussinessName[j]] = json[i][2][keysofbussinessName[j]];
          }
          tempobj["CreatedTime"] =  json[i][3]
          FdataArray.push(tempobj)}
        // // console.log("this json data");
         console.log(json);
        // // alert(json)
        // // console.log("end json");
        //HERE WE UPDATTING STATE FOR TABLE DATA FOR tableDataToSend AND RESUALT FOR CHART AND EXCEL
        this.setState({tableDataToSend : json ,result :FdataArray })
      // // console.log(json);
      // // // alert(json)
        }else{
          swal("Sorry!", "No Data Available For This Range!", "error");
          this.setState({tableDataToSend : 0 ,result : 0 });
        }
    });
}
 //THIS METHOD FOR HENDER FOR CHART WHICH NEVIGATE TO CHART COMPONENT AND SAVE DATA RO SESSION MEMORY
 displayChart() {
  const {result,selectedSensorValueArray,startDate,endDate} = this.state;
  var dataToSend1 = [];
  var dataToSend2 = [];
  for (var i = 0; i < result.length; i++) {
    dataToSend1.push(result[i]["CreatedTime"]);
    var kyetoRemove = ["CreateTime","CreatedTime","Mac"];
    var keypr = Object.keys(result[i]);
  for(var j =0; j< kyetoRemove.length;j++){
    keypr.splice(kyetoRemove.indexOf(kyetoRemove[j]),1);
  }
  var temp ={}
  for(var k =0; k< keypr.length; k++){
    temp[keypr] =result[i][keypr[k]]; 
  }
    dataToSend2.push(temp);
  }
  var yaxisName = selectedSensorValueArray;
  var formDate = new Date(startDate).toLocaleString();
  var toDate = new Date(endDate).toLocaleString();
  //HERE SENDING DATA SESSION-STORAGE
    sessionStorage.setItem("dataToSend1",dataToSend1);
    sessionStorage.setItem("dataToSend2",dataToSend2);
    sessionStorage.setItem("yaxisName",yaxisName);
    sessionStorage.setItem("formDate",formDate);
    sessionStorage.setItem("toDate",toDate);
    //HERE NEVIGATING TO CHART COMPONENT
    this.props.history.push("/chartcomp");
}

 //THIS IS HANDER FOR EXCEL DOWNLOAD
 downloadToExcel() {
   var me = this;
   const {result} = this.state;
   //HERE PUTING RESULT DATA WHICH STORED IN STATE VARIABLE AND ASSIGN TO LOCAL VARIABLE dataForExcel
  var dataForExcel = result;
  // // alert("This is Cliked ");
  if (dataForExcel) {
    // // alert("This is Cliked data  is here ");
//THIS  HEADER OF COLUMN FOR EXCEL DATASHEET
    var arColumns = Object.keys(result[0])
    var arKeys = Object.keys(result[0]);
    var arWidths = [];
    for(var i =0; i< arKeys.length ; i++){
    arWidths.push(35)
    }
    var reportName =   "Sensors Data Recording-"+this.state.selectedSubCustValue+"-"+this.state.selectedDeviceValue+ "Report";
    var dataSet = dataForExcel;
    me.exportToExcel(arColumns, arKeys, arWidths, reportName, dataSet);
  } else {
    // Swal({
    //   title: "There is no data to export!!",
    //   type: "info",
    //   background: '#fff',
    //   width: 400
    // });
    // // alert("There is no data to export!!");
  }
}
  //export To Excel and Save it to server and add the Details to Collection
 async exportToExcel(arColumns, arKeys, arWidths, reportName, dataSet) {
    var workbook = new ExcelJs.Workbook();
    workbook.created = new Date();

    // create a sheet with blue tab colour
    var ws = workbook.addWorksheet("DATA_RECORDING", {
      properties: { tabColor: { argb: "1E1E90FF" } }
    });
  var sensorType = this.state.selectedSensorValueArray;
// if(this.state.selectedDeviceValue !=0){
// for(var i = 0; i< this.state.selectedDeviceValue.length; i++){
//   sensorType = sensorType + this.state.selectedDeviceValue[i];
// }
// }
    // Add initial set of rows
    var titleRows = [
      ["ReportName", "Sensors Data Recording"],
      ["Report Generated On", dateFormat("dd-mmm HH:MM")],
      ["Customer Name", this.state.selectedCustValue],
      ["Sub Customer Name", this.state.selectedSubCustValue],
      ["Asset Name", this.state.selectedAssetValue],
      ["Device Name", this.state.selectedDeviceValue],
      ["Sensors Type", sensorType.join(",")],
      ["Time Interval", dateFormat(this.state.startDate,"dd-mmm HH:MM")+","+dateFormat(this.state.endDate,"dd-mmm HH:MM")]
      // ["Class", this.std]
    ];

    // Add title rows
    ws.addRows(titleRows);

    for (i = 1; i <= titleRows.length; ++i) {
      ws.getRow(i).font = { size: 12, bold: true };
      ws.getRow(i).alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true
      };
      ws.getCell("A" + i).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "8787CEFA" }
      };
      ws.getCell("A" + i).border = ws.getCell("B" + i).border = {
        left: { style: "thin" },
        top: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    }

    /*Set Column headers and keys*/
    for (let i = 0; i < arColumns.length; ++i) {
      ws.getColumn(i + 1).key = arKeys[i];
      ws.getColumn(i + 1).width = arWidths[i];
    }

    ws.getRow(titleRows.length + 2).height = 40;
    ws.getRow(titleRows.length + 2).font = { size: 12, bold: true };
    ws.getRow(titleRows.length + 2).values = arColumns;

    // add all the rows in datasource to sheet - make sure keys are matching
    ws.addRows(dataSet);

    // loop through and style all the cells - Optimize this loop later.
    var j = titleRows.length + 2;
    for (
      var i = titleRows.length + 2;
      i <= dataSet.length + titleRows.length + 2;
      ++i
    ) {
      ws.getRow(i).alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true
      };
      if (i == titleRows.length + 2) {
        var strDataCol = "A";
        for (var k = 0; k < arColumns.length; ++k) {
          if (k == 0) {
            ws.getCell(strDataCol + j).fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "8787CEFA" }
            };
            ws.getCell(strDataCol + j).border = {
              left: { style: "medium" },
              top: { style: "medium" },
              bottom: { style: "medium" },
              right: { style: "thin" }
            };
          } else if (k == arColumns.length - 1) {
            ws.getCell(strDataCol + j).fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "8787CEFA" }
            };
            ws.getCell(strDataCol + j).border = {
              left: { style: "thin" },
              top: { style: "medium" },
              bottom: { style: "medium" },
              right: { style: "medium" }
            };
          } else {
            ws.getCell(strDataCol + j).fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "8787CEFA" }
            };
            ws.getCell(strDataCol + j).border = {
              left: { style: "thin" },
              top: { style: "medium" },
              bottom: { style: "medium" },
              right: { style: "thin" }
            };
          }
          strDataCol = String.fromCharCode(strDataCol.charCodeAt(0) + 1);
        }
      } else {
        if (i == dataSet.length + titleRows.length + 2) {
          strDataCol = "A";
          ws.getRow(j).alignment = { vertical: "middle", horizontal: "center" };
          for (var k = 0; k < arColumns.length; ++k) {
            if (k == 0) {
              ws.getCell(strDataCol + j).border = {
                left: { style: "medium" },
                top: { style: "thin" },
                bottom: { style: "medium" },
                right: { style: "thin" }
              };
            } else if (k == arColumns.length - 1) {
              ws.getCell(strDataCol + j).border = {
                left: { style: "thin" },
                top: { style: "thin" },
                bottom: { style: "medium" },
                right: { style: "medium" }
              };
            } else {
              ws.getCell(strDataCol + j).border = {
                left: { style: "thin" },
                top: { style: "thin" },
                bottom: { style: "medium" },
                right: { style: "thin" }
              };
            }
            strDataCol = String.fromCharCode(strDataCol.charCodeAt(0) + 1);
          }
        } else {
          var strDataCol = "A";
          for (var k = 0; k < arColumns.length; ++k) {
            if (k == 0) {
              ws.getCell(strDataCol + j).border = {
                left: { style: "medium" },
                top: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
              };
            } else if (k == arColumns.length - 1) {
              ws.getCell(strDataCol + j).border = {
                left: { style: "thin" },
                top: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "medium" }
              };
            } else {
              ws.getCell(strDataCol + j).border = {
                left: { style: "thin" },
                top: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
              };
            }
            strDataCol = String.fromCharCode(strDataCol.charCodeAt(0) + 1);
          }
        }
      }
      j = j + 1;
    }
try{
   await workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], { type: "application/octet-stream" });
      var dt = new Date();
      var strdt;
      strdt = dt
        .toString()
        .split("GMT")[0]
        .trim();
      var fileName = reportName + strdt + ".xlsx";
      FileSaver.saveAs(blob, fileName);
    });
  }
  catch(err){
    console.log("This is Error writebuffer");
    console.log(err)
  }
  }

 
  render() {
    const {Disabledsubmit,spCd,custCd,subCustCd,sensorNm,operations,dynInput,ArrayofAsset, ArrayofDevice} = this.state;
  //  var DynInput =null; 
  //THIS VARIABLE FOR DYNAMIC INPUT FIELD EFFECT OR CHANGING.
    var equalvaluedisabled = true;
    var startendvalue =true;
    var dynamicvalue = this.state.startRange;
    var dynamPlaceholder = "Enter Start Values :";
    var dynamicname = "startRange";
    // var Disabledsubmit =true;
    if(dynInput =="EQUALS"){
      equalvaluedisabled = null;
      dynamicvalue = this.state.equalsValue;
      dynamPlaceholder = "Enter Equals value :"
      dynamicname = "equalsValue"
      startendvalue = true;
      //THIS FOR VALIDATION 
      // if(this.state.equalsValue != 0){
      //   Disabledsubmit=null;
      // }
      // else{
      //   Disabledsubmit=true;
      // }
    } 
    else if (dynInput ==="RANGE"){
      equalvaluedisabled = true;
      startendvalue = null;
      dynamicvalue = this.state.startRange;
      dynamPlaceholder = "Enter Start Values :";
      dynamicname = "startRange";
      equalvaluedisabled = null;
      // if(this.state.startRange && this.state.endRange != 0){
      //   Disabledsubmit=null;
      // }
      // else{
      //   Disabledsubmit=true;
      // }
    
      }  else {
        // DynInput = null;
        // Disabledsubmit=true;
        equalvaluedisabled = true;
      startendvalue = true;
       }
       if(dynInput ==="AVG"){
        // Disabledsubmit=null;
       }
       var table = null;
       var table = null;
       if(this.state.tableDataToSend !=0){
          table = <div className="row bg">
               <div className= "custNav btn-group">
               <button className="btn btn-sm btn-secondary" onClick={this.displayChart.bind(this)} disabled><i class="far fa-chart-bar iconfont"></i></button>
               <button  className="btn btn-sm btn-secondary" onClick={this.downloadToExcel.bind(this)}><i class="far fa-file-excel iconfont"></i></button>
              </div>
              </div>;
          }
if(this.state.sensorNm.length != 0){
  var sensorsObj = [];
  this.state.sensorNm.map((item,i) => {
    var obj = {
      "label": item, "value": i
    }
    sensorsObj.push(obj);
  })
}
  
          return (
            <div className=" container">
                
            <div className="row">
              <div className="card2">
                    {/* <div className=" bg-color21">j</div> */}
                    
                    <div className=" divbac ">
                    <form onSubmit={this.onSubmit} >
              
                     <div className="row">
                   
                     <div className="col-sm-3">
                    <div className= "divmanueDrop">
                     <DropdownButton  className = ""  onSelect={this.handleSp}
                      disabled = {this.state.spDisable}
                        bsStyle={"white"}
                        title={this.state.selectedSPValue || "SERVICE PROVIDER"}>
                        {spCd.map( (item) =>
                        <MenuItem eventKey={item}>{item}</MenuItem>
                        )}
                        </DropdownButton>
                        </div>
                     </div>
                     <div className="col-sm-3">
                     <div className= "divmanueDrop">
                     <DropdownButton  className = ""  onSelect={this.handleCutMr}
                      disabled = {this.state.custDisable}
                        bsStyle={"white"}
                        title={this.state.selectedCustValue || "CUSTOMER"}>
                        {custCd.map( (item) =>
                        <MenuItem eventKey={item}>{item}</MenuItem>
                        )}
                        </DropdownButton>
                        </div>
                     </div>
                     <div className="col-sm-3">
                     <div className= "divmanueDrop">
                     <DropdownButton  className = ""  onSelect={this.handleSubCs}
                      disabled = {this.state.subCustDisable}
                        bsStyle={"white"}
                        title={this.state.selectedSubCustValue || "SUBCUSTOMER"}>
                        {subCustCd.map( (item) =>
                        <MenuItem eventKey={item}>{item}</MenuItem>
                        )}
                        </DropdownButton>
                        </div>
               
                     </div>
                     <div className="col-sm-3">
                     <div className= "divmanueDrop">
                     <DropdownButton  className = ""  onSelect={this.handleAsset}
                      disabled = {this.state.assetDisable}
                        bsStyle={"white"}
                        title={this.state.selectedAssetValue || "SELECT THE ASSET" }>
                        {ArrayofAsset.map( (item) =>
                        <MenuItem eventKey={item}>{item}</MenuItem>
                        )}
                        </DropdownButton>
                        </div>
                     </div>
                     <div className="col-sm-3">
                     <div className= "divmanueDrop">
                     <DropdownButton  className = ""  onSelect={this.handleDevice}
                      disabled = {this.state.deviceDisable}
                        bsStyle={"white"}
                        title={this.state.selectedDeviceValue || "SELECT THE DEVICE" }>
                        {ArrayofDevice.map( (item) =>
                        <MenuItem eventKey={item}>{item.DeviceName}</MenuItem>
                        )}
                        </DropdownButton>
                        </div>
                     </div>
                     <div className="col-sm-3">
                     <div className= "divmanueDrop">
                     <ReactMultiSelectCheckboxes placeholderButtonLabel= "SELECT THE SENSOR" disabled onChange= {this.handleSensorNm.bind(this)} options={sensorsObj} />

                        </div>
                     </div> 
                     <div className="col-sm-6">
                     <div className= "sensors">
                     <div className= "senosrs">
                   <span className= "senosrs">{(this.state.selectedSensorValueArray.length !=0)?"Selected Sensors :"+this.state.selectedSensorValueArray.join(" , ") :"" }</span>
                     </div>
                     </div>
                     </div>
                     </div>
                     <div className="row">
                     <div className="col-sm-12 col-md-6">
                     <table>
                            <tbody>
                          <tr>
                        
                         <td> <span className="lab">From:</span></td> 
                          <td> 
                          <DatePicker
                            selected={this.state.startDate}
                            onChange={this.handleChange}
                            showTimeSelect
                            showMonthDropdown
                            showYearDropdown
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="LLL"
                            timeCaption="time"
                            isClearable={true}
                            disabled={this.state.unabledatepiker}
                            className="customdatepiker"
                            
                            placeholderText="Please Select Start Date"
                          
                             />
                             </td>
                              <td>
                             <span className="lab1">To:</span>
                           </td>
                           <td>
                             <DatePicker
                            selected={this.state.endDate}
                            onChange={this.handleChange2}
                            showTimeSelect
                            showMonthDropdown
                            showYearDropdown
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="LLL"
                            timeCaption="time"
                            isClearable={true}
                            disabled={this.state.unabledatepiker}
                            className="customdatepiker"
                            placeholderText="Please Select End Date"
                          />
                               </td>
                               </tr>      
                          </tbody>
                          </table>
                     </div>
                          
                     <div className="col-sm-12 col-md-6">
                     <div className="pull-right">
                 
                               <input
                              type="submit"
                              value="Submit"
                              className="btn btn-danger  ml-1  " 
                              disabled={Disabledsubmit}
                            />
                       
                         
                           <button  className="btn btn-secondary ml-1 " onClick={() =>{ 
                            window.location.reload(); 
                           }}> Clear</button>
                         
                     </div>
                     </div>
                     </div>

                         
                          
                      </form>
                    </div>
                  </div>
             </div>
           <div className="cmrgin">
          {table}
          </div>
          </div>
          );
        }
    }
  


export default Menu;
