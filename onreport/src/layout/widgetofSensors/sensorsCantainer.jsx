import PropTypes from 'prop-types';
import React, { Component } from 'react';


class Sensors extends Component {
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
        <div className="inner"><h3 className= {heading_class_name}>{message}</h3>
            <p className= {P_name_class}>{label}</p>
            <p className= {takenClass}>Last Taken At: {dateTime} </p>
            
            </div>
            <div className={div_icon_class}><i className={iconclass}></i>
            </div>
            <a href="javascript:void(0)" className= {fotter_class}>&nbsp;</a>
            </div>
            
    );
  };

  }

   
  Sensors.propTypes = {
    label: PropTypes.string.isRequired,
    P_name_class: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    bgclass: PropTypes.string.isRequired,
    fotter_class: PropTypes.string.isRequired,
    iconclass: PropTypes.string.isRequired,
    div_icon_class: PropTypes.string.isRequired,
    heading_class_name: PropTypes.string.isRequired,
  };
export default Sensors