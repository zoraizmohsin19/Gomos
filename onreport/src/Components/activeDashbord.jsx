import React, { Component } from 'react'
import "./activeDashbord.css"
import {Table,DropdownButton,MenuItem,Button,Modal,NavItem ,Nav} from 'react-bootstrap';
import SensorsActive from "../layout/widgetofSensors/sensorsForActive";
import axios from "axios";
import moment from 'moment';
import DatePicker from 'react-datepicker';
import dateFormat  from  "dateformat";
import socketIOClient from "socket.io-client";
import CPagination from "../layout/Pagination";
import swal from 'sweetalert';
class activeDashbord extends Component {
    constructor(){
      super();
      this.state={
        endpoint: "http://localhost:4001",
        channelName: [],
        actionTypes: [],
        formStructure: '',
        selectedChannelB: '',
        selectedChannelCn: '',        
        selectedAtionType: '',
        deviceName: '',
        show: false,
        open: false,
        instrInput1: "",
        instrInput2:"",
        startDate: "",
        endDate: "",
        startDatelimit: "",
        endDatelimit: "",
        channelFil: "",
        ActionVF: 1,
        mAOfInactivejob: [],
        channelArray: [],
        sensorsArray: [],
        channelForfilter:[],        
        ActiveJobsArray: [],
        mainActiveJobsArray: [],
        sentCommandArray: [],
        configkeyInput: [],
        configkeyInputKeyValue: {},
        rowclickedData :{},
        tilesPayloaddata: {},
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
         subCustCd: "001",
         CustCd: "DevCub",
         DeviceName : "PilotGH_002T",
         payloadId: "",
         dataBody: {},
         isDaillyJob: "",
         ChannelName: "",
        },
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
      // this.rowClicked = this.rowClicked.bind(this)
      // this. handleChange3 =this.handleChange3.bind(this);
    }
    onChange = e => this.setState({ [e.target.name]: e.target.value });
    Submit(){
      var me = this;
 const {configkeyInput,configkeyInputKeyValue,selectedAtionType,selectedChannelB,formStructure} = this.state;
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
       console.log(dataToSendApi)
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
        alert(dataToSendApi)
     console.log(dataToSendApi)
    }
    if(formStructure == "2-input"){
      for(var key =0; key < configkeyInput.length; key++) {
        configkeyInputKeyValue[configkeyInput[key]+"date"+"error"] =  ""; 
        configkeyInputKeyValue[configkeyInput[key]+"houre"+"error"] = "";
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
        if(configkeyInputKeyValue[configkeyInput[key]+"houre"] == undefined  || configkeyInputKeyValue[configkeyInput[key]+"houre"]  == null || configkeyInputKeyValue[configkeyInput[key]+"houre"] == ''){
          configkeyInputKeyValue[configkeyInput[key]+"houre"+"error"] = "Please provide : "+configkeyInput[key]+"houre"+" error";
          me.setState({configkeyInputKeyValue: configkeyInputKeyValue})
          document.getElementById(configkeyInput[key]+"houre").focus();
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
          dataToSendApi[configkeyInput[key]] = "00:"+configkeyInputKeyValue[configkeyInput[key]+"houre"]+":"+configkeyInputKeyValue[configkeyInput[key]+"min"]+":"+"*:*:*"; 
        }
        else{
          dataToSendApi[configkeyInput[key]] = "00:"+configkeyInputKeyValue[configkeyInput[key]+"houre"]+":"+configkeyInputKeyValue[configkeyInput[key]+"min"]+":"+dateFormat(configkeyInputKeyValue[configkeyInput[key]+"date"], "dd:mm:yy"); 
        }   
         } 
          // dataToSendApi[selectedChannelB] = 1; 
            alert(dataToSendApi)
      }
      alert(this.state.channelName)
      console.log(this.state.channelName)
      if(this.state.channelName.length != 0){
        if(this.state.selectedChannelB == ""){
        alert("please Select Channel Name");
        return;
           }

}
    me.state.submitDataObj.payloadId   = selectedAtionType;
    me.state.submitDataObj.dataBody    = dataToSendApi;
    me.state.submitDataObj.isDaillyJob =  configkeyInputKeyValue["toggle"];
    me.state.submitDataObj.ChannelName = selectedChannelB;
    me.setState({submitDataObj :me.state.submitDataObj});
    me.callApiForAction();
}
    callApiForAction(){
    var me = this;
      axios.post("http://localhost:3992/ActiveDAction",me.state.submitDataObj)
      .then(json =>  {
        alert(json)
  
      });
    }
  
    handleClose() {
        this.setState({ show: false });
      }
      handleShowExecuted() {
     var me = this;
     this.state.filter.TypeOfJobs = "ExecutedJob"
     me.setState({filter :this.state.filter  , show: true });
     me.fetch();
      }
      handleShowPending(){
        var me = this;
        this.state.filter.TypeOfJobs = "PendingJob"
        me.setState({filter :this.state.filter  , show: true });
        this.fetch();
      }
      MdateFilter(value){
        this.state.filter.Fdate= value;

        this.setState({filter: this.state.filter});
        // alert(value);
      }
    handleChange(selectedAtionType){
      alert(selectedAtionType);
      var me = this;
      if(selectedAtionType == "SentCommand" || 
          selectedAtionType == "ActiveCommand" ||
          selectedAtionType == "ExecutedJobs"||
          selectedAtionType == "PendingJobs"){
        me.setState({formStructure: selectedAtionType ,selectedAtionType: selectedAtionType});
        if(selectedAtionType == "ExecutedJobs"){
          this.setState({formStructure: "ActiveAndPending"});
          this.handleShowExecuted()
        }
        if(selectedAtionType == "PendingJobs"){
          this.setState({formStructure: "ActiveAndPending"});
          this.handleShowPending()
        }
      }else{
      var index = this.state.actionTypes.findIndex(element => element.payloadId == selectedAtionType);
      var objectpayload = this.state.actionTypes[index];
      var formStructure = objectpayload.formStructure;
      this.setState({formStructure: formStructure})
      var arrayOfChannel= [];
      if(objectpayload.sensors.Channel !== 0 && objectpayload.sensors.Channel !== undefined && objectpayload.sensors.Channel !== null ){
        for (let [key, value] of Object.entries(objectpayload.sensors.Channel)) {  
          arrayOfChannel.push({"configName":key, "businessName": value}); 
        }

        var  keysofObj = Object.keys(objectpayload.sensors)
        if(keysofObj.length >= 2){
          keysofObj.splice(keysofObj.indexOf("Channel"), 1);
          console.log(objectpayload.sensors[keysofObj[0]]);
          var  allConfigName = Object.values(objectpayload.sensors[keysofObj[0]]);
          console.log(allConfigName);
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
               configkeyInput:allConfigName,configkeyInputKeyValue:configkeyInputKeyValue});
          }else if(formStructure == "2-input"){
            var configkeyInputKeyValue = {};
           alert("this else of 2-input");
           configkeyInputKeyValue["toggle"] = false;
              for (let [key, value] of Object.entries(objectpayload.sensors[keysofObj[0]])) {  
                configkeyInputKeyValue[value+"date"] =  ""; 
                configkeyInputKeyValue[value+"houre"] = "";
                configkeyInputKeyValue[value+"min"] = "";
                configkeyInputKeyValue[value+"date"+"error"] =  ""; 
                configkeyInputKeyValue[value+"houre"+"error"] = "";
                configkeyInputKeyValue[value+"min"+"error"] = "";
              }
            this.setState({ selectedAtionType: selectedAtionType,
               channelName: arrayOfChannel,
               configkeyInput:allConfigName,configkeyInputKeyValue:configkeyInputKeyValue});
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
          var  allConfigName = Object.values(objectpayload.sensors[keysofObj[0]]);
            for (let [key, value] of Object.entries(objectpayload.sensors[keysofObj[0]])) {  
              configkeyInputKeyValue[value] =  ""; 
              configkeyInputKeyValue[value+"error"] =  ""; 

            }
          this.setState({ selectedAtionType: selectedAtionType,
             channelName: [],
             configkeyInput:allConfigName,configkeyInputKeyValue:configkeyInputKeyValue});
        }
        alert("this else "+ selectedAtionType);
      }  
    }     
         console.log(arrayOfChannel);
    }
    handleChange1(value){
        alert(value);
        var index = this.state.channelName.findIndex(element => element.configName == value);
         var businessName = this.state.channelName[index].businessName ;      
       this.setState({ selectedChannelB: businessName,selectedChannelCn:value});
       this.callForActionType(value,this.state.deviceName);
            }
       callForActionType(value,deviceName){
       }
       rowClicked(data){
            alert(data);
            console.log(data);
            this.setState({rowclickedData: data});
       }
      
    toggle() {
        this.setState({
          open: !this.state.open
        });
            }
   componentDidMount(){
     var me = this;
     Date.prototype.addHours = function(h){
      this.setHours(this.getHours()+h);
      return this;
  }
  Date.prototype.addDay = function(h){
    this.setDate(this.getDate()+h);
    return this;
}
     var ActiveJobsArray = [];
    axios.post("http://localhost:3992/getActiveDashBoardDevice",{})

    .then(json =>  {
      console.log("this componentDidMount getActiveDashBoardDevice");
      console.log(json)
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
    socket.emit('clientEvent', {mac: "5ccf7f0015bc"});
    socket.on("FromAPI", data =>{
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
    console.log(data);
      
      });


var onDeviceinstruction = socketIOClient(endpoint+"/onDeviceinstruction");
onDeviceinstruction.emit('onDeviceinstructionClientEvent', { mac : "5ccf7f0015bc", type: "SentInstruction"});
onDeviceinstruction.on('DeviceInstruction',function(data) {
  // console.log("this is second")
    me.setState({sentCommandArray: data["DeviceInstruction"]});
      //  console.log(data)
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
    var body = {mac: "5ccf7f0015bc"}
    axios.post("http://localhost:3992/ActiveActionTypeCall",body)

    .then(json =>  {
      if(json.length !=0){
      console.log(json["data"]);
      var index  = json["data"].findIndex(item => item.formStructure ==  "manualOverride");
      var containerdata = json["data"][index];
      if(index != null && index != undefined){
        json["data"].splice(index,1);
      }

      console.log(containerdata);
      console.log("this is container data");
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
   ActionOnChanel(data,index){
          alert("this called");
          var me = this;
          const {channelArray,tilesPayloaddata} = this.state;
          console.log(tilesPayloaddata);
        console.log(data);
        me.state.submitDataObj.payloadId   = tilesPayloaddata.payloadId;
        me.state.submitDataObj.isDaillyJob = false;
        me.state.submitDataObj.ChannelName = data.devicebusinessNM;
        if( this.state.channelArray[index].ActionCond == this.state.channelArray[index].Value){
        if(channelArray[index].ActionCond == 0){
          swal({
            title: "Action Being Taken ?",
           text: `Channel Name: ${data.devicebusinessNM} Channel Action : ${ (channelArray[index].ActionCond == 1)?"ON":"OFF"} \n
            Age of Status: 40 min  last UpdatedTime: ${dateFormat(data.dateTime, "dd-mmm HH:MM")}`,
            // content: <p>Channel Name: {data.devicebusinessNM} <br/> Channel Action : { (channelArray[index].ActionCond == 1)?"ON":"OFF"}</p>,
            // icon: "warning",
            buttons: true,
            dangerMode: true,
          })
          .then((send) => {
            if (send) {
              swal("Action Is Taken", {
                icon: "success",
              });
              me.state.channelArray[index].ActionCond = 1; 
              me.state.submitDataObj.dataBody[data.devicebusinessNM]    = 1 ;
        me.setState({channelArray: me.state.channelArray}) 

              me.callApiForAction();
            } else {
              swal("Your imaginary file is safe!");
            }
          });
       
          
          }
          else{
          swal({
            title: "Action Being Taken ?",
            text: `Channel Name: ${data.devicebusinessNM} Channel Action : ${ (channelArray[index].ActionCond == 1)?"ON":"OFF"} \n
            Age of Status: 40 min  last UpdatedTime: ${dateFormat(data.dateTime, "dd-mmm HH:MM")}`,
            buttons: true,
            dangerMode: true,
          })
          .then((send) => {
            if (send) {
              swal("Poof! Your imaginary file has been deleted!", {
                icon: "success",
              });
              me.state.channelArray[index].ActionCond = 0; 
              me.state.submitDataObj.dataBody[data.devicebusinessNM]    = 0 ;
        me.setState({channelArray: me.state.channelArray}) 

              me.callApiForAction();
            } else {
              swal("Your imaginary file is safe!");
            }
          });
          }
        }
        else{
          alert("This Already Click");
        }
        
        console.log(index)
   }
fetchActiveJob(){
  var me = this;
  var ActiveBody = {
    mac: "5ccf7f0015bc",
    startDate : this.state.startDatelimit,
    endDate: this.state.endDatelimit,
  }
    axios.post("http://localhost:3992/ActiveJobs",ActiveBody)
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
      mac: "5ccf7f0015bc" ,
      filter: this.state.filter 
  };
    if(this.state.filter.TypeOfJobs == "ExecutedJob"){
     
        axios.post("http://localhost:3992/executedJob",body)
            .then(function (result) {
              var mainActiveJobdata  =   result.data;
              items   =   result.data.executedJob;
              me.setState({mAOfInactivejob:items,'total_count':mainActiveJobdata.count,'in_prog':false});
      }).catch(error =>{
        me.setState({mAOfInactivejob:[],'in_prog':false});
      });
    }else if(this.state.filter.TypeOfJobs == "PendingJob"){
      axios.post("http://localhost:3992/PendingJob",body)
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
    // alert(page);
    this.setState({"filter":this.state.filter});
    // this.fetch();
    }

   firstrender(maindata){
     
    //  if(maindata.length != 0){
      var sDate = new Date().toISOString();
      console.log("This is first Render");
      var endDate= new Date(sDate).addHours(4).toISOString();
      this.setState({startDate: sDate, endDate: endDate});
      console.log(maindata)
      console.log(sDate)
      console.log(endDate)
      this.filterdata(maindata,sDate,endDate);
    //  }
  
   }
   nevigation(value){
     var me = this;
     var sStartdate = this.state.startDate
     if(Math.sign(value )== 1){
      //  alert("this is sign for pluse");

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
        alert(startDate+"start date/"+"end Date"+ endDate )
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
          alert(startDate+"start date/"+"end Date"+ endDate )
          me.filterdata(me.state.mainActiveJobsArray,startDate,endDate);
        }
    }
   
   }
   filterdata(maindata,startDate,endDate){
    const {ActionVF} = this.state;
      var resultdata = maindata.filter(item => item.ActionTime >= startDate && item.ActionTime <= endDate );
      alert("console is print");
      console.log("this is result data ");
      console.log(resultdata);
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
     alert(e.target.value);
     console.log(e.target.value);
     this.setState({ActionVF: e.target.value});
   }
   selectedChF(e){
    alert(e.target.value);
    console.log(e.target.value);
    this.setState({channelFil: e.target.value});
  }
  FselectAction(value){
    alert(value);
    this.state.filter.Action = value;
    this.setState({filter: this.state.filter});
  }
  filterByChExe(value){
  // var me = this;
    alert(value);
    console.log(value);
    this.state.filter.Fchannel = value; 
    this.setState({filter: this.state.filter});
  }
  Mfiltrerbtn(){
    const {filter} = this.state;
    console.log(filter);
    this.fetch();
  }
  filtermethod(){
    const {channelFil, ActionVF,startDate,endDate} = this.state;
    var me = this;
    alert(channelFil+ " ://"+ ActionVF);

   var arrayofActive = this.state.mainActiveJobsArray.filter(item => item.Channel == channelFil );
   me.filterdata(arrayofActive,startDate,endDate);
  }
   handleChechBox(){
    this.state.configkeyInputKeyValue["toggle"]=   !this.state.configkeyInputKeyValue["toggle"]
    this.setState({configkeyInputKeyValue:this.state.configkeyInputKeyValue });
   }
    render() {
      
      const {selectedAtionType,formStructure,configkeyInputKeyValue,configkeyInput,sentCommandArray} = this.state;
      var state   =   this.state;
      var me          =   this;
      var total_page  =   Math.ceil(this.state.total_count/this.state.filter.page_size);
      const indexOfLastTodo = state.filter.page * state.filter.page_size;
      const indexOfFirstTodo = indexOfLastTodo - state.filter.page_size;
      const ExecutedJobs =  state.mAOfInactivejob.slice(indexOfFirstTodo, indexOfLastTodo)
    
      var page_start_index    =   ((state.filter.page-1)*state.filter.page_size);
      // alert(this.state.filter.Fchannel)
    var  inputField = null;
    var className12 = {}
  if(formStructure == "2-input"){
    configkeyInput.forEach(function(key) {
      className12[key+"date"+"Classerror"]   =   "";
      if(configkeyInputKeyValue[key+"date"+"error"].length != 0){
       className12[key+"date"+"Classerror"] = "Acustmborder";
      }
      className12[key+"houre"+"Classerror"]   =   "";
      if(configkeyInputKeyValue[key+"houre"+"error"].length != 0){
       className12[key+"houre"+"Classerror"] = "Acustmborder";
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
       <span className="dropDown"> 
        <label>Channel Setup :</label>
               <DropdownButton  className = "AcDropS"  onSelect={this.handleChange1}
               disabled = {this.state.channelName.length ==  0? true : null}
                bsStyle={"primary"}
                title={this.state.selectedChannelB || "Select Channel"}>
                {this.state.channelName.map( (item) =>
                <MenuItem eventKey={item.configName}>{item.businessName}</MenuItem>
                )}
                </DropdownButton>
       </span>
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
           <input type="number"   id= {item+"houre"} className={"houremin "+ className12[item+"houre"+"Classerror"]} name = {configkeyInputKeyValue[item+"houre"]} maxLength="2" value ={configkeyInputKeyValue[item+"houre"]}  
          onChange = {e => {configkeyInputKeyValue[item+"houre"] =e.target.value ;
            this.setState({ configkeyInputKeyValue : configkeyInputKeyValue })}}  placeholder="HH"/> 
            </span>

           <span className= "Acolon"> :</span>
            <span className= "inhour">
            <input type="number"  id= {item+"min"}  className={"houremin  "+ className12[item+"min"+"Classerror"]} name = {configkeyInputKeyValue[item+"min"]} maxLength="2" value ={configkeyInputKeyValue[item+"min"]}  
            onChange = {e => {configkeyInputKeyValue[item+"min"] =e.target.value ;
            this.setState({ configkeyInputKeyValue : configkeyInputKeyValue })}}  placeholder="MM"/>               
             </span> 
         {configkeyInputKeyValue[item+"dateerror"].length != 0 && <div className='text-danger Acfontsize'>{configkeyInputKeyValue[item+"dateerror"]}</div>}
         {configkeyInputKeyValue[item+"houreerror"].length != 0 && <div className='text-danger Acfontsize'>{configkeyInputKeyValue[item+"houreerror"]}</div>}
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
  if(formStructure == "1-input"){
    configkeyInput.forEach(function(key) {
      className12[key+"Classerror"]   =   "";
      if(configkeyInputKeyValue[key+"error"].length != 0){
       className12[key+"Classerror"] = "Acustmborder";
      }
     });
    inputField =  <form class="form-horizontal" >
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
   <span className="dropDown"> 
        <label>Channel Setup :</label>
               <DropdownButton  className = "AcDropS"  onSelect={this.handleChange1}
               disabled = {this.state.channelName.length ==  0? true : null}
                bsStyle={"primary"}
                title={this.state.selectedChannelB}>
                {this.state.channelName.map( (item) =>
                <MenuItem eventKey={item.configName}>{item.businessName}</MenuItem>
                )}
                </DropdownButton>
       </span>
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
              <tr onClick= {this.rowClicked.bind(this,item)}>
              <td className='Acustmtd '>{1+i}</td>
              <td className='Acustmtd '>{item.ActionType}</td>
              <td className='Acustmtd '>{item.Channel}</td>
              <td className='Acustmtd '>{dateFormat(item.createdTime, "dd-mmm HH:MM")}</td>
              <td className=" btn-group">
              <button  onClick={() =>{ 
                   alert(i)   
                }} 
                 className="btn color1  btn-sm" > View</button>
               <button  onClick={() =>{ 
                     alert(i+"Edit");
                }}   className="btn color2  btn-sm" > Edit</button>
               <button  onClick={ ()=> {alert(i+ "Delete")}} className="btn color3  btn-sm" > Delete</button>
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
    <p className ="ActiveP textArea">Sent Command</p>
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
            bsStyle={"primary"}
            title={this.state.filter.Fchannel}>
             {this.state.channelForfilter.map( (item) =>
            <MenuItem   eventKey={item}>{item}</MenuItem>
            )}
            </DropdownButton>
            <label  className="OpdLable">Action :</label>
               <DropdownButton  className = ""  onSelect={this.FselectAction}
                bsStyle={"primary"}
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
          <div className="SensorsOuter">
          { this.state.channelArray.map((item,i) =>  <div onClick= {this.ActionOnChanel.bind(this,item,i)} className="sensorsDive"> 
         <SensorsActive key ={item._id}
             bgclass= {  (item.OldValue != item.Value) ? " small-boxDActive ChannelBGColortransition":(item.ActionCond != item.Value)?"small-boxDActive  ChannelBGColorYellow ": "small-boxDActive" &&
             (item.Value == 1)? " small-boxDActive onbackground":"small-boxDActive "}
            label= {item.sortName} 
            takenClass= "ActivedateTime"
            P_name_class= "ActivePclass" 
            heading_class_name=" ActiveSheading"
            message={(item.Value == 1)? "ON":"OFF" }
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
 <div className= "col-lg-12">
 <Nav bsStyle="pills" activeKey={this.state.selectedAtionType} onSelect={this.handleChange}>
         { this.state.actionTypes.map(item =>  
          <NavItem eventKey={item.payloadId} >
           {item.payloadId}
          </NavItem>
         )}
         <NavItem eventKey="SentCommand" >
         SentCommand
          </NavItem>
          <NavItem eventKey="ActiveCommand" >
          ActiveCommand
          </NavItem>
          <NavItem eventKey="ExecutedJobs" >
          ExecutedJobs
          </NavItem>
          <NavItem eventKey="PendingJobs" >
          PendingJobs
          </NavItem>  

        </Nav> 
        
 </div>
      <div className="col-lg-12">
     
    
      <div className ="paddForm">
      {inputField}
      </div>
      {/* <div className="col-lg-6">
      <div className="col-xs-6">
          <div className= "col-xs-7">
          <label>Left Curtain 
          </label>
          </div>
          <div className="col-xs-5">
          <label className="switch ">
                <input type="checkbox" value="Text" onChange = {()=> alert("Hello")}/>
                <span className="slider round"></span>
              </label>
                </div>
         </div>
         <div className="col-xs-6">
          <div className= "col-xs-7">
          <label>Right Curtain 
          </label>
          </div>
          <div className="col-xs-5">
          <label className="switch ">
                <input type="checkbox" value="Text" onChange = {()=> alert("Hello")}/>
                <span className="slider round"></span>
              </label>
                </div>
         </div>
         <div className="col-xs-6">
          <div className= "col-xs-7">
          <label>Top Curtain 
          </label>
          </div>
          <div className="col-xs-5">
          <label className="switch ">
                <input type="checkbox" value="Text" onChange = {()=> alert("Hello")}/>
                <span className="slider round"></span>
              </label>
                </div>
         </div>
         <div className="col-xs-6">
          <div className= "col-xs-7">
          <label>Fan 
          </label>
          </div>
          <div className="col-xs-5">
          <label className="switch ">
                <input type="checkbox" value="Text" onChange = {()=> alert("Hello")}/>
                <span className="slider round"></span>
              </label>
                </div>
         </div>
         <div className="col-xs-6">
          <div className= "col-xs-7">
          <label>Pad 
          </label>
          </div>
          <div className="col-xs-5">
          <label className="switch ">
                <input type="checkbox" value="Text" onChange = {()=> alert("Hello")}/>
                <span className="slider round"></span>
              </label>
                </div>
         </div>
         <div className="col-xs-6">
          <div className= "col-xs-7">
          <label>CO2 Valve  
          </label>
          </div>
          <div className="col-xs-5">
          <label className="switch ">
                <input type="checkbox" value="Text" onChange = {()=> alert("Hello")}/>
                <span className="slider round"></span>
              </label>
                </div>
         </div>
         <div className="col-xs-6">
          <div className= "col-xs-7">
          <label>Fogger  
          </label>
          </div>
          <div className="col-xs-5">
          <label className="switch ">
                <input type="checkbox" value="Text" onChange = {()=> alert("Hello")}/>
                <span className="slider round"></span>
              </label>
                </div>
         </div>
         <div className="col-xs-6">
          <div className= "col-xs-7">
          <label>Irrg Pump
          </label>
          </div>
          <div className="col-xs-5">
          <label className="switch ">
                <input type="checkbox" value="Text" onChange = {()=> alert("Hello")}/>
                <span className="slider round"></span>
              </label>
                </div>
         </div>
         <div className="col-xs-6">
          <div className= "col-xs-7">
          <label>Irrg Valve1
          </label>
          </div>
          <div className="col-xs-5">
          <label className="switch ">
                <input type="checkbox" value="Text" onChange = {()=> alert("Hello")}/>
                <span className="slider round"></span>
              </label>
                </div>
         </div>
         <div className="col-xs-6">
          <div className= "col-xs-7">
          <label>Irrg Valve2  
          </label>
          </div>
          <div className="col-xs-5">
          <label className="switch ">
                <input type="checkbox" value="Text" onChange = {()=> alert("Hello")}/>
                <span className="slider round"></span>
              </label>
                </div>
         </div>
              
    </div> */}
    </div>

</div>


    <div className= "col-lg-2 ">
              <div className= "ActiveCorner">
                  <div className= "">
                  <label>SensorNode :</label>
                  <span>02-Feb 15:27</span>
                  </div>
                  <div className= "">
                  <label>WaterSensor :</label>
                  <span>02-Feb 15:27 </span>
                  </div>
                  <div className= "">
                  <label>TDS :</label>
                  <span>02-Feb 15:27 </span>
                  </div>
                {/* </div> */}
                {/* <div className= "col-lg-12"> */}
                <div className="col-lg-6">
                <label>Age </label>
                <p> 30 min</p>
                </div>
                <div className="col-lg-6">
                <label>Pending </label>
                <p> 5</p>
                </div>
                </div>
         </div>
 </div>
</div>
  
)}
}
export default activeDashbord;