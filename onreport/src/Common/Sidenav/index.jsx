import React from 'react';
import {connect} from 'react-redux';
import { withRouter } from 'react-router';
import {Link} from 'react-router-dom';

import UserPannel from "./UserPannel/index.jsx";

class Sidenav extends React.Component {
    componentWillMount(){
    }
    render() {

        var menus        =   [];

        menus.push({
            'link':"/app/devices",
            'label':'Devices',
            'icon':'fa fa-mobile'
        });

        menus.push({
            'link':"/app/admin-user/list",
            'label':'Admin Users',
            'icon':'fa fa-user'
        });


        return (
            <aside className="main-sidebar">
                <section className="sidebar">
                    <UserPannel />
                    <ul className="sidebar-menu" data-widget="tree">
                        <li className="header">MAIN NAVIGATION</li>
                        {
                            menus.map((menu,k)=>{
                                return  <li key={k}>
                                            <Link to={menu.link}>
                                                <i className={menu.icon}></i> <span>{menu.label}</span>
                                            </Link>
                                        </li>;
                            })
                        }
                    </ul>
                </section>
            </aside>
        );
    }

}

export default withRouter(connect(function(store){
    return {
    };
})(Sidenav))