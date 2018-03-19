import React, { Component } from 'react';
import moment from 'moment';
import { Link } from 'react-router';
import isMobile from 'ismobilejs';

import Avatar from './../general/Avatar.jsx';
import NoAvatar from './../general/NoAvatar.jsx';
import displayDuration from './../../utils/displayDuration';
import LazyImage from './../general/LazyImage.jsx';

const ResultList = ({ results, account }) => {
  return (
    <div className="result-list">
      {
        results.map((result, i) =>
          <ResultItem result={result} account={account} key={i} />,
        )
      }
    </div>
  );
};

class ResultItem extends Component {
  shortenString(str) {
    if (str) {
      if (str.length > 300) {
        return `${str.slice(0, 300)}...`;
      }
      return str;
    }
    return 'No description...';
  }

  renderItem() {
    if (this.props.result.name) {
      const channel = this.props.result;
      const fontSize = isMobile.phone || isMobile.tablet ? 25 : 50;
      const width = isMobile.phone || isMobile.tablet ? '100px' : '260px';
      const height = isMobile.phone || isMobile.tablet ? '100px' : '260px';
      return (
        <div className="result-list-channel-item">
          <div className="image-wrapper">
            <Link to={`/channel/${channel.name}`}>
              {channel.avatarPath ?
                <Avatar
                  image={channel.avatarPath}
                  name={channel.name}
                  color={channel.channelColor}
                  avatarStyle={{
                    width,
                    height,
                    margin: 'auto',
                  }}
                  doesLink
                />
                 :
                <NoAvatar
                  letter={channel.name.substring(0, 2)}
                  color={channel.channelColor}
                  width={width}
                  height={height}
                  fontSize={fontSize}
                />
              }
            </Link>
          </div>

          <div className="result-list-channel-info">
            <div className="result-list-item-channel">
              <Link to={`/channel/${channel.channelURL}`}>{channel.name}</Link>
            </div>

            <div className="result-list-item-subcount">
              {`Subscribers: ${channel.subscribers}`}
            </div>

            <div className="result-list-item-desc">
              {this.shortenString(channel.desc)}
            </div>
          </div>
        </div>
      );
    }
    const video = this.props.result;
    if (!video.thumbnailPath) {
      video.thumbnailPath = '/static/images/play.svg';
    }

    if (isMobile.phone) {
      if (video.title.length > 40) {
        video.title = `${video.title.substring(0, 39)}...`;
      }
    }
    return (
      <div className="result-list-video-item">
        <div className="image-wrapper">
          <Link to={`/v/${video.id}`}>
            <LazyImage srcImg={video.thumbnailPath} imgClass={'image-thumbnail'} />
            <div className="duration-tag">{displayDuration(video.duration)}</div>
          </Link>
        </div>

        <div className="desc-wrapper">
          <div className="desc-header">
            <div className="channel-avatar">
              <Avatar
                image={video.channelAvatar}
                name={video.channelName}
                color={video.channelColor}
                doesLink
              />
            </div>

            <div className="result-video-title-wrapper">
              <div className="result-list-item-name">
                <Link to={`/v/${video.id}`}>{video.title}</Link>
              </div>

              <div className="result-list-item-channel">
                <Link to={`/channel/${video.channelURL}`}>{video.channelName}</Link>
              </div>
            </div>
          </div>

          <div className="viewcount">
            Views: {video.views}
            <div>{moment(video.createdAt).format('MMM Do YYYY')}</div>
          </div>

          <div className="result-list-item-desc">{this.shortenString(video.desc)}</div>
        </div>
      </div>
    );
  }

  render() {
    return this.renderItem();
  }
}

export default ResultList;
