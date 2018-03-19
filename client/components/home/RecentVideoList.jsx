import moment from 'moment';
import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';

const RecentVideoList = (props) => {
  return (
    <div className="recent-video-list">
      {props.videos.map(video =>
        <RecentVideoItem
          video={video}
          key={video.id}
        />,
      )}
    </div>
  );
};

class RecentVideoItem extends Component {
  render() {
    const { video } = this.props;
    const createdAt = moment(this.props.video.createdAt).fromNow();

    return (
      <div className="recent-video-item">
        <img alt={video.title} src={video.thumbnailPath} />
        <div><Link to={`/v/${video.id}`}>{video.title}</Link></div>
        <div>{video.views} - {createdAt}</div>
      </div>
    );
  }
}

export default RecentVideoList;
