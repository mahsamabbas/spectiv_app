import React, { Component } from 'react';
import moment from 'moment';
import { Link } from 'react-router';

import displayDuration from './../../utils/displayDuration';
import LazyImage from './../general/LazyImage.jsx';

class SmallVideoInfo extends Component {
  getRelativeTime(time) {
    return moment(new Date(time)).fromNow();
  }

  render() {
    const { video, inlineStyle } = this.props;
    const overrideStyle = inlineStyle || {};
    if (!video.thumbnailPath) {
      video.thumbnailPath = '/static/images/play.svg';
    }

    return (
      <div
        className="small-video-info"
        style={overrideStyle}
      >
        <Link to={`/v/${video.id}`} className="small-video-info-wrapper">
          <div className="small-video-thumbnail">
            <LazyImage srcImg={video.thumbnailPath} imgClass={'small-video-image'} />
            <div className="duration-tag">{displayDuration(video.duration)}</div>
          </div>
          <h5>{video.title}</h5>
          <p>Views: {video.viewCount} • {this.getRelativeTime(video.createdAt)}</p>
        </Link>
      </div>
    );
  }
}

export default SmallVideoInfo;
