import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import isMobile from 'ismobilejs';
import axios from 'axios';

import MyVideoList from './MyVideoList.jsx';
import NoVideos from './../channel/NoVideos.jsx';
import SpectivLoading from './../general/SpectivLoading.jsx';

class VideoManager extends Component {
  constructor(props) {
    super(props);

    this.getMainContent = this.getMainContent.bind(this);
    this.getMyVideos = this.getMyVideos.bind(this);

    this.state = {
      myVideos: [],
      isLoading: false,
    };
  }

  // myVideos should be saved in store. This is a temporay workaround.
  componentDidMount() {
    if (!this.props.account.active) {
      browserHistory.push('/');
    } else {
      this.getMyVideos();
    }
  }

  componentWillReceiveProps() {
    if (!this.props.account.loading) {
      if (!this.props.account.active) {
        browserHistory.push('/');
      } else {
        this.getMyVideos();
      }
    }
  }

  getMyVideos() {
    if (!this.state.isLoading) {
      this.setState({ isLoading: true });
      axios({
        url: '/api/my-videos',
        method: 'GET',
      }).then((res) => {
        const { videos } = res.data;
        this.setState({
          myVideos: videos,
          isLoading: false,
        });
      }).catch((err) => {
        console.log(err);
      });
    }
  }

  getMainContent() {
    if (this.state.myVideos.length === 0 && !this.state.isLoading) {
      return <NoVideos padding={12} />;
    }

    if (this.state.myVideos.length > 0 && !this.state.isLoading) {
      return (<MyVideoList
        refreshList={this.getMyVideos}
        videos={this.state.myVideos}
      />);
    }

    return (
      <SpectivLoading />
    );
  }


  render() {
    if (!this.props.account.id) {
      return (
        <section id="video-manager">
          <SpectivLoading />
        </section>
      );
    } else if (!this.props.account.channel.id) {
      browserHistory.push('/my-channel');
      return (
        <section id="video-manager">
          <SpectivLoading />
        </section>
      );
    }

    return (
      <section id="video-manager">
        <h2>
          Video Manager
          {isMobile.phone ?
            <span style={{ fontSize: '14px', color: 'red' }}> - Login from a desktop to edit your videos.</span>
            : null}
        </h2>
        { this.getMainContent() }
      </section>
    );
  }
}

export default VideoManager;
