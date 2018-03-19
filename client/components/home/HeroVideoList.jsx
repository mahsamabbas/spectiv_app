import React, { Component } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';

import displayDuration from './../../utils/displayDuration';

const HeroVideoList = ({ videos, select, selectedVideo }) => {
  return (
    <div className="hero-video-list">
      {
        videos.map((video, i) =>
          <HeroVideoItem
            video={video}
            select={select}
            index={i}
            key={video.id}
            selectedVideo={selectedVideo}
          />,
        )
      }
    </div>
  );
};

class HeroVideoItem extends Component {

  render() {
    const { video, select, index, selectedVideo } = this.props;
    const style = {};
    if (video.thumbnailPath) {
      style.backgroundImage = `url('${video.thumbnailPath}')`;
    }

    return (
      <Link className="hero-video-wrapper" to={`/v/${video.id}`}>
        <div className={classNames('hero-video-background', 'active')} style={style}>
          <div className="duration">{displayDuration(video.duration)}</div>
          <div className="hero-video-overlay" />
        </div>
      </Link>
    );

    return (
      <div className="hero-video-item" onClick={() => select(index)}>
        <div className="hero-video-image" style={style} />
      </div>
    );
  }
}

export default HeroVideoList;
