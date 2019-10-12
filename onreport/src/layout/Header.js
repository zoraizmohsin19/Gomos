import React , { Component } from 'react';
import PropTypes from 'prop-types'
// import { Link } from 'react-router-dom';
import './Header.css';
import { Link } from 'react-router-dom';
import {Nav, Navbar,NavItem, NavDropdown, Modal} from 'react-bootstrap';
// import * as serviceWorker from '../../src/serviceWorker';
import axios from "axios";
import URL from "../Common/confile/appConfig.json";
class Header extends Component {
  // const { branding } = props;
  constructor() {
    super();
  this.state = {
    show: false,
    devicePreference: [],
    data : [],
  };
  this.handleClose = this.handleClose.bind(this);
  this.handleOpen = this.handleOpen.bind(this);
  }
  handleClose() {
    this.setState({ show: false });
  }
  handleOpen() {
    let data = JSON.parse(sessionStorage.getItem("userDetails"));
   
    this.setState({data: data,  devicePreference: data[0].devicePreference, show: true  })
   
  
  }
  handleSelect(selectedKey) {
  
    if(selectedKey === 6){
     
      sessionStorage.clear();
    }
  }

  handleSubmit(){
   console.log( "This is State",this.state.data)
   let body = { _id : this.state.data[0].id,devicePreference: this.state.devicePreference  }
    axios.post(`${URL.IP}:3992/users/update`,body)
    .then(json => {
      console.log("This is this.state.data result", json)
     if(json.statusText === "OK"){
        console.log("This is this.state.data result", json)
        // let data = JSON.parse(sessionStorage.getItem("userDetails"));
        this.state.data[0].devicePreference = this.state.devicePreference ;
        sessionStorage.setItem("userDetails", JSON.stringify(this.state.data));
        this.handleClose()

      }
      
    
    }).catch(console.log)
  } 
  render(){
  let ActiveData = JSON.parse(sessionStorage.getItem("dashboardConfigobj"));
  let data = JSON.parse(sessionStorage.getItem("userDetails"));
//   var  Admin =  data[0].userType ;
if (ActiveData){
//serviceWorker.register(data[0].userId);
}
 
 

  
  return (

<Navbar inverse collapseOnSelect>
  <Navbar.Header>
    <Navbar.Brand>
    <Link to="/NevMenu" className="navbar-brand pad">
     <img src={require('./AS_Agri_Logo_Website.png')} alt="logo"  className="logo responsive" />
    </Link>
    </Navbar.Brand>
    <Navbar.Toggle />
  </Navbar.Header>
  {ActiveData ? ( <Navbar.Collapse>

       <Nav pullRight onSelect={this.handleSelect.bind(this)}>
        <NavDropdown eventKey={5} title={ "Hello"+" "+ data[0].userFN } id="basic-nav-dropdown">
        <li>
                <div className="navbar-login">
                    <div className="row">
                        <div className="col-lg-4">
                            <p className="text-center">
                                <span className="glyphicon glyphicon-user icon-size"></span>
                            </p>
                        </div>
                        <div className="col-lg-8">
                            <p className="text-left"><strong>{data[0].userFN+" "+data[0].userLN}</strong></p>
                            <p className="text-left small">{data[0].email}</p>
                              
                            <p className="text-left">
                                 <button  onClick ={ this.handleOpen} className="btn btn-primary btn-block  btn-md">Setting &nbsp;<i class="fas fa-user-cog"></i></button>
                                {/* <button href="#" disabled className="btn btn-primary btn-block btn-md">Change Password</button> */}
                            </p>
                        </div>
                    </div>
                </div>
            </li>
            <li className="divider"></li>
            <li>
                <div className="navbar-login navbar-login-session">
                    <div className="row">
                        <div className="col-lg-12">
                            <p>
                                {/* <a href="#"  > */}
                                <NavItem eventKey={6}  onSelect={this.handleSelect.bind(this)} >
                                <Link to="/" className="btn btn-success btn-block"><i className ="fas fa-sign-out-alt"></i> Log out</Link>
                                
                                </NavItem>
                                {/* </a> */}
                            </p>
                        </div>
                    </div>
                </div>
            </li>
        </NavDropdown>
       
    </Nav>
   
    {data[0].userType == "Admin" ? (
        <Nav pullRight onSelect={this.handleSelect.bind(this)}>
        {/* <NavItem eventKey={1} >
          <Link to="/NevMenu">Home</Link>
           
          </NavItem> */}
          <NavItem eventKey={2} >
          <Link to="/aggregator">Aggregator</Link>
          </NavItem>
          <NavItem eventKey={3} >
          <Link to="/SPdashBoard">Service Providers</Link>
           
          </NavItem>
          <NavItem eventKey={4} >
          <Link to="/CustdashBoard">Customers</Link>
          </NavItem>
  
          {/* <NavItem eventKey={3} >
          <Link to="/"><i className ="fas fa-sign-out-alt"></i> Log out</Link>
          
          </NavItem> */}
          </Nav>)
        : null}
         <Nav pullRight onSelect={this.handleSelect.bind(this)}>
    <NavItem eventKey={1} >
          <Link to="/NevMenu">Home</Link>
           
          </NavItem>
      </Nav>
    
       
  </Navbar.Collapse>) : null}
  <Modal show={this.state.show} onHide={this.handleClose}
          dialogClassName=""
          aria-labelledby="example-custom-modal-styling-title">
          <Modal.Header closeButton>
            <Modal.Title id="example-custom-modal-styling-title" ></Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* <div className="row"> */}
            <table>
            <tbody>
          {this.state.devicePreference.map(  (item , i)  =><tr>
              <td colspan="6"> &nbsp;&nbsp;&nbsp;&nbsp;{ i + 1} &nbsp;&nbsp;&nbsp;&nbsp;</td>
               <td> <label> &nbsp;&nbsp;&nbsp;&nbsp;{item.DeviceName} &nbsp;&nbsp;&nbsp;&nbsp;</label> </td>
              <td colspan="6">  <label className="switch  headersetting">
                <input type="checkbox"  value="Text"  checked={item.pusNotification} 
                onChange={e => {
                  
                  this.state.devicePreference[i].pusNotification   = !this.state.devicePreference[i].pusNotification;
                  
                  this.setState({ devicePreference:  this.state.devicePreference })
                }}
                   />
                <span className="slider round"></span>
              </label>
              </td>
              </tr>)}
           
              </tbody>
           </table>
          
          </Modal.Body>
          <Modal.Footer>
            {/* <label className="Mlabel">Action Requested: <u> Switch {(this.state.channelAlerrModel.currentStatus === 1) ? "OFF" : "ON"}</u> And <u>Manual</u> Please Confirm ?</label> */}
            <button className="btn btn-sm " onClick={this.handleClose}>Cancel</button>
            <button className="btn btn-sm btn-success" onClick={this.handleSubmit.bind(this)} >Submit</button>
          </Modal.Footer>
        </Modal>
</Navbar>

  //  <div>
  //    {/* <div className="row bg-primary">
  //     <div className="col-md-12 text-center heading ">
  //       <h3 className="reports">{branding}</h3>
  //     </div>
     
  //   </div> */}
  //   {/* <nav className="navbar navbar-expand-sm bgground navbar-dark "> */}
  //   <nav className="navbar navbar-inverse bgground ">
  //   <div className= 'container-fluid'>
  //   <div className="navbar-header">
  //     <button type="button" className="navbar-toggle cusheadbtn" data-toggle="collapse" data-target="#myNavbar">
  //       <span className="icon-bar colhblac"></span>
  //       <span className="icon-bar colhblac"></span>
  //       <span className="icon-bar colhblac"></span>                        
  //     </button>
      
  //   <Link to="/" className="navbar-brand pad">
  //   <img src={require('./AS_Agri_Logo_Website.png')} alt="logo"  className="logo responsive" />
  //   </Link>
  //   </div>

    
  //   {/* <img src = {AS_Agri_Logo_Website} alt="logo"/>  */}
  //         {/* <a className="navbar-brand" href="#">Logo</a> */}
  //         <div className="collapse navbar-collapse" id="myNavbar">
  //         <ul className="nav navbar-nav">
  //         <li>
  //         <Link to="/" className="hncolor  text-dark">
  //             Menu
  //          </Link>
  //          </li>
  //           <li className="nav-item">
  //           <Link to="/SPdashBoard" className=" hncolor text-dark">
  //             Service Providers
  //          </Link>
  //           </li>
  //           <li>
  //           <Link to="/CustdashBoard" className="hncolor text-dark">
  //             Customers
  //          </Link>
  //           </li>
  //         </ul>
  //         </div>
  //       </div>
  //       </nav>
  //   </div>
   
  );
};
}

// Header.defaultProps = {
//   branding: 'My App'
// };

// Header.propTypes = {
//   branding: PropTypes.string.isRequired
// };

export default Header;
