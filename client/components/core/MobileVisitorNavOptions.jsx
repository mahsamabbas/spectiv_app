import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';

import SearchBar from './../search/SearchBar.jsx';

class MobileVisitorNavOptions extends Component {
  constructor(props) {
    super(props);

    this.showSearch = this.showSearch.bind(this);
    this.hideSearch = this.hideSearch.bind(this);

    this.state = {
      isSearchOpen: false,
    };
  }

  setPrevAuthRoute(route) {
    sessionStorage.setItem('prevAuthRoute', route);
  }

  windowDirectTo(route) {
    this.setPrevAuthRoute(window.location);
    window.location = route;
  }

  showSearch() {
    this.setState({
      isSearchOpen: true,
    });
  }

  hideSearch() {
    this.setState({
      isSearchOpen: false,
    });
  }

  rightNav() {
    if (this.props.loading) {
      return <img src="/static/images/animationLoadingWhite.svg" alt="Loading Animation" />;
    }

    return (
      <ul className="general-options remove-marg">
        <li>
          <a className="account-nav-item" href="/login">
            <span>Login</span>
          </a>
          <a className="account-nav-item" href="/sign-up">
            <span>Sign Up</span>
          </a>
        </li>
      </ul>
    );
  }

  renderContent() {
    if (this.state.isSearchOpen) {
      return (
        <nav className="navbar-mobile">
          <button className="back-btn" onClick={this.hideSearch}>
            <img alt="Back Icon" src="/static/images/left-arrow-white.svg" />
          </button>
          <SearchBar />
        </nav>
      );
    }
    return (
      <nav className="navbar-mobile">
        <div className="navbar-left">
          <Link className="logo-home" to={'/'} >
            <img alt="Spectiv Eye" src="/static/images/spectiv-eye.png" />
          </Link>
        </div>
        <div className="navbar-right visitor">
          <ul className="general-options">
            <li>
              <Link to={'/alpha-info'}><img alt="Upload Icon" src="/static/images/videopage_info_another.svg" /></Link>
            </li>
            <li>
              <button onClick={this.showSearch}>
                <img alt="Search Button" src="/static/images/videopage_search.svg" />
              </button>
            </li>
          </ul>
          { this.rightNav() }
        </div>
      </nav>
    );
  }

  render() {
    return this.renderContent();
  }
}

export default MobileVisitorNavOptions;
