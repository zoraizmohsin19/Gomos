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
    endpoint: "http://52.212.188.65:4001",
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
    lastAlertData: {
      alertText: "",
      businessNm: "",
      businessNmValues: "",
      createdTime: "",
      criteria: "",
      sensorNm: "",
      shortName: ""
    }
  }
  }
  this.changePage     =   this.changePage.bind(this);
  this.changePagesize = this.changePagesize.bind(this);
}
changePage(page){
    this.state.body.page = page
    this.setState({body:  this.state.body});
    this.fetchdata();
    }
   
    changePagesize(e){
      var me = this
      var page = 1;
      me.state.body.page_size = e.target.value;
      me.state.body.page = page;
      me.setState({body: me.state.body});
      this.fetchdata();
    }
handler(selectedSensorsType1,selectedSensorsName){
  var me = this;
   me.state.body.page = 1;
   me.state.body.selectedSensorsType1 =selectedSensorsType1;
   me.state.body.selectedSensorsName =selectedSensorsName;
   this.setState({body : me.state.body}); 
   this.fetchdata();
}
componentDidMount(){
  var me = this;
  var mainData = JSON.parse(sessionStorage.getItem("configData"));
   me.state.body.selectedSPValue       =     mainData.spCd;
   me.state.body.selectedCustValue     =     mainData.custCd;
   me.state.body.selectedSubCustValue  =     mainData.subCustCd;
   me.state.body.mac                   =     mainData.mac;
   me.state.body.selectedDeviceName    =     mainData.DeviceName;
   me.state.body.selectedAssets        =     mainData.assetId;
   me.setState({body: me.state.body});

  this.startFunction()
  }
  startFunction(){
    var me   = this;
      me.callToSocket();
      var dashboardData = JSON.parse(sessionStorage.getItem("dashboardConfigobj"));
      me.state.body.Assets                =   dashboardData.Assets;
      me.state.body.Devices               =   dashboardData.Devices;
      me.state.body.selectedSensorsType1  =   dashboardData.ActivesesnorsType;
      me.state.body.selectedSensorsName   =   dashboardData.ActiveSensorsName;
      me.state.body.page_size             =    10;
      me.state.body.page                  =    1;
      me.setState({body: me.state.body});
      me.callForlastAlert(me.state.body.selectedCustValue,me.state.body.selectedSubCustValue, me.state.body.mac);     
      me.firstTimeRender();
      me.fetchdata();
  }
DisplayChart(result, valueSensoor ){
//  console.log(result)
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
    //console.log(dataToSend1)
    //console.log(dataToSend2)
    //console.log(valueSensoor)
    arrData = dataToSend1;
    arrLabels= dataToSend2;
    var yaxisName = valueSensoor;
    var fromDate = new Date();
    var  toDate =  new Date();
    var borderColors =[];
    for (var i = 0; i <  arrData.length; i++) {
        borderColors.push(this.getRandomBorColor());
        me.state.body.arrData = arrData;
        me.state.body.arrLabels = arrLabels;
        me.state.body.yaxisName = yaxisName;
        me.state.body.fromDate = fromDate;
        me.state.body.borderColors = borderColors;
        this.setState({ body: me.state.body});
  }
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
    me.state.body.in_prog      =   true;
    me.state.body.Spinnerdata  = false; 
    me.setState({body: me.state.body});
    var FdataArray =[];
    var dataArray =[];
    axios.post("http://52.212.188.65:3992/getdashboard",body)
    .then(json =>  {
      me.state.body.Spinnerdata = true;
      me.setState({ body: me.state.body})
      let json1 =[];
      // console.log("this is data");
      // console.log(json["data"]);
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
      
      var lastUpdatedTime = dateFormat(json["data"]["lastCreatedTime"] , "dd-mmm-yy HH:MM:ss")
   //   console.log(dataArray);
      me.state.body.DataArray         =  dataArray;
      me.state.body.in_prog           =  false;
      me.state.body.total_count       =  json["data"]["data_count"];
      me.state.body.lastupdatedData   =  json["data"]["lastdataObj"];
      me.state.body.lastUpdatedTime   =  lastUpdatedTime;
      me.setState({ body: me.state.body})
      me.DisplayChart(FdataArray, me.state.body.selectedSensorsName);
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

callToSocket(){
  
  const { endpoint, socket1} = this.state.body;
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
  if(Object.entries(socket1).length !== 0 && socket1.constructor !== Object){
    socket1.emit("end");
    // console.log(socket1);
  }
 
  const socket = socketIOClient(endpoint+"/onViewDashboard");
  // console.log("This is log of socket");
  // console.log(socket)
  me.state.body.socket1   =   socket;
  me.setState({body: me.state.body});
  var dashboardData = JSON.parse(sessionStorage.getItem("dashboardConfigobj"));
  var arrayOfsensors= dashboardData.Sensors;
  var arrayofbgClass = dashboardData.SensorsBgC;
  socket.emit('lastUpdatedValue',body);  
  socket.on("onViewDashboard", data =>{
    //console.log("This is socket ");
    //console.log(data.sensors);
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
  const {endpoint } = this.state.body;
 var body = {custCd,subCustCd,mac}
  // axios.post("http://52.212.188.65:3992/getdashbordlastalert", body)
  // .then(json =>  {
    var lastError = socketIOClient(endpoint+"/ActivelastError");
    lastError.emit('lastErrorClientEmit',body );
    lastError.on('lastErrorServerEmit',function(data) {
      // console.log(data);
      // alert()
      if( data.createdTime !=  me.state.body.lastAlertData.createdTime ){
      me.state.body.lastAlertData.alertText = data.alertText;
      me.state.body.lastAlertData.businessNm = data.businessNm;
      me.state.body.lastAlertData.businessNmValues  = data.businessNmValues;
      me.state.body.lastAlertData.createdTime  = data.createdTime;
      me.state.body.lastAlertData.criteria   =  data.criteria;
      me.state.body.lastAlertData.sensorNm   = data.sensorNm;
      me.state.body.lastAlertData.shortName  = data.shortName;
   
    // me.state.body.lastAlertdata   =    json["data"];     
       me.setState({body: me.state.body});
  }
  })
}
firstTimeRender(){
  var me = this
    var data = [];
    var dashboardData = JSON.parse(sessionStorage.getItem("dashboardConfigobj"));
    var arrayofbgClass = dashboardData.SensorsBgC;
    var arrayOfsensors= dashboardData.Sensors;
    var obj = [];
    for(var i =0; i< arrayOfsensors.length; i++){
        var temobj ={};
        temobj["sesnorsType"]= "sensorType"+i;
        temobj["sensorsName"]= "sensor"+i;
        temobj["sensorsValues"]= 0.0;
        obj.push(temobj);
    }
    for (var i = 0; i <obj.length; i++ ){ 
       data.push({ "sensorsNM": obj[i].sesnorsType, "bgClass": arrayofbgClass[i],
        nameofbsnm : obj[i].sensorsName, valuseS:obj[i].sensorsValues ,  lastUpdatedTime: "00:00:00:00:00"});
      }
      me.state.body.Sensors   =    data;     
      me.setState({body: me.state.body});
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
    const {arrData, arrLabels, yaxisName,lastAlertData, fromDate ,toDate ,bgColors,selectedSensorsType1, borderColors,DataArray,in_prog,
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
          </div>
          </div>
          <div className="row"> 
            <div className="col-lg-12 ">  
            <p className= "line2"></p>
       <div className="col-lg-12  ViewBredCum">
      
       <div className="col-sm-8">
    <div className="spanBredDiv">
       <span  className="spanBredcum">{(selectedCustValue != "")?selectedCustValue: ""} </span><span className="spanBredcumslash">/</span>
       <span  className="spanBredcum"> {(selectedSubCustValue != "")?selectedSubCustValue: "" }</span> <span className="spanBredcumslash">/</span> 
       <span  className="spanBredcum">{(selectedAssets != "")?selectedAssets: ""} </span> <span className="spanBredcumslash">/</span> 
       <span  className="spanBredcum">{(selectedDeviceName != "")? selectedDeviceName: ""}</span>
  </div>
  </div>
  <div className="col-sm-4">
     <div className="navright">
     <button type="button"  className="spanNev btn"  onClick={() =>{ 
                         this.props.history.push("/NevMenu")}}>Device Menu</button>
     <button  type="button" className="spanNev btn"  onClick={() =>{ 
                         this.props.history.push("/activeDashbord")}}>Operating Dashboard</button>
     </div>
     </div>
      {/* </div> */}
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

            <div className="col-lg-3 col-sm-4 col-xs-12">
             <div className="small-box bg-red" title= {lastAlertData.alertText} >
             <div className="inner"><p className= "color12 dashlastAlert ">{(lastAlertData.shortName)?lastAlertData.shortName:"No Alerts Triggered"}</p>
            <p className= "criteriaClass ">{(lastAlertData.criteria)?lastAlertData.criteria:"  "} &nbsp;</p>
            <p className="takenclass">Last Taken At:  { (lastAlertData.createdTime)?dateFormat(lastAlertData.createdTime, "dd-mmm HH:MM"):""}</p>
           
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
