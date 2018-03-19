import React, { Component } from 'react';
import { Link } from 'react-router';
import isMobile from 'ismobilejs';
import ellipsize from 'ellipsize';

import VideoPlayer from './../general/VideoPlayer.jsx';
import Avatar from './../general/Avatar.jsx';
import HeroVideoList from './HeroVideoList.jsx';
import LikeButton from './../general/Like.jsx';
import SubscribeButton from './../general/Subscribe.jsx';

class HeroSection extends Component {
  constructor(props) {
    super(props);

    // Bind Methods to Component
    this.renderChannelItems = this.renderChannelItems.bind(this);
    this.selectVideo = this.selectVideo.bind(this);
    this.formatChannelData = this.formatChannelData.bind(this);
    this.changeChannel = this.changeChannel.bind(this);

    this.state = {
      selectedChannel: 0,
      selectedVideo: 0,
      isChanged: false,
      channels: this.props.channels,
      isChanged: false,
    };
  }

  renderChannelItems() {
    const { channels } = this.props;
    const total = channels.length;
    const { selectedChannel } = this.state;

    const items = this.formatChannelData(channels);

    return items.map(({ video, infoBar }, idx) => {
      const currentChannel = channels[idx];
      const distance = this.getDistance(total - 1, idx, selectedChannel);
      let style = {};

      let className = '';

      if (idx === this.state.selectedChannel) {
        style = {
          transform: 'scale(1)',
          marginLeft: 0,
          zIndex: 5,
        };
        className = 'light-overlay';
      }

      if (distance === 1) {
        style = {
          transform: 'scale(0.85)',
          marginLeft: '28%',
          zIndex: 4,
        };
      } else if (distance === 2) {
        style = {
          transform: 'scale(0.65)',
          marginLeft: '48%',
          zIndex: 3,
        };
      } else if (distance === 3) {
        style = {
          transform: 'scale(0.5)',
          marginLeft: '64%',
          zIndex: 2,
        };
      }

      return (
        <div className={`video-image-wrapper ${className}`} style={style} key={idx}>
          <div className="video-image-background">
            { video }
          </div>
          { infoBar }
        </div>
      );
    });
  }

  changeChannel(idx) {
    if (idx !== this.state.selectedChannel) {
      document.getElementById(`video${this.state.selectedChannel}`).exit();

      this.setState({
        selectedVideo: 0,
        selectedChannel: idx,
        isChanged: !this.state.isChanged,
      });
    }
  }

  formatChannelData(channels) {
    return channels.map((channel, idx) => {
      const { Videos } = channel;
      let selectedVideo = Videos[0];
      if (this.state.selectedChannel === idx) {
        selectedVideo = Videos[this.state.selectedVideo];
      }
      const videoSources = [];
      if (isMobile.phone) {
        videoSources.push({ src: selectedVideo.pathTo1080p, type: 'application/x-mpegurl' });
      } else {
        videoSources.push({ src: selectedVideo.pathToOriginal, type: 'video/mp4', quality: '4k' });
        if (selectedVideo.pathTo1440p) {
          videoSources.push({ src: selectedVideo.pathTo1440p, type: 'video/mp4', quality: '1440p' });
        }
      }

      return {
        video: (
          <div className="video-image-overlay" onClick={() => { this.changeChannel(idx); }}>
            { this.state.isChanged ? <VideoPlayer
              className="video-player"
              title={selectedVideo.title}
              author={channel.name}
              author-href={`/channel/${channel.name}`}
              format="MONO_360"
              width="100%"
              poster={selectedVideo.thumbnailPath}
              display-mode="inline"
              source={videoSources}
              id={`video${idx}`}
            /> : <div style={{ width: '100%', height: '100%' }}>
              <VideoPlayer
                className="video-player"
                title={selectedVideo.title}
                author={channel.name}
                author-href={`/channel/${channel.name}`}
                format="MONO_360"
                width="100%"
                poster={selectedVideo.thumbnailPath}
                display-mode="inline"
                source={videoSources}
                id={`video${idx}`}
              />
            </div> }
            <div className="video-overlay-must" />
          </div>
        ),
        infoBar: (
          <div className="bar-wrapper">
            <div className="info-bar">
              <div className="info-left">
                <Avatar
                  image={channel.User.avatarPath}
                  name={channel.name}
                  color={channel.color}
                  doesLink
                />
                <div className="video-info">
                  <Link to={`/v/${selectedVideo.id}`}>{ellipsize(selectedVideo.title, 16)}</Link>
                  <div className="view-count">Views: {selectedVideo.viewCount}</div>
                </div>
                <SubscribeButton
                  channel={channel}
                  account={this.props.account}
                />
              </div>
              <div className="info-right">
                <LikeButton
                  video={selectedVideo}
                  account={this.props.account}
                  channel={channel}
                />
              </div>
            </div>
            <div className="description">{ellipsize(selectedVideo.desc, 310)}</div>
          </div>
        ),
      };
    });
  }

  getDistance(total, idx, selectedIdx) {
    if (selectedIdx === 0) {
      return idx;
    }

    if (selectedIdx - 1 === idx) {
      return 3;
    }

    return Math.abs(Math.min(selectedIdx - idx, total - (selectedIdx - idx - 1)));
  }

  selectVideo(index) {
    if (this.state.selectedVideo !== index) {
      this.setState({
        selectedVideo: index,
        isChanged: !this.state.isChanged,
      });
    }
  }

  render() {
    const { channels, selectedChannel, selectedVideo } = this.state;
    const videos = channels[selectedChannel].Videos;

    return (
      <section id="hero-section">
        <div className="left-video-list">
          <HeroVideoList videos={videos} select={this.selectVideo} selectedVideo={selectedVideo} />
        </div>
        <div className="right-channel-list">
          <div className="video-image-list">
            <div className="video-wrapper-absolute">
              { this.renderChannelItems() }
            </div>
          </div>
        </div>
        <div className="overlay-hero" />
      </section>
    );
  }
}

export default HeroSection;
