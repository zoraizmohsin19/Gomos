import React , { Component } from 'react';
import PropTypes from 'prop-types'
// import { Link } from 'react-router-dom';
import './Header.css';
import { Link } from 'react-router-dom';
import {Nav, Navbar,NavItem, NavDropdown, Modal} from 'react-bootstrap';


class Header extends Component {
  // const { branding } = props;
  constructor() {
    super();
  this.state = {
    show: false
  };
  this.handleClose = this.handleClose.bind(this);
  this.handleOpen = this.handleOpen.bind(this);
  }
  handleClose() {
    this.setState({ show: false });
  }
  handleOpen() {
    this.setState({ show: true });
  }

  render(){
  let ActiveData = JSON.parse(sessionStorage.getItem("dashboardConfigobj"));
  let data = JSON.parse(sessionStorage.getItem("userDetails"));
//   var  Admin =  data[0].userType ;
  function handleSelect(selectedKey) {
  
    if(selectedKey === 6){
     
      sessionStorage.clear();
    }
    

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

       <Nav pullRight onSelect={handleSelect}>
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
                                <button href="#" disabled className="btn btn-primary btn-block btn-md">Change Password</button>
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
                                <NavItem eventKey={6}  onSelect={handleSelect} >
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
        <Nav pullRight onSelect={handleSelect}>
        <NavItem eventKey={1} >
          <Link to="/NevMenu">Home</Link>
           
          </NavItem>
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
            <tr>
              <td colspan="6"></td>
               <td> <label> &nbsp;&nbsp;&nbsp;&nbsp;Device Name 1 : &nbsp;&nbsp;&nbsp;&nbsp;</label> </td>
              <td colspan="6">  <label className="switch  headersetting">
                <input type="checkbox" value="Text" 
                   />
                <span className="slider round"></span>
              </label>
              </td>
              </tr>
              <tr>
              <td colspan="6"></td>
               <td> <label> &nbsp;&nbsp;&nbsp;&nbsp;Device Name 2 : &nbsp;&nbsp;&nbsp;&nbsp;</label> </td>
              <td colspan="6">  <label className="switch  headersetting">
                <input type="checkbox" value="Text" 
                   />
                <span className="slider round"></span>
              </label>
              </td>
              </tr>
              <tr>
              <td colspan="6"></td>
               <td> <label> &nbsp;&nbsp;&nbsp;&nbsp;Device Name 3 : &nbsp;&nbsp;&nbsp;&nbsp;</label> </td>
              <td colspan="6">  <label className="switch  headersetting">
                <input type="checkbox" value="Text" 
                   />
                <span className="slider round"></span>
              </label>
              </td>
              </tr>
              </tbody>
           </table>
          
          </Modal.Body>
          <Modal.Footer>
            {/* <label className="Mlabel">Action Requested: <u> Switch {(this.state.channelAlerrModel.currentStatus === 1) ? "OFF" : "ON"}</u> And <u>Manual</u> Please Confirm ?</label> */}
            {/* <button className="btn btn-sm " onClick={this.handleClose}>Cancel</button>
            <button className="btn btn-sm btn-success" onClick={this.handleSubmit} >Submit</button> */}
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
