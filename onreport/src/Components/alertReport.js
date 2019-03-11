import React, { Component } from 'react';
import SelectionInput from '../layout/SelectionInput';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import {Table,Modal,Button} from 'react-bootstrap';
import CPagination from "../layout/Pagination";
import * as FileSaver from "file-saver";
import * as ExcelJs from "exceljs/dist/exceljs.min.js";
import axios from "axios";
import swal from 'sweetalert';
import dateFormat  from  "dateformat";
class AlertReport extends Component {
    constructor(){
        super();
        this.state = { spCd : [],
            custCd: [],
            subCustCd: [],
            assetsNM:[],
            ArrayOfSPs: [],
            ArrayOfCusts: [],
            ArrayOfSubCusts:[],
            operations: [],
            tableDataToSend: [],
            secondTableData:[],
            result: [],
            selectedSPValue:'',
            selectedCustValue :'',
            selectedSubCustValue:'',
            AssetsValue: "",
            DeviceNameValue: "",
            selectedlevelValue: '',
            'in_prog':false,
            'total_count':0,
            'page_size': 10,
            'page': 1,
            flag: '',
            sRowData: '',
            custDisable: true,
            subCustDisable:  true,
            assetsDisable: true,
            TypeDisable : true,
            parameterDisable : true,
            disableFromDt: true,
            disableToDt : true,
            unabledatepiker:true,
            DynamicInput: '',
            show: false,
            startDate: moment(),
            endDate :  moment()
        }
        // this.handlelevel = this.handlelevel.bind(this);
          this.handleChange = this.handleChange.bind(this);
         this.handleChange2 = this.handleChange2.bind(this);
         this.clickRow = this.clickRow.bind(this);
         this.clickedOnflag = this.clickedOnflag.bind(this);
         this.changePage = this.changePage.bind(this); 
         this.handleShow = this.handleShow.bind(this);
         this.handleClose = this.handleClose.bind(this);
         this.clickSTBRow = this.clickSTBRow.bind(this);
    }
    handleClose() {
      this.setState({ show: false });
    }
    handleShow() {
      this.setState({ show: true });
    }
    changePage(page){
        this.setState({page:  page});
        
        this.fetchData(this.state.flag,this.state.DeviceNameValue,page);
        // this.fetchdata(this.state.page_size, page,this.state.selectedSensors,this.state.mac,this.state.selectedSubCustValue,this.state.selectedCustValue,this.state.selectedSPValue  );
        }
    onChange = e => this.setState({ [e.target.name]: e.target.value });
    clickSTBRow(id){
      var item = this.state.secondTableData.find(item => item._id == id);
      alert(item);
      this.setState({sRowData: item});
      this.handleShow();
    }
    clickRow(DeviceName){
      alert(DeviceName);
      var page = 1;
      this.setState({DeviceNameValue:DeviceName,flag : undefined,page:page});
      // fetch("http://localhost:3992/getAlertDevices?subCustCd=" + this.state.selectedSubCustValue +"&&DeviceName="+DeviceName+
      // "&&type=" + this.state.selectedlevelValue)
      //   .then(response => response.json())
      //   .then(json =>  {
      //     alert(json);
      //     this.setState({secondTableData: json})
      //     console.log(json)
      //   });
      this.fetchData(undefined,DeviceName,page);

  // console.log(DeviceName);
}
fetchData(flag,DeviceName,page){
  var filterData = {
    subCustCd: this.state.selectedSubCustValue,
    DeviceName: DeviceName,
    type:  this.state.selectedlevelValue,
    processed: flag,
    page: page,
    page_size: this.state.page_size,
  }
  axios.post("http://localhost:3992/getAlertFlag",{body:filterData})
  
  // .then(response => response.json())
    .then(json =>  {
      console.log(json)
      // alert(json);
      
      this.setState({secondTableData: json["data"].finalResult ,total_count: json["data"].data_count})
     
    });
}
clickedOnflag(flag,DeviceName){
  var  page = 1
  this.setState({DeviceNameValue: DeviceName,flag: flag,page: page});
  alert(flag+ DeviceName);
  this.fetchData(flag,DeviceName,page);
  // // fetch("http://localhost:3992/getAlertFlag?subCustCd=" + this.state.selectedSubCustValue +"&&DeviceName="+DeviceName+
  // // "&&type=" + this.state.selectedlevelValue+"&&processed=" + flag+"&&page=" + this.state.page+"&&page_size=" + this.state.page_size)
  // var filterData = {
  //   subCustCd: this.state.selectedSubCustValue,
  //   DeviceName: DeviceName,
  //   type:  this.state.selectedlevelValue,
  //   processed: flag,
  //   page: this.state.page,
  //   page_size: this.state.page_size,
  // }
  // axios.post("http://localhost:3992/getAlertFlag",{body:filterData})
  
  // // .then(response => response.json())
  //   .then(json =>  {
  //     console.log(json)
  //     alert(json);
      
  //     this.setState({secondTableData: json["data"].finalResult ,total_count: json["data"].data_count})
     
  //   });

}
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
    fetch('http://localhost:3992/getRegisterSP')
    .then(response => response.json())
    .then(json =>  {
    var spCd =  json.map( x =>  { return  x.spCd  });
    var spcd1 = json.map( x =>  { return  x.spCd  });
    this.setState({ArrayOfSPs : spCd});
    spcd1.push("ALL");
    this.setState({spCd : spcd1});
    if(spCd.length == 1){
     this.setState({selectedSPValue : spCd[0], custDisable : null});
     this.getCustomer(spCd[0]);
    }
   }
    );
    
}

// This is Submit Function
onSubmit = (e) => {
    e.preventDefault();
    alert("this is clicked");
    this.getAllDetails();
    }
    //THIS METHOD USE FOR FETCH ALL DATA FROM SERVER BASED ON SELECTED CRITERIA.
getAllDetails(){
  //THIS WAY OF GETTING DATA FROM STATE
  const {startDate,endDate,selectedSPValue,
    selectedCustValue,selectedSubCustValue,
    selectedAssetsValue,ArrayOfSPs,
    ArrayOfCusts,ArrayOfSubCusts,
     selectedlevelValue } =this.state;
     alert("this is clicked2");
     alert(startDate+":"+endDate+":"+selectedSPValue+ ":"
     +":"+selectedCustValue+":"+selectedSubCustValue+":"
      +":"+selectedAssetsValue+":"+ArrayOfSPs+":"
      +":"+ArrayOfCusts+":"+ArrayOfSubCusts+":"
      +":"+selectedlevelValue);
    var dateTime1 = new Date(startDate);
    var dateTime2 = new Date(endDate);
  var spToSend = [], custToSend = [], subCustToSend = [];
  spToSend.push(selectedSPValue);
  custToSend.push(selectedCustValue);
  subCustToSend.push(selectedSubCustValue);
var body = {};
  if (selectedSPValue == "ALL" && selectedCustValue == "ALL" && selectedSubCustValue == "ALL") {
    body= {ArrayOfSPs,ArrayOfCusts,ArrayOfSubCusts,selectedAssetsValue,dateTime1,
      dateTime2, selectedlevelValue}
      this.getAllDataApi(body)
  }
  else if (selectedSPValue == "ALL" && selectedSubCustValue == "ALL") {
    body = {ArrayOfSPs,custToSend,ArrayOfSubCusts,selectedAssetsValue,dateTime1,
      dateTime2, selectedlevelValue}
      this.getAllDataApi(body)
  }
  else if (selectedSPValue == "ALL" && selectedCustValue == "ALL") {
    body = {ArrayOfSPs,ArrayOfCusts,subCustToSend,selectedAssetsValue,dateTime1,
      dateTime2, selectedlevelValue}
      this.getAllDataApi(body)
}
  else if (selectedSubCustValue == "ALL" && selectedCustValue == "ALL") {
body = {spToSend,ArrayOfCusts,ArrayOfSubCusts,selectedAssetsValue,dateTime1,
  dateTime2, selectedlevelValue}
      this.getAllDataApi(body)
}
  
  else if (selectedCustValue == "ALL") {
    body = {spToSend,ArrayOfCusts,subCustToSend,selectedAssetsValue,dateTime1,
      dateTime2, selectedlevelValue}
      this.getAllDataApi(body)
  }
  else if (selectedSPValue == "ALL") {
    body = {ArrayOfSPs,custToSend,subCustToSend,selectedAssetsValue,dateTime1,
      dateTime2, selectedlevelValue}
        this.getAllDataApi(body)
  }
  else if (selectedSubCustValue == "ALL") {
    body = {spToSend,custToSend,ArrayOfSubCusts,selectedAssetsValue,dateTime1,
      dateTime2, selectedlevelValue}
          this.getAllDataApi(body)
  }
  else {
    body = {spToSend,custToSend,subCustToSend,selectedAssetsValue,dateTime1,
      dateTime2, selectedlevelValue}
      this.getAllDataApi(body)
  }
}
//THIS IS API METHOD FOR FETCH ALL DATA FROM SERVER BASED ON SELECTED CRITERIA.
getAllDataApi(body){
    axios.post("http://localhost:3992/getAlert", body)
    // .then(response => response.json())
    .then(json =>  {
      alert(json)
      if(json["data"].length !=0){
        swal("Success!", "", "success");
    
        // console.log("this json data");
         console.log(json["data"]);
          alert(json["data"])
         var MainData =[];
        for (var i = 0; i <= json["data"].length - 1; i++) {
          // var DeviceName = ;
          // var totalDevice = ;
          var processedData = json["data"][i].processedData;
          // var  processed_Y;
          // var  processed_N;
          // var  processed_E;
          // var  processed_I;
          // var  processed_F;
          MainData.push({
            "DeviceName": json["data"][i]._id,
            "totalDevice":json["data"][i].totalCount,
            "processed_Y":0, 
            "processed_E":0,  
            "processed_N":0,  
            "processed_I":0,  
            "processed_F":0,   
     
        })
        console.log( "This lenght"+processedData.length);
          for(var j =0; j<= processedData.length -1; j++){
          console.log(j);
        
            // var keys = JSON.keys(processedData)
               if(processedData[j].processed == 'Y'){
                MainData[i].processed_Y = processedData[j].count;  
               }

               if(processedData[j].processed == 'E'){
                MainData[i].processed_E = processedData[j].count;  
               }

               if(processedData[j].processed == 'N'){
                MainData[i].processed_N =processedData[j].count;  
               }

               if(processedData[j].processed == 'I'){
                MainData[i].processed_I =processedData[j].count;  
               }

               if(processedData[j].processed == 'F'){
                MainData[i].processed_F = processedData[j].count;  
               }
               
          }
      }
        alert(MainData);
        console.log(MainData);
        //HERE WE UPDATTING STATE FOR TABLE DATA FOR tableDataToSend AND RESUALT FOR CHART AND EXCEL
         this.setState({tableDataToSend : MainData ,result :MainData})
      // console.log(json);
      // alert(json)
        }else{
          swal("Sorry!", "No Data Available For This Range!", "error");
          this.setState({tableDataToSend : [] ,result : []});
        }
    });
}
    //This For handler for Service Provider
    handleSp = (e) => {
    this.setState({ selectedSPValue : e.target.value })
    this.getCustomer(e.target.value)
    this.setState({ custDisable : null})
    }
    //This IS FOR HANDLE CUSTOMER 
    handleCutMr =(e) =>{
      const {selectedSPValue} = this.state;
      // alert(e.target.value + "customer")
      this.setState({ selectedCustValue : e.target.value })
      this.getSubCustmer(selectedSPValue, e.target.value  );
      this.setState({  subCustDisable : null})
     }
     //THIS IS FOR HANDLE SUBCUSTOMER
     handleSubCs =(e) =>{
      const {selectedSPValue,selectedCustValue} = this.state;
      // alert(e.target.value + "SubCustomer")
      this.setState({ selectedSubCustValue : e.target.value })
      this.getAssets(e.target.value )
      this.setState({ assetsDisable : null})
     }
   //THIS IS FOR HANDLE  SENSOR  
     handleAssets =(e) =>{
      const {selectedSPValue,selectedCustValue,selectedSubCustValue} = this.state;
      // alert(e.target.value)
      this.setState({  selectedAssetsValue: e.target.value })
     // this.selectOpertion(selectedSPValue,selectedCustValue,selectedSubCustValue,e.target.value)
      alert(this.state.selectedAssetsValue);
      
      this.setState({ TypeDisable : null})
     }
     handlelevel = (e) => {
      this.setState({ selectedlevelValue : e.target.value , unabledatepiker : null});
      alert(e.target.value);

     }
  //THIS METHOD FOR GET CUSTOMER CODE
      getCustomerApi(SendForSp){
        fetch("http://localhost:3992/getCustomers?spCode=" + SendForSp)
        .then(response => response.json())
        .then(json =>  {
        var custCd =  json.map( x =>  { return  x._id  });
        var custCd1 =  json.map( x =>  { return  x._id  });
        this.setState({ArrayOfCusts: custCd});
        custCd1.push("ALL");
         this.setState({custCd :custCd1});
         if(custCd.length == 1){
          this.setState({selectedCustValue : custCd[0], subCustDisable : null});
          this.getSubCustomerApi(custCd[0]);
         }
       });
      }
    // THIS METHOD FOR SELECT CUSTOMER CODE BASED ON SERVICE PROVIDER
    getCustomer(selectedSPValue){
      if (selectedSPValue == "ALL" ) {
        this.getCustomerApi(this.state.ArrayOfSPs)
      }
      else {
        this.getCustomerApi(selectedSPValue)
       }
    }
    //THIS IS  API FOR GET SUBCUSTOMER BASED ON SERVICE PROVIDER AND CUSTOMER CODE
    getSubCustomerApi(SendForSp,SendFroCustCD){
        fetch("http://localhost:3992/getSubCustomers?spCode=" + SendForSp +
        "&&custCd=" + SendFroCustCD )
        .then(response => response.json())
        .then(json =>  {
        var subCustCd =  json.map( x =>  { return  x._id  });
        var subCustCd1 =  json.map( x =>  { return  x._id  });
        this.setState({ArrayOfSubCusts: subCustCd });
        subCustCd1.push("ALL");
        this.setState({subCustCd :subCustCd1});
        if(subCustCd.length == 1){
          this.setState({selectedSubCustValue : subCustCd[0], assetsDisable: null});
          this.getAssetsApi(subCustCd[0]);
         }
        });
    }
    //THIS IS FOR SELECTION OF SUB-CUSTOMER BASED ON SERVICE PROVIDER AND CUSTOMER CODE
    getSubCustmer(selectedSPValue, selectedCustValue){
      alert(selectedSPValue + selectedCustValue )
      if (selectedSPValue == "ALL" &&  selectedCustValue == "ALL") {
       this.getSubCustomerApi(this.state.ArrayOfSPs,this.state.ArrayOfCusts)
      
      }
      else if (selectedCustValue == "ALL") {
         this.getSubCustomerApi(selectedSPValue,this.state.ArrayOfCusts)
        // alert("sp"+selectedSPValue + "csAll"+ selectedCustValue );
      }
      else if (selectedSPValue == "ALL") {
        
          this.getSubCustomerApi(this.state.ArrayOfSPs,selectedCustValue)
        // alert("spAll"+selectedSPValue + "cs"+ selectedCustValue );
      }
      else {
        this.getSubCustomerApi(selectedSPValue,selectedCustValue)
      }
  }
  //THIS API FOR GET SENSOR  BASED ON SERVICE PROVIDER , CUSTOMER CODE, SUBCUSTOMER CODE
  getAssetsApi(SendForSbCd){
    fetch("http://localhost:3992/getAssetsBySpCstSubCst?subCustCd=" + SendForSbCd)
         .then(response => response.json())
         .then(json =>  {
         var assetsNM =  json.map( x =>  { return  x  });
         this.setState({assetsNM : assetsNM});
         if(assetsNM.length == 1){
          this.setState({ selectedAssetsValue: assetsNM[0], TypeDisable: null});
         // this.getAssetsApi(subCustCd[0]);
         alert("this is Assets");
         }
       });
  }
  
  //THIS IS SELECTION OF SENSORE BASED ON SERVICE PROVIDER , CUSTOMER CODE, SUBCUSTOMER CODE
    getAssets(selectedSubCustValue){
      if (selectedSubCustValue == "ALL") {
        alert("this is called 1");
       this.getAssetsApi(this.state.ArrayOfSubCusts)
        //  alert("AllSp"+ selectedSPValue +"AllCstCd"+selectedCustValue +"AllSubCst" +selectedSubCustValue )
      }
      else {
        alert("this is called");
          this.getAssetsApi(this.state.selectedSubCustValue)
        // alert("AllSp"+ selectedSPValue +"CstCd"+selectedCustValue +"AllSubCst" +selectedSubCustValue )
      }
      
    }
    render() {
        const {spCd,custCd,subCustCd,assetsNM,in_prog} = this.state;
        var state   =   this.state;
    var total_page  =   Math.ceil(this.state.total_count/this.state.page_size);
    var page_start_index    =   ((state.page-1)*state.page_size);

    var table = null;
    if(this.state.secondTableData !=0){

      table =""
    }
    else{
        table = null;
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
                 <SelectionInput 
                      label={this.state.selectedSPValue}
                      namefor="SERVICE PROVIDER :"
                      names = {spCd}
                      defaultDisabled = {null}
                      Change = {this.handleSp}
                      
                     />
                 </div>
                 <div className="col-sm-3">
                 <SelectionInput 
                          label={this.state.selectedCustValue}
                          namefor="CUSTOMER :"
                          names = {custCd}
                          defaultDisabled = {this.state.custDisable}
                          Change = {this.handleCutMr}
                          />
                 </div>
                 <div className="col-sm-3">
                 <SelectionInput 
                          label={this.state.selectedSubCustValue}
                          namefor="SUBCUSTOMER :"
                          names = {subCustCd}
                          defaultDisabled = {this.state.subCustDisable}
                          Change = {this.handleSubCs}
                          />
                 </div>
                 <div className="col-sm-3">
                 
                 <SelectionInput 
                      label={this.state.selectedAssetsValue}
                      namefor="SELECT THE Assets :"
                      names = {assetsNM}
                      defaultDisabled = {this.state.assetsDisable}
                      Change = {this.handleAssets}
                      />
                 </div>
                 <div className="col-sm-3">
                 <SelectionInput 
                      label={this.state.selectedlevelValue}
                      namefor="SELECT THE Type :"
                      names = {["level3","level4"]}
                      defaultDisabled = {this.state.TypeDisable}
                      Change = {this.handlelevel}
                      />
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
                         {/* disabled={true} */}
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
                          // disabled={Disabledsubmit}
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
       <div  className="table-responsive">
        <Table  className="table table-hover table-sm table-bordered cust">
        <thead className='bg' style={{background: "gainsboro"}}>
        <tr>
        <th className='text-center '> SI</th>
        <th className='text-center '>Device Name</th>
        <th className='text-center '>Flag I Values</th>
        <th className='text-center '>Flag E Values</th>
        <th className='text-center '>Flag F Values</th>
        <th className='text-center '>Flag N Values</th>
        <th className='text-center '>Flag Y Values</th>
        <th className='text-center '>Total Values</th>
      </tr>
        </thead>
        <tbody>
        {/* { state.in_prog && <tr><td colSpan={8} className='text-center'><i className='fa fa-refresh fa-spin'></i> Loading..</td></tr>}
        { !state.in_prog && state.DataArray.length == 0 && <tr><td colSpan={8} className='text-center'> No Data </td></tr>} */}
        {/* {  !state.in_prog &&  */}
       {  this.state.tableDataToSend.map( (user,i) => {
              return <tr>
              <td className='text-center'>{
                //  page_start_index
                i + 1}</td>
              
              <td className='text-center customCFlink'  onClick={ () =>{
              this.clickRow(user.DeviceName)}} >{user.DeviceName}</td>
              <td className='text-center customCFlink' onClick={() => {this.clickedOnflag("I",user.DeviceName)}}>{user.processed_I}</td>
              <td className='text-center customCFlink'onClick={() => {this.clickedOnflag("E",user.DeviceName)}}>{user.processed_E}</td>
              <td className='text-center customCFlink'onClick={() => {this.clickedOnflag("F",user.DeviceName)}}>{user.processed_F}</td>
              <td className='text-center customCFlink' onClick={ () => {this.clickedOnflag("N",user.DeviceName)}}>{user.processed_N}</td>
              <td className='text-center customCFlink'onClick={() => {this.clickedOnflag("Y",user.DeviceName)}}>{user.processed_Y}</td>
              <td className='text-center customCFlink'onClick={ () =>{
              this.clickRow(user.DeviceName)}}>{user.totalDevice}</td>

              </tr>
     
            })
              } 
         </tbody> 
          {/* { "Pages: " +total_page } */}
           </Table>
          </div> 
      </div>



       <div className="secondtableM">
       <div>
       {"Entity:"+ " "+this.state.selectedAssetsValue +"/"+ this.state.DeviceNameValue}
       </div>
       <div  className="table-responsive">
        <Table  className="table table-hover table-sm table-bordered cust">
        <thead className='bg' style={{background: "gainsboro"}}>
        <tr>
        <th className='text-center '> SI</th>
        <th className='text-center '>Created Time</th>
        <th className='text-center '>Updated Time</th>
        <th className='text-center '>Flag</th>        
        <th className='text-center '>Source Massage</th>
        <th className='text-center '>Translated Massage</th>
        <th className='text-center '>No. Attempt</th>
        <th className='text-center '>Last Error String</th>
        <th className='text-center '>Last Error Time</th>
      </tr>
        </thead>
        <tbody>
        { state.in_prog && <tr><td colSpan={8} className='text-center'><i className='fa fa-refresh fa-spin'></i> Loading..</td></tr>}
        { !state.in_prog && state.secondTableData.length == 0 && <tr><td colSpan={8} className='text-center'> No Data </td></tr>}
        {  !state.in_prog && state.secondTableData.map( (user,i) => {
              return <tr   onClick={ () =>{
                this.clickSTBRow(user._id)}}>
              <td className='text-center scondtdmrt'>{ page_start_index + i + 1}</td>
              <td className='text-center scondtdmrt'>{dateFormat(user.createdTime, "dd-mmm-yy HH:MM:ss")}</td>
              <td className='text-center scondtdmrt'>{  dateFormat(user.updatedTime, "dd-mmm-yy HH:MM:ss")}</td>
              <td className='text-center scondtdmrt' >{user.processed}</td>
              <td className=''><textarea type="text" className ='textareacust' value= {JSON.stringify(user.sourceMsg) }/></td>
              <td className=''><textarea type="text" className ='textareacust' value= { JSON.stringify(user.translatedMsg) }/></td>
              <td className='text-center scondtdmrt'>{user.numberOfAttempt}</td>
              <td className='text-center scondtdmrt' >{user.lasterrorString}</td>
              <td className='text-center scondtdmrt' >{user.lasterrorTime}</td>
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
        {/* <Button bsStyle="primary" bsSize="large" onClick={this.handleShow}>
          Launch demo modal
        </Button> */}
        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{ "id :"+JSON.stringify(this.state.sRowData._id)}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <pre>
            {JSON.stringify(this.state.sRowData,undefined, 2)}
            </pre>


          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>
     

      </div>
      </div>
      );
 
    } 
}
export default AlertReport;