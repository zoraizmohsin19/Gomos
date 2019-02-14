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
            ArrayOfSubCusts:[],
            operations: [],
            tableDataToSend: [],
            result: [],
            selectedSPValue:'',
            selectedCustValue :'',
            selectedSubCustValue:'',
            selectedSensorValue: '',
            operationSelected: '',
            endRange: '',
            startRange: '',
            equalsValue: '',
            custDisable: true,
            subCustDisable:  true,
            sensorDisable : true,
            parameterDisable : true,
            disableFromDt: true,
            disableToDt : true,
            unabledatepiker:true,
            DynamicInput: '',
            startDate: moment(),
            endDate :  moment()
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
    fetch('http://13.127.10.197:3992/getRegisterSP')
    .then(response => response.json())
    .then(json =>  {
    var spCd =  json.map( x =>  { return  x.spCd  });
    this.setState({ArrayOfSPs : spCd});
    spCd.push("ALL");
    this.setState({spCd : spCd});
   }
    );
    
}
// This is Submit Function
onSubmit = (e) => {
  e.preventDefault();
  this.getAllDetails();
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
    this.getSensor(selectedSPValue,selectedCustValue, e.target.value )
    this.setState({ sensorDisable : null})
   }
 //THIS IS FOR HANDLE  SENSOR  
   handleSensorNm =(e) =>{
    const {selectedSPValue,selectedCustValue,selectedSubCustValue} = this.state;
    // alert(e.target.value)
    this.setState({ selectedSensorValue : e.target.value })
    this.selectOpertion(selectedSPValue,selectedCustValue,selectedSubCustValue,e.target.value)
    console.log(this.state.selectedSPValue , "hello sensorNm");
    
    this.setState({ parameterDisable : null})
   }
   //THIS HANDER OF OPERATION SELECTION
   handleOperation =(e) => {
     var me = this;
     me.setState({ dynInput : e.target.value, operationSelected :  e.target.value,
      unabledatepiker : null })
    }
//THIS METHOD FOR GET CUSTOMER CODE
    getCustomerApi(SendForSp){
      fetch("http://13.127.10.197:3992/getCustomers?spCode=" + SendForSp)
      .then(response => response.json())
      .then(json =>  {
      var custCd =  json.map( x =>  { return  x._id  });
      this.setState({ArrayOfCusts: custCd });
      custCd.push("ALL");
      console.log(custCd);
       this.setState({custCd : custCd});
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
      fetch("http://13.127.10.197:3992/getSubCustomers?spCode=" + SendForSp +
      "&&custCd=" + SendFroCustCD )
      .then(response => response.json())
      .then(json =>  {
      var subCustCd =  json.map( x =>  { return  x._id  });
      this.setState({ArrayOfSubCusts: subCustCd });
      subCustCd.push("ALL");
      console.log(subCustCd);
      this.setState({subCustCd : subCustCd});
      console.log(json );
      
});
  }
  //THIS IS FOR SELECTION OF SUB-CUSTOMER BASED ON SERVICE PROVIDER AND CUSTOMER CODE
  getSubCustmer(selectedSPValue, selectedCustValue){
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
getSensorApi(SendForSp,SendFroCustCD,SendForSbCd){
  fetch("http://13.127.10.197:3992/getSensorNames?spCode=" +SendForSp +
         "&&custCd=" + SendFroCustCD + "&&subCustCd=" + SendForSbCd)
       .then(response => response.json())
       .then(json =>  {
       var sensorNm =  json.map( x =>  { return  x  });
       this.setState({sensorNm : sensorNm});
       console.log(json );
     });
}

//THIS IS SELECTION OF SENSORE BASED ON SERVICE PROVIDER , CUSTOMER CODE, SUBCUSTOMER CODE
  getSensor( selectedSPValue,selectedCustValue, selectedSubCustValue){
    if (selectedSPValue == "ALL" && selectedCustValue == "ALL" && selectedSubCustValue == "ALL") {
     this.getSensorApi(this.state.ArrayOfSPs,this.state.ArrayOfCusts,this.state.ArrayOfSubCusts)
      //  alert("AllSp"+ selectedSPValue +"AllCstCd"+selectedCustValue +"AllSubCst" +selectedSubCustValue )
    }
    else if (selectedSPValue == "ALL" && selectedSubCustValue == "ALL") {
        this.getSensorApi(this.state.ArrayOfSPs,selectedCustValue,this.state.ArrayOfSubCusts)
      // alert("AllSp"+ selectedSPValue +"CstCd"+selectedCustValue +"AllSubCst" +selectedSubCustValue )
    }
    else if (selectedSPValue == "ALL" && selectedCustValue == "ALL") {
        this.getSensorApi(this.state.ArrayOfSPs, this.state.ArrayOfCusts,selectedSubCustValue)
      // alert("AllSp"+ selectedSPValue +"AllCstCd"+selectedCustValue +"SubCst" +selectedSubCustValue )
    }
    else if (selectedSubCustValue === "ALL" && selectedCustValue === "ALL") {
        this.getSensorApi(selectedSPValue, this.state.ArrayOfCusts,this.state.ArrayOfSubCusts)
      // alert("Sp"+ selectedSPValue +"AllCstCd"+selectedCustValue +"SubCst" +selectedSubCustValue )
    }
    else if (selectedCustValue == "ALL") {
        this.getSensorApi(selectedSPValue, this.state.ArrayOfCusts,selectedSubCustValue)
      // alert("Sp"+ selectedSPValue +"AllCstCd"+selectedCustValue +"SubCst" +selectedSubCustValue )
    }
    else if (selectedSPValue == "ALL") {
        this.getSensorApi(this.state.ArrayOfSPs, selectedCustValue,selectedSubCustValue)
      // alert("AllSp"+ selectedSPValue +"CstCd"+selectedCustValue +"SubCst" +selectedSubCustValue )
    }
    else if (selectedSubCustValue == "ALL") {
            this.getSensorApi(selectedSPValue, selectedCustValue,this.state.ArrayOfSubCusts)
      // alert("Sp"+ selectedSPValue +"CstCd"+selectedCustValue +"AllSubCst" +selectedSubCustValue )
    }
    else {
     
        this.getSensorApi(selectedSPValue, selectedCustValue,selectedSubCustValue)
        // alert("Sp"+ selectedSPValue +"CstCd"+selectedCustValue +"SubCst" +selectedSubCustValue )
    }
  }
  //THIS IS API FOR OPERTION SELECTION BASED ON SERVICE PROVIDER , CUSTOMER CODE, SUBCUSTOMER AND SELECTED SENSORE CODE
  opertionApi(SendForSp,SendFroCustCD,SendForSbCd,SendForSensor){
    fetch("http://13.127.10.197:3992/getOperations?spCode=" + SendForSp + "&&custCd=" +
    SendFroCustCD + "&&subCustCd=" + SendForSbCd + "&&sensorNm=" + SendForSensor)
     .then(response => response.json())
     .then(json =>  {
       var operations=[];
       if(json[0] !== null && json[0]!== undefined ){
        operations = Object.values(json[0]);
        this.setState({operations : operations});
        console.log(json[0]);
        console.log(operations);
       }
      
   });  
  }
  //THIS METHOD FOR SELECTE OPERTION BASED ON SERVICE PROVIDER , CUSTOMER CODE, SUBCUSTOMER AND SELECTED SENSORE CODE
  selectOpertion(selectedSPValue,selectedCustValue,selectedSubCustValue,selectedSensorValue){
    if (selectedSPValue == "ALL" && selectedCustValue == "ALL" && selectedSubCustValue == "ALL") {
          this.opertionApi(this.state.ArrayOfSPs,this.state.ArrayOfCusts,this.state.ArrayOfSubCusts,selectedSensorValue)  
      //  alert("sensorNm"+"AllSp"+ selectedSPValue +"AllCstCd"+selectedCustValue +"AllSubCst" +selectedSubCustValue + selectedSensorValue) 
    }
    else if (selectedSPValue == "ALL" && selectedSubCustValue == "ALL") {
       
          this.opertionApi(this.state.ArrayOfSPs,selectedCustValue ,this.state.ArrayOfSubCusts,selectedSensorValue) 
      // alert("sensorNm"+"AllSp"+ selectedSPValue +"CstCd"+selectedCustValue +"AllSubCst" +selectedSubCustValue + selectedSensorValue) 
      }
    else if (selectedSPValue == "ALL" && selectedCustValue == "ALL") { 
    this.opertionApi(this.state.ArrayOfSPs, this.state.ArrayOfCusts ,selectedSubCustValue,selectedSensorValue)      
      // alert("sensorNm"+"AllSp"+ selectedSPValue +"AllCstCd"+selectedCustValue +"SubCst" +selectedSubCustValue + selectedSensorValue) 
    }
    else if (selectedSubCustValue == "ALL" && selectedCustValue == "ALL") {
     this.opertionApi(selectedSPValue, this.state.ArrayOfCusts ,this.state.ArrayOfSubCusts,selectedSensorValue) 
      // alert("sensorNm"+"Sp"+ selectedSPValue +"AllCstCd"+selectedCustValue +"AllSubCst" +selectedSubCustValue + selectedSensorValue) 
    }
    else if (selectedCustValue == "ALL") {
        this.opertionApi(selectedSPValue, this.state.ArrayOfCusts ,selectedSubCustValue,selectedSensorValue)     
      // alert("sensorNm"+"Sp"+ selectedSPValue +"AllCstCd"+selectedCustValue +"SubCst" +selectedSubCustValue + selectedSensorValue) 
    }
    else if (selectedSPValue == "ALL") { 
        this.opertionApi(this.state.ArrayOfSPs, selectedCustValue ,selectedSubCustValue,selectedSensorValue)  
      // alert("sensorNm"+"AllSp"+ selectedSPValue +"CstCd"+selectedCustValue +"SubCst" +selectedSubCustValue + selectedSensorValue) 
    }
    else if (selectedSubCustValue == "ALL") {
        this.opertionApi(selectedSPValue, selectedCustValue ,this.state.ArrayOfSubCusts,selectedSensorValue) 
      // alert("sensorNm"+"Sp"+ selectedSPValue +"CstCd"+selectedCustValue +"AllSubCst" +selectedSubCustValue + selectedSensorValue) 
    }
    else {
     this.opertionApi(selectedSPValue, selectedCustValue ,selectedSubCustValue,selectedSensorValue)   
      // alert("sensorNm"+"Sp"+ selectedSPValue +"CstCd"+selectedCustValue +"SubCst" +selectedSubCustValue + selectedSensorValue) 
    }   
  }

//THIS METHOD USE FOR FETCH ALL DATA FROM SERVER BASED ON SELECTED CRITERIA.
getAllDetails(){
  //THIS WAY OF GETTING DATA FROM STATE
  const {startDate,endDate,selectedSPValue,
    selectedCustValue,selectedSubCustValue,
    selectedSensorValue,ArrayOfSPs,
    ArrayOfCusts,ArrayOfSubCusts ,operationSelected ,equalsValue, startRange, endRange } =this.state;
    var dateTime1 = new Date(startDate).toISOString();
    var dateTime2 = new Date(endDate).toISOString();
  var spToSend = [], custToSend = [], subCustToSend = [];
  spToSend.push(selectedSPValue);
  custToSend.push(selectedCustValue);
  subCustToSend.push(selectedSubCustValue);

  if (selectedSPValue == "ALL" && selectedCustValue == "ALL" && selectedSubCustValue == "ALL") {
      this.getAllDataApi(ArrayOfSPs,ArrayOfCusts,ArrayOfSubCusts,selectedSensorValue,dateTime1,
        dateTime2, operationSelected,equalsValue,startRange,endRange)
  }
  else if (selectedSPValue == "ALL" && selectedSubCustValue == "ALL") {
      this.getAllDataApi(ArrayOfSPs,custToSend,ArrayOfSubCusts,selectedSensorValue,dateTime1,
        dateTime2, operationSelected,equalsValue,startRange,endRange)
  }
  else if (selectedSPValue == "ALL" && selectedCustValue == "ALL") {
      this.getAllDataApi(ArrayOfSPs,ArrayOfCusts,subCustToSend,selectedSensorValue,dateTime1,
        dateTime2, operationSelected,equalsValue,startRange,endRange)
}
  else if (selectedSubCustValue == "ALL" && selectedCustValue == "ALL") {

      this.getAllDataApi(spToSend,ArrayOfCusts,ArrayOfSubCusts,selectedSensorValue,dateTime1,
        dateTime2, operationSelected,equalsValue,startRange,endRange)
}
  
  else if (selectedCustValue == "ALL") {
      this.getAllDataApi(spToSend,ArrayOfCusts,subCustToSend,selectedSensorValue,dateTime1,
        dateTime2, operationSelected,equalsValue,startRange,endRange)
  }
  else if (selectedSPValue == "ALL") {
        this.getAllDataApi(ArrayOfSPs,custToSend,subCustToSend,selectedSensorValue,dateTime1,
        dateTime2, operationSelected,equalsValue,startRange,endRange)
  }
  else if (selectedSubCustValue == "ALL") {
          this.getAllDataApi(spToSend,custToSend,ArrayOfSubCusts,selectedSensorValue,dateTime1,
          dateTime2, operationSelected,equalsValue,startRange,endRange)
  }
  else {
      this.getAllDataApi(spToSend,custToSend,subCustToSend,selectedSensorValue,dateTime1,
        dateTime2, operationSelected,equalsValue,startRange,endRange)
  }
}
//THIS IS API METHOD FOR FETCH ALL DATA FROM SERVER BASED ON SELECTED CRITERIA.
getAllDataApi(SendForSp,SendFroCustCD,SendForSbCd,SendForSensor,SendForStartDate,
  SendForEndDate,SendForOperation,SendForEqual,SendForStartRange,SendforEndRange){
    fetch("http://13.127.10.197:3992/getFacts?spCode=" + SendForSp + "&&custCd=" +
    SendFroCustCD + "&&subCustCd=" + SendForSbCd + "&&sensorNm=" + SendForSensor +
  "&&startDate=" + SendForStartDate + "&&endDate=" + SendForEndDate + 
  "&&operation=" + SendForOperation + "&&equalsFacts=" +
  SendForEqual + "&&startFactValue=" + SendForStartRange + 
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
          FdataArray.push({
                  column1: json[i][0],
                  column2: json[i][1],
                  column3: json[i][2],
                  column4: json[i][3].toFixed(2),
                  column5: json[i][4]
     
        })}
        // console.log("this json data");
         console.log(json);
        alert(json)
        // console.log("end json");
        //HERE WE UPDATTING STATE FOR TABLE DATA FOR tableDataToSend AND RESUALT FOR CHART AND EXCEL
        this.setState({tableDataToSend : json ,result :FdataArray })
      // console.log(json);
      // alert(json)
        }else{
          swal("Sorry!", "No Data Available For This Range!", "error");
          this.setState({tableDataToSend : 0 ,result : 0 });
        }
    });
}
 //THIS METHOD FOR HENDER FOR CHART WHICH NEVIGATE TO CHART COMPONENT AND SAVE DATA RO SESSION MEMORY
 displayChart() {
  const {result,selectedSensorValue,startDate,endDate} = this.state;
  var dataToSend1 = [];
  var dataToSend2 = [];
  for (var i = 0; i < result.length; i++) {
    dataToSend1.push(result[i]["column4"]);
    dataToSend2.push(
      result[i]["column5"] 
    );
  }
  var yaxisName = selectedSensorValue;
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
   const {result} = this.state;
   //HERE PUTING RESULT DATA WHICH STORED IN STATE VARIABLE AND ASSIGN TO LOCAL VARIABLE dataForExcel
  var dataForExcel = result;
  if (dataForExcel) {
//THIS  HEADER OF COLUMN FOR EXCEL DATASHEET
    var arColumns = [
      "Device",
      "Device Name",
      "Bussiness Name",
      this.state.selectedSensorValue,
      "QueueDateTime"
    ];
    var arKeys = ["column1", "column2", "column3", "column4","column5"];
    var arWidths = [35, 35, 35, 35, 35];
    var reportName = this.state.selectedSensorValue + " Report";
    var dataSet = dataForExcel;
    this.exportToExcel(arColumns, arKeys, arWidths, reportName, dataSet);
  } else {
    // Swal({
    //   title: "There is no data to export!!",
    //   type: "info",
    //   background: '#fff',
    //   width: 400
    // });
    alert("There is no data to export!!");
  }
}
  //export To Excel and Save it to server and add the Details to Collection
  exportToExcel(arColumns, arKeys, arWidths, reportName, dataSet) {
    var workbook = new ExcelJs.Workbook();
    workbook.created = new Date();

    // create a sheet with blue tab colour
    var ws = workbook.addWorksheet(reportName, {
      properties: { tabColor: { argb: "1E1E90FF" } }
    });

    // Add initial set of rows
    var titleRows = [
      ["ReportName", this.state.selectedSensorValue + " Report"],
      ["Report Generated On", Date().toLocaleString()]
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

    workbook.xlsx.writeBuffer().then(data => {
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

 
  render() {
    const {spCd,custCd,subCustCd,sensorNm,operations,dynInput} = this.state;
  //  var DynInput =null; 
  //THIS VARIABLE FOR DYNAMIC INPUT FIELD EFFECT OR CHANGING.
    var equalvaluedisabled = true;
    var startendvalue =true;
    var dynamicvalue = this.state.startRange;
    var dynamPlaceholder = "Enter Start Values :";
    var dynamicname = "startRange";
    var Disabledsubmit =true;
    if(dynInput =="EQUALS"){
      equalvaluedisabled = null;
      dynamicvalue = this.state.equalsValue;
      dynamPlaceholder = "Enter Equals value :"
      dynamicname = "equalsValue"
      startendvalue = true;
      //THIS FOR VALIDATION 
      if(this.state.equalsValue != 0){
        Disabledsubmit=null;
      }
      else{
        Disabledsubmit=true;
      }
    } 
    else if (dynInput ==="RANGE"){
      equalvaluedisabled = true;
      startendvalue = null;
      dynamicvalue = this.state.startRange;
      dynamPlaceholder = "Enter Start Values :";
      dynamicname = "startRange";
      equalvaluedisabled = null;
      if(this.state.startRange && this.state.endRange != 0){
        Disabledsubmit=null;
      }
      else{
        Disabledsubmit=true;
      }
    
      }  else {
        // DynInput = null;
        Disabledsubmit=true;
        equalvaluedisabled = true;
      startendvalue = true;
       }
       if(dynInput ==="AVG"){
        Disabledsubmit=null;
       }
       
       //THIS VARIABLE FOR DYNAMIC TABLE WHICH APPEAR IN PRESENTS OF DATA .
      //  var table = null;
      //  if(this.state.tableDataToSend !=0){
      //   console.log("this json data1");
      //   console.log(this.state.tableDataToSend);
      //   console.log("end json");
       
      //  table =  <div className= "custNav btn-group">
      //    <button className="btn btn-sm btn-secondary" onClick={this.displayChart.bind(this)}><i class="far fa-chart-bar iconfont"></i></button>
      //    <button  className="btn btn-sm btn-secondary" onClick={this.downloadToExcel.bind(this)}><i class="far fa-file-excel iconfont"></i></button>
      //    </div>;
      
      // }
      // else{
      //   table = null;
      // }
      //   <div className="row bg">
      //    <div className= "custNav btn-group">
      //  <button className="btn btn-sm btn-secondary" onClick={this.displayChart.bind(this)}><i class="far fa-chart-bar iconfont"></i></button>
      //  <button  className="btn btn-sm btn-secondary" onClick={this.downloadToExcel.bind(this)}><i class="far fa-file-excel iconfont"></i></button>
      //  </div>
      {/* //THIS TABLE COMPONENT WHICH COMMING FROM REACT TABLE LIBRARY */}
    {/* <Table style={{
        opacity: 0.8,
        backgroundColor: "#6c757d",
        color: "#ffffff",
        textAlign: "center"
      }}
      tableStyle="table table-hover table-striped table-bordered table-borderless table-responsive"
      pages={true}
      pagination={true}
      onRowClick={(row) => {alert(row); console.log(row)}} // if You Want Table Row Data OnClick then assign this {row => console.log(row)}
      page={true}
      errormsg="Error. . ."
      loadingmsg="Loading. . ."
      isLoading={false} 
      sort={true} 
      title="Sensor Report"
      search={true}
      size={10}
      data={{
        head: {
          Device: "Device",
          Device_Name: "Device Name",
          Bibusiness_name : "Business Name",
          SensorName: this.state.selectedSensorValue,
          queue_date_time: "Queue Date Time",
        },
        data: this.state.tableDataToSend
      }} />
        </div>;

       }else{
        table = null;
       } */}
  
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
                          label="SERVICE PROVIDER :"
                          namefor="SERVICE PROVIDER :"
                          names = {spCd}
                          defaultDisabled = {null}
                          Change = {this.handleSp}
                          
                         />
                     </div>
                     <div className="col-sm-3">
                     <SelectionInput 
                              label="CUSTOMER :"
                              namefor="CUSTOMER :"
                              names = {custCd}
                              defaultDisabled = {this.state.custDisable}
                              Change = {this.handleCutMr}
                              />
                     </div>
                     <div className="col-sm-3">
                     <SelectionInput 
                              label="SUBCUSTOMER :"
                              namefor="SUBCUSTOMER :"
                              names = {subCustCd}
                              defaultDisabled = {this.state.subCustDisable}
                              Change = {this.handleSubCs}
                              />
                     </div>
                     <div className="col-sm-3">
                     
                     <SelectionInput 
                          label="SELECT THE SENSOR :"
                          namefor="SELECT THE SENSOR :"
                          names = {sensorNm}
                          defaultDisabled = {this.state.sensorDisable}
                          Change = {this.handleSensorNm}
                          />
                     </div>
                     <div className="col-sm-3">
                     <SelectionInput 
                          label="SELECT THE OPERATION :"
                          namefor="SELECT THE OPERATION :"
                          names = {operations}
                          defaultDisabled = {this.state.parameterDisable}
                          Change = {this.handleOperation}
                          />
                     </div>
                     <div className="col-sm-3">
                     <input
                          type="number"
                          name= {dynamicname}
                          className= "form-control custoin "
                          placeholder = {dynamPlaceholder}
                          value = {dynamicvalue}
                          disabled = {equalvaluedisabled}
                          onChange = {this.onChange}
                         />
                     </div>
                     <div className="col-sm-3">
                     <input
                          type="number"
                          name= "endRange"
                          className= "form-control custoin "
                          placeholder= "Enter End values :"
                          value = {this.state.endRange}
                          disabled = {startendvalue}
                          onChange = { (e) => {
                          this.setState({endRange : e.target.value});}}
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
          {/* {table} */}
          </div>
          </div>
          );
        }
    }
  


export default Menu;
