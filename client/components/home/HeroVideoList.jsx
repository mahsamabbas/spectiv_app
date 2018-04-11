import React, { Component } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';

import sizedThumbnailUrl from '../../utils/sizedThumbnailUrl';
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
      const imageUrl = sizedThumbnailUrl(video.thumbnailPath, 'xs');
      style.backgroundImage = `url('${imageUrl}')`;
    }

    return (
      <Link className="hero-video-wrapper" to={`/v/${video.id}`}>
        <div className={classNames('hero-video-background', 'active')} style={style}>
          <div className="duration">{displayDuration(video.duration)}</div>
          <div className="hero-video-overlay" />
        </div>
      </Link>
    );
  }
}

export default HeroVideoList;
