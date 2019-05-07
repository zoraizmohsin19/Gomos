import React, { Component } from 'react'
import './Login.css';
import Header from "../layout/Header"
import { Link } from 'react-router-dom';
import * as Validate from "./validation";
import axios from "axios";
import swal from 'sweetalert';
import Spinner from '../layout/Spinner';

 class Login extends Component {
    constructor(props){
        super(props);
        this.state  =   {
            email:'',
            password : '',
            password_error: '',
            email_error: '',
            Spinnerdata: true
            // email_input_class: '',
            // password_input_class:  ''


        }
        this.loginbutton   =   this.loginbutton.bind(this);
    }
    
    componentDidMount(){
       
    }
    onChange = e => this.setState({ [e.target.name]: e.target.value });
    loginbutton(){

       
        this.setState({'error':'','name_error':'','email_error':''});

        var email       =       this.state.email;
        if(email == undefined  || email == null || email.trim().length == 0){
            this.setState({'email_error':"Please provide email address."});
            document.getElementById('inputEmail').focus();
            return;
        }   

        if(!Validate.email(email)){
            this.setState({'email_error':"Please provide a valid email address."});
            document.getElementById('inputEmail').focus();
            return;
        }
        var password       =       this.state.password;
        if(password == undefined  || password == null || password.trim().length == 0){
            this.setState({'password_error':"Please provide password."});
            document.getElementById('inputPassword').focus();
            return;
        }  
       
        var me = this; 
        if (email && password) {
            var userdata ={email,
                password};
                me.setState({ 'Spinnerdata': false});
        axios.post('http://34.244.151.117:3992/authenticate', {body: userdata
           
          })
          .then(function (response) {
            //  alert(response);
            console.log(response["data"]);
             if (response["data"] != 0) {
                sessionStorage.setItem("userDetails", JSON.stringify(response["data"].userDtls));
                sessionStorage.setItem("dashboardConfigobj", JSON.stringify(response["data"].dashboardConfigobj));
                sessionStorage.setItem("configData", JSON.stringify(response["data"].configData));
                sessionStorage.setItem("ClientObj", JSON.stringify(response["data"].ClientObj));
                me.setState({ 'Spinnerdata':true});
                me.props.history.push(response["data"].dashboardConfigobj.Nevigation)
              }
              else {
                swal({
                  title: 'Invalid UserId and Password!!',
                  type: 'error',
                  background: '#fff',
                  width: 400,
                  confirmButtonText: 'OK!',
                })
                me.setState({ 'Spinnerdata':true});
              }
            // me.props.history.push("/SPdashBoard");
          })
          .catch(function (error) {
            console.log(error);
            me.setState({ 'Spinnerdata':true});
          }); 
        }
        else{
            me.setState({ 'Spinnerdata':true});
            swal({
                title: 'Please Enter the UserId and Password before Logging!!',
                type: 'error',
                background: '#fff',
                width: 400,
                confirmButtonText: 'OK!',
              })
            
        }
    }


  render() {
      const {email , password, password_error, email_error} = this.state;
    var state   =   this.state;
            
    
    var Password_input_class   =   "form-group  ";
    if(state.password_error.length != 0){
        Password_input_class   = "form-group   is-invalid";
    }

    var email_input_class   =   "form-group  ";
    if(state.email_error.length != 0){
        email_input_class   = "form-group   is-invalid";
    }
if(this.state.Spinnerdata == true ){
    return (
        <div className= "container-fluid">
       <div class="container">


<div class="card1 card1-container">
    {/* <!-- <img class="profile-img-card1" src="//lh3.googleusercontent.com/-6V8xOA6M7BA/AAAAAAAAAAI/AAAAAAAAAAA/rzlHcD0KYwo/photo.jpg?sz=120" alt="" /> --> */}
    {/* <img id="profile-img" class="profile-img-card1 img-responsive" src="/static/media/AS_Agri_Logo_Website.9a12eb51.png" /> */}
    <p id="profile-name" class="profile-name-card1"></p>
    <form class="form-signin" onSubmit={this.loginbutton}>  
        <span id="reauth-email" class="reauth-email"></span>
        <div className={email_input_class}>
        <input type="email" id="inputEmail" class="form-control"  name="email"  value={this.state.email} onChange={this.onChange} placeholder="Email address" required autofocus />
        {email_error.length != 0 && <div className=' text-danger'>{email_error}</div>}
        </div>
        <div className={Password_input_class}>
        <input type="password" id="inputPassword"  name="password"  value={this.state.password} onChange={this.onChange} class="form-control" placeholder="Password" required />
        {password_error.length != 0 && <div className=' text-danger'>{password_error}</div>}
        </div>
        <div id="remember" class="checkbox">
            {/* <label>
                <input type="checkbox" value="remember-me" /> Remember me
            </label> */}
        </div>
        <button class="btn btn-lg btn-success btn-block btn-signin" type="submit" >Sign in</button>
    </form>
    <a href="#" class="forgot-password">
        Forgot the password?
    </a>
</div>
</div>
        
       </div>
     
    )
}
else{
    return <Spinner />;
}
  }
}
export default Login;
