import React from 'react';
import PropTypes from 'prop-types';
// import classnames from 'classnames';

const TextInputGroup = ({
  label,

  name_input_class,
  value,
  placeholder,
  name_error,
  onChange,
  type,
  name,
  id,
  disabledvalue
  
  // error
}) => {
  return (
    <div className={name_input_class}>
    <label>{label}</label>
    <input disabled ={disabledvalue} className="form-control" id={id} name={name} type={type} tabIndex={1} placeholder={placeholder} value={value} onChange={onChange} tabIndex={1}/>
    {name_error.length != 0 && <div className=' text-danger'>{name_error}</div>}
</div>
  );
};

TextInputGroup.propTypes = {
  label: PropTypes.string.isRequired,
  name_input_class: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  name_error: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  // error: PropTypes.string
  type:PropTypes.string.isRequired,
  name:PropTypes.string.isRequired,
  
};

TextInputGroup.defaultProps = {
  type: 'text'
};

export default TextInputGroup;
