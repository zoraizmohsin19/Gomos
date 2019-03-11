import React, { Component } from 'react'
import "./socketdashbord.css"
import Sensors from "../layout/widgetofSensors/sensorsCantainer";
import Chartcom from "../layout/widgetofSensors/chartCom";
import {Table} from 'react-bootstrap';
import socketIOClient from "socket.io-client";
import axios from "axios";
import CPagination from "../layout/Pagination";
import * as ExcelJs from "exceljs/dist/exceljs.min.js";
import * as FileSaver from "file-saver";
import dateFormat  from  "dateformat";
import Spinner from '../layout/Spinner';
class socketdashbord extends Component {
constructor(){
  super();
  this.state={
  body: {
    endpoint: "http://localhost:4001",
    socket1: {},
    arrData: [],
    arrLabels:[],
    yaxisName:'',
    fromDate: '',
    toDate: '',
    bgColors: [],
    borderColors:[],
    DataArray: [],
    'total_count':0,
    'page_size': 10,
    'page': 1,
    selectedSPValue: '',
    selectedCustValue:'',
    selectedSubCustValue:'',
    spDisable:null,
    subCustDisable: null,
    custDisable: null,
    // spCd: [],
    // custCd: [],
    // subCustCd: [],
    // Assets: [],
    // Devices: [],
    Sensors: [],
    selectedSensorsType1: '',
    mac: '',
    selectedAssets: '',
    excelresult: [],
    lastupdatedData:[],
    lastUpdatedTime: '',
    Spinnerdata: true,
   'in_prog':false,
    sensorsNM: "",
    selectedSensorsName: "",
    lastAlertdata: {}
  }
  }
  this.changePage     =   this.changePage.bind(this);
  // this.clickAsset     = this.clickAsset.bind(this);
  // this.clickDevices     = this.clickDevices.bind(this);
  // this.handleSelect  = this.handleSelect.bind(this);
  this.changePagesize = this.changePagesize.bind(this);
}
changePage(page){
  // this.state.page = page 
    this.state.body.page = page
    this.setState({body:  this.state.body});
    this.fetchdata();
    }
   
    changePagesize(e){
      alert(e.target.value);
      var me = this
      var page = 1;
      me.state.body.page_size = e.target.value;
      me.state.body.page = page;
      me.setState({body: me.state.body});
      this.fetchdata();
    }

// clickAsset(assetId){
//   // alert(assetId);
//   this.setState({selectedAssets: assetId})
//   var subCustCd = this.state.selectedSubCustValue;
//   var custCd = this.state.selectedCustValue;
//   var spCd = this.state.selectedSPValue;
//   var Devices = [];
//   var Sensors = [];
//   // alert("this is clicked"+ assetId);
//   // this.getDevices(assetId)
//   fetch("http://localhost:3992/getDevice?assetId=" + assetId )
//   .then(response => response.json())
//   .then(json =>  {
//   // var sensorType =  json.map( x =>  { return  x  });
//    Devices = json;
//    var page_size = 10;
//     var page = 1
//    this.setState({mac: Devices[0].mac, Devices : json,page_size:page_size, page: page})
//    fetch("http://localhost:3992/getSensors?mac=" + Devices[0].mac)
//    .then(response => response.json())
//    .then(json =>  {
  
//     // Sensors = json[0];
//     var Sensors = Object.keys(json)
//     var selecteSensorName = Object.values(json[Sensors[0]]);
//     this.setState({selectedSensorsType1: Sensors[0], selectedSensorsName: selecteSensorName[0]})
//     this.fetchdata( page_size,page,selecteSensorName[0],Sensors[0],Devices[0].mac,subCustCd,custCd,spCd);
  
//    });
  
//   });
// }
// clickDevices(mac){
 
//    fetch("http://localhost:3992/getSensors?mac=" + mac)
//   .then(response => response.json())
//   .then(json =>  {
//   var page_size = 10;
//   var page = 1;
//   // Sensors = json[0];
//     var Sensors = Object.keys(json)
//     var selectedSensorsName = Object.values(json[Sensors[0]]);
//     this.setState({mac: mac , selectedSensorsType1: Sensors[0],page_size: page_size,page:page,selectedSensorsName: selectedSensorsName[0]});
   
//    this.fetchdata(page_size,page,selectedSensorsName[0],Sensors[0],mac,this.state.selectedSubCustValue,this.state.selectedCustValue,this.state.selectedSPValue  );
//   });
  

// }
handler(selectedSensorsType1,selectedSensorsName){
  // alert(selectedSensorsType1+selectedSensorsName);
  // alert(selectedSensorsType1);
  var me = this;
   me.state.body.page_size = 10;
   me.state.body.page = 1;
   me.state.body.selectedSensorsType1 =selectedSensorsType1;
   me.state.body.selectedSensorsName =selectedSensorsName;
   this.setState({body : me.state.body}); 
   this.fetchdata();
}
componentDidMount(){
  var me = this;
  //  var mainData = JSON.parse(sessionStorage.getItem("userDetails"));
  //  var sessionData = mainData[0].serviceProviders.split(",");
  var mainData = JSON.parse(sessionStorage.getItem("configData"));
  //  var ActiveData = JSON.parse(sessionStorage.getItem("dashboardConfigobj"));
   me.state.body.selectedSPValue       =     mainData.spCd;
   me.state.body.selectedCustValue     =     mainData.custCd;
   me.state.body.selectedSubCustValue  =     mainData.subCustCd;
   me.state.body.mac                   =     mainData.mac;
   me.state.body.selectedDeviceName    =     mainData.DeviceName;
   me.state.body.selectedAssets        =     mainData.assetId;
   me.setState({body: me.state.body});
 
    
//    if (sessionData.length == 1 && sessionData[0] == "ALL") {
     
//   fetch('http://localhost:3992/getRegisterSP')
//   .then(response => response.json())
//   .then(json =>  {
//   var spCd =  json.map( x =>  { return  x.spCd  });
//   this.setState({spCd : spCd});
//  }
//   ); 
// }
//   else {
//    var  spCd = []
//     for (var i = 0; i < sessionData.length; i++) {
//      spCd.push(sessionData[i]);
//     }
//     if(spCd.length == 1){
//       this.setState({spDisable: true})
//     }
  
//      this.setState({spCd : spCd});
// }

// var customers = mainData[0].customers.split(",");
//  var custCd = [];
// if (customers.length == 1 && customers[0] == "ALL") {
//   fetch("http://localhost:3992/getCustomers?spCode=" + AspCd)
// .then(response => response.json())
// .then(json =>  {
// var custCd =  json.map( x =>  { return  x._id  });
// this.setState({custCd: custCd });
// });
// }
// else{
// for (var i = 0; i < customers.length; i++) {
//   custCd.push(customers[i]);

// }
// if(custCd.length == 1){
//   this.setState({custDisable: true})

// }
// this.setState({custCd: custCd});
// }
// var subCustomers = mainData[0].subCustomers.split(",");
// var subCustCd= [];
// if (subCustomers.length == 1 && subCustomers[0] == "ALL") {
// fetch("http://localhost:2992/getSubCustomers?spCode=" + AspCd +
// "&&custCd=" + AcustCd )
// .then(response => response.json())
// .then(json =>  {
// var subCustCd =  json.map( x =>  { return  x._id  });
// this.setState({subCustCd: subCustCd });

// });
// }
// else{

//   for (var i = 0; i < subCustomers.length; i++) {
//     subCustCd.push(subCustomers[i]);
   
//   }
//   if(subCustCd.length == 1){
//     this.setState({subCustDisable: true})
//   }
//   this.setState({subCustCd:subCustCd})
// }


  this.startFunction()
  }




  startFunction(){
    var data = [];
    var me   = this;
  // const {lastupdatedData} = this.state;
    var dashboardData = JSON.parse(sessionStorage.getItem("dashboardConfigobj"));
    // console.log(dashboardData)
    // console.log(lastupdatedData);
    // alert(lastupdatedData);
    var arrayOfsensors= dashboardData.Sensors;
    var arrayofbgClass =dashboardData.SensorsBgC;
    var keysofBsnm = Object.keys(me.state.body.lastupdatedData);
    var values = Object.values(me.state.body.lastupdatedData);
    
    for (var i = 0; i < 3; i++ ){ 
       data.push({ "sensorsNM": arrayOfsensors[i].ActivesesnorsType, "bgClass": arrayofbgClass[i],
        nameofbsnm : keysofBsnm[i], valuseS: values[i] , lastUpdatedTime: this.state.body.lastUpdatedTime});
      }
  
      me.state.body.Assets                =   dashboardData.Assets;
      me.state.body.Devices               =   dashboardData.Devices;
      me.state.body.selectedSensorsType1  =   dashboardData.ActivesesnorsType;
      me.state.body.selectedSensorsName   =   dashboardData.ActiveSensorsName;
      me.state.body.page_size             =    10;
      me.state.body.page                  =    1;
      me.setState({ body: me.state.body});
      me.fetchdata();
  }

  // submitBtn() {
  //   var me = this;
  //  var subCustCd = me.state.selectedSubCustValue;
  //  var custCd = me.state.selectedCustValue;
  //  var spCd = me.state.selectedSPValue;
  //  var Assets = [];
  //  var Devices = [];

  //  fetch("http://localhost:3992/getAssets?subCustCd=" + subCustCd)
  // .then(response => response.json())
  // .then(json =>  {
  //  Assets = json 
  //  this.setState({selectedAssets: Assets[0], Assets : json})
  //  fetch("http://localhost:3992/getDevice?assetId=" + Assets[0])
  //  .then(response => response.json())
  //  .then(json =>  {
  //   this.setState({Devices : json});
  //   Devices = json;
  //   this.setState({Devices : json , mac : Devices[0].mac});
  //   // alert(Devices[0].mac)
  //   fetch("http://localhost:3992/getSensors?mac=" + Devices[0].mac)
  //   .then(response => response.json())
  //   .then(json =>  {
  //     if(json.length!=0){
  //       // alert(json);
        
  //       // alert(json);
  //       // console.log(json)
  //     var Sensors = Object.keys(json)
  //     var selecteSensorName = Object.values(json[Sensors[0]]);
  //     // alert(json[Sensors[0]]);
  // var page_size = 10;
  // var page = 1;
  // this.setState({selectedSensorsType1: Sensors[0],page_size: page_size, page:page, selectedSensorsName : selecteSensorName[0]})
  //    this.fetchdata(page_size,page,selecteSensorName[0],Sensors[0],Devices[0].mac,subCustCd,custCd,spCd);
  //     }
  //   });
  //  });
  // });
  // }

 //This For handler for Service Provider
//  handleSp = (e) => {
//   this.setState({ selectedSPValue : e.target.value })
//   this.getCustomerApi(e.target.value);
//   this.setState({ custDisable : null})
 
//   }  
  //This IS FOR HANDLE CUSTOMER 
  // handleCutMr =(e) =>{
  //   const {selectedSPValue} = this.state;
  //   // alert(e.target.value + "customer")
  //   this.setState({ selectedCustValue : e.target.value,subCustDisable : null })
   
  //   this.getSubCustomerApi(selectedSPValue, e.target.value);
  //   // this.setState({  })
  //  }
   //THIS IS FOR HANDLE SUBCUSTOMER
  //  handleSubCs =(e) =>{
    
  //   this.setState({ selectedSubCustValue : e.target.value });
  //     // this.getAssets( e.target.value );
    
  //  }
  //THIS METHOD FOR GET CUSTOMER CODE
  // getCustomerApi(SendForSp){
  //   var mainData = JSON.parse(sessionStorage.getItem("userDetails"));
  //   var sessionData = mainData[0].customers.split(",");
  //    var custCd = [];
  //   if (sessionData.length == 1 && sessionData[0] == "ALL") {
  //     fetch("http://localhost:3992/getCustomers?spCode=" + SendForSp)
  //   .then(response => response.json())
  //   .then(json =>  {
  //   var custCd =  json.map( x =>  { return  x._id  });
  //   this.setState({custCd: custCd, selectedCustValue:custCd[0]  });
  //  });
  // }
  // else{
  //   for (var i = 0; i < sessionData.length; i++) {
  //     custCd.push(sessionData[i]);
   
  //   }
  //   this.setState({custCd: custCd, selectedCustValue:custCd[0] });

  // }
  // }
  
//   getSubCustomerApi(SendForSp,SendFroCustCD){
//     var mainData = JSON.parse(sessionStorage.getItem("userDetails"));
   
//     var sessionData = mainData[0].subCustomers.split(",");
//     var subCustCd= [];
//     if (sessionData.length == 1 && sessionData[0] == "ALL") {
//     fetch("http://localhost:3992/getSubCustomers?spCode=" + SendForSp +
//     "&&custCd=" + SendFroCustCD )
//     .then(response => response.json())
//     .then(json =>  {
//     var subCustCd =  json.map( x =>  { return  x._id  });
   
//     this.setState({subCustCd: subCustCd, selectedSubCustValue: subCustCd[0] });
    
// });
//     }
//     else{
//       for (var i = 0; i < sessionData.length; i++) {
//         subCustCd.push(sessionData[i]);
//       }
//       this.setState({subCustCd:subCustCd,selectedSubCustValue: subCustCd[0]})
//     }
// }

// getAssets(SendForSbCd){
//   fetch("http://localhost:3992/getAssets?subCustCd=" + SendForSbCd)
//   .then(response => response.json())
//   .then(json =>  {
//   // var sensorType =  json.map( x =>  { return  x  });
//    this.setState({Assets : json});

//   });
// }
// getDevices(assetId){
//   fetch("http://localhost:3992/getDevice?assetId=" + assetId)
//   .then(response => response.json())
//   .then(json =>  {
//   // var sensorType =  json.map( x =>  { return  x  });
//    this.setState({Devices : json, selectedAssets: assetId});
//   console.log(json +'this data of assets' );
//   });
// }

DisplayChart(result, valueSensoor ){
  console.log(result)
  var me = this;
  if( result.length > 0 ){
    var arrData = [];
    var arrLabels =[];
    var dataToSend1 =[];
    var dataToSend2 = [];
    for (var i = 0; i < result.length; i++) {
      var formattedDate = dateFormat(result[i]["column5"], "dd-mmm HH:MM");
      dataToSend1.push(result[i]["column4"]);
      dataToSend2.push(
        formattedDate 
      );
    }
    console.log(dataToSend1)
    console.log(dataToSend2)
    console.log(valueSensoor)
    arrData = dataToSend1;
    arrLabels= dataToSend2;
    var yaxisName = valueSensoor;
    var fromDate = new Date();
    var  toDate =  new Date();
    var borderColors =[];
    for (var i = 0; i <  arrData.length; i++) {
        // bgColors.push(this.getRandomBgColor());
        borderColors.push(this.getRandomBorColor());
        // sessionStorage.clear();
        me.state.body.arrData = arrData;
        me.state.body.arrLabels = arrLabels;
        me.state.body.yaxisName = yaxisName;
        me.state.body.fromDate = fromDate;
        me.state.body.borderColors = borderColors;


        this.setState({ body: me.state.body});
  }

 
      // this.updateState(arrData, arrLabels, yaxisName, fromDate ,toDate,bgcolor, borderColors);
  }
  else{
    me.state.body.arrData = undefined;
    me.state.body.arrLabels = undefined;
    me.state.body.yaxisName = undefined;
    me.state.body.fromDate = undefined;
    me.state.body.borderColors = undefined;
    this.setState({ body: me.state.body});
  }
}
  fetchdata(){
    this.state.body.in_prog = true;
    this.setState({body: this.state.body});
    var dashboardData = JSON.parse(sessionStorage.getItem("dashboardConfigobj"));
    var arrayOfsensors= dashboardData.Sensors;
    var arrayofbgClass =dashboardData.SensorsBgC;  
    var sensor1 = arrayOfsensors[0];
    var sensor2 = arrayOfsensors[0];
    var sensor3 = arrayOfsensors[0];
    var obj = [];
    for(var i =0; i< arrayOfsensors.length; i++){
        var temobj ={};
        temobj["sesnorsType"]= "sensorType"+i;
        temobj["sensorsName"]= "sensor"+i;
        temobj["sensorsValues"]= 0.0;
        obj.push(temobj);
    }
    this.firstTimeRender("0:0:0:0",obj );
    var me = this;
   var body = {
      sensorNm: me.state.body.selectedSensorsType1,
      sensorsBSN : me.state.body.selectedSensorsName,
      spCd :me.state.body.selectedSPValue,
      custCd: me.state.body.selectedCustValue,
      subCustCd : me.state.body.selectedSubCustValue,
      mac: me.state.body.mac,
      page : me.state.body.page,
      page_size: me.state.body.page_size
    }
  
    me.callToSocket(body);
    me.callForlastAlert(me.state.body.selectedCustValue,me.state.body.selectedSubCustValue, me.state.body.mac);
    me.state.body.in_prog      =   true;
    me.state.body.Spinnerdata  = false; 
    me.setState({body: me.state.body});
    var FdataArray =[];
    var dataArray =[];
    axios.post("http://localhost:3992/getdashboard",body)
    .then(json =>  {
      // console.log(json);
      // console.log(json["data"]);
      me.state.body.Spinnerdata = true;
      me.setState({ body: me.state.body})
      let json1 =[];
      console.log("this is data");
      console.log(json["data"]);
     json1 = json["data"]["finalResult"]
      if(json1 !== 0){
        for (var i = 0; i < json1.length ; i++) {
          FdataArray.push({
                  column1: json1[i][0],
                  column2: json1[i][1],
                  column3: json1[i][2],
                  column4: json1[i][3].toFixed(2),
                  column5: json1[i][4]
     
        })
        dataArray.push({
          column1: json1[i][0],
          column2: json1[i][1],
          column3: json1[i][2],
          column4: json1[i][3].toFixed(2),
          column5: dateFormat(json1[i][4], "dd-mmm-yy HH:MM:ss")

})
      }
      
      // console.log(json["data"]["lastdataObj"]);
      var lastUpdatedTime = dateFormat(json["data"]["lastCreatedTime"] , "dd-mmm-yy HH:MM:ss")
      // me.setState({'users':items,'total_count':users_data.count,'in_prog':false});
      console.log(dataArray);
      me.state.body.DataArray         =  dataArray;
      me.state.body.in_prog           =  false;
      me.state.body.total_count       =  json["data"]["data_count"];
      me.state.body.lastupdatedData   =  json["data"]["lastdataObj"];
      me.state.body.lastUpdatedTime   =  lastUpdatedTime;
      me.setState({ body: me.state.body})
      me.DisplayChart(FdataArray, me.state.body.selectedSensorsName);
     // me.firstTimeRender(lastUpdatedTime,json["data"]["lastdataObj"])
      }
    }) 
    .catch(error=>{
      me.DisplayChart(FdataArray, me.state.body.selectedSensorsName);
      me.state.body.DataArray     =   [];
      me.state.body.in_prog       =   false;
      me.state.body.total_count   =   0;
      me.state.body.Spinnerdata   =   true;
      me.setState({ body: me.state.body});
  })
}

callToSocket(body){
  const { endpoint, socket1} = this.state.body;
  var me = this;
  if(Object.entries(socket1).length !== 0 && socket1.constructor !== Object){
    socket1.emit("end");
    console.log(socket1);
  }
 
  const socket = socketIOClient(endpoint+"/onViewDashboard");
  // socket1.close();
  console.log("This is log of socket");
  console.log(socket)
  me.state.body.socket1   =   socket;
  me.setState({body: me.state.body});
  var dashboardData = JSON.parse(sessionStorage.getItem("dashboardConfigobj"));
  var arrayOfsensors= dashboardData.Sensors;
  var arrayofbgClass = dashboardData.SensorsBgC;
  socket.emit('lastUpdatedValue',body);  
  socket.on("onViewDashboard", data =>{
    console.log("This is socket ");
    console.log(data.sensors);
    var array = [];
    // var lastUpdatedTime = dateFormat(data.lastCreatedTime , "dd-mmm-yy HH:MM:ss");
    for (var i = 0 ; i < data.sensors.length ; i++ ){ 
      array.push({ "sensorsNM": data.sensors[i].type, 
      "bgClass": arrayofbgClass[i],
       nameofbsnm : data.sensors[i].devicebusinessNM,
       valuseS:data.sensors[i].Value , 
       lastUpdatedTime:  dateFormat(data.sensors[i].dateTime , "dd-mmm-yy HH:MM:ss")});
     }
     for(var j =0; j< array.length; j++){
       if(array[j].lastUpdatedTime != me.state.body.Sensors[j].lastUpdatedTime ){
        me.state.body.Sensors   =   array;     
        me.setState({body :me.state.body});
        break;
       }
     }
     
  });
}
callForlastAlert(custCd,subCustCd, mac){
  var me = this;
 var body = {custCd,subCustCd,mac}
  axios.post("http://localhost:3992/getdashbordlastalert", body)
  .then(json =>  {
    // alert(json["data"]);
    // console.log(json["data"]);
    me.state.body.lastAlertdata   =    json["data"];     
    me.setState({body: me.state.body});
  })
}
firstTimeRender(lastupdatedTime, obj){
  var me = this
  // if(true){
    var data = [];
    var dashboardData = JSON.parse(sessionStorage.getItem("dashboardConfigobj"));
    var arrayOfsensors= dashboardData.Sensors;
    var arrayofbgClass = dashboardData.SensorsBgC;
    for (var i = 0; i <obj.length; i++ ){ 
       data.push({ "sensorsNM": obj[i].sesnorsType, "bgClass": arrayofbgClass[i],
        nameofbsnm : obj[i].sensorsName, valuseS:obj[i].sensorsValues ,  lastUpdatedTime: lastupdatedTime});
      }
      me.state.body.Sensors   =    data;     
      me.setState({body: me.state.body});
  // }
}


//THIS IS HANDER FOR EXCEL DOWNLOAD
// downloadToExcel() {
//   const {excelresult} = this.state;
//   //HERE PUTING RESULT DATA WHICH STORED IN STATE VARIABLE AND ASSIGN TO LOCAL VARIABLE dataForExcel
//  var dataForExcel = excelresult;
//  if (dataForExcel) {
// //THIS  HEADER OF COLUMN FOR EXCEL DATASHEET
//    var arColumns = [
//      "Device",
//      "Device Name",
//      "Bussiness Name",
//      this.state.selectedSensorsType1,
//      "QueueDateTime"
//    ];
//    var arKeys = ["column1", "column2", "column3", "column4","column5"];
//    var arWidths = [35, 35, 35, 35, 35];
//    var reportName = this.state.selectedSensorsType1 + " Report";
//    var dataSet = dataForExcel;
//    this.exportToExcel(arColumns, arKeys, arWidths, reportName, dataSet);
//  } else {
//    // Swal({
//    //   title: "There is no data to export!!",
//    //   type: "info",
//    //   background: '#fff',
//    //   width: 400
//    // });
//    alert("There is no data to export!!");
//  }
// }
 //export To Excel and Save it to server and add the Details to Collection
//  exportToExcel(arColumns, arKeys, arWidths, reportName, dataSet) {
//    var workbook = new ExcelJs.Workbook();
//    workbook.created = new Date();

//    // create a sheet with blue tab colour
//    var ws = workbook.addWorksheet(reportName, {
//      properties: { tabColor: { argb: "1E1E90FF" } }
//    });

//    // Add initial set of rows
//    var titleRows = [
//      ["ReportName", this.state.selectedSensorsType1 + " Report"],
//      ["Report Generated On", Date().toLocaleString()]
//      // ["Class", this.std]
//    ];

//    // Add title rows
//    ws.addRows(titleRows);

//    for (var i = 1; i <= titleRows.length; ++i) {
//      ws.getRow(i).font = { size: 12, bold: true };
//      ws.getRow(i).alignment = {
//        vertical: "middle",
//        horizontal: "center",
//        wrapText: true
//      };
//      ws.getCell("A" + i).fill = {
//        type: "pattern",
//        pattern: "solid",
//        fgColor: { argb: "8787CEFA" }
//      };
//      ws.getCell("A" + i).border = ws.getCell("B" + i).border = {
//        left: { style: "thin" },
//        top: { style: "thin" },
//        bottom: { style: "thin" },
//        right: { style: "thin" }
//      };
//    }

//    /*Set Column headers and keys*/
//    for (let i = 0; i < arColumns.length; ++i) {
//      ws.getColumn(i + 1).key = arKeys[i];
//      ws.getColumn(i + 1).width = arWidths[i];
//    }

//    ws.getRow(titleRows.length + 2).height = 40;
//    ws.getRow(titleRows.length + 2).font = { size: 12, bold: true };
//    ws.getRow(titleRows.length + 2).values = arColumns;

//    // add all the rows in datasource to sheet - make sure keys are matching
//    ws.addRows(dataSet);

//    // loop through and style all the cells - Optimize this loop later.
//    var j = titleRows.length + 2;
//    for (
//      var i = titleRows.length + 2;
//      i <= dataSet.length + titleRows.length + 2;
//      ++i
//    ) {
//      ws.getRow(i).alignment = {
//        vertical: "middle",
//        horizontal: "center",
//        wrapText: true
//      };
//      if (i === titleRows.length + 2) {
//        var strDataCol = "A";
//        for (var k = 0; k < arColumns.length; ++k) {
//          if (k === 0) {
//            ws.getCell(strDataCol + j).fill = {
//              type: "pattern",
//              pattern: "solid",
//              fgColor: { argb: "8787CEFA" }
//            };
//            ws.getCell(strDataCol + j).border = {
//              left: { style: "medium" },
//              top: { style: "medium" },
//              bottom: { style: "medium" },
//              right: { style: "thin" }
//            };
//          } else if (k === arColumns.length - 1) {
//            ws.getCell(strDataCol + j).fill = {
//              type: "pattern",
//              pattern: "solid",
//              fgColor: { argb: "8787CEFA" }
//            };
//            ws.getCell(strDataCol + j).border = {
//              left: { style: "thin" },
//              top: { style: "medium" },
//              bottom: { style: "medium" },
//              right: { style: "medium" }
//            };
//          } else {
//            ws.getCell(strDataCol + j).fill = {
//              type: "pattern",
//              pattern: "solid",
//              fgColor: { argb: "8787CEFA" }
//            };
//            ws.getCell(strDataCol + j).border = {
//              left: { style: "thin" },
//              top: { style: "medium" },
//              bottom: { style: "medium" },
//              right: { style: "thin" }
//            };
//          }
//          strDataCol = String.fromCharCode(strDataCol.charCodeAt(0) + 1);
//        }
//      } else {
//        if (i === dataSet.length + titleRows.length + 2) {
//          strDataCol = "A";
//          ws.getRow(j).alignment = { vertical: "middle", horizontal: "center" };
//          for (var k = 0; k < arColumns.length; ++k) {
//            if (k == 0) {
//              ws.getCell(strDataCol + j).border = {
//                left: { style: "medium" },
//                top: { style: "thin" },
//                bottom: { style: "medium" },
//                right: { style: "thin" }
//              };
//            } else if (k == arColumns.length - 1) {
//              ws.getCell(strDataCol + j).border = {
//                left: { style: "thin" },
//                top: { style: "thin" },
//                bottom: { style: "medium" },
//                right: { style: "medium" }
//              };
//            } else {
//              ws.getCell(strDataCol + j).border = {
//                left: { style: "thin" },
//                top: { style: "thin" },
//                bottom: { style: "medium" },
//                right: { style: "thin" }
//              };
//            }
//            strDataCol = String.fromCharCode(strDataCol.charCodeAt(0) + 1);
//          }
//        } else {
//          var strDataCol = "A";
//          for (var k = 0; k < arColumns.length; ++k) {
//            if (k == 0) {
//              ws.getCell(strDataCol + j).border = {
//                left: { style: "medium" },
//                top: { style: "thin" },
//                bottom: { style: "thin" },
//                right: { style: "thin" }
//              };
//            } else if (k == arColumns.length - 1) {
//              ws.getCell(strDataCol + j).border = {
//                left: { style: "thin" },
//                top: { style: "thin" },
//                bottom: { style: "thin" },
//                right: { style: "medium" }
//              };
//            } else {
//              ws.getCell(strDataCol + j).border = {
//                left: { style: "thin" },
//                top: { style: "thin" },
//                bottom: { style: "thin" },
//                right: { style: "thin" }
//              };
//            }
//            strDataCol = String.fromCharCode(strDataCol.charCodeAt(0) + 1);
//          }
//        }
//      }
//      j = j + 1;
//    }

//    workbook.xlsx.writeBuffer().then(data => {
//      const blob = new Blob([data], { type: "application/octet-stream" });
//      var dt = new Date();
//      var strdt;
//      strdt = dt
//        .toString()
//        .split("GMT")[0]
//        .trim();
//      var fileName = reportName + strdt + ".xlsx";
//      FileSaver.saveAs(blob, fileName);
//    });
//  }

getRandomBorColor() {
var letters = "0123456789ABCDEF";
var color = "#";
for (var i = 0; i < 6; i++) {
color += letters[Math.floor(Math.random() * 12)];
}
return color;
}

  render() {
   
    const {arrData, arrLabels, yaxisName,lastAlertdata, fromDate ,toDate ,bgColors,selectedSensorsType1, borderColors,DataArray,in_prog,
      selectedSPValue, selectedCustValue,selectedSubCustValue, selectedAssets,selectedDeviceName,selectedSensorsName
    }= this.state.body;
    var state   =   this.state.body;
    var total_page  =   Math.ceil(this.state.body.total_count/this.state.body.page_size);
    var page_start_index    =   ((state.page-1)*state.page_size);
    if (this.state.body.Spinnerdata == true) {
    
    return (
       
      <div className ="container ">
      
          <section className ="content"  >
       
          <div className="box box1">
          <div className="box-header with-border">
          
          {/* <div className="row">
                   <div className="col-lg-3 col-md-4 col-sm-10 col-xs-12">
                   <label> SELECT SERVICE PROVIDER</label>
                   <SelectionInput 
                        label={this.state.selectedSPValue}
                        namefor="SERVICE PROVIDER :"
                        names = {spCd}
                        defaultDisabled = {this.state.spDisable}
                        Change = {this.handleSp}
                        
                       />
                   </div>
                   <div className="col-lg-3 col-md-4 col-sm-10 col-xs-12">
                   <label className="text-center">SELECT CUSTOMER</label>
                   <SelectionInput 
                            label={this.state.selectedCustValue}
                            namefor="CUSTOMER :"
                            names = {custCd}
                            defaultDisabled = {this.state.custDisable}
                            Change = {this.handleCutMr}
                            />
                   </div>
                   <div className="col-lg-3 col-md-4 col-sm-10 col-xs-12">
                   <label className="text-center">SELECT SUBCUSTOMER</label>
                   <SelectionInput 
                            label={this.state.selectedSubCustValue}
                            namefor="SUBCUSTOMER :"
                            names = {subCustCd}
                            defaultDisabled = {this.state.subCustDisable}
                            Change = {this.handleSubCs}
                            />
                            
                   </div>
                   <div className= "col-lg-3 col-md-3 col-sm-10 col-xs-12">
                   <button onClick = {this.submitBtn.bind(this)} className= "btn btn-md btn-success mt-5 btnalig">Submit</button>
                   </div>
                   </div>
                  */}

               {/* <p className= "line2"></p>
          <div className="width1">
          <label className="text-center">SELECT ASSETS</label>
           <Nav bsStyle="pills" activeKey={this.state.selectedAssets} onSelect={this.clickAsset}>
         { this.state.Assets.map(item =>  
          <NavItem eventKey={item} >
           {item}
          </NavItem>
         )}
        </Nav>    
         </div> 
        <p className= "line2"></p>
         <div className="width1">
         <label className="text-center">SELECT DEVICES </label>
      <Nav bsStyle="pills" activeKey={this.state.mac} onSelect={this.clickDevices}>
          { this.state.Devices.map(item =>  
            <NavItem eventKey={item.mac} >
            {item.DeviceName}
            </NavItem>
          )}

        </Nav>
         </div> */}
          </div>
          </div>
          <div className="row"> 
            <div className="col-lg-12">  <p className= "line2"></p>
       <div className="col-lg-12">
       <div className="ViewBredCum">
       {/* <span className="spanBredcum">{(selectedSPValue != "")?selectedSPValue: ""}</span> <span  className="spanBredcumslash" >/</span>  */}
       <span  className="spanBredcum">{(selectedCustValue != "")?selectedCustValue: ""} </span><span className="spanBredcumslash">/</span>
      <span  className="spanBredcum"> {(selectedSubCustValue != "")?selectedSubCustValue: "" }</span> <span className="spanBredcumslash">/</span> 
      <span  className="spanBredcum">{(selectedAssets != "")?selectedAssets: ""} </span> <span className="spanBredcumslash">/</span> 
       <span  className="spanBredcum">{(selectedDeviceName != "")? selectedDeviceName: ""}</span>
       {/* <span className="spanBredcumslash">/</span>  */}
       {/* <span  className="spanBredcum"> {(selectedSensorsName != "")? selectedSensorsName: ""}</span> */}
     <div className="navright"><span  className="spanNev"  onClick={() =>{ 
                         this.props.history.push("/NevMenu")}}>Device Menu</span>
     <span className="spanNev"  onClick={() =>{ 
                         this.props.history.push("/activeDashbord")}}>Operating Dashboard</span>
     </div>
      </div>
      </div>
      </div>
      </div>
        <div className="row">
       <div className = "col-lg-9 col-sm-6 col-xs-12">
       <div className= "custmDivSensorUpper">
      

       <div className= "wrapperSenSors">
        { this.state.body.Sensors.map(item => 
            <span className="custmDivSensor">
                <Sensors key = {item.nameofbsnm} 
                  bgclass={item.bgClass}
                  label= {"Sensor"+" "+item.nameofbsnm} 
                  P_name_class= "color12 " 
                  dateTime = {item.lastUpdatedTime}
                  takenClass= "takenclass"
                  message={item.valuseS}
                  iconclass="fas fa-wind"
                  div_icon_class="icon"
                  heading_class_name=" color12 head"
                  fotter_class ="small-box-footer"
                  Change ={this.handler.bind(this, item.sensorsNM,item.nameofbsnm)}
                />
                </span>
            )}
            </div>
            </div>
            </div>

            {/* <div className="col-lg-3 col-xs-12">
            <Sensors 
             bgclass="small-box bg-green"
            label= "Current Humidity" 
            P_name_class= "color12 " 
            heading_class_name=" color12 head"
            message="0"
            iconclass="fas fa-wind"
            div_icon_class="icon"
            fotter_class ="small-box-footer"
            Change ={this.handler.bind(this,"humidity","#00a65a")}
             />
             </div>
           
            <div className="col-lg-3 col-xs-12">
            <Sensors 
             bgclass="small-box bg-red"
            label= "Current Co2" 
            P_name_class= "color12 " 
            heading_class_name=" color12 head"
            message="0.00%"
            iconclass="far fa-chart-bar"
            div_icon_class="icon"
            fotter_class ="small-box-footer"
            Change ={this.handler.bind(this,"CarbonD","#dd4b39")}
             /> */}
          {/* <i class="far fa-times-circle"></i> */}
            {/* </div> */}
            <div className="col-lg-3 col-sm-4 col-xs-12">


             <div className="small-box bg-red" title= {lastAlertdata.businessNmValues} >
             <div className="inner"><p className= "color12 dashlastAlert ">{(lastAlertdata.shortName)?lastAlertdata.shortName:"No Alerts Triggered"}</p>
            {/* <p className= "color12 ">{lastAlertdata.businessNmValues}</p> */}
           
            <p className="takenclass">Last Taken At:  { (lastAlertdata.createdTime)?dateFormat(lastAlertdata.createdTime, "dd-mmm HH:MM"):"0.0.0.0"}</p>
           
            </div>
            <div className=" fontsizeicon icon"><i className="fas fa-exclamation-triangle"></i>
            </div>
            <a href="javascript:void(0)" className= "small-box-footer">&nbsp;</a>
            </div>
            {/* <Sensors 
             bgclass="small-box bg-red"
            label= {lastAlertdata.businessNmValues} 
            takenClass= "takenclass"
            P_name_class= "color12 " 
            dateTime = { dateFormat(lastAlertdata.createdTime, "dd-mmm HH:MM")}
            heading_class_name=" color12 head"
            message= {lastAlertdata.shortName} 
            iconclass="far fa-times-circle"
            div_icon_class="icon"
            fotter_class ="small-box-footer"
            Change ={this.handler.bind(this, "Water-label","#f39c12")}
             /> */}
            </div>
            </div>
            </section>
  
            <div className ="container">
           
                   <div className="col-lg-10 col-md-10 col-sm-5 col-xs-9">
                   </div>
                   <div className="col-lg-2 col-md-2 col-sm-7 col-xs-3">
                   <span className="spanchart">#ROWS </span>
                  <select onChange={this.changePagesize} className=" selectcolor" value={this.state.body.page_size}   id="Page_Size">{this.state.body.page_size}
                   
                   {["10","20","50","100"].map( n => 
                     <option className="selectcolor " value={n}>{n}</option>)
                     }
                   
                   </select>  
                   {/* <button type="button" onClick={this.downloadToExcel.bind(this)}>downloadToExcel</button>  */}
                   </div>
            </div>
            <div className="chart-container" >
        <Chartcom 
        type="line"
        arrData ={arrData}
        arrLabels= {arrLabels}
        legend= {yaxisName}
        xAxisLbl = "Date and Time"
        yAxisLbl = {yaxisName}
        // bgColors ={bgColors}
        borderColors= {borderColors}
        />
        </div>
        {/* <div className= "custNav btn-group">
      
         <button  className="btn btn-sm btn-secondary" onClick={this.downloadToExcel.bind(this)}><i class="far fa-file-excel iconfont"></i></button>
        </div> */}
        <div className ="sokettablemr">
         <div  className="table-responsive">
        <Table  className="table table-hover table-sm table-bordered cust">
        <thead className='bg' style={{background: "gainsboro"}}>
        <tr>
        <th className='text-center '> SI</th>
        <th className='text-center '>Device</th>
        <th className='text-center '>Device Name</th>
        <th className='text-center '>Sensors Name</th>
        <th className='text-center '>Values</th>
        <th className='text-center '>Created Time</th>
      </tr>
        </thead>
        <tbody>
        { state.in_prog && <tr><td colSpan={8} className='text-center'><i className='fa fa-refresh fa-spin'></i> Loading..</td></tr>}
        { !state.in_prog && state.DataArray.length == 0 && <tr><td colSpan={8} className='text-center'> No Data </td></tr>}
        {  !state.in_prog && DataArray.map( (user,i) => {
              return  <tr key={i}>
              <td className='text-center'>{ page_start_index+i + 1}</td>
              
              <td className='text-center'>{user.column1}</td>
              <td className='text-center'>{user.column2}</td>
              <td className='text-center'>{user.column3}</td>
              <td className='text-center'>{user.column4}</td>
              <td className='text-center'>{user.column5}</td>
              </tr>
       
            })
              }
          </tbody>
          { "Pages: " +total_page }
          </Table>
          </div>
          <div className='align-right'>
{ total_page > 1 && <CPagination  page={state.page} totalpages={total_page} onPageChange={this.changePage}/>}
        </div>
        </div>
      </div>


     
    )
  }else
  {
    return <Spinner />;
  }
  } 
}
export default socketdashbord;
