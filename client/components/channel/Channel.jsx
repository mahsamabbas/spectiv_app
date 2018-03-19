import React, { Component } from 'react';
import axios from 'axios';
import _ from 'lodash';

import ViewChannel from './ViewChannel.jsx';
import ChannelNotFound from './ChannelNotFound.jsx';
import PageLoading from './../general/PageLoading.jsx';
import ErrorHandle from './../alertHandle/index.jsx';

class Channel extends Component {
  constructor(props) {
    super(props);
    // Bind methods to component
    this.getMoreVideos = this.getMoreVideos.bind(this);

    this.state = {
      loading: true,
      notFound: false,
      isUserChannel: false,
      isSubscribed: false,
      totalSubscriber: 0,
      channelInfo: {},
      error: false,
      videos: [],
      offset: 12,
    };
  }

  componentDidMount() {
    this.getChannel(this.props.params.channelURL);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.channelURL !== this.props.params.channelURL) {
      this.getChannel(nextProps.params.channelURL);
    }
  }

  getChannel(channelURL) {
    this.setState({ loading: true });
    axios({
      url: `/api/channel/${channelURL}`,
      method: 'GET',
    }).then((res) => {
      const { channel, isUserChannel, isSubscribed, totalSubscriber } = res.data;

      if (channelURL !== res.data.channel.channelURL) {
        window.history.pushState(null, 'Spectiv VR', `/channel/${channel.channelURL}`);
      }

      this.setState({
        channelInfo: channel,
        loading: false,
        isUserChannel,
        isSubscribed,
        totalSubscriber,
        videos: channel.Videos,
      });
    }).catch((err) => {
      if (!err.response) {
        return this.setState({
          error: true,
          loading: false,
        });
      }
      const { status } = err.response;
      if (status === 404) {
        return this.setState({
          notFound: true,
          loading: false,
        });
      }

      return this.setState({
        error: true,
        loading: false,
      });
    });
  }

  getMoreVideos() {
    const { channelInfo, offset } = this.state;
    axios({
      method: 'GET',
      url: `/api/channel-videos/${channelInfo.id}?offset=${offset}`,
    }).then((res) => {
      const { videos } = res.data;
      const moreVideos = this.state.videos.concat(videos);
      const newOffset = this.state.offset + videos.length;
      this.setState({
        videos: moreVideos,
        offset: newOffset,
      });
    }).catch((err) => {
      if (!err.response) {
        return this.setState({
          error: true,
          loading: false,
        });
      }
      const { status } = err.response;
      if (status === 404) {
        return this.setState({
          notFound: true,
          loading: false,
        });
      }

      return this.setState({
        error: true,
        loading: false,
      });
    });
  }

  renderContent() {
    const { notFound, loading, error, channelInfo, isUserChannel, isSubscribed, videos } = this.state;
    if (loading) {
      return <PageLoading message={'Channel Loading...'} />;
    }

    if (!_.isEmpty(channelInfo)) {
      return (<ViewChannel
        loggedIn={this.props.account.active}
        channel={channelInfo}
        isUserChannel={isUserChannel}
        subscribed={isSubscribed}
        totalSubscriber={this.state.totalSubscriber}
        account={this.props.account}
        videos={videos}
        getMoreVideos={this.getMoreVideos}
      />);
    }

    if (notFound) {
      return <ChannelNotFound channelName={this.props.params.channelURL} />;
    }

    if (error) {
      return <ErrorHandle />;
    }
  }

  render() {
    return (
      <section id="channel">
        {this.renderContent()}
      </section>
    );
  }
}

export default Channel;
