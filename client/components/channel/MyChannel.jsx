import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import _ from 'lodash';
import axios from 'axios';

import CreateChannel from './CreateChannel.jsx';
import ViewChannel from './ViewChannel.jsx';
import ApplyCta from './../general/ApplyCta.jsx';

class MyChannel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      totalSubscriber: 0,
    };
  }

  componentDidMount() {
    this.getChannelInfo();
  }

  getChannelInfo() {
    axios({
      method: 'GET',
      url: '/api/my-channel',
    }).then((res) => {
      this.props.actions.setUserChannel(res.data.channel);
      this.setState({
        loading: false,
        totalSubscriber: res.data.count,
      });
    }).catch((err) => {
      console.log(err);
      if (err.response.status === 401) {
        browserHistory.push('/');
      }
    });
  }

  renderContent() {
    if (this.props.account.loading) {
      return <div>Loading...</div>;
    } else if (!this.props.account.active) {
      window.location = '/login';
    } else if (!this.props.account.isApproved) {
      return (<ApplyCta
        status="notApproved"
        topText="Thanks for being a part of SpectivVR's Alpha!"
        bottomText="During the alpha we are limiting the amount of content creators on SpectivVR."
      />);
    } else if (!this.props.account.channel.id) {
      return (
        <CreateChannel
          account={this.props.account}
          setUserChannel={this.props.actions.setUserChannel}
          setUserAvatar={this.props.actions.setUserAvatar}
        />
      );
    } else {
      return (<ViewChannel
        channel={this.props.account.channel}
        videos={this.props.account.channel.Videos}
        loading={this.state.loading}
        totalSubscriber={this.state.totalSubscriber}
        isUserChannel
      />);
    }
    return <div>loading...</div>;
  }

  render() {
    return (
      <section id="channel">
        {this.renderContent()}
      </section>
    );
  }
}

export default MyChannel;
