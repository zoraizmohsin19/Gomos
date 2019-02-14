import React, { Component } from 'react'
import "./activeDashbord.css"
import {Table,DropdownButton,MenuItem,Button,Modal} from 'react-bootstrap';
import SensorsActive from "../layout/widgetofSensors/sensorsForActive";
import axios from "axios";

class activeDashbord extends Component {
    constructor(){
      super();
      this.state={
        channelName: ["WSTPump","NutrientPump","IrrigPump","BorePump","RO","O2"],
        actionType: ["Instruction","Schedule"],
        selectedChannel: '',
        selectedAtionType: '',
        show: false,
        open: false,
        scheduleInput: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]
      }
      this.handleChange = this.handleChange.bind(this);
      this.handleChange1 = this.handleChange1.bind(this);
      this.handleShow = this.handleShow.bind(this);
      this.handleClose = this.handleClose.bind(this);
    }
    handleClose() {
        this.setState({ show: false });
      }
      handleShow() {
        this.setState({ show: true });
      }
    handleChange(value){
      alert(value);
      this.setState({ selectedAtionType: value});
    }
    handleChange1(value){
        alert(value);
       this.setState({ selectedChannel: value});
            }
            toggle() {
                this.setState({
                  open: !this.state.open
                });
            }
    render() {
var  inputField = null;
  if(this.state.selectedAtionType == "Instruction"){
   inputField = <div><div class="form-group">
     <label class="control-label col-sm-2" for="ON">ON Time:</label>
     <div class="col-sm-10">
       <input type="text" class="form-control widthActive" id="ON" placeholder="ON Time"/>
     </div>
   </div>
   <div class="form-group">
     <label class="control-label col-sm-2" for="OFF">OFF Time:</label>
     <div class="col-sm-10"> 
       <input type="text" class="form-control widthActive" id="OFF" placeholder="OFF Time"/>
     </div>
   </div>
   </div>;
  }
  if(this.state.selectedAtionType =="Schedule" ){
inputField = <div className = "ActiveTableH">
<div  className="table-responsive">
    <Table  className="table table-hover table-sm table-bordered ">
    <thead className=''>
    <tr>
    
    <th className='text-center '>CronJob Name</th>
    <th className='text-center '>ON Time</th>
    <th className='text-center '>OFF Time</th>
    </tr>
    </thead>
    <tbody >
    {this.state.scheduleInput.map(item => 
         <tr>
         <td className=' '>CronJob {item}</td>
         <td className=' '> <input type="text" class="form-control ActiveTIC " id="OFF" placeholder="OFF Time"/></td>
         <td className=' '> <input type="text" class="form-control ActiveTIC" id="OFF" placeholder="OFF Time"/></td>
         </tr>
         )}
   
    </tbody> 
    </Table>
</div> 
</div>;
  }


        return(
<div className ="container-fluid ">
   <div className="row">
   <div className= "col-lg-12">
 <button className= ''  onClick={this.toggle.bind(this)}><i className= { (this.state.open ? "fas fa-caret-up": "fas fa-caret-down")}></i></button>

       <div className ={"ActiveSensorsRow collapse" + (this.state.open ? ' in' : '')}>
       <div className="col-lg-1 col-xs-1 "></div>
        { [{value:9000, sensors: "TotalDissolvedSolid"},
        {value:3, sensors: "WaterLevel"},
        {value:2, sensors: "WaterSensor"}
        ,{value:1, sensors: "ROValve"},
        {value:1, sensors: "IrrigationPump"},
        {value:10, sensors: "AckIntervalSN"},
        {value:50, sensors: "SoilMoisture"},
        {value:10, sensors: "RainSensor"},
        {value:60, sensors: "Soiltemperature"},
        {value:700, sensors: "luminescence"}].map(item =><div className="col-lg-1 col-xs-1 "> 
         <SensorsActive 
             bgclass="small-boxDActive "
            label= {item.sensors} 
            takenClass= ""
            P_name_class= "ActivePclass" 
            heading_class_name=" ActiveSheading"
            message={item.value}
           
         />
         </div>
         )}
           <div className="col-lg-1 col-xs-1 "></div>
        </div>
        </div>

 <div className = 'col-lg-12 col-sm-12'>
 
 <p className= "line3"></p></div>
      <div className="col-lg-6">
        <div className= ""  id="containersimg">
        <div className =""  id="wrapper">
        { [{value:"ON", sensors: "WSTPump"},
        {value:"OFF", sensors: "NutrientPump"},
        {value:"ON", sensors: "IrrigPump"}
        ,{value:"OFF", sensors: "BorePump"},
        {value:"OFF", sensors: "RO"},
        {value: "ON", sensors:"O2"}
            ].map(item =>  <span className="square "> 
         <SensorsActive 
             bgclass="small-boxDActive"
            label= {item.sensors} 
            takenClass= ""
            P_name_class= "ActivePclass" 
            heading_class_name=" ActiveSheading"
            message={item.value}
           
         />
         </span>
         )}
        </div>
        </div>
        <div className= "col-lg-12"> 
        <div className= "">
        <span className="dropDown"> 
        <label>Channel Setup :</label>
               <DropdownButton onSelect={this.handleChange1}
                bsStyle={"primary"}
                title={this.state.selectedChannel}>
                {this.state.channelName.map( (item) =>
                <MenuItem eventKey={item}>{item}</MenuItem>

                )}
                
                </DropdownButton>
       </span>
       <span className="dropDown">
       <label>Action Type :</label>
               <DropdownButton   onSelect={this.handleChange}
             
                bsStyle={"primary"}
                title={this.state.selectedAtionType}>
                 {this.state.actionType.map( (item) =>
                <MenuItem eventKey={item}>{item}</MenuItem>

                )}
                </DropdownButton>
       </span>
       <form class="form-horizontal">
      {inputField}

      <div class="form-group"> 
     <div class="col-sm-offset-2 col-sm-10">
       <button type="submit" class="btn btn-default">Submit</button>
     </div>
      </div>
      </form>
     </div>

        </div>
        
        </div>
    <div className="col-lg-6">
            <div className= "col-lg-12">
                <div className ="tableactuter">
                <p className ="ActiveP">Sent Command</p>
                    <div  className="table-responsive">
                        <Table  className="table table-hover table-sm table-bordered cust">
                        <thead className='' style={{background: "gainsboro"}}>
                        <tr>
                        <th className='text-center '> SI</th>
                        <th className='text-center '>Channel</th>
                        <th className='text-center '>Start Date Time</th>
                        <th className='text-center '>End Date Time</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                        <td className='text-center '> 1</td>
                        <td className='text-center '>WSTPump</td>
                        <td className='text-center '>30.00.00.*.*.*</td>
                        <td className='text-center '> 40.00.00.*.*.*</td>
                        </tr>
                        <tr>
                        <td className='text-center '> 2</td>
                        <td className='text-center '>IrrigationPump</td>
                        <td className='text-center '>30.00.00.*.*.*</td>
                        <td className='text-center '> 40.00.00.*.*.*</td>
                        </tr>
                        </tbody> 
                        </Table>
                    </div> 
                </div>
                <div className ="">
                 <div>
                 <select   className="form-control ActiveSelection">
                    <option className="selectcolor" >WaterLevel</option>
                     <option className="selectcolor" >NutrientPump</option>
                     <option className="selectcolor" >BorePump</option>
                   
                   </select>
                   <select   className="form-control ActiveSelection">
                    <option className="selectcolor" >WaterLevel</option>
                     <option className="selectcolor" >NutrientPump</option>
                     <option className="selectcolor" >BorePump</option>
                   
                   </select>
                   <ul class="pagerActive">
                    <li><a href= '/AlertReport' >Prev</a></li>
                    <li className='ActiveList'>4 hrs</li>
                    <li><a href= '/'>Next</a></li>
                    </ul>
                 </div>
                <p className ="ActiveP">Active Command </p>
                    <div  className="table-responsive">
                            <Table  className="table table-hover table-sm table-bordered cust">
                            <thead className='' style={{background: "gainsboro"}}>
                            <tr>
                            <th className='text-center '> SI</th>
                            <th className='text-center '>Channel</th>
                            <th className='text-center '>Action</th>
                            <th className='text-center '>Date</th>
                            <th className='text-center '>Time</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                            <td className='text-center '> 1</td>
                            <td className='text-center '>WSTPump</td>
                            <td className='text-center '>Instruction</td>
                            <td className='text-center '>18/01/2019</td>
                            <td className='text-center '> 03:07 PM</td>
                            </tr>
                            <tr>
                            <td className='text-center '> 2</td>
                            <td className='text-center '>IrrigationPump</td>
                            <td className='text-center '>Schedule</td>
                            <td className='text-center '>18/01/2019</td>
                            <td className='text-center '> 03:07 PM</td>
                           </tr>
                           <tr>
                            <td className='text-center '> 3</td>
                            <td className='text-center '>BorePump</td>
                            <td className='text-center '>Schedule</td>
                            <td className='text-center '>18/01/2019</td>
                            <td className='text-center '> 03:07 PM</td>
                           </tr>
                            </tbody> 
                            </Table>
                    </div> 
                </div>
              <div className= "" align = "right"> 
              <a  onClick={this.handleShow}>
          Launch
        </a></div>
             
        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title></Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <div className ="tableactuter">
                <p className ="ActiveP">Active Command </p>
                    <div  className="table-responsive">
                            <Table  className="table table-hover table-sm table-bordered cust">
                            <thead className='' style={{background: "gainsboro"}}>
                            <tr>
                            <th className='text-center '> SI</th>
                            <th className='text-center '>Channel</th>
                            <th className='text-center '>Action</th>
                            <th className='text-center '>Date</th>
                            <th className='text-center '>Time</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                            <td className='text-center '> 1</td>
                            <td className='text-center '>WSTPump</td>
                            <td className='text-center '>Instruction</td>
                            <td className='text-center '>18/01/2019</td>
                            <td className='text-center '> 03:07 PM</td>
                            </tr>
                            <tr>
                            <td className='text-center '> 2</td>
                            <td className='text-center '>IrrigationPump</td>
                            <td className='text-center '>Schedule</td>
                            <td className='text-center '>18/01/2019</td>
                            <td className='text-center '> 03:07 PM</td>
                           </tr>
                           <tr>
                            <td className='text-center '> 3</td>
                            <td className='text-center '>BorePump</td>
                            <td className='text-center '>Schedule</td>
                            <td className='text-center '>18/01/2019</td>
                            <td className='text-center '> 03:07 PM</td>
                           </tr>
                            </tbody> 
                            </Table>
                    </div> 
                </div>


          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>
            </div>
                
        </div>
    </div>
</div>
    )
}
}
export default activeDashbord;