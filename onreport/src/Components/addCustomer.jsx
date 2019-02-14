import React, { Component } from 'react'
import TextInputGroup from '../layout/TextInputGroup'
import * as Validate from "./validation";
import SelectionInput from '../layout/SelectionInput';
import axios from "axios";

class addCustomer extends Component {
    constructor(props){
        super(props);
        this.state  =   {
            CustName:'',
            CustName_error:'',
            Phone:'',
            email:'',
            address:'',
            custCd:'',
            description:'',
            mqttClient:'',
            email_error:'',
            password:'',
            custCd_error:'',
            Phone_error:'',
            address_error:'',
            description_error:'',
            mqttClient_error:'',
            error:'',
            success:'',
            selectedSPValue_error:'',
            Active_error:'',
            ArrayOfSPs:[],
            SpJson : [],
            status:'',
            selectedSPValue:'',
            topic1_error: '',
            topic2_error: '',
            topic1: '',
            topic2: ''
        };
        this.add   =   this.add.bind(this);
    }

    componentDidMount(){
        this.getAllSpApi()
        setTimeout(function(){
            document.getElementById('CustName').focus();
        },100);
    }

    onChange = e => this.setState({ [e.target.name]: e.target.value });

    handleSp = (e) => {
        // alert(e.target.value );
        var index =  this.state.SpJson.findIndex(
       x => x.spCd ==  e.target.value
    )
      var PubTopic = this.state.SpJson[index]["PubTopic"];
      var SubTopic = this.state.SpJson[index]["SubTopic"];
        // alert(SubTopic)
        // console.log(SubTopic)
        // var PubTopic =  this.state.SpJson[e.target.value]["PubTopic"];
        this.setState({ selectedSPValue : e.target.value, topic1 : PubTopic, topic2 : SubTopic  })
       
        }
        handlerActive = (e) => {
            alert(e.target.value );
            this.setState({ status : e.target.value })
           
            }
        getAllSpApi(){
            fetch('http://13.127.10.197:3992/getRegisterSP')
            .then(response => response.json())
            .then(json =>  {
            var spCd =  json.map( x =>  { return  x.spCd  });
            // var topics =  json.map( x =>  { return  x.SubTopic  });
            console.log(spCd+ "this is data");
            
            // this.setState({ArrayOfSPs : spCd});
            // spCd.push("ALL");
            this.setState({ArrayOfSPs : spCd, SpJson : json});
            
        
           }
            );
          }

    add(){
        this.setState({'error':'','CustName_error':'','custCd_error':'','Phone_error':'','custCd_error':'','address_error':'','description_error':'','selectedSPValue_error':'','mqttClient_error':'','email_error':'','active_error':'','success':'','topic1_error':'','topic2_error':''});
        var CustName       =       this.state.CustName;
        if(CustName == undefined  || CustName == null || CustName.trim().length == 0){
            this.setState({'CustName_error':"Please Provide Customer Name."})
            document.getElementById('CustName').focus();
            return;
        }   
        var custCd       =       this.state.custCd;
        if(custCd == undefined  || custCd == null || custCd.trim().length == 0){
            this.setState({'custCd_error':"Please Provide Customer Code."})
            document.getElementById('custCd').focus();
            return;
        }  
        var selectedSPValue       =       this.state.selectedSPValue;
        if(selectedSPValue == null || selectedSPValue == '' ){
            this.setState({'selectedSPValue_error':"Please Select Service Provider Code."})
            document.getElementById('SelectSp').focus();
            return;
        }  
       

        var email       =       this.state.email;
        if(email == undefined  || email == null || email.trim().length == 0){
            this.setState({'email_error':"Please provide email address."});
            document.getElementById('SpEmail').focus();
            return;
        }   

        if(!Validate.email(email)){
            this.setState({'email_error':"Please provide a valid email address."});
            document.getElementById('SpEmail').focus();
            return;
        }


        var Phone       =       this.state.Phone;
        if(Phone == undefined  || Phone == null || Phone.trim().length == 0){
            this.setState({'Phone_error':"Please provide Customer Phone No."})
            document.getElementById('Phone').focus();
            return;
        }   

        var address       =       this.state.address;
        if(address == undefined  || address == null || address.trim().length == 0){
            this.setState({'address_error':"Please Customer Address"})
            document.getElementById('SpAddress').focus();
            return;
        }
        var mqttClient       =       this.state.mqttClient;
        if(mqttClient == undefined  || mqttClient == null || mqttClient.trim().length == 0){
            this.setState({'mqttClient_error':"Please Provide  MqttClient."})
            document.getElementById('mqttClient').focus();
            return;
        } 
        var description       =       this.state.description;
        if(description == undefined  || description == null || description.trim().length == 0){
            this.setState({'description_error':"Please provide Customer Description."})
            document.getElementById('description').focus();
            return;
        } 
        var topic1       =       this.state.topic1;
        if(topic1 == undefined  || topic1 == null || topic1.trim().length == 0){
            this.setState({'topic1_error':"Please provide Customer Topic 1."})
            document.getElementById('topic1').focus();
            return;
        }
        var topic2       =       this.state.topic2;
        if(topic2 == undefined  || topic1 == null || topic2.trim().length == 0){
            this.setState({'topic2_error':"Please provide Customer Topic 2."})
            document.getElementById('topic2').focus();
            return;
        }  
        var status       =       this.state.status;
        if(status == ''  || status == null){
            this.setState({'Active_error':"Please provide Customer Status."})
            document.getElementById('ActiveID').focus();
            return;
        } 
        var selectedSPValue = this.state.selectedSPValue;
        var status = this.state.status;
        var topic1 = this.state.topic1;
        var topic2 = this.state.topic2;
        
        
        var arrayOfdata={
            CustName,
            custCd,
            selectedSPValue,
            email,
            Phone,
            address,
            description,
            mqttClient,
            status,
            topic1,
            topic2
            
        }
        console.log(arrayOfdata);
        alert(arrayOfdata);

      
        axios.post('http://13.127.10.197:3992/customerReg', {
           body:arrayOfdata
          })
          .then(function (response) {
            alert(response);
          })
          .catch(function (error) {
            console.log(error);
          });
      
    
    }

    render() {
        var state   =   this.state;
            
    
        var CustName_input_class   =   "form-group  ";
        if(state.CustName_error.length != 0){
            CustName_input_class   = "form-group   is-invalid";
        }
    
        var email_input_class   =   "form-group  ";
        if(state.email_error.length != 0){
            email_input_class   = "form-group   is-invalid";
        }
    
        var custCd_input_class   =   "form-group  ";
        if(state.custCd_error.length != 0){
            custCd_input_class   = "form-group   is-invalid";
        }
       
        var mqttClient_input_class   =   "form-group  ";
        if(state.mqttClient_error.length != 0){
            mqttClient_input_class   = "form-group   is-invalid";
        }
        var description_input_class   =   "form-group  ";
        if(state.description_error.length != 0){
            description_input_class   = "form-group   is-invalid";
        }
    
        var Phone_input_class   =   "form-group  ";
        if(state.Phone_error.length != 0){
            Phone_input_class   = "form-group   is-invalid";
        }
        var topic1_input_class   =   "form-group  ";
        if(state.topic1_error.length != 0){
            topic1_input_class   = "form-group   is-invalid";
        }
        var topic2_input_class   =   "form-group  ";
        if(state.topic2_error.length != 0){
            topic2_input_class   = "form-group   is-invalid";
        }
        var address_input_class   =   "form-group  ";
        if(state.address_error.length != 0){
            address_input_class   = "form-group   is-invalid";
        }
        var SelectSP_input_class   =   "form-group  ";
        if(state.selectedSPValue_error.length != 0){
            SelectSP_input_class   = "form-group   is-invalid";
        }
        
        var Active_input_class   =   "form-group  ";
        if(state.Active_error.length != 0){
            Active_input_class   = "form-group   is-invalid";
        }
    
        // var user_type_input_class   =   "form-group  ";
    
        // var     user_type_options   =   [
        //     {
        //         'name':'Admin',
        //         'value':2
        //     },
        //     {
        //         'name':'Super Admin',
        //         'value':1
        //     }
        // ];
    return (
      <div>
        <section className="content">
                    <div className='row'>
                        <div className='col-lg-12'>
                            <div className="box box-success ">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Add Customer</h3>
                                </div>
                                <div className="box-body">
                                    <div className='row'>
                                        <div className='col-lg-1'></div>
                                        <div className='container mt-4'>
                                            <div className='form update-profile'>
                                                {/* {state.error.length != 0 && <Alert bsStyle="danger" >{state.error}</Alert>}
                                                {state.success.length != 0 && <Alert bsStyle="success" >{state.success}</Alert>} */}
                                                {/* <div className={name_input_class}>
                                                    <label>Name*</label>
                                                    <input className="form-control" id='profile_name' type='text' tabIndex={1} placeholder="Name" value={state.name} onChange={(event)=>{this.setState({'name':event.target.value})}} tabIndex={1}/>
                                                    {state.name_error.length != 0 && <div className='error'>{state.name_error}</div>}
                                                </div> */}
                                                <div className="row">
                                                <div className="col-sm-4">
                                                <TextInputGroup
                                                label= "Customer Name"
                                                name_input_class={CustName_input_class} 
                                                value ={this.state.CustName}
                                                name="CustName"
                                                id="CustName"
                                                type="text"
                                                placeholder="Customer Name"
                                                name_error={this.state.CustName_error}
                                                onChange={this.onChange}
                                                />
                                                <TextInputGroup
                                                    label= "CustomerCode *"
                                                    name_input_class={custCd_input_class} 
                                                    value ={this.state.custCd}
                                                    name="custCd"
                                                    type="text"
                                                    id="custCd"
                                                    placeholder="Customer Code"
                                                    name_error={this.state.custCd_error}
                                                    onChange={this.onChange}
                                                    />
                                                 <label>SELECT SERVICE PROVIDER</label>
                                              <div className ={SelectSP_input_class}>

                                                        <select  onChange={this.handleSp} className="form-control selectcolor"   id="SelectSp">
                                                        {this.state.ArrayOfSPs.map( n => 
                                                        <option className="selectcolor" value={n}>{n}</option>)}
                                                        <option disabled selected value> -: SELECT SERVICE PROVIDER :- </option>
                                                        </select>
                                                  {this.state.selectedSPValue_error.length != 0 && <div className=' text-danger'>{this.state.selectedSPValue_error}</div>}
                                                        
                                                </div>
                                                
                                                 <TextInputGroup
                                                label= "Email *"
                                                name_input_class={email_input_class} 
                                                value ={this.state.email}
                                                name="email"
                                                id="SpEmail"
                                                type="email"
                                                placeholder="Email "
                                                name_error={this.state.email_error}
                                                onChange={this.onChange}
                                                />
                                                
                                                </div>
                                                <div className="col-sm-4">
                                                <TextInputGroup
                                                label= "Phone No *"
                                                name_input_class={Phone_input_class} 
                                                value ={this.state.Phone}
                                                name="Phone"
                                                type="number"
                                                id="Phone"
                                                placeholder="Phone No"
                                                name_error={this.state.Phone_error}
                                                onChange={this.onChange}
                                                />
                                                 <TextInputGroup
                                                    label= "Address *"
                                                    name_input_class={address_input_class} 
                                                    value ={this.state.address}
                                                    name="address"
                                                    type="text"
                                                    id="SpAddress"
                                                    placeholder="Address"
                                                    name_error={this.state.address_error}
                                                    onChange={this.onChange}
                                                    />
                            
                                                  
                                                     <TextInputGroup
                                                    label= "mqttClient *"
                                                    name_input_class={mqttClient_input_class} 
                                                    value ={this.state.mqttClient}
                                                    name="mqttClient"
                                                    type="text"
                                                    id="mqttClient"
                                                    placeholder="mqttClient"
                                                    name_error={this.state.mqttClient_error}
                                                    onChange={this.onChange}
                                                    />
                                                     <TextInputGroup
                                                    label= "Customer Description *"
                                                    name_input_class={description_input_class} 
                                                    value ={this.state.description}
                                                    name="description"
                                                    type="text"
                                                    id="description"
                                                    placeholder="Customer Description"
                                                    name_error={this.state.description_error}
                                                    onChange={this.onChange}
                                                    />
                                                    
                                                </div>
                                                <div className="col-sm-4 ">
                                                <TextInputGroup
                                                        label= "Topic 1 *"
                                                        name_input_class={topic1_input_class} 
                                                        value ={this.state.topic1}
                                                        name="topic1"
                                                        type="text"
                                                        id="topic1"
                                                        placeholder="Topic 1"
                                                        name_error={this.state.topic1_error}
                                                        onChange={this.onChange}
                                                        />
                                                         <TextInputGroup
                                                        label= "Topic 2 *"
                                                        name_input_class={topic2_input_class} 
                                                        value ={this.state.topic2}
                                                        name="topic2"
                                                        type="text"
                                                        id="topic2"
                                                        placeholder="Topic 2"
                                                        name_error={this.state.topic2_error}
                                                        onChange={this.onChange}
                                                        />
                                                     <div className ={Active_input_class}>

                                                    <select  onChange={this.handlerActive} className="form-control selectcolor"   id="ActiveID">
                                                    <option className="selectcolor" value="SETUP">SETUP </option>
                                                    <option className="selectcolor" value="ACTIVE">ACTIVE </option>
                                                    <option className="selectcolor" value="IN ACTIVE">IN ACTIVE </option>
                                                    <option disabled selected value> -: SELECT CUSTOMER STATUS :- </option>
                                                    </select>
                                                    {this.state.Active_error.length != 0 && <div className=' text-danger'>{this.state.Active_error}</div>}

                                                    </div>
                                                </div>
                                              </div>
                                              
                                                <hr/>
                                                <div className='text-right'>
                                                    {/* {!state.inProg && <Button bsStyle='success' tabIndex={6} onClick={this.add}>Add</Button>}
                                                    
                                                    {state.inProg && <Button bsStyle='success' tabIndex={6} ><i className="fa fa-spinner fa-spin" style={{fontSize:"20px"}}></i></Button>} */}
                                                   <button  className="btn btn-success btn-md" onClick={this.add}>Add</button>
                                                    &nbsp;&nbsp;
                                                    {/* <Button tabIndex={7} onClick={()=>{this.props.history.goBack    ()}}>Cancel</Button> */}
                                                    <button  className="btn  btn-md btn-danger " onClick={() =>{ 
                                                        window.location.reload(); 
                                                    }} >Cancel</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='col-lg-2'></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
      </div>
    )
  }
}

export default addCustomer;