import React, { Component } from 'react';
import axios from 'axios';
import { browserHistory, Link } from 'react-router';

import NotShitDropDown from './../general/NotShitDropDown.jsx';
import NoAvatar from './../general/NoAvatar.jsx';
import Avatar from './../general/Avatar.jsx';
import SearchBar from './../search/SearchBar.jsx';

class UserNavOptions extends Component {
  constructor(props) {
    super(props);

    this.toggleAccountNav = this.toggleAccountNav.bind(this);
    this.openAccountNav = this.openAccountNav.bind(this);
    this.closeAccountNav = this.closeAccountNav.bind(this);
    this.decideFunc = this.decideFunc.bind(this);

    this.state = {
      isAccountNavOpen: false,
      approveLoading: false,
    };
  }


  getChannelLink() {
    const { name } = this.props.account.channel;
    if (name) {
      return `/${name}`;
    }

    return '';
  }

  toggleAccountNav() {
    this.setState({
      isAccountNavOpen: !this.state.isAccountNavOpen,
    });
  }

  openAccountNav() {
    this.setState({
      isAccountNavOpen: true,
    });
  }

  closeAccountNav() {
    this.setState({
      isAccountNavOpen: false,
    });
  }

  decideFunc() {
    this.forceUpdate();
    console.log(this.state);
  }

  logout() {
    axios({
      method: 'POST',
      url: '/logout',
    }).then(() => {
      window.location.reload();
    }).catch((err) => {
      console.log(err);
    });
  }

  getOptions() {
    const options = [];
    const baseOptions = [
      {
        defaultImage: '/static/images/ic-subscription.svg',
        activeImage: '/static/images/ic-subscription-active.svg',
        displayName: 'My Subscriptions',
        func: () => {
          browserHistory.push('/subscriptions');
        },
      },
      {
        defaultImage: '/static/images/ic-settings.svg',
        activeImage: '/static/images/ic-settings-active.svg',
        displayName: 'Setting',
        func: () => {
          browserHistory.push('/settings');
        },
      },
      {
        defaultImage: '/static/images/ic-logout.svg',
        activeImage: '/static/images/ic-logout-active.svg',
        displayName: 'Logout',
        func: () => {
          this.logout();
        },
      },
    ];

    if (this.props.account.channel.id) {
      options.push(
        {
          defaultImage: '/static/images/ic-channel.svg',
          activeImage: '/static/images/ic-channel-active.svg',
          displayName: 'My Channel',
          func: () => {
            browserHistory.push('/my-channel');
          },
        },
        {
          defaultImage: '/static/images/ic-video-manager.svg',
          activeImage: '/static/images/ic-video-manager-active.svg',
          displayName: 'Video Manager',
          func: () => {
            browserHistory.push('/video-manager');
          },
        },
      );
    } else if (this.props.account.isApproved) {
      options.push(
        {
          defaultImage: '/static/images/ic-channel.svg',
          activeImage: '/static/images/ic-channel-active.svg',
          displayName: 'Create Channel',
          func: () => {
            browserHistory.push('/my-channel');
          },
        },
      );
    } else {
      options.push(
        {
          defaultImage: '/static/images/ic-channel.svg',
          activeImage: '/static/images/ic-channel-active.svg',
          displayName: 'Apply for Channel',
          func: () => {
            browserHistory.push('/apply');
          },
        },
      );
    }
    return [...options, ...baseOptions];
  }

  checkVerification() {
    if (this.props.account.id) return '/upload';
    return '/login';
  }

  render() {
    const displayName = this.props.account.channel.name || this.props.account.username;
    const transitionClasses = ['transition-component'];
    if (this.state.approveLoading) {
      transitionClasses.push('show');
    }
    return (
      <nav className="navbar">
        {
          <div className={transitionClasses.join(' ')}>
            <img className="loading-item" src="/static/images/loading.svg" alt="encoding" />
          </div>
        }
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
              <Link to={this.checkVerification()}><img alt="Upload Icon" src="/static/images/cloud_white.svg" /></Link>
            </li>
          </ul>
          <div
            className="account-nav" onClick={() => this.toggleAccountNav()}
          >
            { this.props.account.avatarPath ?
              <Avatar
                image={this.props.account.avatarPath}
                size="xs"
              />
              :
              <NoAvatar
                color={this.props.account.channel.color}
                letter={displayName.substring(0, 2)}
              />
            }
            <img className="drop-down-img" src="/static/images/white-drop-down-arrow.svg" alt="DropDown Image" />
            <NotShitDropDown
              account={this.props.account}
              isOpen={this.state.isAccountNavOpen}
              open={this.openAccountNav}
              close={this.closeAccountNav}
              toggle={this.toggleAccountNav}
              options={this.getOptions()}
            />
          </div>
        </div>
      </nav>
    );
  }
}

export default UserNavOptions;
