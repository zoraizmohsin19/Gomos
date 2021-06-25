import React, { Component } from 'react'
import {Table,DropdownButton,ButtonToolbar,MenuItem,Button,Modal,NavItem ,Nav} from 'react-bootstrap';
import axios from "axios";
import dateFormat  from  "dateformat";
import swal from 'sweetalert';
import QueryBuilder from 'react-querybuilder';

 class climateControlTemp extends Component {
    constructor(){
        super();
    this.state = {
        climateSensor: [],
        modelState: true,
        DeviceSensorsArray:[],
        SelectedQueryBusinessName:'',
        Businessfields:[],
        Climate:{
            selectedfilter: "",
          },
        CriteriaForOP:{
            spCd: "ASAGRISY",
           subCustCd: "001",
           CustCd: "DevCub",
           DeviceName : "PilotGH_002T",
           mac: "5ccf7f0015bc"
         },
         selectedSensorRowArray:[]
    }
    this.filterClimateFun = this.filterClimateFun.bind(this);
    this.handleCloseModel = this.handleCloseModel.bind(this);
    this.SelectSensorshandler = this.SelectSensorshandler.bind(this);
    }
    handleCloseModel(){
        this.setState({modelState: false});
    }

    componentDidMount(){
      this.fetchForClimate();
      this.fetchAllStateSensor();
    }
    fetchAllStateSensor(){
        axios.post("http://localhost/getAllSateData",{ mac: this.state.CriteriaForOP.mac})
        // .then(response => response.json())
        .then(json =>  {
       console.log(json)
       this.setState({DeviceSensorsArray: json["data"].sensors})
        }
          )
    }
    logQuery(query) {
        this.setState({rowclickedData: query});
        function convert(o) { 
   
         function fromRules(r) {
           return {
             c: r.combinator,
             a: r.rules.map(one=> convert(one))
           };
         }
         function fromField(f) {
           return {
             f: f.field,
             v: f.value,
             o: f.operator,
           }
         }
       
         return (o.rules? fromRules(o): fromField(o));
       }
       
   function toString(o) {
     function fromRules(r) {
       return r.rules.map(one=>`(${toString(one)})`).join(` ${r.combinator} `);
     }
     function fromField(f) {
       return `${f.field} ${f.operator} ${f.value}`;
     }
     return (o.rules? fromRules(o): fromField(o));
   }
       var temp =  convert(query); 
       var humanreadable = toString(query)
       console.log(query);
       console.log(temp);
       console.log(humanreadable)
   }
    fetchForClimate(){
        var me =this;
        alert("Hello This Working")
        //  THIS IS GETING SENSORNAME BASED ON SPCD,CUSTCD,SUBCUSTCD
        fetch("http://localhost/getSensorNames?spCode=" +this.state.CriteriaForOP.spCd +
        "&&custCd=" + this.state.CriteriaForOP.CustCd + "&&subCustCd=" + this.state.CriteriaForOP.subCustCd)
           .then(response => response.json())
           .then(json =>  {
             alert(json)
           var climateSensor =  json.map( x =>  { return  x  });
           me.setState({climateSensor : climateSensor});
      // console.log(json );
    });
      }
      filterClimateFun(value){
        var me = this;
        alert(value)
        this.state.Climate.selectedfilter = value;
        this.setState({selectedfilFSensor: value })
      }
      SelectSensorshandler(value){
          const {DeviceSensorsArray,Businessfields,climateSensor} = this.state;
          var me = this;
          this.setState({SelectedQueryBusinessName: value});
          var ArrayForFields = DeviceSensorsArray.filter(item =>  item.Type == value);
          var Field =[];
         if(ArrayForFields.length != 0){
             for(var i =0; i< ArrayForFields.length; i++){
                var obj = {};
                obj["name"] = ArrayForFields[i].devicebusinessNM;
                obj["label"] = ArrayForFields[i].configName;
                Field.push(obj)
             }
         }
         me.setState({Businessfields: Field});
          alert(value)
          console.log(climateSensor)
          console.log(ArrayForFields)
          console.log(Field)

      }
  render() {
      const {Businessfields ,selectedSensorRowArray}= this.state;
    const fields = [
        {name: 'Temp', label: 'temperature'},
        {name: 'lastName', label: 'Last Name'},
        {name: 'age', label: 'Age'},
        {name: 'address', label: 'Address'},
        {name: 'phone', label: 'Phone'},
        {name: 'email', label: 'Email'},
        {name: 'twitter', label: 'Twitter'},
        {name: 'isDev', label: 'Is a Developer?', value: false},
    ];
     
    // const dom =
    return (
      <div>

<div className= "col-sm-12">
    <div className ="">
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
            <p className ="ActiveP">Climate Control Table </p>
                <div  className="table-responsive">
                <Table  className="table table-hover table-sm table-bordered ">
                        <thead className='' style={{background: "gainsboro"}}>
                        <tr>
                        <th className='Acustmtd'> SI</th>
                        <th className='Acustmtd'>Expression</th>
                        <th className='Acustmtd Apadh '>Sensor Type</th>
                        <th className=' Acustmtd'>Action</th>
                        {/* <th className='Acustmtd'>DO /DO NOT</th> */}
                       
                        </tr>
                        </thead>
                        <tbody>
                        {/* { state.in_prog && <tr><td colSpan={8} className='text-center'><i className='fa fa-refresh fa-spin'></i> Loading..</td></tr>}
  { !state.in_prog && ExecutedJobs.length == 0 && <tr><td colSpan={8} className='text-center'> No Data </td></tr>}
    { !state.in_prog && ExecutedJobs.map( (item,i) => 
                    
                    <tr key ={i}>
                    <td className='Acustmtd'>{page_start_index+i + 1}</td>
                    <td className='Acustmtd'>{item.Channel}</td>
                    <td className='Acustmtd'>{item.ActionType}</td>
                    <td className='Acustmtd'>{dateFormat(item.ActionTime, "dd-mmm HH:MM")}</td>
                    <td className='Acustmtd'>{(item.isDailyJob)?"Yes":"NO"}</td>
                    </tr>
                    )} */}
                        </tbody> 
                        {/* { "Pages: " +total_page } */}
                        </Table>
                </div>
                {/* <div className='align-right'>
{ total_page > 1 && <CPagination  page={state.filter.page} totalpages={total_page} onPageChange={this.changePage}/>}
    </div>  */}
            </div>
    </div>


         <Modal show={this.state.modelState} onHide={this.handleCloseModel}
             dialogClassName="modal-90w"
             aria-labelledby="example-custom-modal-styling-title">
          <Modal.Header closeButton>
            <Modal.Title id="example-custom-modal-styling-title" ></Modal.Title>
          </Modal.Header>
          <Modal.Body>
      <div className= "row">
      <label className="OpdLable">Sensor Type :</label>
          <DropdownButton  className = "" 
            onSelect={this.SelectSensorshandler}
           bsStyle={"Awhite"}
            title={this.state.SelectedQueryBusinessName || "Select Sensor Type"}>
             {this.state.climateSensor.map( (item) =>
            <MenuItem   eventKey={item}>{item}</MenuItem>
             )} 
            </DropdownButton>
      <div>
      <QueryBuilder fields={fields}
                              onQueryChange={this.logQuery.bind(this)}/>
     </div>
      </div>
 </Modal.Body>
          <Modal.Footer>
            
            <button className="btn btn-sm " onClick = {this.handleCloseModel}>Cancel</button>
            {/* <button   className="btn btn-sm btn-success" onClick = {this.handleSubmit} >Submit</button> */}
           
           
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}
export default climateControlTemp;