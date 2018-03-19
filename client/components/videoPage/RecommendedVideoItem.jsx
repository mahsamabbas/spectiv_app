import React, { Component } from 'react';
import { Link } from 'react-router';

import displayDuration from './../../utils/displayDuration';
import LazyImage from './../general/LazyImage.jsx';

class RecommendedVideoItem extends Component {
  render() {
    const { video } = this.props;

    if (!video.thumbnailPath) {
      video.thumbnailPath = '/static/images/play.svg';
    }

    return (
      <Link to={`/v/${video.id}`} className="recommended-video-item">
        <div className="recommended-video-item-left">
          <div className="video-thumbnail">
            <LazyImage srcImg={video.thumbnailPath} imgClass={'video-image'} />
            <div className="duration-tag">{displayDuration(video.duration)}</div>
          </div>
        </div>
        <div className="recommended-video-item-right">
          <div className="title">{video.title}</div>
          <div className="channel">{video.Channel.name}</div>
          <div className="view-count">Views: {video.viewCount}</div>
        </div>
      </Link>
    );
  }
}

export default RecommendedVideoItem;
