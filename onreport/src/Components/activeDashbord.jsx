import React, { Component } from 'react'
import "./activeDashbord.css"
import {Table,DropdownButton,ButtonToolbar,MenuItem,Button,Modal,NavItem ,Nav} from 'react-bootstrap';
import SensorsActive from "../layout/widgetofSensors/sensorsForActive";
import axios from "axios";
import moment from 'moment';
import DatePicker from 'react-datepicker';
import dateFormat  from  "dateformat";
import socketIOClient from "socket.io-client";
import CPagination from "../layout/Pagination";
import swal from 'sweetalert';
import InputRange from 'react-input-range';
import "react-input-range/lib/css/index.css";
// import QueryBuilder from 'react-querybuilder';
class activeDashbord extends Component {
    constructor(){
      super();
      this.state={
        value: { min: 2, max: 10 },
        endpoint: "http://52.212.188.65:4001",
        channelName: [],
        actionTypes: [],
        formStructure: '',
        selectedChannelB: '',
        selectedChannelCn: '',        
        selectedAtionType: '',
        deviceName: '',
        show: false,
        open: true,
        instrInput1: "",
        instrInput2:"",
        startDate: "",
        endDate: "",
        startDatelimit: "",
        endDatelimit: "",
        channelFil: "",
        ActionVF: 1,
        sentCommandIndex: "",
        mAOfInactivejob: [],
        channelArray: [],
        channelAlerrModel:{},
        sensorsArray: [],
        channelForfilter:[],        
        ActiveJobsArray: [],
        mainActiveJobsArray: [],
        sentCommandArray: [],
        configkeyInput: [],
        configkeyInputKeyValue: {},
        rowclickedData :{},
        tilesPayloaddata: {},
        climateSensor: [],
        ClimateIndex: "",
        SourceClimateData: [],
        Climate:{
          selectedfilter: "",
        },
        lastAlertData: {
          alertText: "",
          businessNm: "",
          businessNmValues: "",
          createdTime: "",
          criteria: "",
          sensorNm: "",
          shortName: ""
        },
        ArrayForClimateTable: [],
        selectedClimateAction: [],
        selectedExpression:{},
        // selectedfilFSensor: "",
        'total_count':0,
        'filter':{
          "TypeOfJobs": "",
            'Fchannel': '',
             'Fdate':'',
            'Action': '',
            'page':1,
            'page_size':15,
        },
        'in_prog':false,
        submitDataObj:{
          mac: "",
         subCustCd: "",
         CustCd: "",
         DeviceName : "",
         payloadId: "",
         dataBody: {},
         isDaillyJob: "",
         ChannelName: "",
        },
        CriteriaForOP:{
           spCd: "",
           subCustCd: "",
           CustCd: "",
           DeviceName : "",
           mac: "",
           assetId: ""
        },
        AryfPayloadfromConfig:[],
        deviceAllData:{},
        Defaultparameter: {},
        lastPayloadDataArray: [],
        sentCommandArrayLenght: "",
        rowClickedId: "",
        age:"",
        DefaulaManualOverride: {}
  
      }

      this.fetch  =   this.fetch.bind(this);
      this.changePage     =   this.changePage.bind(this);
      this.FselectAction = this.FselectAction.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.handleChange1 = this.handleChange1.bind(this);
      this.handleShowExecuted = this.handleShowExecuted.bind(this);
      this.handleShowPending = this.handleShowPending.bind(this);
      this.handleClose = this.handleClose.bind(this);
      this.Submit = this.Submit.bind(this);
      this.MdateFilter = this.MdateFilter.bind(this);
      this.filterByChExe = this.filterByChExe.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this)
      this.SubmitForParameter = this.SubmitForParameter.bind(this);
      // this.filterClimateFun = this.filterClimateFun.bind(this);
      // this.handelMExpression = this.handelMExpression.bind(this);
      // this.rowClicked = this.rowClicked.bind(this)
      // this. handleChange3 =this.handleChange3.bind(this);
    }
    onChange = e => this.setState({ [e.target.name]: e.target.value });
    Submit(){
      var me = this;
 const {configkeyInput,configkeyInputKeyValue,selectedAtionType,selectedChannelB,formStructure,DefaulaManualOverride} = this.state;
 var dataToSendApi = {};
      if(formStructure == "table"){
        var tempArray = ["ON","OFF"];
        for(var i =0; i< 2;i++){
        for(var key =0; key < configkeyInput.length; key++){
             configkeyInputKeyValue[tempArray[i]+configkeyInput[key]+"error"] = "";
             me.setState({configkeyInputKeyValue: configkeyInputKeyValue})
         };
    }
    for(var i =0; i< 2;i++){
      for(var key =0; key < configkeyInput.length; key++){
          if(configkeyInputKeyValue[tempArray[i]+configkeyInput[key]] == undefined  || configkeyInputKeyValue[tempArray[i]+configkeyInput[key]]  == null || configkeyInputKeyValue[tempArray[i]+configkeyInput[key]] == ''){
              configkeyInputKeyValue[tempArray[i]+configkeyInput[key]+"error"] = "Please provide"+tempArray[i]+" : "+configkeyInput[key]+" error";
              me.setState({configkeyInputKeyValue: configkeyInputKeyValue})
             // alert(tempArray[i]+key);
              //  document.getElementById(tempArray[i]+key+"Classerror").focus();
            
              return;
             
          }  
    }
  }

  for(var key =0; key < configkeyInput.length; key++) { 
              dataToSendApi[configkeyInput[key]] = dateFormat(configkeyInputKeyValue["ON"+configkeyInput[key]], "ss:MM:HH:dd:mm:yy")+","+dateFormat(configkeyInputKeyValue["OFF"+configkeyInput[key]], "ss:MM:HH:dd:mm:yy"); 
              };
      //  dataToSendApi[selectedChannelB] = 1; 
       ////console.log(dataToSendApi)
   }
   if(formStructure == "1-input"){
    for(var key =0; key < configkeyInput.length; key++) {
         configkeyInputKeyValue[configkeyInput[key]+"error"] = "";
        me.setState({configkeyInputKeyValue: configkeyInputKeyValue})
  }

  for(var key =0; key < configkeyInput.length; key++) {
       if(configkeyInputKeyValue[configkeyInput[key]] == undefined  || configkeyInputKeyValue[configkeyInput[key]]  == null || configkeyInputKeyValue[configkeyInput[key]] == ''){
           configkeyInputKeyValue[configkeyInput[key]+"error"] = "Please provide : "+configkeyInput[key]+" error";
           me.setState({configkeyInputKeyValue: configkeyInputKeyValue})
          // alert(tempArray[i]+key);
           document.getElementById(configkeyInput[key]).focus();
           return;
   }
}
for(var key =0; key < configkeyInput.length; key++) {
     dataToSendApi[configkeyInput[key]] = configkeyInputKeyValue[configkeyInput[key]];
      } 
        // this.callApiForAction("Schedule",dataToSendApi);
        //alert(dataToSendApi)
     //console.log(dataToSendApi)
    }
    if(formStructure == "2-input"){
      for(var key =0; key < configkeyInput.length; key++) {
        configkeyInputKeyValue[configkeyInput[key]+"date"+"error"] =  ""; 
        configkeyInputKeyValue[configkeyInput[key]+"hour"+"error"] = "";
        configkeyInputKeyValue[configkeyInput[key]+"min"+"error"] = "";
        // configkeyInputKeyValue[key+"Meridiem"+"error"] ="";
       me.setState({configkeyInputKeyValue: configkeyInputKeyValue})
      }
      for(var key =0; key < configkeyInput.length;key++) {
        if(configkeyInputKeyValue["toggle"]==false){
        if(configkeyInputKeyValue[configkeyInput[key]+"date"] == undefined  || configkeyInputKeyValue[configkeyInput[key]+"date"]  == null || configkeyInputKeyValue[configkeyInput[key]+"date"] == ''){
            configkeyInputKeyValue[configkeyInput[key]+"date"+"error"] = "Please provide : "+configkeyInput[key]+"date"+" error";
            me.setState({configkeyInputKeyValue: configkeyInputKeyValue})
           // alert(tempArray[i]+key);
            // document.getElementById(key+"date").focus();
            return;
         }}
        if(configkeyInputKeyValue[configkeyInput[key]+"hour"] == undefined  || configkeyInputKeyValue[configkeyInput[key]+"hour"]  == null || configkeyInputKeyValue[configkeyInput[key]+"hour"] == ''){
          configkeyInputKeyValue[configkeyInput[key]+"hour"+"error"] = "Please provide : "+configkeyInput[key]+"hour"+" error";
          me.setState({configkeyInputKeyValue: configkeyInputKeyValue})
          document.getElementById(configkeyInput[key]+"hour").focus();
          return;
       }
     
      if(configkeyInputKeyValue[configkeyInput[key]+"min"] == undefined  || configkeyInputKeyValue[configkeyInput[key]+"min"]  == null || configkeyInputKeyValue[configkeyInput[key]+"min"] == ''){
        configkeyInputKeyValue[configkeyInput[key]+"min"+"error"] = "Please provide : "+configkeyInput[key]+"min"+" error";
        me.setState({configkeyInputKeyValue: configkeyInputKeyValue})
        document.getElementById(configkeyInput[key]+"min").focus();
        return;
     }

 } 

 for(var key =0; key < configkeyInput.length; key++) {
        if(configkeyInputKeyValue["toggle"]==true){
          dataToSendApi[configkeyInput[key]] = "00:"+configkeyInputKeyValue[configkeyInput[key]+"hour"]+":"+configkeyInputKeyValue[configkeyInput[key]+"min"]+":"+"*:*:*"; 
        }
        else{
          dataToSendApi[configkeyInput[key]] = "00:"+configkeyInputKeyValue[configkeyInput[key]+"hour"]+":"+configkeyInputKeyValue[configkeyInput[key]+"min"]+":"+dateFormat(configkeyInputKeyValue[configkeyInput[key]+"date"], "dd:mm:yy"); 
        }   
         } 
          // dataToSendApi[selectedChannelB] = 1; 
            //alert(dataToSendApi)
      }
      //alert(this.state.channelName)
      //console.log(this.state.channelName)
      if(this.state.channelName.length != 0){
        if(this.state.selectedChannelB == ""){
        //alert("please Select Channel Name");
        return;
           }

}
if(formStructure == "manualOverride"){
  //console.log("This is manualOverride")
  //console.log(configkeyInputKeyValue)
  //console.log(DefaulaManualOverride)

  for(var key =0; key < configkeyInput.length; key++) {
      dataToSendApi[configkeyInput[key]] = configkeyInputKeyValue[configkeyInput[key]]
     } 
      // dataToSendApi[selectedChannelB] = 1; 
        //alert(dataToSendApi)
  
}
//console.log()
    me.state.submitDataObj.payloadId   = selectedAtionType;
    me.state.submitDataObj.dataBody    = dataToSendApi;
    me.state.submitDataObj.isDaillyJob =  configkeyInputKeyValue["toggle"];
    me.state.submitDataObj.ChannelName = selectedChannelB;
    me.setState({submitDataObj :me.state.submitDataObj});
    me.callApiForAction();
    if(formStructure == "manualOverride"){
   me.callApiForManoverride();
    }
}
SubmitForParameter(){
  // var me = this;
  // alert("Hello Takreem ")
  var dataToSendApi ={};
var me = this;
  const {selectedAtionType, configkeyInput, configkeyInputKeyValue} =this.state;
  for(var key =0; key < configkeyInput.length; key++) {
    dataToSendApi[configkeyInput[key]] = [configkeyInputKeyValue[configkeyInput[key]+"Lower"],configkeyInputKeyValue[configkeyInput[key]+"higher"]]
     } 
    me.state.submitDataObj.payloadId   = selectedAtionType;
    me.state.submitDataObj.dataBody    = dataToSendApi;
    me.state.submitDataObj.isDaillyJob = "";
    me.state.submitDataObj.ChannelName = "";
    me.setState({submitDataObj :me.state.submitDataObj});

  me.callApiForAction();
  me.callApiForClimateSave();
}
callApiForClimateSave(){
  var me = this;
  axios.post("http://52.212.188.65:3992/ActiveClimatesave",me.state.submitDataObj)
  .then(json =>  {
  // if(json["data"] == "success"){
   
  //   swal("Success!", "You Send Action!", "success");ActivesaveForManualOver
  // 
  //alert("result")
  //console.log(json)
});
}
callApiForManoverride(){
  var me = this;
  axios.post("http://52.212.188.65:3992/ActivesaveForManualOver",me.state.submitDataObj)
  .then(json =>  {
  // if(json["data"] == "success"){
   
  //   swal("Success!", "You Send Action!", "success");ActivesaveForManualOver
  // 
  //alert("result")
  //console.log(json)
});
}
callApiForManoverrideForTiles(){
  var me = this;
  axios.post("http://52.212.188.65:3992/ActivesaveForManualOverForTiles",me.state.submitDataObj)
  .then(json =>  {
  // if(json["data"] == "success"){
   
  //   swal("Success!", "You Send Action!", "success");ActivesaveForManualOver
  // 
  //alert("result")
  ////console.log(json)
});
}
    callApiForAction(){
    var me = this;
    //console.log(me.state.submitDataObj)
    //alert(me.state.submitDataObj)
      axios.post("http://52.212.188.65:3992/ActiveDAction",me.state.submitDataObj)
      .then(json =>  {
      if(json["data"] == "success"){
       
        swal("Success!", "You Send Action!", "success");
      }
      else{
        swal("Error!", "You Send Action!", "error");
         
      }
      //console.log(json)
      });
    }
  
    handleClose() {
        this.setState({ show: false });
      }
      handleShowExecuted() {
     var me = this;
     this.state.filter.TypeOfJobs = "ExecutedJob"
     me.setState({filter :this.state.filter   });
     me.fetch();
      }
      handleShowPending(){
        var me = this;
        this.state.filter.TypeOfJobs = "PendingJob"
        me.setState({filter :this.state.filter });
        this.fetch();
      }
      MdateFilter(value){
        this.state.filter.Fdate= value;

        this.setState({filter: this.state.filter});
        // //alert(value);
      }
    handleChange(selectedAtionType){
      //alert(selectedAtionType);
      var me = this;
      if(selectedAtionType == "SentCommand" || 
          selectedAtionType == "ActiveCommand" ||
          selectedAtionType == "ExecutedJobs"||
          selectedAtionType == "PendingJobs"|| 
          selectedAtionType == "ClimateParameter" ||
          selectedAtionType ==  "ClimateControl"
          ){
        me.setState({formStructure: selectedAtionType ,selectedAtionType: selectedAtionType});
        if(selectedAtionType == "ExecutedJobs"){
          this.setState({formStructure: "ActiveAndPending"});
          this.handleShowExecuted()
        }
        me.setState({formStructure: selectedAtionType ,selectedAtionType: selectedAtionType});
        // if(selectedAtionType == "ClimateParameter"){
        //   this.setState({formStructure: "ClimateParameter"});
      
        // }
        if(selectedAtionType == "PendingJobs"){
          this.setState({formStructure: "ActiveAndPending"});
          this.handleShowPending()
        }
      }else{
      var index = this.state.actionTypes.findIndex(element => element.payloadId == selectedAtionType);
      var objectpayload = this.state.actionTypes[index];
      var formStructure = objectpayload.formStructure;
      //console.log(formStructure);
      //console.log(formStructure);
      //console.log(index);
      //console.log(this.state.actionTypes);

      //console.log(objectpayload);

      this.setState({formStructure: formStructure})
      var arrayOfChannel= [];
      if(objectpayload.sensors.Channel !== 0 && objectpayload.sensors.Channel !== undefined && objectpayload.sensors.Channel !== null ){
        for (let [key, value] of Object.entries(objectpayload.sensors.Channel)) {  
          arrayOfChannel.push({"configName":key, "businessName": value}); 
        }

        var  keysofObj = Object.keys(objectpayload.sensors)
        //console.log(objectpayload);
        if(formStructure == "manualOverride"){
          
         this.manualOverrideProcess( objectpayload,selectedAtionType);
        }
        if(keysofObj.length >= 2){
          keysofObj.splice(keysofObj.indexOf("Channel"), 1);
          //console.log(objectpayload.sensors[keysofObj[0]]);
          var  allBusinessName = Object.values(objectpayload.sensors[keysofObj[0]]);
          //console.log(allBusinessName);
        
          if(formStructure == "table"){
            var configkeyInputKeyValue = {};
            var tempArray = ["ON","OFF"];
            for(var i =0; i< 2;i++){
              for (let [key, value] of Object.entries(objectpayload.sensors[keysofObj[0]])) {  
                configkeyInputKeyValue[tempArray[i]+value] = ""; 
                configkeyInputKeyValue[tempArray[i]+value+"error"] = "";
                configkeyInputKeyValue[tempArray[i]+value+"Classerror"] = "";
              }
            }
            this.setState({ selectedAtionType: selectedAtionType,
               channelName: arrayOfChannel,
               configkeyInput:allBusinessName,configkeyInputKeyValue:configkeyInputKeyValue});
          }else if(formStructure == "2-input"){
            var configkeyInputKeyValue = {};
           //alert("this else of 2-input");
           configkeyInputKeyValue["toggle"] = false;
              for (let [key, value] of Object.entries(objectpayload.sensors[keysofObj[0]])) {  
                configkeyInputKeyValue[value+"date"] =  ""; 
                configkeyInputKeyValue[value+"hour"] = "";
                configkeyInputKeyValue[value+"min"] = "";
                configkeyInputKeyValue[value+"date"+"error"] =  ""; 
                configkeyInputKeyValue[value+"hour"+"error"] = "";
                configkeyInputKeyValue[value+"min"+"error"] = "";
              }
            this.setState({ selectedAtionType: selectedAtionType,
               channelName: arrayOfChannel,
               configkeyInput:allBusinessName,configkeyInputKeyValue:configkeyInputKeyValue});
          }
        
        }else{
          this.setState({ selectedAtionType: selectedAtionType,
            channelName: arrayOfChannel});
        }
    
      }
      else{
        this.setState({selectedChannelB: "",selectedChannelCn:""});

        if(formStructure == "1-input"){
          
          var configkeyInputKeyValue = {};
         
          var  keysofObj = Object.keys(objectpayload.sensors)
          var  allBusinessName = Object.values(objectpayload.sensors[keysofObj[0]]);
            for (let [key, value] of Object.entries(objectpayload.sensors[keysofObj[0]])) {  
              configkeyInputKeyValue[value] =  ""; 
              configkeyInputKeyValue[value+"error"] =  ""; 

            }
          this.setState({ selectedAtionType: selectedAtionType,
             channelName: [],
             configkeyInput:allBusinessName,configkeyInputKeyValue:configkeyInputKeyValue});
        }
        
        if(formStructure == "SetParameter"){
          var configkeyInputKeyValue = {};
          var  allBusinessName =[];
          var  keysofObj = Object.keys(objectpayload.sensors)
          var obj = this.getStrucOfClimateParam();
            allBusinessName = obj.businessName;
             for (var i =0; i< obj.businessName.length; i++) { 
               configkeyInputKeyValue[obj.businessName[i]] =  ''; 
               configkeyInputKeyValue[obj.businessName[i]+"Lower"] =  this.state.Defaultparameter[obj.businessName[i]+"Lower"]; 
               configkeyInputKeyValue[obj.businessName[i]+"higher"] =  this.state.Defaultparameter[obj.businessName[i]+"higher"]; 
               configkeyInputKeyValue[obj.businessName[i]+"max"] = obj.max[i];
               configkeyInputKeyValue[obj.businessName[i]+"min"] =  obj.min[i];
             }
           
            
            //console.log("This is Object of configkeyInputKeyValue")
            //console.log(configkeyInputKeyValue)
           this.setState({ selectedAtionType: selectedAtionType,
              // channelName: arrayOfChannel,
              configkeyInput:allBusinessName,configkeyInputKeyValue:configkeyInputKeyValue});
         }
        }
        //alert("this else "+ selectedAtionType);
      
    }     
         //console.log(arrayOfChannel);
    }
  manualOverrideProcess(objectpayload,selectedAtionType){
    var configkeyInputKeyValue = {};
         
    var  keysofObj = Object.keys(objectpayload.sensors)
    //console.log(keysofObj);
    //console.log("This is of Data");
    var  allBusinessName = Object.values(objectpayload.sensors[keysofObj[0]]);
      for (let [key, value] of Object.entries(objectpayload.sensors[keysofObj[0]])) {  
        configkeyInputKeyValue[value] = this.state.DefaulaManualOverride[value];
        configkeyInputKeyValue[value+"toggle"] = (this.state.DefaulaManualOverride[value]["pendingMode"] == 0)? false : true;

      }
    this.setState({ selectedAtionType: selectedAtionType,
       channelName: [],
       configkeyInput:allBusinessName,configkeyInputKeyValue:configkeyInputKeyValue});
  }
    getStrucOfClimateParam(){
      var sensorsArray = this.state.deviceAllData["sensors"];
      var data = sensorsArray.filter(item => item.climateControl.flag == "Y"); 
      var allBusinessName =  data.map(item => item.configName);
      var businessName  = data.map(item => item.businessName);
      var max  = data.map(item => item.climateControl.max);
      var min  = data.map(item => item.climateControl.min);
      var json = {allBusinessName ,businessName,max,min }
     return json;
    }
    handleChange1(value){
        //alert(value);
        var index = this.state.channelName.findIndex(element => element.configName == value);
         var businessName = this.state.channelName[index].businessName ;      
       this.setState({ selectedChannelB: businessName,selectedChannelCn:value});
       this.callForActionType(value,this.state.deviceName);
            }
       callForActionType(value,deviceName){
       }
    
       AllSelectionManual(event){
      const  {configkeyInputKeyValue, configkeyInput} =this.state;
       //alert(event)
       if(event === "manual"){
        for (var i = 0 ; i< configkeyInput.length; i++ ) {  
          configkeyInputKeyValue[configkeyInput[i]]['pendingMode'] =  0;
          configkeyInputKeyValue[configkeyInput[i]+"toggle"] = false;

        }
        //alert("This is  configkeyInputKeyValue")
        //console.log("configkeyInput")
        //console.log(configkeyInput)
        this.setState({configkeyInputKeyValue:configkeyInputKeyValue});
       }
       else{
        for (var i = 0 ; i< configkeyInput.length; i++ ) {  
          configkeyInputKeyValue[configkeyInput[i]]["pendingMode"] =  1;
          configkeyInputKeyValue[configkeyInput[i]+"toggle"] = true;

        }
        this.setState({configkeyInputKeyValue:configkeyInputKeyValue});
       }
       }
    toggle() {
        this.setState({
          open: !this.state.open
        });
        }
    rowClicked(data,index,id){
      // //alert(data);
      // //console.log(data);
      this.setState({rowclickedData: data, sentCommandIndex: index,rowClickedId : id});
        }
   componentDidMount(){
     var me = this;
     var mainData = JSON.parse(sessionStorage.getItem("configData"));
     var configPayloadData = JSON.parse(sessionStorage.getItem("dashboardConfigobj"));
    //  //console.log("This Is I want to See");
    //  //console.log(AryfPayloadfromConfig);
    this.state.AryfPayloadfromConfig = configPayloadData.ConfADPayload.split(",");
// //console.log(mainData)
    this.state.CriteriaForOP.spCd = mainData.spCd;
    this.state.CriteriaForOP.subCustCd = mainData.subCustCd;
    this.state.CriteriaForOP.CustCd = mainData.custCd;
    this.state.CriteriaForOP.DeviceName = mainData.DeviceName;
    this.state.CriteriaForOP.mac = mainData.mac;
    this.state.CriteriaForOP.assetId= mainData.assetId;
    this.state.submitDataObj.mac  = mainData.mac;
    this.state.submitDataObj.subCustCd  = mainData.subCustCd;
    this.state.submitDataObj.CustCd  = mainData.custCd;   
    this.state.submitDataObj.DeviceName  =  mainData.DeviceName;  
    this.setState({CriteriaForOP: this.state.CriteriaForOP,
      submitDataObj: this.state.submitDataObj
    })
     Date.prototype.addHours = function(h){
      this.setHours(this.getHours()+h);
      return this;
    }
      Date.prototype.addDay = function(h){
        this.setDate(this.getDate()+h);
        return this;
    }
     var ActiveJobsArray = [];
    axios.post("http://52.212.188.65:3992/getActiveDashBoardDevice",{mac: this.state.CriteriaForOP.mac})

    .then(json =>  {
      //console.log("this componentDidMount getActiveDashBoardDevice");
      //console.log(json)
      // if(json.length != 0){
        var channelForfilter = [];
        for(var i =0; i< json["data"].channel.length; i++){
          channelForfilter.push(json["data"].channel[i].devicebusinessNM);
        }
        me.setState({
          channelForfilter: channelForfilter
        })    
    });
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.emit('clientEvent', {mac: this.state.CriteriaForOP.mac});
    socket.on("FromAPI", data =>{
      //console.log(data);
      var tempArrayFC = [];
      for(var i = 0;i< data.channel.length;i++){
        if(this.state.channelArray[i] != undefined && this.state.channelArray[i] !=null ){
         
        if(this.state.channelArray[i].Value != this.state.channelArray[i].ActionCond){   
            data.channel[i]["ActionCond"] =  this.state.channelArray[i].ActionCond;
          }
        else{
          data.channel[i]["ActionCond"] = data.channel[i].Value;
        }

        data.channel[i]["OldValue"] =  this.state.channelArray[i].Value;
        tempArrayFC.push(data.channel[i]);
      }
    else{
      data.channel[i]["ActionCond"] =  data.channel[i].Value;
      data.channel[i]["OldValue"] = data.channel[i].Value;
      tempArrayFC.push(data.channel[i]);
    }
  }
    
    this.setState({ sensorsArray: data.sensors , channelArray: tempArrayFC});
    //console.log(data);
      
      });
this.fetchForClimate();
this.fetchClimateControlAllData();
this.fetchClimateControlDevice();
this.fetchClimateParameter();
this.fetchFromManualOverride();
this.callForlastAlert();
this.callForlastPayload();
var onDeviceinstruction = socketIOClient(endpoint+"/onDeviceinstruction");
onDeviceinstruction.emit('onDeviceinstructionClientEvent', { mac : this.state.CriteriaForOP.mac, type: "SentInstruction"});
onDeviceinstruction.on('DeviceInstruction',function(data) {
  //console.log("this is second")
  //console.log(data["DeviceInstruction"]);
  //console.log(me.state.rowClickedId)
  if(me.state.rowClickedId !== '' &&  me.state.rowClickedId !== undefined){
    // for(let i =0; i < data["DeviceInstruction"].length; i++){
    // if(data["DeviceInstruction"][me.state.sentCommandIndex]["_id"] !==  me.state.rowClickedId){
    //   me.setState({rowclickedData: {},sentCommandIndex:0});
    //   // break;
    // // }
    // }
    let value =  data["DeviceInstruction"].find((item)=> item._id == me.state.rowClickedId)
    // console.log("Value");
    // console.log(value)
    if(value === undefined){
   me.setState({rowclickedData: {},sentCommandIndex:''});
    }
  }
    me.setState({sentCommandArray: data["DeviceInstruction"], sentCommandArrayLenght  :data["DeviceInstruction"].length});

  
  // rowclickedData
  // sentCommandIndex
    // me.setState({sentCommandArray: data["DeviceInstruction"], sentCommandArrayLenght  :data["DeviceInstruction"].length});
      //  //console.log(data)
      });
 
    var dataTime =  new Date().toISOString();
    var startDate = dataTime;
   var endDate = new Date(dataTime).addDay(1).toISOString();
    me.setState({startDatelimit: startDate, endDatelimit: endDate })
    this.fetchActiveJob();
    // this.fetch();
   this.fetchPayload();
   }
   fetchPayload(){
     var me = this;
    var body = {mac: this.state.CriteriaForOP.mac}
    axios.post("http://52.212.188.65:3992/ActiveActionTypeCall",body)

    .then(json =>  {
      if(json.length !=0){
      //console.log(json["data"]);
      var index  = json["data"].findIndex(item => item.formStructure ==  "manualOverride");
      var containerdata = json["data"][index];
      // if(index != null && index != undefined){
      //   json["data"].splice(index,1);
      // }

      //console.log(containerdata);
      //console.log("this is container data");
      me.setState({actionTypes:json["data"],tilesPayloaddata:  containerdata})
      }
      else{
        me.setState({actionTypes:[]})
      }
    });
    var dataTime = new Date().addDay(-1);
    this.state.filter.Fdate= moment(dataTime);
    this.setState({filter: this.state.filter})
   }
   timeDifference(date1, date2) {
    var oneDay = 24 * 60 * 60; // hours*minutes*seconds
    var oneHour = 60 * 60; // minutes*seconds
    var oneMinute = 60; // 60 seconds
    var firstDate = date1.getTime(); // convert to milliseconds
    var secondDate = date2.getTime(); // convert to milliseconds
    var seconds = Math.round(Math.abs(firstDate - secondDate) / 1000); //calculate the diffrence in seconds
    // the difference object
    var difference = {
      "days": 0,
      "hours": 0,
      "minutes": 0,
      "seconds": 0,
    }
    //calculate all the days and substract it from the total
    while (seconds >= oneDay) {
      difference.days++;
      seconds -= oneDay;
    }
    //calculate all the remaining hours then substract it from the total
    while (seconds >= oneHour) {
      difference.hours++;
      seconds -= oneHour;
    }
    //calculate all the remaining minutes then substract it from the total 
    while (seconds >= oneMinute) {
      difference.minutes++;
      seconds -= oneMinute;
    }
    //the remaining seconds :
    difference.seconds = seconds;
    //return the difference object
    return difference;
  }
   callForlastAlert(){
    var me = this;
    const { lastAlertData , endpoint } = this.state;
   var body = {custCd: this.state.CriteriaForOP.CustCd,
    subCustCd: this.state.CriteriaForOP.subCustCd,
    mac: this.state.CriteriaForOP.mac}
    var lastError = socketIOClient(endpoint+"/ActivelastError");
    lastError.emit('lastErrorClientEmit',body );
    lastError.on('lastErrorServerEmit',function(data) {
      lastAlertData.alertText = data.alertText;
      lastAlertData.businessNm = data.businessNm;
      lastAlertData.businessNmValues  = data.businessNmValues;
      lastAlertData.createdTime  = data.createdTime;
      lastAlertData.criteria   =  data.criteria;
      lastAlertData.sensorNm   = data.sensorNm;
      lastAlertData.shortName  = data.shortName;
      me.setState({lastAlertData: lastAlertData});
      //console.log(data)
      });
    // axios.post("http://localhost:3992/getdashbordlastalert", body)
    // .then(json =>  {
    //   // alert("This is last Alert Object Data ");
    //   //console.log("This is log of Alert Object ")
    //     //console.log(json);
    //     lastAlertData.alertText = json["data"].alertText;
    //     lastAlertData.businessNm = json["data"].businessNm;
    //     lastAlertData.businessNmValues  = json["data"].businessNmValues;
    //     lastAlertData.createdTime  = json["data"].createdTime;
    //     lastAlertData.criteria   = json["data"].criteria;
    //     lastAlertData.sensorNm   = json["data"].sensorNm;
    //     lastAlertData.shortName  = json["data"].shortName;
    //     me.setState({lastAlertData: lastAlertData});
    // })
  }
  callForlastPayload(){
    const {CriteriaForOP, AryfPayloadfromConfig ,endpoint} = this.state
   var body = {
      mac:CriteriaForOP.mac,
      subCustCd : CriteriaForOP.subCustCd,
      custCd : CriteriaForOP.CustCd,
      Arrayofpayload: AryfPayloadfromConfig

    }
    var me = this;
    var payloadData = socketIOClient(endpoint+"/LastPayloadData");
    payloadData.emit('lastPayloadClient',body );
    payloadData.on('lastPayloadServerData',function(data) {
    // axios.post("http://localhost:3992/lastpayloadTime",body)
    // .then(json =>  {
      if(data.length > 0){
        var datedata = [];
        function sortDates(a, b)
         {
             return a.getTime() - b.getTime();
         }
         //console.log(data)
         for(let i = 0 ; i < data.length; i++ ){
   
           datedata.push(new Date(data[i].createdTime))
         }
         //console.log(datedata)
         var sorted = datedata.sort(sortDates);
         var maxDate = sorted[sorted.length-1];
        var tempValue = me.timeDifference(new Date(maxDate),new Date(new Date().toISOString()))
        let minutes1 = "";
        let seconds1 = "";
        let hours1 = "";
        if(tempValue.hours.toString().length == 1){
           hours1  =  "0"+tempValue.hours;
        }else{
          hours1 = tempValue.hours;
        }
        if(tempValue.minutes.toString().length == 1){
          minutes1 =  "0"+tempValue.minutes;
       }else{
        minutes1 = tempValue.minutes;
       }
       if(tempValue.seconds.toString().length == 1){
        seconds1 =  "0"+tempValue.seconds;
     }else{
      seconds1 = tempValue.seconds;
     }
     var age = hours1+":"+minutes1+":"+seconds1+"  hrs";
        
        me.setState({lastPayloadDataArray: data ,age : age})
      }else{
        let temparray = [];
        for(let j =0 ; j < AryfPayloadfromConfig.length ; j++){
          temparray.push({"payloadId": AryfPayloadfromConfig[j],"createdTime":null });
        }
         
        me.setState({lastPayloadDataArray: temparray ,age : "00:00:00"})
      }
 
   
    // //console.log(json["data"]);
    });
  }
  rowDelete(id){
    swal({
      title: "Are you sure ?",
      text: "Once deleted, you will not be able to recover this SentCommand Info!",
      icon: "warning",
      buttons: true,
      // dangerMode: true,
    })
    .then((willDelete) => {
      if (willDelete) {
        axios.delete("http://52.212.188.65:3992/deleteSentCommand?id="+ id)
        .then(json =>  {
          swal("Poof! Your SentCommand  Info has been deleted!", {
            icon: "success",
          });
        });
      }
      // } else {
      //   swal("Your sentCommand  Info is safe!");
      // }
    });
    // axios.delete("http://localhost:3992/deleteSentCommand?id="+ id)
    // .then(json =>  {
    // });
   }

   fetchClimateControlDevice(){
    axios.post("http://52.212.188.65:3992/getActiveDAction",{mac:this.state.CriteriaForOP.mac})
    .then(json =>  {
     this.setState({deviceAllData: json["data"]})
    })
   }
   fetchClimateParameter(){
    axios.post("http://52.212.188.65:3992/getAClimateparameter",{mac:this.state.CriteriaForOP.mac})
    .then(json =>  {
      var keys1 = Object.keys(json["data"]);
      var obj={}
      for(var i =0; i< keys1.length; i++){
      obj[keys1[i]+"Lower"] = json["data"][keys1[i]][0];
      obj[keys1[i]+"higher"] = json["data"][keys1[i]][1];
      }
      //console.log(obj)
      //console.log( json["data"])getAManualOverride
     this.setState({Defaultparameter: obj})
    })
   }
   fetchFromManualOverride(){
    axios.post("http://52.212.188.65:3992/getAManualOverride",{mac:this.state.CriteriaForOP.mac})
    .then(json =>  {
      var keys1 = Object.keys(json["data"]);
      var obj={}
      console.log("This is all json data for getmanualoverride");
      console.log(json["data"])
     this.setState({DefaulaManualOverride: json["data"]})
    })
   }
   fetchForClimate(){
     var me =this;
     //alert("Hello This Working")
     //  THIS IS GETING SENSORNAME BASED ON SPCD,CUSTCD,SUBCUSTCD
     fetch("http://52.212.188.65:3992/getSensorNames?spCode=" +this.state.CriteriaForOP.spCd +
     "&&custCd=" + this.state.CriteriaForOP.CustCd + "&&subCustCd=" + this.state.CriteriaForOP.subCustCd)
        .then(response => response.json())
        .then(json =>  {
          //alert(json)
        var climateSensor =  json.map( x =>  { return  x  });
        me.setState({climateSensor : climateSensor});
   // console.log(json );
 });
   }

   ActionOnChanel(data,index){
          // //alert("this called");
          var me = this;
          const {channelArray,tilesPayloaddata} = this.state;
         //alert(this.state.submitDataObj.payloadId);
       let age = this.timeDifference(new Date(data.valueChangeAt),new Date(new Date().toISOString()))
      //  console.log(age)
      // console.log(me.state.submitDataObj.payloadId)
        //alert(tilesPayloaddata.payloadId +"Hello")
        this.state.submitDataObj.payloadId   = tilesPayloaddata.payloadId;
        //alert(this.state.submitDataObj.payloadId)
        this.state.submitDataObj.isDaillyJob = false;
        this.state.submitDataObj.ChannelName = data.devicebusinessNM;
        if( this.state.channelArray[index].ActionCond == this.state.channelArray[index].Value){

        // if(channelArray[index].ActionCond == 0){
         var obj = {}
         obj["channelName"] = data.devicebusinessNM;
         obj["mode"] = data.mode;
         obj["currentStatus"] = channelArray[index].ActionCond;
         obj["age"]= age.hours+":"+ age.minutes;
         obj["UpdatedTime"] = dateFormat(data.dateTime, "dd-mmm HH:MM");
         obj["index"] = index;
         this.state.channelAlerrModel = obj;
         this.setState({show: true,
         channelArray: this.state.channelArray,
         channelAlerrModel:  this.state.channelAlerrModel,
         submitDataObj:this.state.submitDataObj}) 
        }
        else{
          //alert("This Already Click");
        }
        
        //console.log(index)
   }
   handleSubmit(){
     var me = this;
     const {channelAlerrModel,channelArray,submitDataObj} = this.state;
     if(Object.keys(submitDataObj.dataBody).length !== 0){
      submitDataObj.dataBody = {};
      me.setState({submitDataObj: submitDataObj});
     } 
     //console.log("hello")
     ////console.log(channelArray[channelAlerrModel["index"]].ActionCond )
     if(channelArray[channelAlerrModel["index"]].ActionCond  == 1){
       //alert(submitDataObj.dataBody[channelAlerrModel["channelName"]])
      //console.log(submitDataObj)
      //alert("1")
      channelArray[channelAlerrModel["index"]].ActionCond = 0; 
      submitDataObj.dataBody[channelAlerrModel["channelName"]]    = { "mode": 0, "action": 0} ;
      //console.log("second Obj");
      //console.log(submitDataObj)
      me.setState({channelArray: channelArray, submitDataObj:submitDataObj ,show: false})
      // me.callApiForAction();
     }
     else{
      //alert("0")
        //alert( submitDataObj.dataBody[channelAlerrModel["channelName"]])
      channelArray[channelAlerrModel["index"]].ActionCond = 1; 
      submitDataObj.dataBody[channelAlerrModel["channelName"]]  = { "mode": 0, "action": 1} ;
      me.setState({channelArray: channelArray, submitDataObj: submitDataObj,show: false})
      // me.callApiForAction();
     } 
     me.callApiForManoverrideForTiles();
     me.callApiForAction();
}

fetchClimateControlAllData(){
  function toString(o) {
    function fromRules(r) {
      return r.a.map(one=>`(${toString(one)})`).join(` ${r.c} `);
    }
    function fromField(f) {
      return `${f.f} ${f.o} ${f.v}`;
    }
    return (o.a? fromRules(o): fromField(o));
  }
function tokeyValue(o){
  var temp ="";
  for(var j= 0; j< o.length; j++){
    var key = Object.keys(o[j]);
    for(var i = 0; i < key.length; i++){
      temp += ` ${key[i]} : ${o[j][key[i]]}`; 
    }
    
  }
  return temp;
}
  axios.post("http://52.212.188.65:3992/getAllClimateControl",{subCustCd:this.state.CriteriaForOP.subCustCd,custCd:this.state.CriteriaForOP.CustCd})
  .then(json =>  {
    //console.log("This fetchClimateControlAllData");
var temp=[];
    for(var i =0; i< json["data"].length; i++){
        var tempObj ={};
        tempObj["actionsOn"] = tokeyValue(json["data"][i].actionsOn);
        tempObj["expression"] = toString(json["data"][i].expression);
        tempObj["sensorsType"] = json["data"][i].sensorsType;
        tempObj["process"] = json["data"][i].process;
        tempObj["state"] = json["data"][i].state;
        temp.push(tempObj);
    }
    this.setState({ArrayForClimateTable:temp,SourceClimateData: json["data"]
  
  });
   //console.log(json);
  });
}
ClimateRow(index){
  const {SourceClimateData}= this.state;
  var selectedExpression =SourceClimateData[index].expression;
  var selectedClimateAction =[];
  for(var i =0; i< SourceClimateData[index].actionsOn.length;i++){
 var key = Object.keys(SourceClimateData[index].actionsOn[i])
 for(var j =0; j< key.length; j++){
   var obj ={};
   obj["key"] = key[j];
   obj["value"] = SourceClimateData[index].actionsOn[i][key[j]];
   selectedClimateAction.push(obj);
 }
  }
  //alert(index);
// //console.log(selectedExpression)
//console.log(selectedClimateAction)
this.setState({selectedExpression,selectedClimateAction, ClimateIndex: index});
}
fetchActiveJob(){
  var me = this;
  var ActiveBody = {
    mac: this.state.CriteriaForOP.mac,
    startDate : this.state.startDatelimit,
    endDate: this.state.endDatelimit,
  }
    axios.post("http://52.212.188.65:3992/ActiveJobs",ActiveBody)
    .then(json =>  {
       var ActiveJobsArray = json["data"]["ActiveJob"];
        if(json["data"]["ActiveJob"].length != 0){
        me.setState({
        mainActiveJobsArray :  json["data"]["ActiveJob"],
      }
        );
        // console.log("This is data ");
        // console.log(ActiveJobsArray);
        me.firstrender(ActiveJobsArray);
      }
      else{
        me.setState({
        mainActiveJobsArray :[],
      }
        ); 
      } 
    });
}

   fetch(){
    var me = this;
    var items=[];
    this.setState({'in_prog':true});
    var body = {
      mac: this.state.CriteriaForOP.mac ,
      filter: this.state.filter 
  };
    if(this.state.filter.TypeOfJobs == "ExecutedJob"){
     
        axios.post("http://52.212.188.65:3992/executedJob",body)
            .then(function (result) {
              var mainActiveJobdata  =   result.data;
              items   =   result.data.executedJob;
              me.setState({mAOfInactivejob:items,'total_count':mainActiveJobdata.count,'in_prog':false});
      }).catch(error =>{
        me.setState({mAOfInactivejob:[],'in_prog':false});
      });
    }else if(this.state.filter.TypeOfJobs == "PendingJob"){
      axios.post("http://52.212.188.65:3992/PendingJob",body)
      .then(function (result) {
        var mainActiveJobdata  =   result.data;
        items   =   result.data.PendingJob;
        me.setState({mAOfInactivejob:items,'total_count':mainActiveJobdata.count,'in_prog':false});
        }).catch(error =>{
          me.setState({mAOfInactivejob:[],'in_prog':false});
        });
    }
      
     
}
changePage(page){
    this.state.filter.page  =   page;
    // //alert(page);
    this.setState({"filter":this.state.filter});
    // this.fetch();
    }

   firstrender(maindata){
     
    //  if(maindata.length != 0){
      var sDate = new Date().toISOString();
      //console.log("This is first Render");
      var endDate= new Date(sDate).addHours(4).toISOString();
      this.setState({startDate: sDate, endDate: endDate});
      //console.log(maindata)
      //console.log(sDate)
      //console.log(endDate)
      this.filterdata(maindata,sDate,endDate);
    //  }
  
   }
   nevigation(value){
     var me = this;
     var sStartdate = this.state.startDate
     if(Math.sign(value )== 1){
      //  //alert("this is sign for pluse");

      var startDate = new Date(sStartdate).addHours(value).toISOString();
      var endDate= new Date(startDate).addHours(value).toISOString();
    
      me.setState({startDate: startDate, endDate: endDate, ActionVF: 1});
    if(this.state.endDatelimit < endDate){
      var startDatelimit = new Date(me.state.startDatelimit).addDay(1).toISOString();
      var endDatelimit = new Date(me.state.endDatelimit).addDay(1).toISOString();
      me.setState({startDatelimit: startDatelimit, endDatelimit:endDatelimit ,startDate: startDate, endDate: endDate,ActionVF: 1})
      me.fetchActiveJob();
      }
    else{
        //alert(startDate+"start date/"+"end Date"+ endDate )
        me.setState({startDate: startDate, endDate: endDate,ActionVF: 1});
        me.filterdata(me.state.mainActiveJobsArray,startDate,endDate);
        }
    }
     else{
      var startDate = new Date(sStartdate).addHours(value).toISOString();
      var endDate= sStartdate;
      if(me.state.startDatelimit > startDate ){
        var startDatelimit = new Date(me.state.startDatelimit).addDay(-1).toISOString();
        var endDatelimit = new Date(me.state.endDatelimit).addDay(-1).toISOString();
        me.setState({startDatelimit: startDatelimit, endDatelimit:endDatelimit,startDate: startDate, endDate: endDate,ActionVF: 1 })
        me.fetchActiveJob();
         }
      else{
          me.setState({startDate: startDate, endDate: endDate,ActionVF: 1});
          //alert(startDate+"start date/"+"end Date"+ endDate )
          me.filterdata(me.state.mainActiveJobsArray,startDate,endDate);
        }
    }
   
   }
   filterdata(maindata,startDate,endDate){
    const {ActionVF} = this.state;
      var resultdata = maindata.filter(item => item.ActionTime >= startDate && item.ActionTime <= endDate );
      //alert("console is print");
      //console.log("this is result data ");
      //console.log(resultdata);
      if(ActionVF == 1){
        resultdata.sort(function(a, b) {
          a = new Date(a.ActionTime);
          b = new Date(b.ActionTime);
          return a>b ? 1 : a<b ? -1 : 0;
        });
      }
      else{
        resultdata.sort(function(a, b) {
          a = new Date(a.ActionTime);
          b = new Date(b.ActionTime);
          return a>b ? -1 : a<b ? 1 : 0;
        });
      }
      this.setState({ActiveJobsArray: resultdata}); 
   }
   selectedActioV(e){
     //alert(e.target.value);
     //console.log(e.target.value);
     this.setState({ActionVF: e.target.value});
   }
   selectedChF(e){
    //alert(e.target.value);
    //console.log(e.target.value);
    this.setState({channelFil: e.target.value});
  }
  FselectAction(value){
    //alert(value);
    this.state.filter.Action = value;
    this.setState({filter: this.state.filter});
  }
  filterByChExe(value){
  // var me = this;
    //alert(value);
    //console.log(value);
    this.state.filter.Fchannel = value; 
    this.setState({filter: this.state.filter});
  }
  filterClimateFun(value){
    var me = this;
    //alert(value)
    this.state.Climate.selectedfilter = value;
    this.setState({selectedfilFSensor: value })
  }
  Mfiltrerbtn(){
    const {filter} = this.state;
    //console.log(filter);
    this.fetch();
  }
  filtermethod(){
    const {channelFil, ActionVF,startDate,endDate} = this.state;
    var me = this;
    //alert(channelFil+ " ://"+ ActionVF);

   var arrayofActive = this.state.mainActiveJobsArray.filter(item => item.Channel == channelFil );
   me.filterdata(arrayofActive,startDate,endDate);
  }
   handleChechBox(){
    this.state.configkeyInputKeyValue["toggle"]=   !this.state.configkeyInputKeyValue["toggle"]
    this.setState({configkeyInputKeyValue:this.state.configkeyInputKeyValue });
   }
   handelMExpression(){
     this.setState({MExpression: false})
   }
 
    render() {
    //console.log(this.state.channelAlerrModel.mode);
      // console.log(this.state.rowClickedId)
      const {selectedAtionType,formStructure,configkeyInputKeyValue,configkeyInput,sentCommandArray} = this.state;
      var state   =   this.state;
      var me          =   this;
      var total_page  =   Math.ceil(this.state.total_count/this.state.filter.page_size);
      const indexOfLastTodo = state.filter.page * state.filter.page_size;
      const indexOfFirstTodo = indexOfLastTodo - state.filter.page_size;
      const ExecutedJobs =  state.mAOfInactivejob.slice(indexOfFirstTodo, indexOfLastTodo)
    
      var page_start_index    =   ((state.filter.page-1)*state.filter.page_size);
      // //alert(this.state.filter.Fchannel)
    var  inputField = null;
    var className12 = {}
  if(formStructure == "2-input"){
    configkeyInput.forEach(function(key) {
      className12[key+"date"+"Classerror"]   =   "";
      if(configkeyInputKeyValue[key+"date"+"error"].length != 0){
       className12[key+"date"+"Classerror"] = "Acustmborder";
      }
      className12[key+"hour"+"Classerror"]   =   "";
      if(configkeyInputKeyValue[key+"hour"+"error"].length != 0){
       className12[key+"hour"+"Classerror"] = "Acustmborder";
      }
      className12[key+"min"+"Classerror"]   =   "";
      if(configkeyInputKeyValue[key+"min"+"error"].length != 0){
       className12[key+"min"+"Classerror"] = "Acustmborder";
      }
      // className12[key+"Meridiem"+"Classerror"]   =   "";
      // if(configkeyInputKeyValue[key+"Meridiem"+"error"].length != 0){
      //  className12[key+"Meridiem"+"Classerror"] = "Acustmborder";
      // }
     });
 
   inputField =  <form class="form-horizontal" >
    <div>
    <div className="dropDown">
        <label>Channel Setup :</label>
               <DropdownButton  className = "AcDropS"  onSelect={this.handleChange1}
               disabled = {this.state.channelName.length ==  0? true : null}
               bsStyle={"Awhite"}
                title={this.state.selectedChannelB || "Select Channel"}>
                {this.state.channelName.map( (item) =>
                <MenuItem eventKey={item.configName}>{item.businessName}</MenuItem>
                )}
                </DropdownButton>
       </div>
     <div className= "divOFsingleinput">
     <label className = "AsingleInput">Daily Task:  </label>
     <label className="switch ActiveSinput">
      <input type="checkbox" value="Text" onChange = {this.handleChechBox.bind(this)}/>
      <span className="slider round"></span>
    </label>
    </div>
      {this.state.configkeyInput.map(item => <div class="form-group">
     <label class="control-label col-sm-2" for="ON">{item} Time:</label>
     <div class="col-sm-10">
     <span className= "Aidate">
     <DatePicker  id = {item+"date"}
                        selected={configkeyInputKeyValue[item+"date"]}
                        onChange={e => {configkeyInputKeyValue[item+"date"] =e;
                        this.setState({ configkeyInputKeyValue : configkeyInputKeyValue })}}
                        showMonthDropdown
                        showYearDropdown
                        isClearable={true}
                         disabled={(configkeyInputKeyValue["toggle"])? true: null}
                        className={className12[item+"date"+"Classerror"]}
                        placeholderText="   *  .  *  .  *  .  *  .  *  .  *"
                         />
                         </span>

                         <span className= "inhour">
           <input type="number"   id= {item+"hour"} className={"hourmin "+ className12[item+"hour"+"Classerror"]} name = {configkeyInputKeyValue[item+"hour"]} maxLength="2" value ={configkeyInputKeyValue[item+"hour"]}  
          onChange = {e => {configkeyInputKeyValue[item+"hour"] =e.target.value ;
            this.setState({ configkeyInputKeyValue : configkeyInputKeyValue })}}  placeholder="HH"/> 
            </span>

           <span className= "Acolon"> :</span>
            <span className= "inhour">
            <input type="number"  id= {item+"min"}  className={"hourmin  "+ className12[item+"min"+"Classerror"]} name = {configkeyInputKeyValue[item+"min"]} maxLength="2" value ={configkeyInputKeyValue[item+"min"]}  
            onChange = {e => {configkeyInputKeyValue[item+"min"] =e.target.value ;
            this.setState({ configkeyInputKeyValue : configkeyInputKeyValue })}}  placeholder="MM"/>               
             </span> 
         {configkeyInputKeyValue[item+"dateerror"].length != 0 && <div className='text-danger Acfontsize'>{configkeyInputKeyValue[item+"dateerror"]}</div>}
         {configkeyInputKeyValue[item+"hourerror"].length != 0 && <div className='text-danger Acfontsize'>{configkeyInputKeyValue[item+"hourerror"]}</div>}
         { configkeyInputKeyValue[item+"minerror"].length != 0 && <div className='text-danger Acfontsize'>{configkeyInputKeyValue[item+"minerror"]}</div>}

     </div>
      </div>)}
      <div class="form-group"> 
     <div class="col-sm-offset-2 col-sm-10">
       <button type="button" class="btn btn-default" onClick = {this.Submit}>Submit</button>
     </div>
      </div>
   </div>
   </form>;
  }
  if(formStructure == "ClimateControl"){
    inputField =     <div className= "col-sm-12">
    <table>
     <tr>
       <td>
     <label>Select Template</label>
       </td>
       <td>
     <DropdownButton  className = "" 
           onSelect={this.filterClimateFun}
          bsStyle={"Awhite"}
           title={ "Select Template Type"}>
            {/* {this.state.climateSensor.map( (item) =>
           <MenuItem   eventKey={item}>{item}</MenuItem>
            )}  */}
           </DropdownButton>
           </td>
   
           <td>
     <label>Select Version</label>
     </td>
     <td>
     <DropdownButton  className = "" 
           onSelect={this.filterClimateFun}
          bsStyle={"Awhite"}
           title={ "Select Version"}>
            {/* {this.state.climateSensor.map( (item) =>
           <MenuItem   eventKey={item}>{item}</MenuItem>
            )}  */}
           </DropdownButton>
           </td>

     </tr>
     </table>
   <div className ="col-sm-8">
     <div className= "Activefilterdiv">
         <label className="OpdLable">Sensor Type :</label>
         <DropdownButton  className = "" 
           onSelect={this.filterClimateFun}
          bsStyle={"Awhite"}
           title={this.state.selectedfilFSensor || "Select Sensor Type"}>
            {this.state.climateSensor.map( (item) =>
           <MenuItem   eventKey={item}>{item}</MenuItem>
            )} 
           </DropdownButton>
              <button type= "button" className= "ActivFilterBtn btn btn-sm ">filter</button>
            </div>
           <p className ="ActiveP" >Climate Control Table </p>
               <div  className="table-responsive">
               <Table  className="table table-hover table-sm table-bordered ">
                       <thead className='' style={{background: "gainsboro"}}>
                       <tr>
                       <th className='Acustmtd'> SI</th>
                       <th className='Acustmtd'>Sensor Type</th>
                       <th className='Acustmtd'>Expression</th>
                       <th className=' Acustmtd'>Action</th>
                       <th className='Acustmtd'>Flag</th>
                       </tr>
                       </thead>
                       <tbody>
    { this.state.ArrayForClimateTable.map( (item,i) => 
                   <tr key ={i} onClick ={this.ClimateRow.bind(this,i)}>
                   <td className='Acustmtd'>{i + 1}</td>
                   <td className='Acustmtd'>{item.sensorsType}</td>
                   <td className='Acustmtd'>{item.expression}</td>
                   <td className='Acustmtd'>{item.actionsOn}</td>
                   <td className='Acustmtd'>{item.process}</td>
                   </tr>
                   )}
                       </tbody> 
                       </Table>
               </div>

           </div>
           <div className="col-sm-4">
        <div className="">
        <p className ="ActiveP " >Serial No. :{this.state.ClimateIndex} </p>
   <textarea type="text" className ='ActivetestArea ClimateTExM textareacust' value= {JSON.stringify(this.state.selectedExpression,undefined, 2) }/>
        </div>
        <table className="">
        {this.state.selectedClimateAction.map((item, i)=>
             <tr key= {i}>
            <td> <label>{item.key}</label></td>
           <td> <label className="switch ActiveSinput">
             <input type="checkbox" checked= {(item.value ==1)? true: false} value="Text" onChange = {this.handleChechBox.bind(this)} disabled/>
             <span className="slider round"></span>
             </label>
             </td>
             </tr>
        )}
        </table>
           </div>

   </div>;
  }
  if(formStructure == "manualOverride"){
    // console.log(configkeyInputKeyValue);
    // console.log("This I Want See");
  
      inputField = <form > 
      <div className = 'col-sm-12 col-xs-12 col-md-12 col-lg-12'>
      <div className ="col-sm-12 col-lg-12 col-xs-12">
      <div className ="col-sm-4 col-lg-4 col-xs-4"></div>
      <div className ="col-sm-4 col-lg-4 col-xs-4">
      <div class="marginbtnManual">
      <button className="btn btn-default btn-xs pull-left" type="button" onClick={this.AllSelectionManual.bind(this,"manual")}>All Manual</button> 
      <button className="btn btn-default btn-xs pull-right" type ="button" onClick={this.AllSelectionManual.bind(this,"automatic")}>All Automatic</button>
      </div>
      <div className ="col-sm-4 col-lg-4 col-xs-4"></div>
      </div>
      </div>
      {this.state.configkeyInput.map(item => <div className= "col-sm-12"><div className='col-sm-4 col-xs-4 col-md-4 col-lg-4 '>
       <label>{item}</label>
       </div>
       <div className ="col-sm-8 col-xs-8 col-md-8 col-lg-8">
       <span  className={(configkeyInputKeyValue[item+"toggle"])?"Activefont": "NotActivefont" }> Manual</span>
       <label className="switch ActiveSinput">
          <input type="checkbox" value = "Text" checked ={ configkeyInputKeyValue[item+"toggle"]}
           onChange={e =>{
            configkeyInputKeyValue[item+"toggle"] = !configkeyInputKeyValue[item+"toggle"]
            configkeyInputKeyValue[item]["pendingMode"] = (configkeyInputKeyValue[item+"toggle"] == true)? 1: 0 
             this.setState({configkeyInputKeyValue : configkeyInputKeyValue})}} />
          <span className="slider round"></span>
        </label> &nbsp; &nbsp;  &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp;
        <span  className={(configkeyInputKeyValue[item+"toggle"])?"NotActivefont": "Activefont" }> Automatic</span>
        </div>
        </div>
        )}
       </div>
       <div class="form-group"> 
       <div class="col-sm-offset-2 col-sm-10">
         <button type="button" class="btn btn-default" onClick = {this.Submit}>Submit</button>
       </div>
        </div>
       </form>;
     }
  if(formStructure == "SetParameter"){
    inputField =  <div className ="">
    <div className="col-xs-12">
    {this.state.configkeyInput.map(item =><div>
    <div className= "col-sm-8">
    <label> Set {item} :</label><span className="rangeLabel">{"Min : "+configkeyInputKeyValue[item+"Lower"]+",  Max :  "+configkeyInputKeyValue[item+"higher"]}</span>
    
   <InputRange
        maxValue={configkeyInputKeyValue[item+"max"]}
        minValue={configkeyInputKeyValue[item+"min"]}
        // formatLabel={value => `${value.min}Min`} 
        draggableTrack = {true}
        value={ {min: configkeyInputKeyValue[item+"Lower"], max: configkeyInputKeyValue[item+"higher"] }}
        onChange={value =>{
           configkeyInputKeyValue[item+"Lower"]  = value.min
           configkeyInputKeyValue[item+"higher"] = value.max
          this.setState({configkeyInputKeyValue:configkeyInputKeyValue })}}/>
          <br/>
    </div>
    {/* <div className= "col-xs-6"> */}
    {/* <div className="displayRange">{ "Min : "+configkeyInputKeyValue[item+"Lower"]+",  Max :  "+configkeyInputKeyValue[item+"higher"]}</div> */}
    {/* <br/> */}
     {/* <span className="rangeLabel">Min  : </span>
    <span className="rangeLabel">{configkeyInputKeyValue[item+"min"]}</span>
    <input className= "rangeClassActive" type="range" 
    name={configkeyInputKeyValue[item+"Lower"]} 
    max = {configkeyInputKeyValue[item+"higher"]}
    min = {configkeyInputKeyValue[item+"min"]} 
    title={configkeyInputKeyValue[item+"Lower"]}
    value ={configkeyInputKeyValue[item+"Lower"]}
    onChange={(e)=>{ configkeyInputKeyValue[item+"Lower"] =e.target.value
     this.setState({configkeyInputKeyValue : configkeyInputKeyValue})}}/>
     <span className="rangeLabel">{configkeyInputKeyValue[item+"higher"]}</span>
     <br/>
     <span className="rangeLabel">Max  :  </span>
     <span className="rangeLabel">{configkeyInputKeyValue[item+"Lower"]}</span>
         <input className= "rangeClassActive" type="range" 
    name={configkeyInputKeyValue[item+"higher"]} 
    max = {configkeyInputKeyValue[item+"max"]}
    min = {configkeyInputKeyValue[item+"Lower"]} 
    title={configkeyInputKeyValue[item+"higher"]}
    value ={configkeyInputKeyValue[item+"higher"]}
    onChange={(e)=>{ configkeyInputKeyValue[item+"higher"] =e.target.value
     this.setState({configkeyInputKeyValue : configkeyInputKeyValue})}}/> */}
     {/* <span className="rangeLabel">{configkeyInputKeyValue[item+"max"]}</span> */}
    
    {/* </div> */}
    </div>
    )}
    </div>
    <div class="col-sm-offset-2 col-sm-10">
       <button type="button" class="btn btn-default" onClick = {this.SubmitForParameter}>Submit</button>
     </div>
    </div>
  }

  if(formStructure == "1-input"){
    configkeyInput.forEach(function(key) {
      className12[key+"Classerror"]   =   "";
      if(configkeyInputKeyValue[key+"error"].length != 0){
       className12[key+"Classerror"] = "Acustmborder";
      }
     });
    inputField =  <form className="form-horizontal" >
     <div className="AcSetInterval">
    {this.state.configkeyInput.map(item =><div class="form-group">
      <label class="control-label col-sm-2" for="ON">Interval:</label>
      <div class="col-sm-10">
                        <input type="number"
                        id = {item}
                        value= {configkeyInputKeyValue[item]}
                        className={className12[item+"Classerror"]}
                        name = {configkeyInputKeyValue[item]}
                         onChange={e => {configkeyInputKeyValue[item] =e.target.value;
                        this.setState({ configkeyInputKeyValue : configkeyInputKeyValue })}} 
                        
                        />
         {configkeyInputKeyValue[item+"error"].length != 0 && <div className='text-danger Acfontsize'>{configkeyInputKeyValue[item+"error"]}</div>}

      </div>
    </div>)}
    <div class="form-group"> 
     <div class="col-sm-offset-2 col-sm-10">
       <button type="button" class="btn btn-default" onClick = {this.Submit}>Submit</button>
     </div>
      </div>
    </div>
    </form>;
   }
  
  if(formStructure == "table"){
     var tempArray = ["ON","OFF"];
     configkeyInput.forEach(function(key) {
     for(var i =0; i< 2;i++){
     
      className12[tempArray[i]+key+"Classerror"]   =   "";
     if(configkeyInputKeyValue[tempArray[i]+key+"error"].length != 0){
      className12[tempArray[i]+key+"Classerror"] = "Acustmborder";
     }
     }
    })
  
inputField = 
<form class="form-horizontal" >
<div>
   <div className="dropDown"> 
        <label>Channel Setup :</label>
               <DropdownButton  className = "AcDropS"  onSelect={this.handleChange1}
               disabled = {this.state.channelName.length ==  0? true : null}
               bsStyle={"Awhite"}
                title={this.state.selectedChannelB || "Select Channel"}>
                {this.state.channelName.map( (item) =>
                <MenuItem eventKey={item.configName}>{item.businessName}</MenuItem>
                )}
                </DropdownButton>
       </div>
<div className = "ActiveTableH">
<div  className="table-responsive">
    <Table  className="table table-hover table-sm table-bordered ">
    <thead className=''>
    <tr>
    
    <th className='Acustmtd '>CronJob Name</th>
    <th className='Acustmtd'>ON Time</th>
    <th className='Acustmtd '>OFF Time</th>
    </tr>
    </thead>
    <tbody >
    {this.state.configkeyInput.map(item => 
         <tr>
         <td className=' ActiveTableinput'> {item}</td>
         <td className='ActiveTableinput '> 
         {configkeyInputKeyValue["ON"+item+"error"].length != 0 && <div className=' text-danger Acfontsize'>{configkeyInputKeyValue["ON"+item+"error"]}</div>}        
         <DatePicker  id = {"ON"+item}
                        selected={configkeyInputKeyValue["ON"+item]}
                        onChange={e => {configkeyInputKeyValue["ON"+item] =e;
                        this.setState({ configkeyInputKeyValue : configkeyInputKeyValue })}}
                        showTimeSelect
                        showMonthDropdown
                        showYearDropdown
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="LLL"
                        timeCaption="time"
                        className={className12["ON"+item+"Classerror"]}
                        placeholderText="Please Select Start Date"
                         /></td>
         <td className=' ActiveTableinput' > 
         {configkeyInputKeyValue["OFF"+item+"error"].length != 0 && <div className=' text-danger Acfontsize'>{configkeyInputKeyValue["OFF"+item+"error"]}</div>}
         <DatePicker id = {"OFF"+item}
                        selected={configkeyInputKeyValue["OFF"+item]}
                        onChange={e => {configkeyInputKeyValue["OFF"+item] =e;
                        this.setState({ configkeyInputKeyValue : configkeyInputKeyValue })}}
                        showTimeSelect
                        showMonthDropdown
                        showYearDropdown
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="LLL"
                        timeCaption="time"
                        className={className12["OFF"+item+"Classerror"]}
                        placeholderText="Please Select Start Date"
                         />
          </td>
         </tr>
         )}
   
    </tbody> 
    </Table>
</div> 
</div>
<div class="form-group"> 
     <div class="col-sm-offset-2 col-sm-10">
       <button type="button" class="btn btn-default" onClick = {this.Submit}>Submit</button>
     </div>
      </div>
</div>
</form>;
  }
  if(formStructure == "SentCommand"){
    inputField = <div className= "col-lg-12">
    <div className= "col-lg-6">
      <div className ="tableactuter">
      <p className ="ActiveP">Sent Command</p>
          <div  className="table-responsive">
              <Table  className="table table-hover table-sm table-bordered  cust">
              <thead className='' style={{background: "gainsboro"}}>
              <tr>
              <th className='Acustmtd '> SI</th>
              <th className='Acustmtd'>Action Type</th>
              <th className='Acustmtd'>Channel</th>
              <th className='Acustmtd'>Time</th>
              <th className='Acustmtd'>Action</th>
              </tr>
              </thead>
              <tbody>
              {  this.state.sentCommandArray.map((item, i) =>
              <tr>
              <td className='Acustmtd '>{1+i}</td>
              <td className='Acustmtd '>{item.ActionType}</td>
              <td className='Acustmtd '>{item.Channel}</td>
              <td className='Acustmtd '>{dateFormat(item.createdTime, "dd-mmm HH:MM")}</td>
              <td className=" btn-group">
              <button   onClick= {this.rowClicked.bind(this,item,1+i,item._id)}
                 className="btn color1  btn-xs" > View</button>
               <button  onClick={()=>{

               }}   className="btn color2  btn-xs" > Edit</button>
               <button  onClick={ this.rowDelete.bind(this,item._id)} className="btn color3  btn-xs" > Delete</button>
               </td>
              </tr>
              )}
              </tbody> 
              </Table>
          </div> 
      </div>
     </div> 
     <div className= "col-lg-6">
    <div className= "ActiveDivareainput">
    <p className ="ActiveP textArea">Sent Command = {this.state.sentCommandIndex}</p>
    <textarea type="text" className ='ActivetestArea textareacust' value= {JSON.stringify( this.state.rowclickedData,undefined, 2) }/>
    </div>
     </div>
     </div>;
  }
  if(formStructure == "ActiveCommand"){
    inputField =   <div className ="col-lg-12">
    <div className= "Activefilterdiv">
    <select onChange={this.selectedChF.bind(this)}  className="form-control ActiveSelection">
    {this.state.channelForfilter.map(item => 
    <option className="selectcolor" value={item}>{item}</option> )}
      </select>
      <select    onChange={this.selectedActioV.bind(this)}  className="form-control ActiveSelection">
       <option className="selectcolor"  value="1">Ascending </option>
        <option className="selectcolor"value="-1" >descending</option>
      </select>
      <button type= "button" className= "ActivFilterBtn btn btn-sm " onClick= {this.filtermethod.bind(this)}>filter</button>
      <ul class="pagerActive">
       <li><a  onClick= {this.nevigation.bind(this,-4)}>Prev</a></li>
       <li className='ActiveList'>4 hrs</li>
       <li><a  onClick= {this.nevigation.bind(this,4)}>Next</a></li>
       </ul>
    </div>
   <p className ="ActiveP">Active Command 
   <span className= "Acustmfloat"> {dateFormat(this.state.startDate, "HH:MM dd-mmm")+" / "+ dateFormat(this.state.endDate, "HH:MM dd-mmm")}</span></p>
       <div  className="table-responsive">
               <Table  className="table table-hover table-sm table-bordered cust">
               <thead className='' style={{background: "gainsboro"}}>
               <tr>
               <th className=' Acustmtd'> SI</th>
               <th className='Acustmtd Apadh '>Channel</th>
               <th className='Acustmtd '>Action</th>
               <th className='Acustmtd'>Values</th>
               <th className='Acustmtd '>isDailyJob</th>
               </tr>
               </thead>
               <tbody>
               { this.state.ActiveJobsArray.map((itme, i) =>
           <tr>
           <td className='Acustmtd '>{i+ 1}</td>
           <td className='Acustmtd '>{itme.Channel}</td>
           <td className='Acustmtd '>{itme.ActionType}</td>
           <td className='Acustmtd '>{dateFormat(itme.ActionTime, "dd-mmm HH:MM")}</td>
           <td className='Acustmtd '>{(itme.isDailyJob)?"Yes":"NO"}</td>
           </tr>
           )
           }
               </tbody> 
               </Table>
       </div> 
   </div>;
    }
    if(formStructure == "ActiveAndPending"){
      inputField =  <div className ="">
      <div className= "Activefilterdiv">
          {/* <div className= "col-lg-12">
          </div> */}
          <label className="OpdLable">Channel :</label>
          <DropdownButton  className = ""  onSelect={this.filterByChExe}
           bsStyle={"Awhite"}
            title={this.state.filter.Fchannel || "Select Channel"}>
             {this.state.channelForfilter.map( (item) =>
            <MenuItem   eventKey={item}>{item}</MenuItem>
            )}
            </DropdownButton>
            <label  className="OpdLable">Action :</label>
               <DropdownButton  className = ""  onSelect={this.FselectAction}
               bsStyle={"Awhite"}
                title={this.state.filter.Action}>
                <MenuItem   eventKey="OFFTime">OFFTime</MenuItem>
                <MenuItem   eventKey="ONTime">ONTime</MenuItem>
            </DropdownButton>
            <label  className="OpdLable">From Date :</label>
               <div className= "ExecutejobDate">
              
               <DatePicker  id = "Fromfilter"
                    selected={this.state.filter.Fdate}
                     onChange={this.MdateFilter}
                     showTimeSelect
                     showMonthDropdown
                     showYearDropdown
                     timeFormat="HH:mm"
                     timeIntervals={15}
                     dateFormat="LLL"
                     timeCaption="time"
                     isClearable={true}
                    // isClearable={true}
                    className="ExecutejobDatepiker"
                    placeholderText="From Date"
                     />
                </div>
               <button type= "button" className= "ActivFilterBtn btn btn-sm " onClick= {this.Mfiltrerbtn.bind(this)}>filter</button>
             </div>
            <p className ="ActiveP">Executed Jobs Command </p>
                <div  className="table-responsive">
                <Table  className="table table-hover table-sm table-bordered ">
                        <thead className='' style={{background: "gainsboro"}}>
                        <tr>
                        <th className='Acustmtd'> SI</th>
                        <th className='Acustmtd Apadh '>Channel</th>
                        <th className=' Acustmtd'>Action</th>
                        <th className='Acustmtd'>Values</th>
                        <th className='Acustmtd'>isDailyJob</th>
                        </tr>
                        </thead>
                        <tbody>
                        { state.in_prog && <tr><td colSpan={8} className='text-center'><i className='fa fa-refresh fa-spin'></i> Loading..</td></tr>}
  { !state.in_prog && ExecutedJobs.length == 0 && <tr><td colSpan={8} className='text-center'> No Data </td></tr>}
    { !state.in_prog && ExecutedJobs.map( (item,i) => 
                    
                    <tr key ={i}>
                    <td className='Acustmtd'>{page_start_index+i + 1}</td>
                    <td className='Acustmtd'>{item.Channel}</td>
                    <td className='Acustmtd'>{item.ActionType}</td>
                    <td className='Acustmtd'>{dateFormat(item.ActionTime, "dd-mmm HH:MM")}</td>
                    <td className='Acustmtd'>{(item.isDailyJob)?"Yes":"NO"}</td>
                    </tr>
                    )}
                        </tbody> 
                        { "Pages: " +total_page }
                        </Table>
                </div>
                <div className='align-right'>
{ total_page > 1 && <CPagination  page={state.filter.page} totalpages={total_page} onPageChange={this.changePage}/>}
    </div> 
            </div>

    }
  

        return(
<div className ="container-fluid ">
   <div className="row">
   <div className= "col-lg-10">
   <p className= "line2"></p>
   <div className="row"> 
            <div className="col-lg-12 ">  
           
       <div className="col-lg-12  ViewBredCum">
      
       <div className="col-sm-8">
    <div className="spanBredDiv">
       <span  className="spanBredcum">{(this.state.CriteriaForOP.CustCd != "")?this.state.CriteriaForOP.CustCd: ""} </span><span className="spanBredcumslash">/</span>
       <span  className="spanBredcum"> {(this.state.CriteriaForOP.subCustCd != "")?this.state.CriteriaForOP.subCustCd: "" }</span> <span className="spanBredcumslash">/</span> 
       <span  className="spanBredcum">{(this.state.CriteriaForOP.assetId != "")?this.state.CriteriaForOP.assetId: ""} </span> <span className="spanBredcumslash">/</span> 
       <span  className="spanBredcum">{(this.state.CriteriaForOP.DeviceName != "")? this.state.CriteriaForOP.DeviceName: ""}</span>
  </div>
  </div>
  <div className="col-sm-4">
     <div className="navright">
     <button type="button"  className="spanNev btn"  onClick={() =>{ 
                         this.props.history.push("/NevMenu")}}>Device Menu</button>
     <button  type="button" className="spanNev btn"  onClick={() =>{ 
                         this.props.history.push("/socketdashbord")}}>View Dashboard</button>
     </div>
     </div>
      {/* </div> */}
      </div>
      </div>
      </div>
 <button className= ' toggleButton'  onClick={this.toggle.bind(this)}><i className= { (this.state.open ? "fas fa-caret-up": "fas fa-caret-down")}></i></button>

       <div className ={"ActiveSensorsRow collapse" + (this.state.open ? ' in' : '')}>
       <div className="col-lg-12">
       <div className="SensorsWrapper">
         <div className="SensorsOuter">
        { this.state.sensorsArray.map(item =><div className="sensorsDive"> 
         <SensorsActive key ={item._id}
             bgclass="small-boxDActive "
            label= {item.sortName} 
            takenClass= "ActivedateTime"
            P_name_class= "ActivePclass" 
            heading_class_name=" ActiveSheading"
            message={item.Value}
           
            dateTime = {dateFormat(item.dateTime, "dd-mmm HH:MM")}
           />
         </div>
         )}
      
          </div>
          <div className="SensorsOuter pointer1">
          { this.state.channelArray.map((item,i) =>  <div onClick= {this.ActionOnChanel.bind(this,item,i)} className="sensorsDive"> 
         <SensorsActive key ={item._id}
             bgclass= {  (item.OldValue != item.Value) ? " small-boxDActive ChannelBGColortransition":(item.ActionCond != item.Value)?"small-boxDActive  ChannelBGColorYellow ": "small-boxDActive" &&
             (item.Value == 1)? " small-boxDActive onbackground":"small-boxDActive "}
            label= {item.sortName} 
            takenClass= "ActivedateTime"
            P_name_class= "ActivePclass" 
            heading_class_name=" ActiveSheading"
            message={(item.Value == 1)? "ON":"OFF" }
            div_icon_class=" fontsizeicon12"
            iconclass= {item.mode}
            dateTime = {dateFormat(item.dateTime, "dd-mmm HH:MM")}
         />
         </div>
         )}
         </div>
         </div>
         </div>
        
        </div>
        <div className = 'col-lg-12 col-sm-12'>
 
 <div className= "line3"></div></div>
 <div className= "col-lg-12 margin-topActive">
 <Nav bsStyle="pills colorpills"  activeKey={this.state.selectedAtionType} onSelect={this.handleChange}>
         { this.state.actionTypes.map(item =>  
          <NavItem eventKey={item.payloadId} >
           {item.payloadId}
          </NavItem>
         )}
         <NavItem eventKey="SentCommand" >
         SentCommand
          </NavItem>
          {/* <NavItem eventKey="ActiveCommand" >
          ActiveCommand
          </NavItem>
          <NavItem eventKey="ExecutedJobs" >
          ExecutedJobs
          </NavItem>
          <NavItem eventKey="PendingJobs" >
          PendingJobs
          </NavItem> 
          <NavItem eventKey="ClimateParameter" >
          ClimateParameter
          </NavItem>   
          <NavItem eventKey="ClimateControl" >
          ClimateControl
          </NavItem>    */}

        </Nav> 
        
 </div>
      <div className="col-lg-12">
     
    
      <div className ="paddForm">
      {inputField}
    
     </div>
   </div>


</div>
    <div className= "col-lg-2 ">
              <div className= "ActiveCorner">
            
                <div className="col-sm-12">
                {this.state.lastPayloadDataArray.map(item => <div>
                  <label>{item.payloadId} :</label>
                  <span>{(item.createdTime)?dateFormat(item.createdTime, "dd-mmm HH:MM:ss"): "00:00:00:00:00"}</span>
                  </div>
              )
              }
                <label className="fonsizename">Age : </label>
                <span className="spanclass"> {this.state.age}</span>
                <br/>
                <br/>
                <p className= "line2"></p>
                <br/>
                <label  className="fonsizename">Pending Command : </label>
                <span className="spanclass"> {this.state.sentCommandArrayLenght}</span>
                <br/>
                <br/>
               </div>
              
                <div className= "col-lg-12">
                <p className= "line2"></p>
                <br/>
                <div className="small-box bg-red" title= {this.state.lastAlertData.alertText} >
             <div className="inner"><p className= "color12  ">{(this.state.lastAlertData.shortName)?this.state.lastAlertData.shortName:"No Alerts Triggered"}</p>
            <p className= "criteriaClass ">{(this.state.lastAlertData.criteria)?this.state.lastAlertData.criteria:""} &nbsp;</p>
            <p className="ForAlertActive">Time:  { (this.state.lastAlertData.createdTime)?dateFormat(this.state.lastAlertData.createdTime, "dd-mmm HH:MM:ss"):""}</p>
            </div>
            <div className=" fontsizeicon2 icon"><i className="fas fa-exclamation-triangle"></i>
            </div>
            <a href="javascript:void(0)" className= "small-box-footer">&nbsp;</a>
            </div>
            </div>
               
                {/* <div className="col-lg-12">
                <ul class="nav nav-pills nav-stacked">
                  <li><a className=" " onClick={() =>{ 
                         this.props.history.push("/socketdashbord")
                           }}>View Dashboard</a></li>
                  <li><a className=" " onClick={() =>{ 
                         this.props.history.push("/NevMenu")
                           }}> Device Menu</a></li>
                </ul> 
                </div> */}
              
                </div>
               
         </div>
         
 </div>
 <Modal show={this.state.show} onHide={this.handleClose}
             dialogClassName=""
             aria-labelledby="example-custom-modal-styling-title">
          <Modal.Header closeButton>
            <Modal.Title id="example-custom-modal-styling-title" ></Modal.Title>
          </Modal.Header>
          <Modal.Body>
      <div className= "row">
      <div className= "col-xs-12">
      <label>Channel Name :</label> <span>{this.state.channelAlerrModel.channelName}</span>
      </div>
      <div className= "col-xs-5">
      <label>Current Status :</label> <span>{(this.state.channelAlerrModel.currentStatus == 1)?"ON":"OFF"}</span>
      </div>
      <div className= "col-xs-7">
      <label> Last Updated Time :</label> <span>{this.state.channelAlerrModel.UpdatedTime}</span>
      </div>
      <div className= "col-xs-7">
      <label>Channel is  {(this.state.channelAlerrModel.currentStatus == 1)?"ON":"OFF"} since :</label> <span>{this.state.channelAlerrModel.age} hrs.</span>
      </div>
      <div className= "col-xs-12">
      <label>Current Mode :</label> <span>{(this.state.channelAlerrModel.mode == 1)?"Automatic":"Manual"}</span>
      </div>
      </div>
 </Modal.Body>
          <Modal.Footer>
            <label className="Mlabel">Action Requested: <u> Switch {(this.state.channelAlerrModel.currentStatus == 1)?"OFF":"ON"}</u> And <u>Manual</u> Please Confirm ?</label>
            <button className="btn btn-sm " onClick = {this.handleClose}>Cancel</button>
            <button   className="btn btn-sm btn-success" onClick = {this.handleSubmit} >Submit</button>    
          </Modal.Footer>
        </Modal>
</div>
  
)}
}
export default activeDashbord;