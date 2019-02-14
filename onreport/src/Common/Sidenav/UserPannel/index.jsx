import React from 'react';
import {connect} from 'react-redux';
import { withRouter } from 'react-router';
import {me as CurrentUser} from "../../../../actions/useraction";

class UserPannel extends React.Component {

    constructor(props){
        super(props);
    }

    componentWillMount(){
    }
    
    render() {

        var user    =   this.props.currentUser.user;

        if(user == null){
            return null;
        }
        
        var role_id     =   parseInt(user.user_type+'');

        var user_role   =   "";
        
        if(role_id == 1){
            user_role   =   "Admin";
        } else if(role_id == 2){
            user_role   =   "Admin";
        } else {
            user_role   =   "Bid Team";
        }

        return (
            <div className="user-panel">
                <div className="pull-left image">
                    <img src="/images/default_user.png" className="img-circle" alt="User Image" />
                </div>
                <div className="pull-left info">
                    <p>{ user.name }</p>
                    <a href="javascript:void(0)"><i className="fa fa-circle text-success"></i> { user_role }</a>
                </div>
            </div>
        );
    }

}

export default withRouter(connect(function(store){
    return {
        currentUser:store.currentUser
    };
})(UserPannel))