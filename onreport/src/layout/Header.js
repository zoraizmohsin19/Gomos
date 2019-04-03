import React from 'react';
import PropTypes from 'prop-types'
// import { Link } from 'react-router-dom';
import './Header.css';
import { Link } from 'react-router-dom';
import {Nav, Navbar,NavItem, NavDropdown, MenuItem} from 'react-bootstrap';



const Header = props => {
  const { branding } = props;
  var ActiveData = JSON.parse(sessionStorage.getItem("dashboardConfigobj"));
  var data = JSON.parse(sessionStorage.getItem("userDetails"));
//   var  Admin =  data[0].userType ;
  function handleSelect(selectedKey) {
  
    if(`${selectedKey}` == 3){
     
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
        <NavDropdown eventKey={3} title={ "Hello"+" "+ data[0].userFN } id="basic-nav-dropdown">
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
                                <a href="#" disabled className="btn btn-primary btn-block btn-md">Change Password</a>
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
                                <NavItem eventKey={3}  onSelect={handleSelect} >
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
          <Link to="/socketdashbord">Dashboard</Link>
           
          </NavItem>
          <NavItem eventKey={1} >
          <Link to="/SPdashBoard">Service Providers</Link>
           
          </NavItem>
          <NavItem eventKey={2} >
          <Link to="/CustdashBoard">Customers</Link>
          </NavItem>
          {/* <NavItem eventKey={3} >
          <Link to="/"><i className ="fas fa-sign-out-alt"></i> Log out</Link>
          
          </NavItem> */}
          </Nav>)
        : null}
    
       
  </Navbar.Collapse>) : null}
 
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

Header.defaultProps = {
  branding: 'My App'
};

Header.propTypes = {
  branding: PropTypes.string.isRequired
};

export default Header;
