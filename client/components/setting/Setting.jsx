import axios from 'axios';
import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import isMobile from 'ismobilejs';

import ImageUploader from './../general/ImageUploader.jsx';
import EditAccount from './EditAccount.jsx';
import ChangePassword from './ChangePassword.jsx';
import PageLoading from '../general/PageLoading.jsx';

class Setting extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {},
      loading: true,
    };
  }

  componentDidMount() {
    this.getUserInfo();
  }

  getUserInfo() {
    axios({
      method: 'GET',
      url: '/api/account/user-info',
    }).then((resp) => {
      if (!resp.data.success) {
        window.location = '/login';
      } else {
        this.setState({
          user: resp.data.user,
          loading: false,
        });
      }
    }).catch((err) => {
      if (err.response.status === 401) {
        browserHistory.push('/');
      }
    });
  }

  renderContent() {
    if (this.state.loading) {
      return <PageLoading message="Fetching data from Server..." />;
    }

    return (
      <div className="settings-wrapper">
        <div className="left-wrapper">
          {!isMobile.any ? <h4 className="image-heading">Change Avatar</h4> : null}
          {console.log(this.props.account.id, this.props.actions.setUserAvatar, this.props.account.channel, this.props.account.avatarPath, this.props)}
          <ImageUploader
            type="avatar"
            isAvatar
            options={{ userId: this.props.account.id }}
            updateUserAvatar={this.props.actions.setUserAvatar}
            channel={this.props.account.channel}
            imageUrl={this.props.account.avatarPath}
          />
        </div>
        <div className="right-wrapper">
          <EditAccount user={this.state.user} />
          <ChangePassword />
        </div>
      </div>
    );
  }

  render() {
    return (
      <section id="settings-page">
        <h2 className="section-heading">Account Settings</h2>
        { this.renderContent() }
      </section>
    );
  }
}

export default Setting;
