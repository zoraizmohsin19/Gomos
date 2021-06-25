import React, { Component } from 'react';

import './App.css';
 import 'bootstrap/dist/css/bootstrap.min.css'
// import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { HashRouter  as Router, Route, Switch } from 'react-router-dom';
import Login from './Components/Login';
import Menu from './Components/Menu';
import chartcomp from './Components/chartcomp';
import addServiceProvider from './Components/addServiceProvider';
import AddEmployedetails  from './Components/AddEmployedetails';
import EditServiceProvider from './Components/EditServiceProvider';
import EditEmployeeDetails from './Components/EditEmployeeDetails';
import addCustomer from './Components/addCustomer';
import SPdashBoard from './Components/SPdashBoard';
import EMSdashBoard from './Components/EMSdashBoard';
import CustdashBoard from './Components/CustdashBoard';
import viewDashboard from './Components/viewDashboard/viewDashboard';
import AlertReport from './Components/alertReport';
import activeDashbord from './Components/activeDashbord';

import Header from "./layout/Header"
import ClimateTemp from "./Components/ClimateControlTemp/climateControlTemp"
import alertSetup from "./Components/AlertSetupComponent/alertSetup"
import NevMenu from "./Components/NevigationMenu/nevMenu"
import aggregatorScreen from "./Components/AdminScreens/aggregatorScreen"

// import UserList from './Components/List/index';socketdashbord
class App extends Component {
 
 
  render() {
    
    return (
      <Router>
  <div className="App">
        <Header/>
          <Switch>
              <Route exact path="/" component={Login} />
              <Route exact path="/menu" component={Menu} />
              <Route exact path="/AlertReport" component={AlertReport} />
              <Route exact path="/aggregator" component={aggregatorScreen} />
              {/* <Route exact path="/alertSetup" component={alertSetup} /> */}
              {/* <Route exact path= "/climatTemp" component= {ClimateTemp}/>  */}
              <Route exact path="/activeDashbord" component={activeDashbord} />
              <Route exact path="/NevMenu" component={NevMenu} />                            
              {/* <Route exact path="/chartcomp/:data" component = {chartcomp} />     */}
              {/* <Route exact path="/chartcomp" component = {chartcomp} /> */}
              <Route exact path="/addServiceProvider" component = {addServiceProvider} /> 
              <Route exact path="/AddEmployedetails" component = {AddEmployedetails} /> 
              <Route exact path="/addCustomer" component = {addCustomer} /> 
              <Route exact path="/SPdashBoard" component = {SPdashBoard} />
              <Route exact path="/EMSdashBoard" component = {EMSdashBoard} />
              <Route exact path="/CustdashBoard" component = {CustdashBoard} />  
              <Route exact path="/socketdashbord" component = {viewDashboard} />      
              {/* <Route exact path="/UserList" component = {UserList} />    */}
              <Route exact path="/EditServiceProvider/:id/:title" component = {EditServiceProvider} /> 
              <Route exact path="/EditEmployeeDetails/:id/:title" component = {EditEmployeeDetails} /> 
                     
                
          </Switch>
    </div>
    </Router>
    );
  }
}

export default App;
