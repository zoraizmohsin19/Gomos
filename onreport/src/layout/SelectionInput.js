// import React from 'react';
import PropTypes from 'prop-types';
import './SelectionInput.css';
import React, { Component } from 'react';


class SelectionInput extends Component {
// const SelectionInput = ({
//    props
//   }) => {
    state = {
      name : ["vidzai" , "takreem", "sharik"],
    }
    // handleChange(e){

    //   alert(e.target.value)
    //   var value1 = e.target.value
    //   this.props.Change(value1)
      
    // }
  render(){
    const {  label,namefor,names ,defaultDisabled,defaultLabel } = this.props;  
    
    
    if(names == undefined || names == null){
      return null

      }
    return (  
    

            <div className ="form-group ">
            {/* <label className="labelcl" htmlFor={namefor}>{label}</label> */}
                    <select  value={this.props.label} onChange={this.props.Change} className="form-control selectcolor"  disabled={defaultDisabled ? true : null}  id={namefor}>
                   
                    {names.map( n => 
                      <option className="selectcolor " value={n}>{n}</option>)}
                    {/* <option disabled selected value> {label}  </option> */}
                    </select>
            </div>


    );
  };
}
  
  SelectionInput.propTypes = {
    label: PropTypes.string.isRequired,
    namefor: PropTypes.string.isRequired,
    names : PropTypes.array.isRequired,
   
    Change : PropTypes.func.isRequired,
  
   
  };
  
  SelectionInput.defaultProps = {
    type: 'text'
  };
  
  export default SelectionInput;
  