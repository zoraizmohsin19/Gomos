import React, { Component } from 'react'
import TextInputGroup from '../layout/TextInputGroup'
import * as Validate from "./validation";
import axios from "axios";


 class AddEmployedetails extends Component {
    constructor(props){
        super(props);
        this.state  =   {
            name:'',
            name_error:'',
            Phone:'',
            email:'',
            address:'',
            edCd:'',
            Date_of_joining:'',
            job_status:'',
            email_error:'',
            password:'',
            edCd_error:'',
            Phone_error:'',
            address_error:'',
            Date_of_joining_error:'',
            job_status_error:'',
            user_type:1,
            error:'',
            success:'',
            inProg:false
        };
       
        this.add   =   this.add.bind(this);
    }

    componentWillMount(){
    }
    
    init(){
    }

    componentDidMount(){
        setTimeout(function(){
            document.getElementById('SpName').focus();
        },100);
    }
    
    onChange = e => this.setState({ [e.target.name]: e.target.value });


    add(){
        this.setState({'error':'','name_error':'','email_error':'','Phone_error':'','edCd_error':'','address_error':'','job_status_error':'','Date_of_joining_error':'','success':''});
        var name       =       this.state.name;
        if(name == undefined  || name == null || name.trim().length == 0){
            this.setState({'name_error':"Please provide Employee name."})
            document.getElementById('SpName').focus();
            return;
        }   
        var edCd       =       this.state.edCd;
        if(edCd == undefined  || edCd == null || edCd.trim().length == 0){
            this.setState({'edCd_error':"Please provide Employee Code."})
            document.getElementById('SpCode').focus();
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
            this.setState({'Phone_error':"Please provide Employee Phone No."})
            document.getElementById('Phone').focus();
            return;
        }   

        var address       =       this.state.address;
        if(address == undefined  || address == null || address.trim().length == 0){
            this.setState({'address_error':"Please provide Employees Address"})
            document.getElementById('SpAddress').focus();
            return;
        }
        var Date_of_joining       =       this.state.Date_of_joining;
        if(Date_of_joining == undefined  || Date_of_joining == null || Date_of_joining.trim().length == 0){
            this.setState({'Date_of_joining_error':"Please provide Employee Date of joining."})
            document.getElementById('Date_of_joining').focus();
            return;
        } 
        var job_status       =       this.state.job_status;
        if(job_status == undefined  || job_status == null || job_status.trim().length == 0){
            this.setState({'job_status_error':"Please provide Employee job status."})
            document.getElementById('job_status').focus();
            return;
        } 
       
        var arrayOfdata={
            name,
            edCd,
            email,
            Phone,
            address,
            job_status,
            Date_of_joining
        }
        // alert(Phone);
   
     var me = this; 
        axios.post('http://localhost:3992/registerED', {
           body:arrayOfdata
          })
          .then(function (response) {
            // alert(response);
            me.props.history.push("/EMSdashBoard");
          })
          .catch(function (error) {
            console.log(error);
          });
      
    
    }

   
  render() {
    var state   =   this.state;
        

    var name_input_class   =   "form-group  ";
    if(state.name_error.length != 0){
        name_input_class   = "form-group   is-invalid";
    }

    var email_input_class   =   "form-group  ";
    if(state.email_error.length != 0){
        email_input_class   = "form-group   is-invalid";
    }

    var edCd_input_class   =   "form-group  ";
    if(state.edCd_error.length != 0){
        edCd_input_class   = "form-group   is-invalid";
    }
   
    var Date_of_joining_input_class   =   "form-group  ";
    if(state.Date_of_joining_error.length != 0){
        Date_of_joining_input_class   = "form-group   is-invalid";
    }
    var job_status_input_class   =   "form-group  ";
    if(state.job_status_error.length != 0){
        job_status_input_class   = "form-group   is-invalid";
    }

    var Phone_input_class   =   "form-group  ";
    if(state.Phone_error.length != 0){
        Phone_input_class   = "form-group   is-invalid";
    }
    var address_input_class   =   "form-group  ";
    if(state.address_error.length != 0){
        address_input_class   = "form-group   is-invalid";
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
                            <div className="box box-success">
                                <div className="box-header with-border">
                                    <h3 className="box-title">Add Employee Details</h3>
                                </div>
                                <div className="box-body">
                                    <div className='row'>
                                        <div className='col-lg-1'></div>
                                        <div className='col-lg-6'>
                                            <div className='form update-profile'>
                                                {/* {state.error.length != 0 && <Alert bsStyle="danger" >{state.error}</Alert>}
                                                {state.success.length != 0 && <Alert bsStyle="success" >{state.success}</Alert>} */}
                                                {/* <div className={name_input_class}>
                                                    <label>Name*</label>
                                                    <input className="form-control" id='profile_name' type='text' tabIndex={1} placeholder="Name" value={state.name} onChange={(event)=>{this.setState({'name':event.target.value})}} tabIndex={1}/>
                                                    {state.name_error.length != 0 && <div className='error'>{state.name_error}</div>}
                                                </div> */}
                                                <div className="row">
                                                <div className="col-sm-6">
                                                <TextInputGroup
                                                label= "Employee Name *"
                                                name_input_class={name_input_class} 
                                                value ={this.state.name}
                                                name="name"
                                                id="SpName"
                                                type="text"
                                                placeholder="Employee Name"
                                                name_error={this.state.name_error}
                                                onChange={this.onChange}
                                                />
                                                <TextInputGroup
                                                    label= "Employee Code *"
                                                    name_input_class={edCd_input_class} 
                                                    value ={this.state.edCd}
                                                    name="edCd"
                                                    type="text"
                                                    id="SpCode"
                                                    placeholder="Employee Code"
                                                    name_error={this.state.edCd_error}
                                                    onChange={this.onChange}
                                                    />
                                                {/* <div className={ email_input_class }>
                                                    <label>Email*</label>
                                                    <input className="form-control" id='profile_email' type='text' placeholder="Email" value={state.email} onChange={(event)=>{this.setState({'email':event.target.value})}} tabIndex={2}/>
                                                    {state.email_error.length != 0 && <div className='error'>{state.email_error}</div>}
                                                </div> */}
                                                
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

                                                {/* <div className={ password_input_class }>
                                                    <label>Password*</label>
                                                    <input className="form-control" id='profile_password' type='password' placeholder="Password" value={state.password} onChange={(event)=>{this.setState({'password':event.target.value})}} tabIndex={3}/>
                                                    {state.password_error.length != 0 && <div className='error'>{state.password_error}</div>}
                                                </div> */}

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
                                                </div>
                                                <div className="col-sm-6">
                                                  {/* <div className={ Phone_input_class }>
                                                    <label>Confirm Password*</label>
                                                    <input className="form-control" id='profile_Phone' type='password' placeholder="Confirm Password" value={state.Phone} onChange={(event)=>{this.setState({'Phone':event.target.value})}} tabIndex={4}/>
                                                    {state.Phone_error.length != 0 && <div className='error'>{state.Phone_error}</div>}
                                                </div> */}
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
                                                    label= "Employee Date of joining *"
                                                    name_input_class={Date_of_joining_input_class} 
                                                    value ={this.state.Date_of_joining}
                                                    name="Date_of_joining"
                                                    type="text"
                                                    id="Date_of_joining"
                                                    placeholder="Date of joining"
                                                    name_error={this.state.Date_of_joining_error}
                                                    onChange={this.onChange}
                                                    />
                                                     <TextInputGroup
                                                    label= "Job status*"
                                                    name_input_class={job_status_input_class} 
                                                    value ={this.state.job_status}
                                                    name="job_status"
                                                    type="text"
                                                    id="job_status"
                                                    placeholder="job status"
                                                    name_error={this.state.job_status_error}
                                                    onChange={this.onChange}
                                                    />
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

export default AddEmployedetails;


