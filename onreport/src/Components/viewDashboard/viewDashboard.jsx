import React, { Component } from 'react'
import "./socketdashbord.css"
import Sensors from "../../layout/widgetofSensors/sensorsCantainer";
import Chartcom from "../../layout/widgetofSensors/chartCom";
import { Table } from 'react-bootstrap';
import socketIOClient from "socket.io-client";
import axios from "axios";
import moment from 'moment';
import CPagination from "../../layout/Pagination";
import DatePicker from 'react-datepicker';
// import * as ExcelJs from "exceljs/dist/exceljs.min.js";
// import * as FileSaver from "file-saver";
import dateFormat from "dateformat";
import swal from 'sweetalert';
import Spinner from '../../layout/Spinner';
import { NavItem, Nav } from "react-bootstrap";
import URL from "../../Common/confile/appConfig.json";
class viewDashboard extends Component {
  constructor() {
    super();
    this.state = {
      open: true,
      openChartMenu: true,
      body: {
        endpoint: `${URL.IP}:4001`,
        socket1: {},
        arrData: [],
        arrLabels: [],
        yaxisName: '',
        fromDate: '',
        toDate: '',
        bgColors: [],
        borderColors: [],
        DataArray: [],
        'total_count': 0,
        'page_size': 10,
        'page': 1,
        selectedSPValue: '',
        selectedCustValue: '',
        selectedSubCustValue: '',
        spDisable: null,
        subCustDisable: null,
        custDisable: null,
        Sensors: [],
        selectedSensorsType1: '',
        mac: '',
        deviceType: "",
        deviceTypeObj: {},
        selectedAssets: '',
        excelresult: [],
        lastupdatedData: [],
        lastUpdatedTime: '',
        Spinnerdata: false,
        'in_prog': false,
        sensorsNM: "",
        selectedSensorsName: "",
        lastAlertData: {
          alertText: "",
          businessNm: "",
          businessNmValues: "",
          createdTime: "",
          criteria: "",
          sensorNm: "",
          shortName: ""
        },
        deviceIdentifier: [],
        DeviceIdentifierForSensors: [],
        sensorsGroups: [],
        selectedGroups: {},
        sensorsMainData: [],
        selectedGroupsitem: "",
        selectedSensorsDataArray: [],
        headerTable: [],
        OpratingDashBoardEnable: Boolean,
        typeOfNavData: [{type:"Normal", disable: ["Max","Avg","Min","Durations","Count"]},{ type:"Hourly", disable: ["Values"]},{type:"Daily", disable: ["Values"]}, {type:"Weekly", disable: ["Values"]}, {type:"Monthly", disable: ["Values"]}],
        selectedNevData: "",
        typeOfGraph: ["MULTI", "SINGLE"],
        selectedgraphType: "",
        selectedEntitiesType: "",
        selectedEntitiesValues: [],
        selectedEntitiesValuesflag: {},
        selectedEntity: "",
        selectedEntitiesClass: "",
        selectedDataInfoType: "",
        selectedDataInfoTypeValuesflag: {},
        selectedDataInfoTypeValues: [],
        selectedDataInfoDefault: "Avg",
        selectedDataInfoClass: "",
        arrayOfDataIfoDisplay: [{"type":"Values","name":"name1", "disable": false}, {"type":"Max","name":"name1", "disable": false}, {"type":"Avg","name":"name1", "disable": false}, {"type": "Min","name":"name1","disable": false},{"type": "Count","name":"name1","disable": false},{"type":"Durations", "name":"name1","disable": false}],
        startTime: "",
        endTime: "",
        mainjson: {},
        tableSecondKeyArray:[]
      }
    }
    this.changePage = this.changePage.bind(this);
    this.changePagesize = this.changePagesize.bind(this);
  }
  changePage(page) {
    this.state.body.page = page
    this.setState({ body: this.state.body });
   // this.fetchdata();
   this.submit();
  }
  toggle() {
    this.setState({
      open: !this.state.open
    });
  }
  toggleChartMenu() {
    this.setState({
      openChartMenu: !this.state.openChartMenu
    });
  }
  changePagesize(e) {
    var me = this
    var page = 1;
    me.state.body.page_size = e.target.value;
    me.state.body.page = page;
    me.setState({ body: me.state.body });
    //this.fetchdata()
    this.submit();
  }
  handler(selectedSensorsType1, selectedSensorsName) {
    var me = this;
    me.state.body.page = 1;
    me.state.body.selectedSensorsType1 = selectedSensorsType1;
    me.state.body.selectedSensorsName = selectedSensorsName;
    this.setState({ body: me.state.body });
    this.fetchdata();
  }

  chartsIdbyDeviceType(deviceType) {
    let tempData = JSON.parse(sessionStorage.getItem("ClientObj"));
    console.log("chartsIdbyDeviceType");
    console.log(tempData)
    let obj = tempData.viewDashBoard.deviceTypes[deviceType].map(item => { return { "businessName": item.businessName, "axisY": item.axisY } })

    return obj;
  }
  componentDidMount() {
    var me = this;
    let mainData = JSON.parse(sessionStorage.getItem("configData"));
    let tempData = JSON.parse(sessionStorage.getItem("dashboardConfigobj"));
    //  me.state.body.deviceType            =     tempData.DeviceType;
    me.state.OpratingDashBoardEnable = tempData.OpratingDashBoardEnable
    //   me.state.body.deviceTypeObj         =     this.chartsIdbyDeviceType(tempData.DeviceType);
    me.state.body.selectedSPValue = mainData.spCd;
    me.state.body.selectedCustValue = mainData.custCd;
    me.state.body.selectedSubCustValue = mainData.subCustCd;
    me.state.body.mac = mainData.mac;
    me.state.body.selectedDeviceName = mainData.DeviceName;
    me.state.body.selectedAssets = mainData.assetId;
    // me.handleNavForData("Normal");
    me.state.body.selectedNevData = "Normal";
    me.dataTypeDisable();
    //  me.state.body.selectedgraphType = "MULTI";
    // // me.state.body.Spinnerdata = false
    // // console.log(URL.IP);
    me.setState({ body: me.state.body });
    // me.graphProcess();
    //  var result1 = this.groupingDataArray();
    //  //console.log(result1)
    // me.submit()
    this.startFunction()

  }
dataTypeDisable(){
  let me = this;
  let dataInfo=  me.state.body.typeOfNavData.find(item => item.type === me.state.body.selectedNevData);
  // if(value ==="Normal"){
    me.state.body.arrayOfDataIfoDisplay.findIndex(i => i.disable = false);
    dataInfo.disable.map(item => {
      let index =  me.state.body.arrayOfDataIfoDisplay.findIndex(i => i.type === item);
      me.state.body.arrayOfDataIfoDisplay[index].disable = true; });
    me.setState({ body: me.state.body });

}
  async startFunction() {
    var me = this;
    let response = await me.callDeviceIdentifier();
    // console.log(response)
    me.callToSocket();
    var dashboardData = JSON.parse(sessionStorage.getItem("dashboardConfigobj"));
    me.state.body.Assets = dashboardData.Assets;
    me.state.body.Devices = dashboardData.Devices;
    // me.state.body.selectedSensorsType1  =   dashboardData.ActivesesnorsType;
    // me.state.body.selectedSensorsName   =   dashboardData.ActiveSensorsName;
    me.state.body.page_size = 10;
    me.state.body.page = 1;
    me.state.body.selectedgraphType = "MULTI";
    // me.state.body.Spinnerdata = false
    // console.log(URL.IP);
    
    
    me.setState({ body: me.state.body });
    me.graphProcess();
    me.callForlastAlert(me.state.body.selectedCustValue, me.state.body.selectedSubCustValue, me.state.body.mac);
    me.firstTimeRender();
    me.fetchdata();
  }
  callDeviceIdentifier() {
    return new Promise((resolve, reject) => {
      var me = this;
      axios.post(`${URL.IP}:3992/getDevicesIdentifier`, { mac: this.state.body.mac })
        .then(json => {
          me.state.body.DeviceIdentifierForSensors = json["data"].sensors;
          json["data"].sensors.map(item => {item["BsType"]= "sensors"});
          json["data"].channel.map(item => {item["BsType"]= "channel"});
        
          let tempArray = (json["data"].sensors).concat(json["data"].channel)

          console.log("This is Device Identifier json");
          // console.log(tempSdata);
          console.log(tempArray)
          // let tempCSArray = [];
              me.state.body.deviceIdentifier = tempArray;
          var groupedData = this.groupingDataArray(tempArray)
          let index = groupedData.findIndex(item => item.group === json["data"].defaultGroupInfo);
          let index2 = tempArray.findIndex(item => item.group === json["data"].defaultGroupInfo);

          me.state.body.sensorsGroups = groupedData;
          console.log("This is Group Data");
          console.log(groupedData);
          me.state.body.selectedGroups = groupedData[index];
          me.state.body.selectedGroupsitem = groupedData[index].group;
          me.state.body.selectedSensorsType1 = tempArray[index2].Type;
          me.state.body.selectedSensorsName = tempArray[index2].devicebusinessNM;
          me.state.body.selectedSensorsDataArray = groupedData[index].devicebusinessNM;
          me.state.body.selectedEntitiesValues= groupedData[index].devicebusinessNM;
          console.log(groupedData[index].devicebusinessNM)
          me.state.body.deviceType = json["data"].deviceTypes;
          me.state.body.deviceTypeObj = this.chartsIdbyDeviceType(json["data"].deviceTypes);
          me.setState({ body: me.state.body })
          // let json1 =[];
          resolve({ "get": "success" })
        }).catch(error => {
          me.state.body.Spinnerdata = true;
          // me.state.body.mainjson= {};
          this.errorganerator()
          me.setState({ body: me.state.body });
          reject(error)
    })
  })
  }
  DisplayChart() {
    let me = this;
    let result = JSON.parse(JSON.stringify(me.state.body.DataArray))
    //  console.log(result)
    if (result.length > 0) {
      let arrData = [];
      let arrLabels = [];
      let dataToSend1 = [];
      let dataToSend2 = [];
      result.sort((a, b) => new Date(a.column5).getTime() - new Date(b.column5).getTime())
      for (let i = 0; i < result.length; i++) {
        let formattedDate = dateFormat(result[i]["column5"], "dd-mmm HH:MM");
        //  var arrayforsend= [];
        let temp = {};
        for (let j = 0; j < me.state.body.tableSecondKeyArray.length; j++) {

          temp[me.state.body.tableSecondKeyArray[j]] = result[i][me.state.body.tableSecondKeyArray[j]];

        }
        dataToSend1.push(temp);
        dataToSend2.push(
          formattedDate
        );
      }
      arrData = dataToSend1;
      arrLabels = dataToSend2;
      // var yaxisName = valueSensoor;
      let fromDate = new Date();
      // var toDate = new Date();
      let  borderColors = [];
      // for (var i = 0; i <  arrData.length; i++) {
      borderColors.push(this.getRandomBorColor());
      me.state.body.arrData = arrData;
      me.state.body.arrLabels = arrLabels;
      // me.state.body.yaxisName = yaxisName;
      me.state.body.fromDate = fromDate;
      me.state.body.borderColors = borderColors;
      this.setState({ body: me.state.body });
      // }
    }
    else {
      me.state.body.arrData = undefined;
      me.state.body.arrLabels = undefined;
      me.state.body.yaxisName = undefined;
      me.state.body.fromDate = undefined;
      me.state.body.borderColors = undefined;
      this.setState({ body: me.state.body });
    }
  }
  fetchdata() {
    let me = this;
    me.state.body.in_prog = true;
    me.setState({ body: me.state.body });
    let body = {
      TypeOfData: me.state.body.selectedNevData,
      sensorNm: me.state.body.selectedSensorsType1,
      sensorsBSN: me.state.body.selectedSensorsName,
      spCd: me.state.body.selectedSPValue,
      custCd: me.state.body.selectedCustValue,
      subCustCd: me.state.body.selectedSubCustValue,
      mac: me.state.body.mac,
      page: me.state.body.page,
      page_size: me.state.body.page_size,
      startTime: me.state.body.startTime,
      endTime: me.state.body.endTime
    }
    me.state.body.in_prog = true;
    me.state.body.Spinnerdata = false;
    me.setState({ body: me.state.body });
    // var FdataArray = [];
    // var dataArray = [];
    axios.post(`${URL.IP}:3992/getdashboard`, body)
      .then(json => {
          me.state.body.mainjson= json;
          console.log(json)
          me.setState({ body: me.state.body })
          // me.DisplayChart();
        // }
        me.callMainDataProcess()
      })
      .catch(error => {
        // me.DisplayChart();
        me.callMainDataProcess()
        me.state.body.Spinnerdata = true;
        me.state.body.mainjson= {};
        me.setState({ body: me.state.body });
        this.errorganerator()
       
      })
  }
  callMainDataProcess(){
    let me = this;
    console.log("This is Call of CallMainDataProcess")
    try{
      console.log("This is Call of CallMainDataProcess Try")
      me.state.body.Spinnerdata = true;
      me.setState({ body: me.state.body })
    let json = me.state.body.mainjson;
    let json1 = [];
    let dataArray = [];
    let arrayHeder = [];
     console.log("this is Source of data ");
     console.log(json["data"]);
    json1 = json["data"]["finalResult"]
    if (json1 !== 0) {
      for (let i = 0; i < json1.length; i++) {
        let jsontemp = {
          column1: json1[i][0],
          column2: json1[i][1],
          column5: dateFormat(json1[i][4], "dd-mmm-yy HH:MM:ss")
        };
        // console.log(me.state.body.selectedGroups.devicebusinessNM)
        arrayHeder = ["SI", "DEVICE NAME"];
        let sensorsKeys =  me.state.body.selectedEntitiesValues;
        let arrayOfDisplayData = me.state.body.selectedDataInfoTypeValues.map(item => item);
        console.log("arrayOfDisplayData");
        console.log(arrayOfDisplayData);
        if(me.state.body.selectedNevData !== "Normal"){
          // if(arrayOfDisplayData.filter(item => item == "Values").length !== 0){
          //  arrayOfDisplayData = arrayOfDisplayData.splice(arrayOfDisplayData.findIndex(item => item == "Values"),1);
          // }
          if( me.state.body.selectedgraphType !== "MULTI"){
            me.state.body.tableSecondKeyArray = arrayOfDisplayData;
          for (let k = 0; k < sensorsKeys.length; k++) {
            for(let j =0 ; j< arrayOfDisplayData.length;j++){
              jsontemp[arrayOfDisplayData[j]] = json1[i][3][sensorsKeys[k]][arrayOfDisplayData[j]];
            }
          }
         
          for (let l = 0; l < arrayOfDisplayData.length; l++) {
            arrayHeder.push(arrayOfDisplayData[l]);
          }
          arrayHeder.push("CREATED TIME");
          dataArray.push(
            jsontemp
          )
     
          }
          else{
            me.state.body.tableSecondKeyArray = sensorsKeys;
            for (let k = 0; k < sensorsKeys.length; k++) {
              let temD =   me.getBsType(sensorsKeys[k]);
              if(temD === "channel"){
              for(let j =0 ; j< arrayOfDisplayData.length;j++){
                jsontemp[sensorsKeys[k]] = json1[i][3][sensorsKeys[k]]["Durations"];
              }
            }else{
              for(let j =0 ; j< arrayOfDisplayData.length;j++){
                jsontemp[sensorsKeys[k]] = json1[i][3][sensorsKeys[k]][arrayOfDisplayData[j]];
              }
            }

            }
            for (let l = 0; l < sensorsKeys.length; l++) {
              arrayHeder.push(sensorsKeys[l]);
            }
            arrayHeder.push("CREATED TIME");
            dataArray.push(
              jsontemp
            )
          }
        }
        else{
          me.state.body.tableSecondKeyArray = sensorsKeys;
          for (let k = 0; k < sensorsKeys.length; k++) {
            jsontemp[sensorsKeys[k]] = json1[i][3][sensorsKeys[k]];
          }
           arrayHeder = ["SI", "DEVICE NAME"];
          for (let l = 0; l < sensorsKeys.length; l++) {
  
            arrayHeder.push(sensorsKeys[l]);
          }
          arrayHeder.push("CREATED TIME");
          dataArray.push(
            jsontemp
          )
        }
      }
      console.log("This is header Of table")
      console.log(arrayHeder)
      console.log("This is Data Array")
      console.log(dataArray)

      let lastUpdatedTime = dateFormat(json["data"]["lastCreatedTime"], "dd-mmm-yy HH:MM:ss")
      // console.log("This is dataArray");
      // console.log(dataArray);
      me.state.body.headerTable = arrayHeder
      me.state.body.DataArray = dataArray;
      me.state.body.in_prog = false;
      me.state.body.total_count = json["data"]["data_count"];
      me.state.body.lastupdatedData = json["data"]["lastdataObj"];
      me.state.body.lastUpdatedTime = lastUpdatedTime;
    
    }
    else{
      me.state.body.DataArray = [];
      me.state.body.in_prog = false;
      me.state.body.total_count = 0;
      me.state.body.Spinnerdata = true;
      // me.state.body.in_prog = false;
      // me.setState({ body: me.state.body })
    }
    me.setState({ body: me.state.body })
    me.DisplayChart();
  }
  catch(err){
    me.state.body.DataArray = [];
    me.state.body.in_prog = false;
    me.state.body.total_count = 0;
    me.state.body.Spinnerdata = true;
    // me.state.body.in_prog = false;
    me.setState({ body: me.state.body })
    console.log("This is Call of CallMainDataProcess Try")
    me.errorganerator()
  }
  }

  callToSocket() {

    const { endpoint, socket1 } = this.state.body;
    var me = this;
    var body = {
      sensorNm: me.state.body.selectedSensorsType1,
      sensorsBSN: me.state.body.selectedSensorsName,
      spCd: me.state.body.selectedSPValue,
      custCd: me.state.body.selectedCustValue,
      subCustCd: me.state.body.selectedSubCustValue,
      mac: me.state.body.mac,
      page: me.state.body.page,
      page_size: me.state.body.page_size
    }
    if (Object.entries(socket1).length !== 0 && socket1.constructor !== Object) {
      socket1.emit("end");
      // console.log(socket1);
    }

    const socket = socketIOClient(endpoint + "/onViewDashboard", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 99999
    });
    // console.log("This is log of socket");
    // console.log(socket)
    me.state.body.socket1 = socket;
    me.setState({ body: me.state.body });
    var dashboardData = JSON.parse(sessionStorage.getItem("dashboardConfigobj"));
    var arrayOfsensors = dashboardData.Sensors;
    var arrayofbgClass = dashboardData.SensorsBgC;
    socket.emit('lastUpdatedValue', body);
    socket.on("onViewDashboard", data => {
      //console.log("This is socket ");
      //console.log(data.sensors);
      var dataofSensors = [];
      if (me.state.body.selectedGroups.devicebusinessNM !== undefined && me.state.body.selectedGroups.devicebusinessNM != null && me.state.body.selectedGroups.devicebusinessNM.length !== 0) {

        //console.log(data)
        //console.log(me.state.body.selectedGroups.devicebusinessNM)
        for (let i = 0; i < me.state.body.selectedGroups.devicebusinessNM.length; i++) {
          dataofSensors.push(data.sensors.filter(item => item.devicebusinessNM === me.state.body.selectedGroups.devicebusinessNM[i])[0])
        }
        // console.log(dataofSensors)
        // console.log(this.state.body.selectedGroups);
        me.state.body.selectedSensorsType1 = dataofSensors[0].type;
        me.state.body.selectedSensorsName = dataofSensors[0].devicebusinessNM;
        me.state.body.sensorsMainData = data.sensors;
        // me.setState({body: me.state.body})
        var array = [];
        // console.log(dataofSensors)
        for (var i = 0; i < dataofSensors.length; i++) {
          array.push({
            "sensorsNM": dataofSensors[i].type,
            "bgClass": arrayofbgClass[i],
            nameofbsnm: dataofSensors[i].devicebusinessNM,
            valuseS: dataofSensors[i].Value,
            lastUpdatedTime: dateFormat(dataofSensors[i].dateTime, "dd-mmm-yy HH:MM:ss")
          });
        }
        for (var j = 0; j < array.length; j++) {
          if (array[j].lastUpdatedTime !== me.state.body.Sensors[j].lastUpdatedTime) {
            me.state.body.Sensors = array;
            me.setState({ body: me.state.body });
            break;
          }
        }
      }

    });
  }
  handleNavForData = (value) => {
    var me = this;
    me.state.body.selectedNevData = value;

    // if(me.state.body.selectedNevData ==="Normal"){
    //   me.state.body.selectedDataInfoTypeValues = ["Values"];
    // }else{

    //   if(me.state.body.selectedDataInfoTypeValues.filter(item => item ==="Values").length !==0){
    //   let index =  me.state.body.selectedDataInfoTypeValues.findIndex(item => item ==="Values");
    //   me.state.body.selectedDataInfoTypeValues.splice(index, 1);

    //   }
    // }
// }
// console.log(dataInfo)
    me.setState({ body: me.state.body })

  }
  submit(){
    // alert("This is Submit Call")
     let me = this;
    // if(me.state.body.selectedNevData ==="Normal"){
    //   me.state.body.selectedDataInfoTypeValues = ["Values"];
    // }else{
    //   if(me.state.body.selectedDataInfoTypeValues.filter(item => item ==="Values").length !==0){
    //   let index =  me.state.body.selectedDataInfoTypeValues.findIndex(item => item ==="Values");
    //   me.state.body.selectedDataInfoTypeValues.splice(index, 1);

    //   }
    // }
    me.dataTypeDisable();
     me.setState({body : me.state.body})
    this.graphProcess();
    this.fetchdata();
  }
  methodForDataDisplayBySingleTypeProcess(value){
    let me = this;
    if(me.state.body.selectedNevData !== "Normal"){
    // if (me.state.body.selectedgraphType === "MULTI") {
      // me.state.body.selectedSensorsDataArray.map( key => {
        // me.state.body.arrayOfDataIfoDisplay.map(item => {me.state.body.selectedDataInfoTypeValuesflag[item.type] = false });
        me.state.body.selectedDataInfoTypeValues = [];
        let index =  me.state.body.deviceIdentifier.findIndex(item => item.devicebusinessNM === value );
       let temV =  me.state.body.deviceIdentifier[index].BsType;
       if(temV === "channel"){
        me.state.body.arrayOfDataIfoDisplay.map(i => {i.disable = false});
     ["Values","Max","Min","Avg"].map(item => {  
        let index =  me.state.body.arrayOfDataIfoDisplay.findIndex(i => i.type === item);
        me.state.body.arrayOfDataIfoDisplay[index].disable = true;
         me.state.body.selectedDataInfoTypeValuesflag[item] = false;
      });
      // me.state.body.selectedDataInfoTypeValues = ["Durations","Count"];
      ["Durations","Count"].map(item =>{  me.state.body.selectedDataInfoTypeValuesflag[item] = true ;
        me.state.body.selectedDataInfoTypeValues.push(item)}); 


       }else{
        
        me.state.body.arrayOfDataIfoDisplay.map(i => {i.disable = false});   
        ["Values","Durations"].map(item => {  
          let index =  me.state.body.arrayOfDataIfoDisplay.findIndex(i => i.type === item);
          me.state.body.arrayOfDataIfoDisplay[index].disable = true;
           me.state.body.selectedDataInfoTypeValuesflag[item] = false;
        });
        // me.state.body.selectedDataInfoTypeValues = ["Max","Min","Avg","Count"];
        ["Max","Min","Avg","Count"].map(item => {  me.state.body.selectedDataInfoTypeValuesflag[item] = true ;
          me.state.body.selectedDataInfoTypeValues.push(item)
        }); 
       }
   
       me.setState({ body: me.state.body })
        // })
    // }
    // else{

    // }
      }
     
  }
  getBsType(value){
    let me = this;
    let index =  me.state.body.deviceIdentifier.findIndex(item => item.devicebusinessNM === value );
    return me.state.body.deviceIdentifier[index].BsType;
  }
  graphProcessForMultiCase(){
    let me = this;
    if(me.state.body.selectedNevData !== "Normal"){
      me.state.body.selectedDataInfoTypeValuesflag[me.state.body.selectedDataInfoDefault] = true
      me.state.body.selectedDataInfoTypeValues =  [me.state.body.selectedDataInfoDefault] 
   let temD =  me.state.body.selectedSensorsDataArray.find( item =>  me.getBsType(item) === "channel" );
   if(temD !== undefined){
     let index = me.state.body.arrayOfDataIfoDisplay.findIndex(item => item.type === "Durations");
     me.state.body.arrayOfDataIfoDisplay[index].name = "name4";
     me.state.body.arrayOfDataIfoDisplay[index].disable = false;
     me.state.body.selectedDataInfoTypeValuesflag["Durations"] = true

   //  me.state.body.selectedDataInfoTypeValues.push("Durations") 
   
   }
   else{
    let index = me.state.body.arrayOfDataIfoDisplay.findIndex(item => item.type === "Durations");
    me.state.body.arrayOfDataIfoDisplay[index].name = "name1";
    me.state.body.arrayOfDataIfoDisplay[index].disable = true;
    me.state.body.selectedDataInfoTypeValuesflag["Durations"] = false
   }
   console.log("This is graphProcessForMultiCase")
    console.log(temD);
    let index = me.state.body.arrayOfDataIfoDisplay.findIndex(item => item.type === "Count");
    me.state.body.arrayOfDataIfoDisplay[index].disable = true;
    me.state.body.selectedDataInfoTypeValuesflag["Count"] = false
  
    }
    else{
      me.state.body.selectedDataInfoTypeValuesflag["Values"] = true
      me.state.body.selectedDataInfoTypeValues =  ["Values"] 
    }
    me.setState({ body: me.state.body })
  }
  graphProcess(){
    let me = this;
    if (me.state.body.selectedgraphType === "MULTI") {
      me.state.body.selectedEntitiesType = "checkbox";
      me.state.body.selectedEntitiesClass = "checkbox-inline";
      me.state.body.selectedSensorsDataArray.map(item => { me.state.body.selectedEntitiesValuesflag[item] = true });
      me.state.body.selectedEntitiesValues =  me.state.body.selectedSensorsDataArray.map(item => item)
      me.state.body.selectedDataInfoType = "radio";
      me.state.body.selectedDataInfoClass = "radio-inline";
      console.log("This is Log For graph Values")
      console.log(me.state.body.selectedDataInfoDefault)
      me.state.body.arrayOfDataIfoDisplay.map(item => { me.state.body.selectedDataInfoTypeValuesflag[item.type] =false});
      me.state.body.selectedDataInfoTypeValues  = [];
  
      console.log(  me.state.body.selectedDataInfoTypeValuesflag)
      me.setState({ body: me.state.body })
      me.graphProcessForMultiCase();
   
     }
    else {
      me.state.body.selectedEntitiesType = "radio";
      me.state.body.selectedEntitiesClass = "radio-inline";
      me.state.body.selectedSensorsDataArray.map(item => { me.state.body.selectedEntitiesValuesflag[item] = false });

      // if(me.state.body.selectedEntitiesValues.length === 0){
        let temSensorsName = (me.state.body.selectedEntity == "" || me.state.body.selectedEntity == undefined )? me.state.body.selectedSensorsName :  me.state.body.selectedEntity;
        
      me.state.body.selectedEntitiesValues = [temSensorsName];
      me.state.body.selectedEntitiesValuesflag[temSensorsName] = true;
        
      // }else{
        console.log("This is Single Bs Selected Data")
        console.log(me.state.body.selectedEntity);
        console.log( me.state.body.selectedEntitiesValues);
        console.log(temSensorsName)
        // me.state.body.selectedEntitiesValues = [me.state.body.selectedEntity];
        // me.state.body.selectedEntitiesValuesflag[me.state.body.selectedEntity] = true;
      // }
      me.state.body.selectedDataInfoType = "checkbox";
      me.state.body.selectedDataInfoClass = "checkbox-inline";
        me.state.body.arrayOfDataIfoDisplay.map(item => {me.state.body.selectedDataInfoTypeValuesflag[item.type] = true });
       // me.state.body.selectedDataInfoTypeValues =  me.state.body.arrayOfDataIfoDisplay.map(item => item.type);
     

      me.methodForDataDisplayBySingleTypeProcess(me.state.body.selectedSensorsName)
      me.setState({ body: me.state.body })
      if(me.state.body.selectedNevData !== "Normal"){
     //   me.state.body.selectedDataInfoTypeValues.splice(me.state.body.selectedDataInfoTypeValues.findIndex(item => item =="Values"),1)
      }
      else{
        me.state.body.arrayOfDataIfoDisplay.map(item => {me.state.body.selectedDataInfoTypeValuesflag[item.type] = false });
        me.state.body.selectedDataInfoTypeValues.push("Values");
        me.state.body.selectedDataInfoTypeValuesflag["Values"] = true;
        
      }
      me.setState({ body: me.state.body })
      }
      console.log("This is default SensorsName")
      console.log(me.state.body.selectedSensorsName)
   
  }
  graphType = (value) => {
    //alert(value)
    // console.log(value.target.value)
    console.log(value)
    let me = this
    me.state.body.selectedgraphType = value;
   
    me.setState({ body: me.state.body })
    me.graphProcess();
    me.callMainDataProcess()


  }
  EntitiesSeletction = (value) => {
    let me = this;

    if (me.state.body.selectedgraphType === "MULTI") {
      if (me.state.body.selectedEntitiesValues.filter(item => item == value).length == 0) {
        me.state.body.selectedEntitiesValuesflag[value] = !me.state.body.selectedEntitiesValuesflag[value];

        me.state.body.selectedEntitiesValues.push(value);
      } else {
        me.state.body.selectedEntitiesValuesflag[value] = !me.state.body.selectedEntitiesValuesflag[value];

        me.state.body.selectedEntitiesValues.splice(me.state.body.selectedEntitiesValues.findIndex(item => item == value), 1);
      }

    } else {
      me.state.body.selectedEntitiesValues = [];
      me.state.body.selectedSensorsDataArray.map(item => { me.state.body.selectedEntitiesValuesflag[item] = false });
      me.state.body.selectedEntitiesValuesflag[value] = !me.state.body.selectedEntitiesValuesflag[value];
      me.state.body.selectedEntitiesValues.push(value);
      me.methodForDataDisplayBySingleTypeProcess(value);
      me.state.body.selectedEntity = value;
    }

    
    console.log(value)
    console.log(me.state.body.selectedEntitiesValues)
    me.setState({ body: me.state.body })
    me.callMainDataProcess()


  }
  ClickInfoDisplay = (value) => {
    let me = this;
    if (me.state.body.selectedgraphType === "SINGLE") {
      if (me.state.body.selectedDataInfoTypeValues.filter(item => item == value).length == 0) {
        me.state.body.selectedDataInfoTypeValuesflag[value] = !me.state.body.selectedDataInfoTypeValuesflag[value];

        me.state.body.selectedDataInfoTypeValues.push(value);
      } else {
        me.state.body.selectedDataInfoTypeValuesflag[value] = !me.state.body.selectedDataInfoTypeValuesflag[value];

        me.state.body.selectedDataInfoTypeValues.splice(me.state.body.selectedDataInfoTypeValues.findIndex(item => item == value), 1);
      }

    } else {
      me.state.body.selectedDataInfoTypeValues = [];
      me.state.body.arrayOfDataIfoDisplay.map(item => { me.state.body.selectedDataInfoTypeValuesflag[item.type] = false });
      me.state.body.selectedDataInfoTypeValuesflag[value] = !me.state.body.selectedDataInfoTypeValuesflag[value];
      me.state.body.selectedDataInfoTypeValues.push(value);
      let temD =  me.state.body.selectedSensorsDataArray.find( item =>  me.getBsType(item) === "channel" );
      if(temD !== undefined){
      //  let index = me.state.body.arrayOfDataIfoDisplay.findIndex(item => item.type === "Durations");
     //   me.state.body.arrayOfDataIfoDisplay[index].name = "name4";
//me.state.body.arrayOfDataIfoDisplay[index].disable = false;
        me.state.body.selectedDataInfoTypeValuesflag["Durations"] = true
      // me.state.body.selectedDataInfoTypeValues.push("Durations") 
      
      }
    }


    console.log(value)
    console.log(me.state.body.selectedDataInfoTypeValues)
    me.setState({ body: me.state.body });
    me.callMainDataProcess()

  }
  handleGroups = (value) => {
    try {
      var me = this;
      var dashboardData = JSON.parse(sessionStorage.getItem("dashboardConfigobj"));
      var arrayofbgClass = dashboardData.SensorsBgC;
      me.state.body.selectedGroupsitem = value;
      let index = me.state.body.sensorsGroups.findIndex(item => item.group == value);

      me.state.body.selectedGroups = me.state.body.sensorsGroups[index];
      console.log(me.state.body.sensorsMainData)
      //  alert(value);
      var dataofSensors = [];
      for (let i = 0; i < me.state.body.selectedGroups.devicebusinessNM.length; i++) {
        dataofSensors.push(me.state.body.sensorsMainData.filter(item => item.devicebusinessNM == me.state.body.selectedGroups.devicebusinessNM[i])[0])
      }
      //  console.log(dataofSensors[0].type)
      //  console.log(dataofSensors[0].devicebusinessNM)
      var array = [];

      for (let i = 0; i < dataofSensors.length; i++) {
        array.push({
          "sensorsNM": dataofSensors[i].type,
          "bgClass": arrayofbgClass[i],
          nameofbsnm: dataofSensors[i].devicebusinessNM,
          valuseS: dataofSensors[i].Value,
          lastUpdatedTime: dateFormat(dataofSensors[i].dateTime, "dd-mmm-yy HH:MM:ss")
        });
      }
      me.state.body.selectedSensorsDataArray = dataofSensors.map(item => item.devicebusinessNM);
      console.log(me.state.body.selectedSensorsDataArray)
      me.state.body.selectedSensorsType1 = dataofSensors[0].type;
      me.state.body.selectedSensorsName = dataofSensors[0].devicebusinessNM;
      me.state.body.Sensors = array;
      me.setState({ body: me.state.body })
    //  me.fetchdata();
    me.submit()
    } catch (error) {
      console.log(error)
      this.errorganerator()
    }

  }
  errorganerator() {
    swal("Oops", "Something went wrong From Back End Services!", "error")
  }
  groupingDataArray(myArray) {

    var group_to_values = myArray.reduce(function (obj, item) {
      obj[item.group] = obj[item.group] || [];
      obj[item.group].push(item.devicebusinessNM);
      return obj;
    }, {});

    var groups = Object.keys(group_to_values).map(function (key) {
      return { group: key, devicebusinessNM: group_to_values[key] };
    });
    return groups;
  }
  callForlastAlert(custCd, subCustCd, mac) {
    var me = this;
    const { endpoint } = this.state.body;
    var body = { custCd, subCustCd, mac }
    // axios.post("http://URL.IP:3992/getdashbordlastalert", body)
    // .then(json =>  {
    var lastError = socketIOClient(endpoint + "/ActivelastError", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 99999
    });
    lastError.emit('lastErrorClientEmit', body);
    lastError.on('lastErrorServerEmit', function (data) {
      // console.log(data);
      // alert()
      if (data.createdTime != me.state.body.lastAlertData.createdTime) {
        me.state.body.lastAlertData.alertText = data.alertText;
        me.state.body.lastAlertData.businessNm = data.businessNm;
        me.state.body.lastAlertData.businessNmValues = data.businessNmValues;
        me.state.body.lastAlertData.createdTime = data.createdTime;
        me.state.body.lastAlertData.criteria = data.criteria;
        me.state.body.lastAlertData.sensorNm = data.sensorNm;
        me.state.body.lastAlertData.shortName = data.shortName;

        // me.state.body.lastAlertdata   =    json["data"];     
        me.setState({ body: me.state.body });
      }
    })
  }
  firstTimeRender() {
    var me = this
    var data = [];
    var dashboardData = JSON.parse(sessionStorage.getItem("dashboardConfigobj"));
    var arrayofbgClass = dashboardData.SensorsBgC;
    // var arrayOfsensors= dashboardData.Sensors;
    var obj = [];
    for (var i = 0; i < arrayofbgClass.length; i++) {
      var temobj = {};
      temobj["sesnorsType"] = "sensorType" + i;
      temobj["sensorsName"] = "sensor" + i;
      temobj["sensorsValues"] = 0.0;
      obj.push(temobj);
    }
    for (var i = 0; i < obj.length; i++) {
      data.push({
        "sensorsNM": obj[i].sesnorsType, "bgClass": arrayofbgClass[i],
        nameofbsnm: obj[i].sensorsName, valuseS: obj[i].sensorsValues, lastUpdatedTime: "00:00:00:00:00"
      });
    }
    me.state.body.Sensors = data;
    me.setState({ body: me.state.body });
    // }
  }
  getRandomBorColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 12)];
    }
    return color;
  }

  render() {
    const { arrData, deviceTypeObj, arrLabels, yaxisName, lastAlertData, fromDate, toDate, bgColors, selectedSensorsType1, borderColors, DataArray, in_prog,
      selectedSPValue, selectedCustValue, selectedSubCustValue, selectedAssets, selectedDeviceName, selectedSensorsName
    } = this.state.body;
    var state = this.state.body;
    var total_page = Math.ceil(this.state.body.total_count / this.state.body.page_size);
    var page_start_index = ((state.page - 1) * state.page_size);
    if (this.state.body.Spinnerdata == true) {

      return (

        <div className="container ">

          <section className="content"  >

            <div className="box box1">
              {/* <div className="box-header with-border">
          </div> */}
            </div>
            <div className="row">
              <div className="col-lg-12 ">
                <p className="line2"></p>
                <div className="col-lg-12  ViewBredCum">

                  <div className="col-sm-8">
                    <div className="spanBredDiv">
                      <span className="spanBredcum">{(selectedCustValue != "") ? selectedCustValue : ""} </span><span className="spanBredcumslash">/</span>
                      <span className="spanBredcum"> {(selectedSubCustValue != "") ? selectedSubCustValue : ""}</span> <span className="spanBredcumslash">/</span>
                      <span className="spanBredcum">{(selectedAssets != "") ? selectedAssets : ""} </span> <span className="spanBredcumslash">/</span>
                      <span className="spanBredcum">{(selectedDeviceName != "") ? selectedDeviceName : ""}</span>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="navright">
                      <button type="button" className="spanNev btn" onClick={() => {
                        this.props.history.push("/NevMenu")
                      }}>Device Menu</button>
                      {(this.state.OpratingDashBoardEnable) ? <button type="button" className="spanNev btn" onClick={() => {
                        this.props.history.push("/activeDashbord")
                      }}>Operating Dashboard</button> : ""}
                    </div>
                  </div>
                  {/* </div> */}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12 col-sm-12 col-md-12">
                <p className="line2"></p>
                <div className="width1">
                  <label className="text-center">SELECT GROUP</label>
                  <Nav bsStyle="pills" activeKey={this.state.body.selectedGroupsitem} onSelect={this.handleGroups}>
                    {this.state.body.sensorsGroups.map(item =>
                      <NavItem eventKey={item.group} >
                        {item.group}
                      </NavItem>
                    )}
                  </Nav>
                </div>
              </div>
              <div className="col-lg-9 col-sm-6 col-xs-12">
                <div className="custmDivSensorUpper">
                  <div className="wrapperSenSors">
                    {this.state.body.Sensors.map(item =>
                      <span className=" custmDivSensor">
                        <Sensors key={item.nameofbsnm}
                          bgclass={item.bgClass}
                          label={"Sensor" + " " + item.nameofbsnm}
                          P_name_class="color12 "
                          dateTime={item.lastUpdatedTime}
                          takenClass="takenclass"
                          message={item.valuseS}
                          iconclass="fas fa-wind"
                          div_icon_class="icon"
                          heading_class_name=" color12 head"
                          fotter_class="small-box-footer"
                        // Change ={this.handler.bind(this, item.sensorsNM,item.nameofbsnm)}
                        />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-sm-4 col-xs-12">
                <div className="small-box bg-red" title={lastAlertData.alertText} >
                  <div className="inner"><p className="color12 dashlastAlert ">{(lastAlertData.shortName) ? lastAlertData.shortName : "No Alerts Triggered"}</p>
                    <p className="criteriaClass ">{(lastAlertData.criteria) ? lastAlertData.criteria : "  "} &nbsp;</p>
                    <p className="takenclass">Last Taken At:  {(lastAlertData.createdTime) ? dateFormat(lastAlertData.createdTime, "dd-mmm HH:MM") : ""}</p>

                  </div>
                  <div className=" fontsizeicon icon"><i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <a href="javascript:void(0)" className="small-box-footer">&nbsp;</a>
                </div>
              </div>
            </div>
          </section>

          <div className="container">
            <div className="mb-2">  <label className="text-center ">VIEW MENU
           <button className=' toggleButton' onClick={this.toggle.bind(this)}><i className={(this.state.open ? "fas fa-caret-up" : "fas fa-caret-down")}></i></button>
            </label> &nbsp;&nbsp; {(this.state.open )? "" :<span className="ml-6 font-12 color-grey"> <span className="labeltoggal">VIEW : </span> <span className="valuetoggal">{this.state.body.selectedNevData}</span> 
                 {(this.state.body.startTime !=="" && this.state.body.endTime!=="")?<span> <span className="labeltoggal">INTERVAL : </span> <span className="valuetoggal">{moment(this.state.body.startTime).format("L hh:mm a") +" To "+moment(this.state.body.endTime).format("L hh:mm a")}</span></span> : "" }</span>}
            </div>
            <div className={"ml-5 mb-2 collapse" + (this.state.open ? ' in' : '')}>
              {/* <label className="text-center">SELECT VIEW </label>
              <Nav bsStyle="pills"
                activeKey={this.state.body.selectedNevData} onSelect={this.handleNavForData}
              >
                {this.state.body.typeOfNavData.map(item =>
                  <NavItem eventKey={item.type}
                  >
                    {item.type}
                  </NavItem>
                )}
              </Nav> */}
              <div>
              <label className="text-center">SELECT VIEW  &nbsp; : </label> &nbsp; &nbsp;
              {this.state.body.typeOfNavData.map(item =>
                  <label className= "radio-inline"   >
                    <input type="radio"
                      onClick={this.handleNavForData.bind(this, item.type)} name="optradio4" 
                      checked={item.type === this.state.body.selectedNevData} />{item.type}
                  </label>
                )}
              </div>
              <div><label className="text-center">SELECT INTERVAL </label></div>
              <div className="wefDef">
                <DatePicker
                  selected={this.state.body.startTime}
                  onChange={e => {
                    this.state.body.startTime = e;
                    this.setState({ body: this.state.body })
                  }}
                  placeholderText="START TIME"
                  timeIntervals={1}
                  showMonthDropdown
                  showYearDropdown
                  showTimeSelect
                  dateFormat="DD/MM/YYYY hh:mm a"
                  className="startendTime"
                />
              </div>
              <div className="wefDef">
                <DatePicker
                  selected={this.state.body.endTime}
                  onChange={e => {
                    this.state.body.endTime = e;
                    this.setState({ body: this.state.body })
                  }}
                  placeholderText="END TIME"
                  timeIntervals={1}
                  showMonthDropdown
                  showYearDropdown
                  showTimeSelect
                  dateFormat="DD/MM/YYYY hh:mm a"
                  className="startendTime"
                />


              </div>
              <div className="width1">
                <button
                  className="btn btn-xm btn-default" onClick={this.submit.bind(this)}>Submit</button>
              </div>
            </div>
            {/* <div className=""> */}
            <p className="line2"></p>
            {/* </div> */}

            <div className="row">
              <div className="col-lg-3 col-md-3 col-sm-3 col-xs-3">
                {/* <div className="align-center">  */}
                <span className="spanchart">#ROWS </span>
                <select onChange={this.changePagesize} className=" selectcolor" value={this.state.body.page_size} id="Page_Size">{this.state.body.page_size}

                  {["10", "20", "50", "100"].map(n =>
                    <option className="selectcolor " value={n}>{n}</option>)
                  }

                </select>
                {/* <button type="button" onClick={this.downloadToExcel.bind(this)}>downloadToExcel</button>  */}
                {/* </div> */}
              </div>
              <div className="col-sm-5 col-lg-5 col-xs-12 col-md-5">
                <div className='align-center'>
                  {total_page > 1 && <CPagination page={state.page} totalpages={total_page} onPageChange={this.changePage} />}
                </div>
              </div>
              <div className="col-lg-3 col-md-3 col-sm-3 col-xs-9">
                <div className="align-right">  <button title="Download Report In Excel Formate" className="btn btn-xs btn-secondary chartbtn" onClick={() => {
                  this.props.history.push("/menu")
                }
                }><i class="far fa-file-excel"></i></button>

                </div>
              </div>

            </div>
            <p className="line2"></p>
          </div>

          <div className="container">
            <div className="mb-2">  <label className="text-center">CHART MENU
           <button className=' toggleButton' onClick={this.toggleChartMenu.bind(this)}><i className={(this.state.openChartMenu ? "fas fa-caret-up" : "fas fa-caret-down")}></i></button>
            </label> {(this.state.openChartMenu )? "" :<span className="ml-6 font-12 color-grey"> <span className="labeltoggal">GRAPH : </span> <span className="valuetoggal">{this.state.body.selectedgraphType}</span>
             <span className="labeltoggal">ENTITIES : </span> <span className="valuetoggal">{this.state.body.selectedEntitiesValues.map((item,i) => item +",")}</span> 
             <span className="labeltoggal">DISPLAY : </span> <span className="valuetoggal">{this.state.body.selectedDataInfoTypeValues.map((item,i) => item +",")}</span> </span>}
         
            </div>
            <div className={"ml-5 mb-2 collapse" + (this.state.openChartMenu ? ' in' : '')}>
              <div className="">
                <label className="text-center">TYPE OF GRAPH &nbsp; : </label> &nbsp; &nbsp;
                  {this.state.body.typeOfGraph.map(item =>
                  <label className="radio-inline">
                    <input type="radio" name="optradio" onChange={this.graphType.bind(this, item)} checked={item === this.state.body.selectedgraphType} />{item}
                  </label>
                )}
              </div>
              <div className="">
                <label className="text-center">SHOW ENTITIES &nbsp; : </label> &nbsp; &nbsp;
                  {this.state.body.selectedSensorsDataArray.map(item =>
                  <label className={this.state.body.selectedEntitiesClass || "checkbox-inline"}>
                    <input type={this.state.body.selectedEntitiesType || "checkbox"} name="BsName" onClick={this.EntitiesSeletction.bind(this, item)}
                      checked={this.state.body.selectedEntitiesValuesflag[item]}
                    />{item}
                  </label>
                )}
              </div>
              <div className="">
                <label className="text-center">INFO TO DISPLAY : </label> &nbsp; &nbsp;
                  {this.state.body.arrayOfDataIfoDisplay.map(item =>
                  <label className={ this.state.body.selectedDataInfoClass || "radio-inline"  }  style= {{color: (item.disable)? "#ccc": "" }}>
                    <input type={this.state.body.selectedDataInfoType || "radio"}
                   checked= { this.state.body.selectedDataInfoTypeValuesflag[item.type]}
                      onClick={this.ClickInfoDisplay.bind(this, item.type)}
                       name= {item.name} 
                      disabled = {item.disable}/>{item.type}
                  </label>
                )}
              </div>
            </div>
            <div className="col-sm-8 col-lg-8 col-xs-12 col-md-8">




              <div className="chart-container" >

                <Chartcom
                  type="line"
                  arrData={arrData}
                  chartAxis={deviceTypeObj}
                  arrLabels={arrLabels}
                  legend={yaxisName}
                  xAxisLbl="Date and Time"
                  yAxisLbl={yaxisName}
                  // bgColors ={bgColors}
                  borderColors={borderColors}
                />
              </div>
            </div>
          </div>
          {/* <div className= "custNav btn-group">
      
         <button  className="btn btn-sm btn-secondary" onClick={this.downloadToExcel.bind(this)}><i class="far fa-file-excel iconfont"></i></button>
        </div> */}
          <div className="sokettablemr">
            <div className="table-responsive">
              <Table className="table table-hover table-sm table-bordered cust">
                <thead className='bg' style={{ background: "gainsboro" }}>
                  <tr>
                    {this.state.body.headerTable.map(item => {
                      return <th className='text-center '>{item}</th>
                    })}

                  </tr>
                </thead>
                <tbody>
                  {state.in_prog && <tr><td colSpan={8} className='text-center'><i className='fa fa-refresh fa-spin'></i> Loading..</td></tr>}
                  {!state.in_prog && state.DataArray.length == 0 && <tr><td colSpan={8} className='text-center'> No Data </td></tr>}
                  {!state.in_prog && DataArray.map((user, i) => {
                    return (<tr key={i}>
                      <td className='text-center'>{page_start_index + i + 1}</td>

                      {/* <td className='text-center'>{user.column1}</td> */}
                      <td className='text-center'>{user.column2}</td>
                      {/* <td> */}
                      {this.state.body.tableSecondKeyArray.map(item => {
                        return <td className='text-center'>{user[item]}</td>
                      })

                      }

                      {/* </td> */}
                      {/* <td className='text-center'>{user.column4}</td> */}
                      <td className='text-center'>{user.column5}</td>
                    </tr>
                    )
                  })
                  }
                </tbody>
                {"Pages: " + total_page}
              </Table>
            </div>
            <div className="col-lg-3 col-md-3 col-sm-3 col-xs-3">
              {/* <div className="align-center">  */}
              <span className="spanchart">#ROWS </span>
              <select onChange={this.changePagesize} className=" selectcolor" value={this.state.body.page_size} id="Page_Size">{this.state.body.page_size}

                {["10", "20", "50", "100"].map(n =>
                  <option className="selectcolor " value={n}>{n}</option>)
                }

              </select>
              {/* <button type="button" onClick={this.downloadToExcel.bind(this)}>downloadToExcel</button>  */}
              {/* </div> */}
            </div>
            <div className="col-sm-5 col-lg-5 col-xs-12 col-md-5">
              <div className='align-center'>
                {total_page > 1 && <CPagination page={state.page} totalpages={total_page} onPageChange={this.changePage} />}
              </div>
            </div>
            <div className="col-lg-3 col-md-3 col-sm-3 col-xs-9">
              <div className="align-right">  <button title="Download Report In Excel Formate" className="btn btn-xs btn-secondary chartbtn" onClick={() => {
                this.props.history.push("/menu")
              }
              }><i class="far fa-file-excel"></i></button>

              </div>
            </div>

          </div>
        </div>



      )
    } else {
      return <Spinner />;
    }
  }
}
export default viewDashboard;
