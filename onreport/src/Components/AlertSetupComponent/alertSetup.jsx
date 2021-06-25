import React, { Component } from 'react'
import axios from "axios";
import {DropdownButton,MenuItem,Button, Table} from 'react-bootstrap';

import "./alertSetup.css"
class alertSetup extends Component {
  constructor(){
    super();
    this.state={
      inputField :[]
    }
  }


  add(){
    this.setState({ inputField: [...this.state.inputField, ""]})

  }
  remove(index){
this.state.inputField.splice(index,1);
console.log(index);
console.log(this.state.inputField)
this.setState({inputField: this.state.inputField})
  }
  render() {
    var Operator = ["==", "!=", "> ", "<", ">=", "<="];
    var Logicalop = ["&&","||"];
    var businessnNM = ["Heat1","Humidity", "Temperature","Relative_Humidity","Luminescence", "Rain_Sensor" ]
   var payloadId = ["PayloadId1", "PayloadId2", "PayloadId3","PayloadId4"];
   var typeofComponent = ["range","inputfield","OnOFF"];
    return (
      <div className ="container ">
      <div className="row">
      <div className = "col-sm-6">
<div className= "col-sm-12"> 
<select className="alertPayloadcustm">
        {payloadId.map((item,i) =>
          <option key ={i}> {item} </option>
          )}
      </select>

 </div>
 <div className= "col-sm-12"> 
<select className="alertbsName">
        {businessnNM.map((item,i) =>
          <option key ={i}> {item} </option>
          )}
      </select>
      <select className="alertbsName ">
        {typeofComponent.map((item,i) =>
          <option key ={i}> {item} </option>
          )}
      </select>

 </div>
{this.state.inputField.map((data,index)=>
  <div key= {index}  className= "alertSDiv">

  {/* <div class="slidecontainer">
  <input type="range" min="1" max="100" value="50" class="slider" id="myRange"/>
  <p>Value: <span id="demo"></span></p>
</div> */}
      <select className= "ADInput">
        {businessnNM.map((item,i) =>
          <option key ={i}> {item} </option>
          )}
      </select>
      <input type= "text" className= "AlInput"/>
  <select className= "ADInput">
    {Operator.map((item,i) =>
      <option key ={i}> {item} </option>
      )}
  </select>
  <input type= "text" className= "AlInput"/>
  <select className= "ADInput">
    {Logicalop.map((item,i) =>
      <option key ={i}> {item} </option>
      )}
  </select >
  <select className= "ADInput">
        {businessnNM.map((item,i) =>
          <option key ={i}> {item} </option>
          )}
      </select>
      <input type= "text" className= "AlInput"/>
  <select className= "ADInput">
    {Operator.map((item,i) =>
      <option key ={i}> {item} </option>
      )}
  </select>
  <input type= "text" className= "AlInput"/>
  <button onClick= {()=> this.remove(index)}>Remove</button>
      </div> )}
    
      <button onClick= {this.add.bind(this)}>Add More </button>
      </div>
      <div className = "col-sm-6">
      <div className="">
      <p className ="ActiveP">Active Alert </p>
      <div  className="table-responsive">
                            <Table  className="table table-hover table-sm table-bordered">
                            <thead className='' style={{background: "gainsboro"}}>
                            <tr>
                            <th className=' Acustmtd'> SI</th>
                            <th className='Acustmtd Apadh '>Channel</th>
                            <th className='Acustmtd '>Action</th>
                            <th className='Acustmtd'>Values</th>
                            <th className='Acustmtd '>isDailyJob</th>
                            </tr>
                            </thead>
                            <tbody>
                            {businessnNM.map((itme, i) =>
                        <tr>
                        <td className='Acustmtd '>{i+ 1}</td>
                        <td className='Acustmtd '>{itme}</td>
                        <td className='Acustmtd '>{itme}</td>
                        <td className='Acustmtd '>{itme}</td>
                        <td className='Acustmtd '>{(itme)?"Yes":"NO"}</td>
                        </tr>
                        )

                        }
                            </tbody> 
                            </Table>
                    </div> 
      </div>
      
      </div>
      </div>
      </div>
    )
  }
}
export default alertSetup;
