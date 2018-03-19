import React, { Component } from 'react';

import SmallVideoInfo from './SmallVideoInfo.jsx';
import ViewMoreVideos from './ViewMoreVideos.jsx';
import NoVideos from './NoVideos.jsx';
import FeaturedVideo from './FeaturedVideo.jsx';
import SmallLoading from './../general/SmallLoading.jsx';

class ChannelFeaturedVideos extends Component {

  renderRecentVideos(videos) {
    return videos.filter((video, i) => i > 0 && i < 7).map((video, i) => {
      if (i === 5) {
        return (
          <ViewMoreVideos changeTab={this.props.changeTab} thumbnail={video.thumbnailPath} />
        );
      }
      return (
        <SmallVideoInfo video={video} key={i} />
      );
    });
  }

  renderContent() {
    const { videos, channelName, channelColor } = this.props;
    if (this.props.loading) {
      return <SmallLoading message="Loading..." />;
    }

    if (videos.length > 0) {
      let contentArr = [
        <FeaturedVideo channelName={channelName} videos={videos} channelColor={channelColor} key={0} />,
      ];

      if (videos.length > 1) {
        // TODO - redo w/ map so unique keys can be provided to div
        contentArr = contentArr.concat([
          <h5 className="recent-videos-title">Recent videos</h5>,
          <div className="recent-videos-wrapper">
            {this.renderRecentVideos(videos)}
          </div>,
        ]);
      }

      return contentArr;
    }
    return <NoVideos />;
  }

  render() {
    return (
      <div className="tab-content channel-featured-content">
        { this.renderContent() }
      </div>
    );
  }
}

export default ChannelFeaturedVideos;
