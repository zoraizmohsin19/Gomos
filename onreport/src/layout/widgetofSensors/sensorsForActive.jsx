import PropTypes from 'prop-types';
import React, { Component } from 'react';


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

    return (
        <div className={bgclass} onClick = {this.props.Change}>
        <div className=""><p className= {heading_class_name}>{message}</p>
            <p className= {P_name_class}>{label}</p>
           
            
            </div>
         
            </div>
            
    );
  };

  }

   
  SensorsActive.propTypes = {
    label: PropTypes.string.isRequired,
    P_name_class: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    bgclass: PropTypes.string.isRequired,
    heading_class_name: PropTypes.string.isRequired,
  };
export default SensorsActive