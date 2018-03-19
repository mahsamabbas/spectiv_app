import React, { Component } from 'react';
import SmallVideoInfo from './SmallVideoInfo.jsx';
import NoVideos from './NoVideos.jsx';

class AllVideos extends Component {
  getMoreButton() {
    if (this.props.videos.length % 12 === 0 && this.props.videos.length !== 0) {
      return (
        <div className="button-wrapper">
          <button onClick={this.props.getMoreVideos}>Get More Videos</button>
        </div>
      );
    }
  }

  renderAllVideos(videos) {
    if (videos.length > 0) {
      return videos.map((video, i) => {
        return (
          <SmallVideoInfo video={video} key={i} idx={i} />
        );
      });
    }
    return <NoVideos />;
  }

  render() {
    return (
      <div className="all-videos">
        {this.renderAllVideos(this.props.videos)}
        {this.getMoreButton()}
      </div>
    );
  }
}

export default AllVideos;
