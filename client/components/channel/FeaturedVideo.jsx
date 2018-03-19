import React, { Component } from 'react';
import { Link } from 'react-router';
import anchorme from 'anchorme';
import renderHTML from 'react-render-html';
import moment from 'moment';
import isMobile from 'ismobilejs';

import VideoPlayer from './../general/VideoPlayer.jsx';

class FeaturedVideo extends Component {
  getRelativeTime(time) {
    return moment(new Date(time)).fromNow();
  }

  render() {
    const { videos, channelName } = this.props;
    let featuredVideo;
    const videoSources = [];

    if (videos.length > 0) {
      featuredVideo = videos[0];
      if (isMobile.phone) {
        videoSources.push({ src: featuredVideo.pathTo1080p, type: 'application/x-mpegurl' });
      } else {
        videoSources.push({ src: featuredVideo.pathToOriginal, type: 'video/mp4', quality: '4k' });
        if (featuredVideo.pathTo1440p) {
          videoSources.push({ src: featuredVideo.pathTo1440p, type: 'video/mp4', quality: '1440p' });
        }
      }
    }

    return (
      <div className="featured-wrapper">
        <VideoPlayer
          className="video-player"
          title={featuredVideo.title}
          author={channelName}
          author-href={`/channel/${channelName}`}
          format="MONO_360"
          poster={featuredVideo.thumbnailPath}
          display-mode="inline"
          source={videoSources}
          videoId={featuredVideo.id}
        />
        <div className="featured-video-content">
          <Link className="featured-title" to={`/v/${featuredVideo.id}`}>{featuredVideo.title}</Link>
          <p className="time-views">
            Views: {this.props.videos[0].viewCount} • {this.getRelativeTime(featuredVideo.createdAt)}
          </p>
          <p className="desc">{featuredVideo.desc ? renderHTML(anchorme(featuredVideo.desc, { attributes: [{ name: 'target', value: 'blank' }, { name: 'style', value: `color: ${this.props.channelColor}` }] })) : null}</p>
        </div>
      </div>
    );
  }
}

export default FeaturedVideo;
