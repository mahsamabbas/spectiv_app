import React, { Component } from 'react';
import { Link } from 'react-router';
import SearchBar from './../search/SearchBar.jsx';

class LoadingNavOptions extends Component {
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
            <img alt="Spectiv Logo" src="/static/images/alpha.svg" />
          </Link>
        </div>
        <div className="navbar-center">
          <SearchBar />
        </div>
        <div className="navbar-right">
          <img src="/static/images/animationLoadingWhite.svg" alt="Loading Animation" />
        </div>
      </nav>
    );
  }
}

export default LoadingNavOptions;
