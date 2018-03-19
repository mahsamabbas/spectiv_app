import React, { Component } from 'react';

import MyVideo from './MyVideo.jsx';
import Confirm from './../general/Confirm.jsx';

class VideoManager extends Component {
  constructor(props) {
    super(props);

    this.openConfirm = this.openConfirm.bind(this);
    this.closeConfirm = this.closeConfirm.bind(this);
    this.deleteVideo = this.deleteVideo.bind(this);

    this.state = {
      isOpen: false,
      deleteFunc: () => {
        console.log('No Function Selected');
      },
    };
  }

  renderVideoList(videos) {
    return videos.map((video, idx) => {
      return (
        <MyVideo
          key={idx}
          video={video}
          refreshList={this.props.refreshList}
          openConfirm={this.openConfirm}
        />
      );
    });
  }

  openConfirm(func) {
    this.setState({
      isOpen: true,
      deleteFunc: func,
    });
  }

  closeConfirm() {
    this.setState({
      isOpen: false,
    });
  }

  deleteVideo() {
    this.state.deleteFunc();
    this.setState({
      isOpen: false,
    });
  }

  render() {
    return (
      <div className="my-video-list">
        { this.renderVideoList(this.props.videos) }
        <Confirm
          isOpen={this.state.isOpen}
          close={() => this.closeConfirm()}
          confirm={() => this.deleteVideo()}
        />
      </div>
    );
  }
}

export default VideoManager;
