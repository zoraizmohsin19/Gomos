import React, { Component } from 'react'
import "./socketdashbord.css"
import Sensors from "../../layout/widgetofSensors/sensorsCantainer";
import Chartcom from "../../layout/widgetofSensors/chartCom";
import socketIOClient from "socket.io-client";
import axios from "axios";
import moment from 'moment';
import CPagination from "../../layout/Pagination";
import DatePicker from 'react-datepicker';
import { Button, Badge } from 'react-bootstrap'
// import * as ExcelJs from "exceljs/dist/exceljs.min.js";
// import * as FileSaver from "file-saver";
import dateFormat from "dateformat";
import swal from 'sweetalert';
import Spinner from '../../layout/Spinner';
import { Table, NavItem, Nav } from "react-bootstrap";
import URL from "../../Common/confile/appConfig.json";
import Comment from "./Component/Comment"
class viewDashboard extends Component {
  constructor() {
    super();
    this.state = {
      open: true,
      openChartMenu: true,
      body: {
        endpoint: `${URL.SIP}`,
        socket1: {},
        arrData: [],
        arrComments: [],
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

        Sensors: [],
        selectedSensorsType1: '',
        // mac: '',
        deviceType: "",
        chartOptions: {},
        deviceTypeObj: {},
       
        activeChartLegend: {},
        // selectedAssets: '',
        //excelresult: [],
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
        CommentInfo: {show: false},
        deviceIdentifier: [],
        DeviceIdentifierForSensors: [],
        sensorsGroups: [],
        selectedGroups: {},
        sensorsMainData: [],
        selectedGroupsitem: "",
        selectedSensorsDataArray: [],
        headerTable: [],
        OpratingDashBoardEnable: Boolean,
        typeOfNavData: [{ type: "Normal", disable: ["Max", "Avg", "Min", "Durations", "Count"] }, { type: "Hourly", disable: ["Values"] }, { type: "Daily", disable: ["Values"] }, { type: "Weekly", disable: ["Values"] }, { type: "Monthly", disable: ["Values"] }],
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
        arrayOfDataIfoDisplay: [{ "type": "Values", "name": "name1", "disable": false }, { "type": "Max", "name": "name1", "disable": false }, { "type": "Avg", "name": "name1", "disable": false }, { "type": "Min", "name": "name1", "disable": false }, { "type": "Count", "name": "name1", "disable": false }, { "type": "Durations", "name": "name1", "disable": false }],
        startTime: "",
        endTime: "",
        mainjson: {},
        tableSecondKeyArray: []
      }
    }
    this.changePage = this.changePage.bind(this);
    this.changePagesize = this.changePagesize.bind(this);
  }
  changePage(page) {
    this.state.body.page = page
    this.setState({ body: this.state.body });
    // this.fetchdata();
    this.startProcess();
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
    this.startProcess();
  }
  // handler(selectedSensorsType1, selectedSensorsName) {
  //   var me = this;
  //   me.state.body.page = 1;
  //   me.state.body.selectedSensorsType1 = selectedSensorsType1;
  //   me.state.body.selectedSensorsName = selectedSensorsName;
  //   this.setState({ body: me.state.body });
  //   this.fetchdata();
  // }

  chartsOptionsbyDeviceType(deviceType) {
      let tempData = JSON.parse(sessionStorage.getItem("ClientObj"));
      let obj = {}

      if (tempData.viewDashBoard[deviceType] !== undefined && tempData.viewDashBoard[deviceType].chartOptions !== undefined ) {
          obj = tempData.viewDashBoard[deviceType].chartOptions
      } 
      else {
          obj = { "areaFill": true , "displayGridlines": true }
      }

      return obj;
  }

  chartsIdbyDeviceType(deviceType) {
    let tempData = JSON.parse(sessionStorage.getItem("ClientObj"));
    //console("chartsIdbyDeviceType");
    //console(tempData)
    let obj = tempData.viewDashBoard[deviceType].chartAxis.map(item => { return { "businessName": item.businessName, "axisY": item.axisY } })

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
    // me.startProcess()
    this.startFunction()

  }
  dataTypeDisable() {
    let me = this;
    let dataInfo = me.state.body.typeOfNavData.find(item => item.type === me.state.body.selectedNevData);
    // if(value ==="Normal"){
    me.state.body.arrayOfDataIfoDisplay.findIndex(i => i.disable = false);
    dataInfo.disable.map(item => {
      let index = me.state.body.arrayOfDataIfoDisplay.findIndex(i => i.type === item);
      me.state.body.arrayOfDataIfoDisplay[index].disable = true;
    });
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
      axios.post(`${URL.IP}/getDevicesIdentifier`, { mac: this.state.body.mac })
        .then(json => {
          me.state.body.DeviceIdentifierForSensors = json["data"].sensors;
          json["data"].sensors.map(item => { item["BsType"] = "sensors" });
          json["data"].channel.map(item => { item["BsType"] = "channel" });

          let tempArray = (json["data"].sensors).concat(json["data"].channel)

          console.log("This is Device Identifier json");
          console.log("this is tempArray", tempArray);
          //console(tempArray)
          // let tempCSArray = [];
          tempArray.sort((a, b) => a["displayPosition"] - b["displayPosition"]);
          console.log("this is tempArray 2", tempArray);
          me.state.body.deviceIdentifier = tempArray;
          var groupedData = this.groupingDataArray(tempArray);
          console.log("this is groupeData", groupedData)
          let index = groupedData.findIndex(item => item.group === json["data"].defaultGroupInfo);
          let index2 = tempArray.findIndex(item => item.group === json["data"].defaultGroupInfo);

          me.state.body.sensorsGroups = groupedData;
          //console("This is Group Data");
          console.log("This is Group Data", groupedData);
          me.state.body.selectedGroups = groupedData[index];
          me.state.body.selectedGroupsitem = groupedData[index].group;
          me.state.body.selectedSensorsType1 = tempArray[index2].Type;
          me.state.body.selectedSensorsName = tempArray[index2].devicebusinessNM;
          me.state.body.selectedSensorsDataArray = groupedData[index].devicebusinessNM;
          me.state.body.selectedEntitiesValues = groupedData[index].devicebusinessNM;
          //console(groupedData[index].devicebusinessNM)
          me.state.body.deviceType = json["data"].deviceTypes;
          me.state.body.chartOptions = this.chartsOptionsbyDeviceType( json["data"].deviceTypes );
          me.state.body.deviceTypeObj = this.chartsIdbyDeviceType(json["data"].deviceTypes);
         
          console.log("This is group", me.state.body.activeChartLegend)
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
      let tempArrComments = [];
      let arrLabels = [];
      let dataToSend1 = [];
      let dataToSend2 = [];
      (me.state.body.selectedNevData === "Weekly") ? result.sort((a, b) => (a.column5 < b.column5) ? -1 : ((a.column5 > b.column5) ? 1 : 0)) : result.sort((a, b) => new Date(a.column5).getTime() - new Date(b.column5).getTime())
      for (let i = 0; i < result.length; i++) {
        let formattedDate = (me.state.body.selectedNevData === "Normal") ? moment(result[i]["column5"], "DD-MMM-YY HH:mm:ss").format("DD-MMM-YY HH:mm") : result[i]["column5"];
        //  var arrayforsend= [];
        let temp = {};
        for (let j = 0; j < me.state.body.tableSecondKeyArray.length; j++) {

          temp[me.state.body.tableSecondKeyArray[j]] = result[i][me.state.body.tableSecondKeyArray[j]];

        }
        dataToSend1.push(temp);
        tempArrComments.push(result[i].column6);
        dataToSend2.push(
          formattedDate
        );
      }
      arrData = dataToSend1;
      arrLabels = dataToSend2;
      // var yaxisName = valueSensoor;
      let fromDate = new Date();
      // var toDate = new Date();
      let borderColors = [];
      // for (var i = 0; i <  arrData.length; i++) {
      borderColors.push(this.getRandomBorColor());
      me.state.body.arrData = arrData;
      me.state.body.arrComments = tempArrComments ;
      me.state.body.arrLabels = arrLabels;
      // me.state.body.yaxisName = yaxisName;
      me.state.body.fromDate = fromDate;
      me.state.body.borderColors = borderColors;
      let ClientObj = JSON.parse(sessionStorage.getItem("ClientObj"));
     // me.state.body.chartLegendNames = ClientObj.viewDashBoard[me.state.body.deviceType].chartLegend
      console.log("ClientObj.viewDashBoard[ me.state.body.deviceType].chartLegend", ClientObj.viewDashBoard[ me.state.body.deviceType].chartLegend)
     
      if (me.state.body.selectedNevData == "Normal") {
       // legend = activeChartLegend["normal"]
      me.state.body.activeChartLegend = ClientObj.viewDashBoard[ me.state.body.deviceType].chartLegend[me.state.body.selectedGroupsitem]["normal"]

      }
      // console.log("this is selected", activeChartLegend)
      if (me.state.body.selectedNevData != "Normal") {
      me.state.body.activeChartLegend = ClientObj.viewDashBoard[ me.state.body.deviceType].chartLegend[me.state.body.selectedGroupsitem]["aggregated"]

        // legend = activeChartLegend["aggregated"];
      }
      console.log("This is log of legend",  me.state.body.activeChartLegend)
     
     // me.state.body.activeChartLegend = me.state.body.chartLegendNames[me.state.body.selectedGroupsitem];
      this.setState({ body: me.state.body });
      // }
    }
    else {
      me.state.body.arrData = undefined;
      me.state.body.arrComments = undefined ;
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
    axios.post(`${URL.IP}/getdashboard`, body)
      .then(json => {
        me.state.body.mainjson = json;
        //console(json)
        me.setState({ body: me.state.body })
        // me.DisplayChart();
        // }
        me.callMainDataProcess()
      })
      .catch(error => {
        // me.DisplayChart();
        me.callMainDataProcess()
        me.state.body.Spinnerdata = true;
        me.state.body.mainjson = {};
        me.setState({ body: me.state.body });
        this.errorganerator()

      })
  }
  CommentStateUpdate(data){
    let me = this;
    me.state.body.CommentInfo = data;
    this.setState({body:  me.state.body})

  }
  callMainDataProcess() {
    let me = this;
    //console("This is Call of CallMainDataProcess")
    try {
      //console("This is Call of CallMainDataProcess Try")
      me.state.body.Spinnerdata = true;
      me.setState({ body: me.state.body })
      let json = me.state.body.mainjson;
      let json1 = [];
      let dataArray = [];
      let arrayHeder = [];
      //console("this is Source of data ");
      console.log("This is", json["data"]["finalResult"])
      json1 = json["data"]["finalResult"]
      if (json1 !== 0) {
        for (let i = 0; i < json1.length; i++) {
          let jsontemp = {
            column1: json1[i][0],
            column2: json1[i][1],
            column5: ((me.state.body.selectedNevData === "Normal") ? dateFormat(json1[i][4], "dd-mmm-yy HH:MM:ss") : json1[i][4]),
          
            column7: json1[i][6]
          };
          //console("This Debug For Date")
          console.log(json1[i][5])
          // alert("Alert")
          arrayHeder = ["SI", "DEVICE NAME"];
          let sensorsKeys = me.state.body.selectedEntitiesValues;
          let arrayOfDisplayData = me.state.body.selectedDataInfoTypeValues.map(item => item);
          //console("arrayOfDisplayData");
          //console(arrayOfDisplayData);
          if (me.state.body.selectedNevData !== "Normal") {
            //TTHIS COMMENT FOR AGGREAGATED DATA WHICH COMMING FORM OF ARRAY;
            jsontemp["column6"] =  json1[i][5];
            jsontemp["column6"].sort((a, b) => new Date(b.DeviceTime).getTime() - new Date(a.DeviceTime).getTime())
            jsontemp["commentOtherInfo"] ={
              createdTime: new Date(),
              updatedTime : new Date()
           }
            // if(arrayOfDisplayData.filter(item => item == "Values").length !== 0){
            //  arrayOfDisplayData = arrayOfDisplayData.splice(arrayOfDisplayData.findIndex(item => item == "Values"),1);
            // }
            if (me.state.body.selectedgraphType !== "MULTI") {
              me.state.body.tableSecondKeyArray = arrayOfDisplayData;
              for (let k = 0; k < sensorsKeys.length; k++) {
                for (let j = 0; j < arrayOfDisplayData.length; j++) {
                  jsontemp[arrayOfDisplayData[j]] = json1[i][3][sensorsKeys[k]][arrayOfDisplayData[j]];
                }
              }

              for (let l = 0; l < arrayOfDisplayData.length; l++) {
                arrayHeder.push(arrayOfDisplayData[l]);
              }
              arrayHeder.push("TIME");
              arrayHeder.push("Comment");
              dataArray.push(
                jsontemp
              )

            }
            else {
              me.state.body.tableSecondKeyArray = sensorsKeys;
              for (let k = 0; k < sensorsKeys.length; k++) {
                let temD = me.getBsType(sensorsKeys[k]);
                if (temD === "channel") {
                  for (let j = 0; j < arrayOfDisplayData.length; j++) {
                    jsontemp[sensorsKeys[k]] = json1[i][3][sensorsKeys[k]]["Durations"];
                  }
                } else {
                  for (let j = 0; j < arrayOfDisplayData.length; j++) {
                    jsontemp[sensorsKeys[k]] = json1[i][3][sensorsKeys[k]][arrayOfDisplayData[j]];
                  }
                }

              }
              for (let l = 0; l < sensorsKeys.length; l++) {
                arrayHeder.push(sensorsKeys[l]);
              }
              arrayHeder.push("TIME");
              arrayHeder.push("Comment");
              dataArray.push(
                jsontemp
              )
            }
          }
          else {
            jsontemp["column6"]= [];
            if(json1[i][5]["data"] != undefined &&  json1[i][5]["data"].length > 0){
              json1[i][5]["data"].map( item2=> {
                jsontemp["column6"].push(item2);
              })
              jsontemp["commentOtherInfo"] ={
                 _id: json1[i][5]["_id"],
                 createdTime: json1[i][5]["createdTime"],
                 updatedTime : new Date()
              }
            }else{
              jsontemp["column6"] = [];
              jsontemp["commentOtherInfo"] ={
                
                createdTime: new Date(),
                updatedTime : new Date()
             }
            }
         
            me.state.body.tableSecondKeyArray = sensorsKeys;
            for (let k = 0; k < sensorsKeys.length; k++) {
              jsontemp[sensorsKeys[k]] = json1[i][3][sensorsKeys[k]];
            }
            arrayHeder = ["SN", "DEVICE NAME"];
            for (let l = 0; l < sensorsKeys.length; l++) {

              arrayHeder.push(sensorsKeys[l]);
            }
            arrayHeder.push("TIME");
            arrayHeder.push("Comment");
            dataArray.push(
              jsontemp
            )
          }
        }
        //console("This is header Of table")
        //console(arrayHeder)
        //console("This is Data Array")
        console.log("This is dataArray", dataArray)
        let { deviceIdentifier, selectedDeviceName } = this.state.body;
        let lastUpdatedTime = "";
        // console.log("This is dataArray");
        // if( selectedDeviceName == 'Bed3_ec63' || selectedDeviceName == "Bed1_3bd1" || selectedDeviceName == "Bed2_427f" || selectedDeviceName == "CONT_e737" ){
        var key = Object.keys(dataArray[0])
        key.splice(key.indexOf("column1"), 1);
        key.splice(key.indexOf("column2"), 1);
        key.splice(key.indexOf("column5"), 1);
        key.splice(key.indexOf("column6"), 1);
        key.splice(key.indexOf("column7"), 1);
        key.splice(key.indexOf("commentOtherInfo"),1);
        console.log("deviceIdentifier", deviceIdentifier)
        for (let j = 0; j < key.length; j++) {
          let objtemp = deviceIdentifier.find(item => item.devicebusinessNM == key[j]);
          console.log("This is objetemp", objtemp)
          if (objtemp.transformExpr != undefined && objtemp.transformExpr != "") {
            for (let i = 0; i < dataArray.length; i++) {
              dataArray[i][key[j]] = me.transformExprFun(objtemp.transformExpr.numeric, dataArray[i][key[j]])
            }
          }

        }
        // }

        me.state.body.headerTable = arrayHeder
        me.state.body.DataArray = dataArray;
        me.state.body.in_prog = false;
        me.state.body.total_count = json["data"]["data_count"];
        me.state.body.lastupdatedData = json["data"]["lastdataObj"];
        me.state.body.lastUpdatedTime = lastUpdatedTime;

      }
      else {
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
    catch (err) {
      me.state.body.DataArray = [];
      me.state.body.in_prog = false;
      me.state.body.total_count = 0;
      me.state.body.Spinnerdata = true;
      // me.state.body.in_prog = false;
      me.setState({ body: me.state.body })
      console.log("This is Call of CallMainDataProcess Try", err)
      me.errorganerator()
    }
  }
  transformExprFun(expression, value) {

    try {
      let fun = eval("(" + expression + ")")
      return fun(value);
    } catch (error) {
      console.log("error", error)
      return value
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
      reconnectionAttempts: 99999,
      path: "/api/soketForOnreport"
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
        let { deviceIdentifier, selectedDeviceName } = this.state.body;
        for (var i = 0; i < dataofSensors.length; i++) {
          let dataObj = {
            "sensorsNM": dataofSensors[i].type,
            "bgClass": arrayofbgClass[i],
            nameofbsnm: dataofSensors[i].devicebusinessNM,
            valuseS: dataofSensors[i].Value,
            lastUpdatedTime: dateFormat(dataofSensors[i].dateTime, "dd-mmm-yy HH:MM:ss")
          }
          // if( selectedDeviceName == 'Bed3_ec63' || selectedDeviceName == "Bed1_3bd1" || selectedDeviceName == "Bed2_427f" || selectedDeviceName == "CONT_e737" ){
          let objtemp = deviceIdentifier.find(item => item.devicebusinessNM == dataofSensors[i].devicebusinessNM);
          if (objtemp.transformExpr != undefined && objtemp.transformExpr != "") {
            dataObj["valuseS"] = me.transformExprFun(objtemp.transformExpr.numeric, dataofSensors[i].Value)
          }
          // }

          array.push(dataObj);
        }
        console.log("this array", array)
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
  startProcess() {
    // alert("This is startProcess Call")
    let me = this;
    // if(me.state.body.selectedNevData ==="Normal"){
    //   me.state.body.selectedDataInfoTypeValues = ["Values"];
    // }else{
    //   if(me.state.body.selectedDataInfoTypeValues.filter(item => item ==="Values").length !==0){
    //   let index =  me.state.body.selectedDataInfoTypeValues.findIndex(item => item ==="Values");
    //   me.state.body.selectedDataInfoTypeValues.splice(index, 1);

    //   }
    // }
    // me.state.body.page = 1; 
    // // me.setState({body : me.state.body})
    me.dataTypeDisable();

    this.graphProcess();
    this.fetchdata();
  }
  onSubmin() {
    var me = this;
    me.state.body.page = 1;
    me.setState({ body: me.state.body });
    me.startProcess()
  }
  methodForDataDisplayBySingleTypeProcess(value) {
    let me = this;
    if (me.state.body.selectedNevData !== "Normal") {
      // if (me.state.body.selectedgraphType === "MULTI") {
      // me.state.body.selectedSensorsDataArray.map( key => {
      // me.state.body.arrayOfDataIfoDisplay.map(item => {me.state.body.selectedDataInfoTypeValuesflag[item.type] = false });
      me.state.body.selectedDataInfoTypeValues = [];
      let index = me.state.body.deviceIdentifier.findIndex(item => item.devicebusinessNM === value);
      let temV = me.state.body.deviceIdentifier[index].BsType;
      if (temV === "channel") {
        me.state.body.arrayOfDataIfoDisplay.map(i => { i.disable = false });
        ["Values", "Max", "Min", "Avg"].map(item => {
          let index = me.state.body.arrayOfDataIfoDisplay.findIndex(i => i.type === item);
          me.state.body.arrayOfDataIfoDisplay[index].disable = true;
          me.state.body.selectedDataInfoTypeValuesflag[item] = false;
        });
        // me.state.body.selectedDataInfoTypeValues = ["Durations","Count"];
        ["Durations", "Count"].map(item => {
          me.state.body.selectedDataInfoTypeValuesflag[item] = true;
          me.state.body.selectedDataInfoTypeValues.push(item)
        });


      } else {

        me.state.body.arrayOfDataIfoDisplay.map(i => { i.disable = false });
        ["Values", "Durations"].map(item => {
          let index = me.state.body.arrayOfDataIfoDisplay.findIndex(i => i.type === item);
          me.state.body.arrayOfDataIfoDisplay[index].disable = true;
          me.state.body.selectedDataInfoTypeValuesflag[item] = false;
        });
        // me.state.body.selectedDataInfoTypeValues = ["Max","Min","Avg","Count"];
        ["Max", "Min", "Avg", "Count"].map(item => {
          me.state.body.selectedDataInfoTypeValuesflag[item] = true;
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
  getBsType(value) {
    let me = this;
    let index = me.state.body.deviceIdentifier.findIndex(item => item.devicebusinessNM === value);
    return me.state.body.deviceIdentifier[index].BsType;
  }
  graphProcessForMultiCase() {
    let me = this;
    if (me.state.body.selectedNevData !== "Normal") {
      me.state.body.selectedDataInfoTypeValuesflag[me.state.body.selectedDataInfoDefault] = true
      me.state.body.selectedDataInfoTypeValues = [me.state.body.selectedDataInfoDefault]
      let temD = me.state.body.selectedSensorsDataArray.find(item => me.getBsType(item) === "channel");
      if (temD !== undefined) {
        let index = me.state.body.arrayOfDataIfoDisplay.findIndex(item => item.type === "Durations");
        me.state.body.arrayOfDataIfoDisplay[index].name = "name4";
        me.state.body.arrayOfDataIfoDisplay[index].disable = false;
        me.state.body.selectedDataInfoTypeValuesflag["Durations"] = true

        //  me.state.body.selectedDataInfoTypeValues.push("Durations") 

      }
      else {
        let index = me.state.body.arrayOfDataIfoDisplay.findIndex(item => item.type === "Durations");
        me.state.body.arrayOfDataIfoDisplay[index].name = "name1";
        me.state.body.arrayOfDataIfoDisplay[index].disable = true;
        me.state.body.selectedDataInfoTypeValuesflag["Durations"] = false
      }
      //console("This is graphProcessForMultiCase")
      //console(temD);
      let index = me.state.body.arrayOfDataIfoDisplay.findIndex(item => item.type === "Count");
      me.state.body.arrayOfDataIfoDisplay[index].disable = true;
      me.state.body.selectedDataInfoTypeValuesflag["Count"] = false

    }
    else {
      me.state.body.selectedDataInfoTypeValuesflag["Values"] = true
      me.state.body.selectedDataInfoTypeValues = ["Values"]
    }
    me.setState({ body: me.state.body })
  }
  graphProcess() {
    let me = this;
    if (me.state.body.selectedgraphType === "MULTI") {
      me.state.body.selectedEntitiesType = "checkbox";
      me.state.body.selectedEntitiesClass = "checkbox-inline";
      me.state.body.selectedSensorsDataArray.map(item => { me.state.body.selectedEntitiesValuesflag[item] = true });
      me.state.body.selectedEntitiesValues = me.state.body.selectedSensorsDataArray.map(item => item)
      me.state.body.selectedDataInfoType = "radio";
      me.state.body.selectedDataInfoClass = "radio-inline";
      //console("This is Log For graph Values")
      //console(me.state.body.selectedDataInfoDefault)
      me.state.body.arrayOfDataIfoDisplay.map(item => { me.state.body.selectedDataInfoTypeValuesflag[item.type] = false });
      me.state.body.selectedDataInfoTypeValues = [];

      //console(  me.state.body.selectedDataInfoTypeValuesflag)
      me.setState({ body: me.state.body })
      me.graphProcessForMultiCase();

    }
    else {
      me.state.body.selectedEntitiesType = "radio";
      me.state.body.selectedEntitiesClass = "radio-inline";
      me.state.body.selectedSensorsDataArray.map(item => { me.state.body.selectedEntitiesValuesflag[item] = false });

      // if(me.state.body.selectedEntitiesValues.length === 0){
      let temSensorsName = (me.state.body.selectedEntity == "" || me.state.body.selectedEntity == undefined) ? me.state.body.selectedSensorsName : me.state.body.selectedEntity;

      me.state.body.selectedEntitiesValues = [temSensorsName];
      me.state.body.selectedEntitiesValuesflag[temSensorsName] = true;

      // }else{
      //console("This is Single Bs Selected Data")
      //console(me.state.body.selectedEntity);
      //console( me.state.body.selectedEntitiesValues);
      //console(temSensorsName)
      // me.state.body.selectedEntitiesValues = [me.state.body.selectedEntity];
      // me.state.body.selectedEntitiesValuesflag[me.state.body.selectedEntity] = true;
      // }
      me.state.body.selectedDataInfoType = "checkbox";
      me.state.body.selectedDataInfoClass = "checkbox-inline";
      me.state.body.arrayOfDataIfoDisplay.map(item => { me.state.body.selectedDataInfoTypeValuesflag[item.type] = true });
      // me.state.body.selectedDataInfoTypeValues =  me.state.body.arrayOfDataIfoDisplay.map(item => item.type);


      me.methodForDataDisplayBySingleTypeProcess(me.state.body.selectedSensorsName)
      me.setState({ body: me.state.body })
      if (me.state.body.selectedNevData !== "Normal") {
        //   me.state.body.selectedDataInfoTypeValues.splice(me.state.body.selectedDataInfoTypeValues.findIndex(item => item =="Values"),1)
      }
      else {
        me.state.body.arrayOfDataIfoDisplay.map(item => { me.state.body.selectedDataInfoTypeValuesflag[item.type] = false });
        me.state.body.selectedDataInfoTypeValues.push("Values");
        me.state.body.selectedDataInfoTypeValuesflag["Values"] = true;

      }
      me.state.body.activeChartLegend = me.state.body.chartLegendNames[me.state.body.selectedGroupsitem]
      me.setState({ body: me.state.body })
    }
    //console("This is default SensorsName")
    //console(me.state.body.selectedSensorsName)

  }
  graphType = (value) => {
    //alert(value)
    // //console(value.target.value)
    //console(value)
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


    //console(value)
    //console(me.state.body.selectedEntitiesValues)
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
      let temD = me.state.body.selectedSensorsDataArray.find(item => me.getBsType(item) === "channel");
      if (temD !== undefined) {
        //  let index = me.state.body.arrayOfDataIfoDisplay.findIndex(item => item.type === "Durations");
        //   me.state.body.arrayOfDataIfoDisplay[index].name = "name4";
        //me.state.body.arrayOfDataIfoDisplay[index].disable = false;
        me.state.body.selectedDataInfoTypeValuesflag["Durations"] = true
        // me.state.body.selectedDataInfoTypeValues.push("Durations") 

      }
    }


    //console(value)
    //console(me.state.body.selectedDataInfoTypeValues)
    me.setState({ body: me.state.body });
    me.callMainDataProcess()

  }
  handleGroups = (value) => {
    try {
      var me = this;
      var dashboardData = JSON.parse(sessionStorage.getItem("dashboardConfigobj"));
      var arrayofbgClass = dashboardData.SensorsBgC;
      me.state.body.selectedGroupsitem = value;
      console.log("this is chart chartLegendNames", me.state.body.chartLegendNames)
      // me.state.body.activeChartLegend = me.state.body.chartLegendNames[value]
      console.log("this is chart chartLegendNames12", me.state.body.activeChartLegend)
      let index = me.state.body.sensorsGroups.findIndex(item => item.group == value);

      me.state.body.selectedGroups = me.state.body.sensorsGroups[index];
      //console(me.state.body.sensorsMainData)
      //  alert(value);
      me.setState({ body: me.state.body })
      var dataofSensors = [];
      for (let i = 0; i < me.state.body.selectedGroups.devicebusinessNM.length; i++) {
        dataofSensors.push(me.state.body.sensorsMainData.filter(item => item.devicebusinessNM == me.state.body.selectedGroups.devicebusinessNM[i])[0])
      }
      //  console.log(dataofSensors[0].type)
      //  console.log(dataofSensors[0].devicebusinessNM)
      var array = [];

      let { deviceIdentifier, selectedDeviceName } = this.state.body;
      for (var i = 0; i < dataofSensors.length; i++) {
        let dataObj = {
          "sensorsNM": dataofSensors[i].type,
          "bgClass": arrayofbgClass[i],
          nameofbsnm: dataofSensors[i].devicebusinessNM,
          valuseS: dataofSensors[i].Value,
          lastUpdatedTime: dateFormat(dataofSensors[i].dateTime, "dd-mmm-yy HH:MM:ss")
        }
        // if( selectedDeviceName == 'Bed3_ec63' || selectedDeviceName == "Bed1_3bd1" || selectedDeviceName == "Bed2_427f" || selectedDeviceName == "CONT_e737" ){
        let objtemp = deviceIdentifier.find(item => item.devicebusinessNM == dataofSensors[i].devicebusinessNM);
        if (objtemp.transformExpr != undefined && objtemp.transformExpr != "") {
          dataObj["valuseS"] = me.transformExprFun(objtemp.transformExpr.numeric, dataofSensors[i].Value)
        }
        // }

        array.push(dataObj);
      }
      me.state.body.selectedSensorsDataArray = dataofSensors.map(item => item.devicebusinessNM);
      //console(me.state.body.selectedSensorsDataArray)
      me.state.body.selectedSensorsType1 = dataofSensors[0].type;
      me.state.body.selectedSensorsName = dataofSensors[0].devicebusinessNM;
      me.state.body.Sensors = array;
      me.state.body.page = 1;
      me.setState({ body: me.state.body })
      //  me.fetchdata();
      me.startProcess()
    } catch (error) {
      //console(error)
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

    let tem = groups.filter(item => item.group !== "Not displayed in dashboard")
    return tem;
  }
  callForlastAlert(custCd, subCustCd, mac) {
    var me = this;
    const { endpoint } = this.state.body;
    var body = { custCd, subCustCd, mac }
    // axios.post("http://URL.IP/getdashbordlastalert", body)
    // .then(json =>  {
    var lastError = socketIOClient(endpoint + "/ActivelastError", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 99999,
      path: "/api/soketForOnreport"
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
  CommentUpdateRowTable(factId, commentdata,_id,createdTime,updatedTime){
var me = this;    
 let index = me.state.body.DataArray.findIndex(item =>  item.column7 == factId);
 me.state.body.DataArray[index].column6 = commentdata;
 me.state.body.DataArray[index].commentOtherInfo["_id"] = _id;
 me.state.body.DataArray[index].commentOtherInfo["createdTime"] = createdTime;
 me.state.body.DataArray[index].commentOtherInfo["updatedTime"] = updatedTime;
 me.state.body.CommentInfo.comment = commentdata;
 me.state.body.CommentInfo["_id"] = _id;
 me.state.body.CommentInfo["createdTime"] = createdTime;
 me.state.body.CommentInfo["updatedTime"] = updatedTime;
 me.setState({body : me.state.body});
  }

  render() {
    const { arrData, arrComments, chartOptions, deviceTypeObj, arrLabels, yaxisName, activeChartLegend, lastAlertData, fromDate, toDate, bgColors, selectedSensorsType1, borderColors, DataArray, in_prog,
      selectedSPValue, selectedCustValue, selectedSubCustValue, selectedAssets, selectedDeviceName, selectedSensorsName, selectedNevData} = this.state.body;
    var state = this.state.body;

   
    console.log("state ", this.state)
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
              <div className="col-lg-9 col-md-9 col-sm-6 col-xs-12">
                <div className="custmDivSensorUpper">
                  <div className="wrapperSenSors">
                    {this.state.body.Sensors.map((item, k) =>
                      <span className=" custmDivSensor ">
                        <Sensors key={k}
                          bgclass={item.bgClass}
                          label={" " + item.nameofbsnm}
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

              <div className="col-lg-3 col-md-3 col-sm-4 col-xs-12">
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
            </label> &nbsp;&nbsp; {(this.state.open) ? "" : <span className="ml-6 font-12 color-grey"> <span className="labeltoggal">VIEW : </span> <span className="valuetoggal">{this.state.body.selectedNevData}</span>
              {(this.state.body.startTime !== "" && this.state.body.endTime !== "") ? <span> <span className="labeltoggal">INTERVAL : </span> <span className="valuetoggal">{moment(this.state.body.startTime).format("L hh:mm a") + " To " + moment(this.state.body.endTime).format("L hh:mm a")}</span></span> : ""}</span>}
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
                  <label className="radio-inline"   >
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
                  timeIntervals={5}
                  isClearable={true}
                  timeFormat="HH:mm"
                  dateFormat="DD/MM/YYYY HH:mm"
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
                  isClearable={true}
                  timeIntervals={5}
                  timeFormat="HH:mm"
                  dateFormat="DD/MM/YYYY HH:mm"
                  className="startendTime"
                />


              </div>
              <div className="width1">
                <button
                  className="btn btn-xm btn-default" onClick={this.onSubmin.bind(this)}>Submit</button>
              </div>
            </div>
            {/* <div className=""> */}
            <p className="line2 mr-Bootom-2"></p>
            {/* </div> */}

            <div className="row">
              <div className="col-lg-3 col-md-3 col-sm-3 col-xs-2">
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
              <div className="col-sm-6 col-lg-5  col-md-6  col-xs-8">
                <div className='align-center'>
                  {total_page > 1 && <CPagination page={state.page} totalpages={total_page} onPageChange={this.changePage} />}
                </div>
              </div>
              <div className="col-lg-3 col-md-3 col-sm-3 col-xs-2">
                <div className="align-right">  <button title="Download Report In Excel Formate" className="btn btn-xs btn-secondary chartbtn" onClick={() => {
                  this.props.history.push("/menu")
                }
                }><img src={require('../../layout/Nms-excel.png')} alt="Excel" /></button>

                </div>
              </div>

            </div>
            <p className="line2"></p>
          </div>

          <div className="container">
            <div className="mb-2">  <label className="text-center">CHART MENU
           <button className=' toggleButton' onClick={this.toggleChartMenu.bind(this)}><i className={(this.state.openChartMenu ? "fas fa-caret-up" : "fas fa-caret-down")}></i></button>
            </label> {(this.state.openChartMenu) ? "" : <span className="ml-6 font-12 color-grey">
              <span className="labeltoggal">DeviceName : </span> <span className="valuetoggal"> {(selectedDeviceName != "") ? selectedDeviceName : ""}</span>
              <span className="labeltoggal">GRAPH : </span> <span className="valuetoggal">{this.state.body.selectedgraphType}</span>
              <span className="labeltoggal">ENTITIES : </span> <span className="valuetoggal">{this.state.body.selectedEntitiesValues.map((item, i) => item + ",")}</span>
              <span className="labeltoggal">DISPLAY : </span> <span className="valuetoggal">{this.state.body.selectedDataInfoTypeValues.map((item, i) => item + ",")}</span> </span>}

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
                  <label className={this.state.body.selectedDataInfoClass || "radio-inline"} style={{ color: (item.disable) ? "#ccc" : "" }}>
                    <input type={this.state.body.selectedDataInfoType || "radio"}
                      checked={this.state.body.selectedDataInfoTypeValuesflag[item.type]}
                      onClick={this.ClickInfoDisplay.bind(this, item.type)}
                      name={item.name}
                      disabled={item.disable} />{item.type}
                  </label>
                )}
              </div>
            </div>

          </div>
          <div className="container chartCantainer">




            <div className="chart-container" style={{ position: "relative", height: "70vh", width: "80vw" }} >

              <Chartcom
                type="line"
                arrData={arrData}
                arrComments = { arrComments }
                chartOptions = { chartOptions }
                chartAxis={deviceTypeObj}
                arrLabels={arrLabels}
                legend={activeChartLegend}
                xAxisLbl="Date and Time"
                yAxisLbl={yaxisName}
                // bgColors ={bgColors}
                borderColors={borderColors}
              />
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
                      <td className=''>
                        {/* <Button variant="success">
                        Comment <Badge variant="success" >{user.column6.length}</Badge>
                      </Button> */}
                      
                      &nbsp;&nbsp;  &nbsp;&nbsp; <span  onClick ={() => {
                      this.state.body.CommentInfo.rowHeader = this.state.body.headerTable
                      this.state.body.CommentInfo.row = user;
                      this.state.body.CommentInfo.SN = (page_start_index + i + 1) ;
                      this.state.body.CommentInfo.tableSensors = this.state.body.tableSecondKeyArray;
                      this.state.body.CommentInfo._id =   user.commentOtherInfo._id;
                      this.state.body.CommentInfo.createdTime =   user.commentOtherInfo.createdTime; 
                      this.state.body.CommentInfo.updatedTime =   user.commentOtherInfo.updatedTime; 
                      this.state.body.CommentInfo.factId =   user.column7; 
                      this.state.body.CommentInfo.DeviceName =  selectedDeviceName;  
                      this.state.body.CommentInfo.DeviceTime =  user.column5;  
                      this.state.body.CommentInfo.comment = user.column6;
                      this.state.body.CommentInfo.show = true;
                      this.setState({body: this.state.body})}} className= {"commentIcon"} ><i class="far fa-comment-dots commentIcon"></i>
                      </span>
                      &nbsp;&nbsp; &nbsp;&nbsp;  {user.column6.length > 0 ? <span className="badge commentBadge">{ user.column6.length}</span>: ""}
                      </td>
                    </tr>
                    )
                  })
                  }
                </tbody>
                {"Pages: " + total_page}
              </Table>
            </div>
            <div className="col-lg-3 col-md-3 col-sm-3 col-xs-2">
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
            <div className="col-sm-6 col-lg-5  col-md-6  col-xs-8">
              <div className='align-center'>
                {total_page > 1 && <CPagination page={state.page} totalpages={total_page} onPageChange={this.changePage} />}
              </div>
            </div>
            <div className="col-lg-3 col-md-3 col-sm-3 col-xs-2">
              <div className="align-right">  <button title="Download Report In Excel Formate" className="btn btn-xs btn-secondary chartbtn" onClick={() => {
                this.props.history.push("/menu")
              }
              }><img src={require('../../layout/Nms-excel.png')} alt="Excel" /></button>

              </div>
            </div>

          </div>
          <Comment 
          key ={ this.state.body.CommentInfo.DeviceTime }
           nevInfo={this.state.body.selectedNevData} 
          startProcess ={() => {this.startProcess()}}
           CommentInfo ={this.state.body.CommentInfo} 
           CommentUpdateRowTable={this.CommentUpdateRowTable.bind(this)}
           CommentStateUpdate = {this.CommentStateUpdate.bind(this)}/>
        </div>



      )
    } else {
      return <Spinner />;
    }
  }
}
export default viewDashboard;
