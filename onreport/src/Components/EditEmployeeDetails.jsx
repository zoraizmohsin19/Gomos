import React, { Component } from 'react'
import TextInputGroup from '../layout/TextInputGroup'
import * as Validate from "./validation";
import axios from "axios";


 class EditEmployeeDetails extends Component {
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
            dynamicClass: 'text-right',
            Heading: 'Edit Employee Details',
            disableddata: null,
            success:'',
            inProg:false
        };
       
        this.Update   =   this.Update.bind(this);
    }

   
    
    init(){
    }
    getSPApibyID(id){
        var me = this
        axios.get('http://localhost:3992/getRegisterEDbyId?id='+ id)
          .then(function (response) {
            //alert(response);
            console.log(response.data[0]);
            var name = response.data[0].name;
            var  edCd = response.data[0].edCd;
            var email =response.data[0].email;
            var  phone =response.data[0].phone;
            var  address =response.data[0].address;
            var Date_of_joining =response.data[0].Date_of_joining;
            var job_status =response.data[0].job_status;

            me.setState({ name:name,
                 edCd: edCd,
                 email: email,
                 Phone: phone,
                 address:address,
                 Date_of_joining:Date_of_joining,
                 job_status: job_status
 
            });
          })
          .catch(function (error) {
            console.log(error);
          });
    }
    decideType(id,title){
        console.log(id);
        console.log(title);
       
        if(title === "Edit"){
            this.getSPApibyID(id)
            // console.log(id+"this is data");
    
            // alert("Hello Takreem");
        
        }
        else {
            // alert("Bolo Takreem");

            this.getSPApibyID(id)
            // console.log(id+"this is data");
            this.setState({disableddata: true, dynamicClass: 'text-right d-none', Heading: "View Employee Details"});

        }
        
    }

    componentDidMount(){
        const {id} = this.props.match.params;
        const {title} = this.props.match.params
        this.decideType(id,title);
      
        setTimeout(function(){
            document.getElementById('SpName').focus();
        },100);
    }
    
    onChange = e => this.setState({ [e.target.name]: e.target.value });


    Update(){
        this.setState({'error':'','name_error':'','email_error':'','Phone_error':'','edCd_error':'','address_error':'','job_status_error':'','Date_of_joining_error':'','success':''});
        var name       =       this.state.name;
        if(name == undefined  || name == null || name.trim().length == 0){
            this.setState({'name_error':"Please provide name."})
            document.getElementById('SpName').focus();
            return;
        }   
        var edCd       =       this.state.edCd;
        if(edCd == undefined  || edCd == null || edCd.trim().length == 0){
            this.setState({'edCd_error':"Please provide Service Provider Code."})
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
            this.setState({'Phone_error':"Please provide Service Provider Phone No."})
            document.getElementById('Phone').focus();
            return;
        }   

        var address       =       this.state.address;
        if(address == undefined  || address == null || address.trim().length == 0){
            this.setState({'address_error':"Please provide Address"})
            document.getElementById('SpAddress').focus();
            return;
        }
        var Date_of_joining       =       this.state.Date_of_joining;
        if(Date_of_joining == undefined  || Date_of_joining == null || Date_of_joining.trim().length == 0){
            this.setState({'Date_of_joining_error':"Please provide Date of Joining."})
            document.getElementById('Date_of_joinings').focus();
            return;
        } 
        var job_status       =       this.state.job_status;
        if(job_status == undefined  || job_status == null || job_status.trim().length == 0){
            this.setState({'job_status_error':"Please provide  job_status."})
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
        
        var me = this;
        const {id} = this.props.match.params;
        console.log(id +"this is id")
        axios.put('http://localhost:3992/UpdateRegisterEDbyId?id='+ id, {
        data:arrayOfdata
          })
          .then(function (response) {
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
                                {/* Edit Service Provider */}
                                    <h3 className="box-title">{this.state.Heading}</h3>
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
                                                label= "Employee Name"
                                                name_input_class={name_input_class} 
                                                value ={this.state.name}
                                                name="name"
                                                id="SpName"
                                                type="text"
                                                placeholder="Employee Name"
                                                disabledvalue ={this.state.disableddata}
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
                                                    disabledvalue ={this.state.disableddata}
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
                                                disabledvalue ={this.state.disableddata}
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
                                                disabledvalue ={this.state.disableddata}
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
                                                    disabledvalue ={this.state.disableddata}
                                                    placeholder="Address"
                                                    name_error={this.state.address_error}
                                                    onChange={this.onChange}
                                                    />
                                                     <TextInputGroup
                                                    label= "Date of Joining *"
                                                    name_input_class={Date_of_joining_input_class} 
                                                    value ={this.state.Date_of_joining}
                                                    name="Date_of_joining"
                                                    type="text"
                                                    id="Date_of_joining"
                                                    disabledvalue ={this.state.disableddata}
                                                    placeholder="Date_of_joining"
                                                    name_error={this.state.Date_of_joining_error}
                                                    onChange={this.onChange}
                                                    />
                                                     <TextInputGroup
                                                    label= "Employee job_status *"
                                                    name_input_class={job_status_input_class} 
                                                    value ={this.state.job_status}
                                                    name="job_status"
                                                    type="text"
                                                    id="job_status"
                                                    disabledvalue ={this.state.disableddata}
                                                    placeholder="Employee Job status"
                                                    name_error={this.state.job_status_error}
                                                    onChange={this.onChange}
                                                    />
                                                </div>
                                              </div>
                                              
                                                <hr/>
                                                {/* text-right d-none */}
                                                <div className={this.state.dynamicClass}>
                                                    {/* {!state.inProg && <Button bsStyle='success' tabIndex={6} onClick={this.Update}>Add</Button>}
                                                    
                                                    {state.inProg && <Button bsStyle='success' tabIndex={6} ><i className="fa fa-spinner fa-spin" style={{fontSize:"20px"}}></i></Button>} */}
                                                   <button  className="btn btn-success btn-md" onClick={this.Update}>Update</button>
                                                    &nbsp;&nbsp;
                                                    {/* <Button tabIndex={7} onClick={()=>{this.props.history.goBack    ()}}>Cancel</Button> */}
                                                    {/* <button  className="btn  btn-md btn-danger " onClick={() =>{ 
                                                        window.location.reload(); 
                                                    }} >Cancel</button> */}
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

export default EditEmployeeDetails;
