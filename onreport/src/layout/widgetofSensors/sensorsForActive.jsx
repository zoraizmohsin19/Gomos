import PropTypes from 'prop-types';
import React, { Component } from 'react';
import  manual  from '../MANUAL.svg'
import  auto  from '../automatic.svg'

class SensorsActive extends Component {
  render(){
    const{
    label,
    P_name_class,
    message,
    bgclass,
    fotter_class,
    iconclass,
    heading_class_name,
    div_icon_class,
    dateTime,
    takenClass
    } = this.props
    // error
    var temp = null;
    if(iconclass !== null && iconclass !== undefined ){
      var icon ;
if(iconclass == 0){
icon = manual
}else if(iconclass == 1)
{
  icon = auto
}
  temp =<span > <img src ={icon}  className={div_icon_class} alt="M"/>
            </span>;

}else{
  temp = null;
} 
  return (
        <div className={bgclass}  onClick = {this.props.Change}>

        <div className="">
        <p className= {heading_class_name}>
        {temp}
          
        {message}</p>
            <p className= {P_name_class}>{label}</p>
            <p className= {takenClass}>{dateTime}</p>
           
            </div>
         
            </div>
            
    );
  };

  }

   
  SensorsActive.propTypes = {
    label: PropTypes.string.isRequired,
    P_name_class: PropTypes.string.isRequired,
  
    bgclass: PropTypes.string.isRequired,
    heading_class_name: PropTypes.string.isRequired,
  };
export default SensorsActive