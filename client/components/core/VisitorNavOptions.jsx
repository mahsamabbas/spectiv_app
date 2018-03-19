import React, { Component } from 'react';
import { Link } from 'react-router';

import SearchBar from './../search/SearchBar.jsx';

class VisitorNavOptions extends Component {
  setPrevAuthRoute(route) {
    sessionStorage.setItem('prevAuthRoute', route);
  }

  windowDirectTo(route) {
    this.setPrevAuthRoute(window.location);
    window.location = route;
  }

  render() {
    return (
      <nav className="navbar">
        <div className="navbar-left">
          { /* <div className="navbar-menu-wrapper">
            <img alt="Menu Icon" src="/static/images/videopage_hamburger.svg" />
          </div> */ }
          <Link className="logo-home" to={'/'} >
            <img alt="Spectiv Eye" src="/static/images/spectiv-eye.png" />
            <img alt="Spectiv Logo" src="/static/images/alpha_white.svg" />
          </Link>
        </div>
        <div className="navbar-center">
          <SearchBar />
        </div>
        <div className="navbar-right">
          <ul className="general-options">
            <li>
              <Link to={'/alpha-info'}><img alt="Upload Icon" src="/static/images/videopage_info_another.svg" /></Link>
            </li>
            <li>
              <a className="account-nav-item" href="/sign-up">
                <span>Sign Up</span>
              </a>
            </li>
            <li>
              <a className="account-nav-item" href="/login">
                <span>Login</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

export default VisitorNavOptions;
