import React from 'react';

import {FormControl,FormGroup,InputGroup,Button} from 'react-bootstrap';

// import "./style.scss";

class SearchInput extends React.Component {
    
    constructor(props){
        super(props);
        this.handleEnter   =   this.handleEnter.bind(this);
        this.onSearch   =   this.onSearch.bind(this);
        this.onChange   =   this.onChange.bind(this);
    }

    onSearch(event){
        var value   =   event.target.value;
        if(this.props.onSubmit != undefined){
            this.props.onSubmit();
        }
    }

    onChange(event){
        var value   =   event.target.value;
        if(this.props.onChange != undefined){
            this.props.onChange(value);
        }
    }

    handleEnter(event){
        if (event.key === 'Enter') {
            if(this.props.onSubmit != undefined){
                this.props.onSubmit();
            }
        }
    }


    render() {
        var placeholder     =   "";
        if(this.props.placeholder != undefined){
            placeholder     = this.props.placeholder
        }
        var value       =   "";
        if(this.props.value != undefined){
            value     = this.props.value
        }
        return (
            <FormGroup className='searchInput col-sm-12 '>
                <InputGroup>
                    <FormControl type="text" placeholder={placeholder} value={value} onChange={this.onChange} onKeyPress={this.handleEnter}/>
                    <InputGroup.Button>
                        <Button className="form-control btn  btn-primary" onClick={this.onSearch}><i className='fa fa-search'></i> Search</Button>
                    </InputGroup.Button>
                </InputGroup>
            </FormGroup>
        );
    }

}

export default SearchInput;