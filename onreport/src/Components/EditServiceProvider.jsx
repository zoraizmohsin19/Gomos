import React, { Component } from 'react'
import TextInputGroup from '../layout/TextInputGroup'
import * as Validate from "./validation";
import axios from "axios";


 class EditServiceProvider extends Component {
    constructor(props){
        super(props);
        this.state  =   {
            name:'',
            name_error:'',
            Phone:'',
            email:'',
            address:'',
            spCd:'',
            PubTopic:'',
            SubTopic:'',
            email_error:'',
            password:'',
            SpCd_error:'',
            Phone_error:'',
            address_error:'',
            Pub_Topic_error:'',
            Sub_Topic_error:'',
            user_type:1,
            error:'',
            dynamicClass: 'text-right',
            Heading: 'Edit Service Provider',
            disableddata: null,
            success:'',
            inProg:false
        };
       
        this.Update   =   this.Update.bind(this);
    }

    componentWillMount(){
    }
    
    init(){
    }
    getSPApibyID(id){
        var me = this
        axios.get('http://18.203.28.35:3300/getRegisterSPbyId?id='+ id)
          .then(function (response) {
            // alert(response);
            console.log(response.data[0]);
            var name = response.data[0].name;
            var  spCd = response.data[0].spCd;
            var email =response.data[0].email;
            var  Phone =response.data[0].phone;
            var  address =response.data[0].address;
            var PubTopic =response.data[0].PubTopic;
            var SubTopic =response.data[0].SubTopic;

            me.setState({ name:name,
                 spCd: spCd,
                 email: email,
                 Phone: Phone,
                 address:address,
                 PubTopic:PubTopic,
                 SubTopic: SubTopic
 
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
            this.setState({disableddata: true, dynamicClass: 'text-right d-none', Heading: "View Service Provider"});

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
        this.setState({'error':'','name_error':'','email_error':'','Phone_error':'','SpCd_error':'','address_error':'','Pub_Topic_error':'','Sub_Topic_error':'','success':''});
        var name       =       this.state.name;
        if(name == undefined  || name == null || name.trim().length == 0){
            this.setState({'name_error':"Please provide name."})
            document.getElementById('SpName').focus();
            return;
        }   
        var spCd       =       this.state.spCd;
        if(spCd == undefined  || spCd == null || spCd.trim().length == 0){
            this.setState({'SpCd_error':"Please provide Service Provider Code."})
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
            this.setState({'address_error':"Please provide Service Address"})
            document.getElementById('SpAddress').focus();
            return;
        }
        var SubTopic       =       this.state.SubTopic;
        if(SubTopic == undefined  || SubTopic == null || SubTopic.trim().length == 0){
            this.setState({'Sub_Topic_error':"Please provide Service Provider SubTopic."})
            document.getElementById('SubTopic').focus();
            return;
        } 
        var PubTopic       =       this.state.PubTopic;
        if(PubTopic == undefined  || PubTopic == null || PubTopic.trim().length == 0){
            this.setState({'Pub_Topic_error':"Please provide Service Provider PubTopic."})
            document.getElementById('PubTopic').focus();
            return;
        } 
       
        var arrayOfdata={
            name,
            spCd,
            email,
            Phone,
            address,
            PubTopic,
            SubTopic
        }
        alert(Phone);

        const {id} = this.props.match.params;
        console.log(id +"this is id")
        axios.put('http://18.203.28.35:3300/UpdateRegisterSPbyId?id='+ id, {
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
        

    var name_input_class   =   "form-group  ";
    if(state.name_error.length != 0){
        name_input_class   = "form-group   is-invalid";
    }

    var email_input_class   =   "form-group  ";
    if(state.email_error.length != 0){
        email_input_class   = "form-group   is-invalid";
    }

    var SpCd_input_class   =   "form-group  ";
    if(state.SpCd_error.length != 0){
        SpCd_input_class   = "form-group   is-invalid";
    }
   
    var Sub_Topic_input_class   =   "form-group  ";
    if(state.Sub_Topic_error.length != 0){
        Sub_Topic_input_class   = "form-group   is-invalid";
    }
    var Pub_Topic_input_class   =   "form-group  ";
    if(state.Pub_Topic_error.length != 0){
        Pub_Topic_input_class   = "form-group   is-invalid";
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
                                                label= "Service Provider Name"
                                                name_input_class={name_input_class} 
                                                value ={this.state.name}
                                                name="name"
                                                id="SpName"
                                                type="text"
                                                placeholder="Service Provider Name"
                                                disabledvalue ={this.state.disableddata}
                                                name_error={this.state.name_error}
                                                onChange={this.onChange}
                                                />
                                                <TextInputGroup
                                                    label= "Service Provider Code *"
                                                    name_input_class={SpCd_input_class} 
                                                    value ={this.state.spCd}
                                                    name="spCd"
                                                    type="text"
                                                    id="SpCode"
                                                    disabledvalue ={this.state.disableddata}
                                                    placeholder="Service Provider Code"
                                                    name_error={this.state.SpCd_error}
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
                                                    label= "Service Provider SubTopic *"
                                                    name_input_class={Sub_Topic_input_class} 
                                                    value ={this.state.SubTopic}
                                                    name="SubTopic"
                                                    type="text"
                                                    id="SubTopic"
                                                    disabledvalue ={this.state.disableddata}
                                                    placeholder="Service Provider SubTopic"
                                                    name_error={this.state.Sub_Topic_error}
                                                    onChange={this.onChange}
                                                    />
                                                     <TextInputGroup
                                                    label= "Service Provider PubTopic *"
                                                    name_input_class={Pub_Topic_input_class} 
                                                    value ={this.state.PubTopic}
                                                    name="PubTopic"
                                                    type="text"
                                                    id="PubTopic"
                                                    disabledvalue ={this.state.disableddata}
                                                    placeholder="Service Provider PubTopic"
                                                    name_error={this.state.Pub_Topic_error}
                                                    onChange={this.onChange}
                                                    />
                                                </div>
                                              </div>
                                              
                                                <hr/>
                                                {/* text-right d-none */}
                                                <div className={this.state.dynamicClass}>
                                                    {/* {!state.inProg && <Button bsStyle='success' tabIndex={6} onClick={this.Update}>Add</Button>}
                                                    
                                                    {state.inProg && <Button bsStyle='success' tabIndex={6} ><i className="fa fa-spinner fa-spin" style={{fontSize:"20px"}}></i></Button>} */}
                                                   <button  className="btn btn-success btn-md" onClick={this.Update}>Upadate</button>
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

export default EditServiceProvider;
