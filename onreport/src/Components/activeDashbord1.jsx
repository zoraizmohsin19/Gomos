import React, { Component } from 'react'
import "./activeDashbord.css"
import {Table,DropdownButton,MenuItem} from 'react-bootstrap';
import SensorsActive from "../layout/widgetofSensors/sensorsForActive";
import axios from "axios";

class activeDashbord extends Component {
    constructor(){
      super();
      this.state={}
    }
    render() {
        return(
<div className ="container-fluid ">
   <div className="row">
      <div className="col-lg-6">
        <div className= "col-lg-12">
        <div className= "sensorname">
       <div className ="ActiveSensorsRow">
        { ["1","2","3","4","5","6","7","8","9","10"].map(item =>  <div className="col-lg-3 col-xs-3 ActiveScol"> 
         <SensorsActive 
             bgclass="small-boxDActive bg-red"
            label= "Not Available" 
            takenClass= "takenclass"
            P_name_class= "color12 " 
            heading_class_name=" colorDActive"
            message="NA"
           
         />
         </div>
         )}
            </div>
        </div>
        </div>
        <div className= "col-lg-12"> 
        <div className= "sensorname">
        { ["1","2","3","4","5","6","7","8","9","10"].map(item =><span className="dropDown"> <DropdownButton
                bsStyle={"primary"}
                title={"Pump"+ item}>
                <MenuItem eventKey="1">ON</MenuItem>
                <MenuItem eventKey="2">OFF</MenuItem>
                </DropdownButton>
                </span>
        )}
        </div>
        </div>
        <div className= "leftActiveButtons" align="center">
        <button className= "btn btn-lg btn-success ActvieBtn">Start</button>
        <button className= " btn-lg btn btn-warning ActvieBtn">Exist</button>
        </div>
        </div>
    <div className="col-lg-6">
            <div className= "col-lg-12">
                <div className ="tableactuter">Sent Command
                    <div  className="table-responsive">
                        <Table  className="table table-hover table-sm table-bordered cust">
                        <thead className='bg' style={{background: "gainsboro"}}>
                        <tr>
                        <th className='text-center '> SI</th>
                        <th className='text-center '>Channel</th>
                        <th className='text-center '>Start Date Time</th>
                        <th className='text-center '>End Date Time</th>
                        </tr>
                        </thead>
                        <tbody>
                        </tbody> 
                        </Table>
                    </div> 
                </div>
                <div className ="tableactuter">Active Command
                    <div  className="table-responsive">
                            <Table  className="table table-hover table-sm table-bordered cust">
                            <thead className='bg' style={{background: "gainsboro"}}>
                            <tr>
                            <th className='text-center '> SI</th>
                            <th className='text-center '>Channel</th>
                            <th className='text-center '>Start Date Time</th>
                            <th className='text-center '>End Date Time</th>
                            </tr>
                            </thead>
                            <tbody>
                            </tbody> 
                            </Table>
                    </div> 
                </div>
                <div className ="tableactuter">Exeeded Command
                        <div  className="table-responsive">
                            <Table  className="table table-hover table-sm table-bordered cust">
                            <thead className='bg' style={{background: "gainsboro"}}>
                            <tr>
                            <th className='text-center '> SI</th>
                            <th className='text-center '>Channel</th>
                            <th className='text-center '>Start Date Time</th>
                            <th className='text-center '>End Date Time</th>
                            </tr>
                            </thead>
                            <tbody>
                            </tbody> 
                            </Table>
                        </div> 
                </div>
            </div>
                
        </div>
    </div>
</div>
    )
}
}
export default activeDashbord;