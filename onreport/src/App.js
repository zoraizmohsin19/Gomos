import React, { Component } from 'react';

import './App.css';
 import 'bootstrap/dist/css/bootstrap.min.css'
// import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { HashRouter  as Router, Route, Switch } from 'react-router-dom';
import Login from './Components/Login';
import Menu from './Components/Menu';
import chartcomp from './Components/chartcomp';
import addServiceProvider from './Components/addServiceProvider';
import EditServiceProvider from './Components/EditServiceProvider';
import addCustomer from './Components/addCustomer';

import SPdashBoard from './Components/SPdashBoard';
import CustdashBoard from './Components/CustdashBoard';
import socketdashbord from './Components/socketdashbord';
import AlertReport from './Components/alertReport';
import activeDashbord from './Components/activeDashbord';
import soketdemo from './Components/soketdemo';
import Header from "./layout/Header"
import alertSetup from "./Components/AlertSetupComponent/alertSetup"
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
              <Route exact path="/alertSetup" component={alertSetup} />
              <Route exact path="/activeDashbord" component={activeDashbord} />
              {/* <Route exact path="/chartcomp/:data" component = {chartcomp} />     */}
              <Route exact path="/chartcomp" component = {chartcomp} />
              <Route exact path="/addServiceProvider" component = {addServiceProvider} /> 
              <Route exact path="/addCustomer" component = {addCustomer} /> 
              <Route exact path="/SPdashBoard" component = {SPdashBoard} />
              <Route exact path="/CustdashBoard" component = {CustdashBoard} />  
              <Route exact path="/soketdemo" component = {soketdemo} /> 
              <Route exact path="/socketdashbord" component = {socketdashbord} />      
              {/* <Route exact path="/UserList" component = {UserList} />    */}
              <Route exact path="/EditServiceProvider/:id/:title" component = {EditServiceProvider} /> 
                     
                
          </Switch>
    </div>
    </Router>
    );
  }
}

export default App;
