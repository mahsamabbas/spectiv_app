import React, { Component } from 'react';
import axios from 'axios';
import isMobile from 'ismobilejs';

import UserNavOptions from './UserNavOptions.jsx';
import VisitorNavOptions from './VisitorNavOptions.jsx';
import LoadingNavOptions from './LoadingNavOptions.jsx';
import MobileUserNavOptions from './MobileUserNavOptions.jsx';
import MobileVisitorNavOptions from './MobileVisitorNavOptions.jsx';

import LayoutContainer from './../../containers/LayoutContainer';

if (NODE_ENV === 'dev') {
  require('../../styles/base.scss');
}

class Layout extends Component {
  constructor(props) {
    super(props);

    // Bind methods to components
    this.renderNavOptions = this.renderNavOptions.bind(this);
    this.onResize = this.onResize.bind(this);

    this.state = {
      loadingAccount: true,
      smallScreen: false,
    };
  }

  componentDidMount() {
    this.destroyPrevAuthRoute(); // Destroys redirect route in session storage
    window.onresize = this.onResize;
    this.onResize();
    this.getUserInfo();
  }

  componentWillUnmount() {
    window.onresize = null;
  }

  onResize() {
    if (window.innerWidth < 780 && !this.state.smallScreen) {
      this.setState({
        smallScreen: true,
      });
    } else if (window.innerWidth > 780 && this.state.smallScreen) {
      this.setState({
        smallScreen: false,
      });
    }
  }

  getUserInfo() {
    axios({
      method: 'GET',
      url: '/api/account/user-info',
    }).then((res) => {
      if (res.data.success) {
        const { user } = res.data;
        const { id, firstName, lastName, username, email, avatarPath, isApproved } = user;

        if (user.Channel) {
          if (avatarPath) user.Channel.avatarPath = avatarPath;
          this.props.actions.setUserChannel(user.Channel);
        }

        this.props.actions.setAccountInfo({
          id,
          firstName,
          lastName,
          username,
          email,
          avatarPath,
          isApproved,
        });
      }

      this.props.actions.accountNotFound();

      this.setState({
        loadingAccount: false,
      });
    }).catch((err) => {
      console.log(err);
      this.setState({
        loadingAccount: false,
      });
    });
  }

  destroyPrevAuthRoute() {
    sessionStorage.removeItem('prevAuthRoute');
  }

  renderNavOptions() {
    if (this.state.loadingAccount) {
      if (this.state.smallScreen) {
        return (<MobileVisitorNavOptions loading="true" />);
      }
      return (<LoadingNavOptions />);
    } else if (this.props.account.active) {
      if (this.state.smallScreen) {
        return (<MobileUserNavOptions account={this.props.account} />);
      }
      return (<UserNavOptions account={this.props.account} />);
    }
    if (this.state.smallScreen) {
      return (<MobileVisitorNavOptions />);
    }
    return (<VisitorNavOptions />);
  }

  render() {
    return (
      <section id="layout">
        {this.renderNavOptions()}
        {React.Children.map(this.props.children, child =>
          React.cloneElement(child,
            this.props,
        ))}
      </section>
    );
  }
}

export default LayoutContainer(Layout);
