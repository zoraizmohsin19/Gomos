import React from 'react';
import {connect} from 'react-redux';
import { withRouter } from 'react-router';
import {Link} from "react-router-dom";

import {me as CurrentUser,logout} from "../../../../actions/useraction";

class ProfileDropdown extends React.Component {

    constructor(props){
        super(props);
        this.state   =  {
            'current_user':null
        };

        this.logout     =   this.logout.bind(this);
        this.init     =   this.init.bind(this);
    }

    componentWillMount(){ 
       this.init();
    }
    
    init(){
        var me      =   this;
        CurrentUser(true).then((user)=>{
            me.setState({'current_user':user});
        }); 
    }

    logout(){
        logout().then(()=>{
            window.location.reload();
        })
    }


    render() {
        

        var user    =   this.props.currentUser.user;
        if(user == null){
            return null;
        }
        
        return (
            <li className="dropdown user user-menu">
                <a href="#" className="dropdown-toggle" data-toggle="dropdown">
                    <img src="/images/default_user.png" className="user-image" alt="User Image" />
                    <span className="hidden-xs">{ user.name }</span>
                </a>
                <ul className="dropdown-menu">
                    <li className="user-header">
                        <img src="/images/default_user.png" className="img-circle" alt="User Image" />
                        <p>
                        { user.name }
                        </p>
                    </li>
                    <li className="user-footer">
                        <div className="pull-left">
                        <Link to={'/app/myprofile'} className="btn btn-default btn-flat">Profile</Link>
                        </div>
                        <div className="pull-right">
                        <a href="javascript:void(0)" onClick={this.logout} className="btn btn-default btn-flat">Sign out</a>
                        </div>
                    </li>
                </ul>
            </li>
        );
    }

}

export default withRouter(connect(function(store){
    return {
        currentUser:store.currentUser
    };
})(ProfileDropdown))