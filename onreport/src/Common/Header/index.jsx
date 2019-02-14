import React from 'react';
import {connect} from 'react-redux';
import { withRouter } from 'react-router';

import Logo from "../Logo/index.jsx";
import ProfileDropdown from "./ProfileDropdown/index.jsx";

import "./style.scss";

class Header extends React.Component {
    componentWillMount(){
    }
    render() {
        return (
            <header className="main-header">
                <a href="#" className="logo">
                    <Logo />
                </a>
                <nav className="navbar navbar-static-top">
                    <a href="#" className="sidebar-toggle" data-toggle="push-menu" role="button">
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                    </a>
                    <div className="navbar-custom-menu">
                        <ul className="nav navbar-nav">
                        <ProfileDropdown />
                            
                        </ul>
                    </div>
                </nav>
            </header>
        );
    }

}

export default withRouter(connect(function(store){
    return {
    };
})(Header))