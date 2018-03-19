import React, { Component } from 'react';
import anchorme from 'anchorme';
import renderHTML from 'react-render-html';
import isMobile from 'ismobilejs';
import { Link } from 'react-router';

import VideoPlayer from './../general/VideoPlayer.jsx';
import Avatar from './../general/Avatar.jsx';
import SubscribeButton from './../general/Subscribe.jsx';
import LikeButton from './../general/Like.jsx';

class FeaturedVideo extends Component {

  render() {
    const { video } = this.props;

    const videoSources = [];

    if (isMobile.phone) {
      videoSources.push({ src: video.pathTo1080p, type: 'application/x-mpegurl' });
    } else {
      videoSources.push({ src: video.pathToOriginal, type: 'video/mp4', quality: '4k' });
      if (video.pathTo1440p) {
        videoSources.push({ src: video.pathTo1440p, type: 'video/mp4', quality: '1440p' });
      }
    }

    return (
      <div className="home-featured-video">
        <div className="featured-video-left">
          <h4>Featured Video</h4>
          <VideoPlayer
            className="video-player"
            title={video.title}
            author={video.Channel.name}
            author-href={`/channel/${video.Channel.name}`}
            format="MONO_360"
            width="100%"
            poster={video.thumbnailPath}
            display-mode="inline"
            source={videoSources}
          />
        </div>
        <div className="featured-video-right">
          <div className="featured-flex-info">
            <div className="featured-col-info">
              <Avatar
                image={video.Channel.User.avatarPath}
                name={video.Channel.name}
                color={video.Channel.color}
                doesLink
              />
              <div className="featured-flex-info-col">
                <h5><Link to={`/channel/${video.Channel.name}`}>{video.title}</Link></h5>
                <div className="view-count">Views: {video.viewCount}</div>
              </div>
            </div>
            <p>{video.desc ? renderHTML(anchorme(video.desc, { attributes: [{ name: 'target', value: 'blank' }, { name: 'style', value: 'color: #4EBD94' }] })) : null}</p>
          </div>
          <div className="featured-flex-actions">
            <LikeButton
              video={video}
              account={this.props.account}
              channel={video.Channel}
            />
            <SubscribeButton
              channel={video.Channel}
              account={this.props.account}
            />
          </div>
        </div>
      </div>
    );
  }
}


// { this.props.account.avatarPath ?
//   <div
//     className="avatar-img" alt="Avatar Img" style={{
//       backgroundImage: `url('${this.props.account.avatarPath}')`,
//     }}
//   /> : <NoAvatar color={this.props.account.channel.color} letter={displayName.substring(0, 2)} />
// }

export default FeaturedVideo;
