import React, { Component } from 'react';
import { Link } from 'react-router';
import isMobile from 'ismobilejs';

import AlertHandle from './../alertHandle/AlertHandle.jsx';
import Avatar from './../general/Avatar.jsx';
import NoAvatar from './../general/NoAvatar.jsx';
import Subscribe from './../general/Subscribe.jsx';

const SubscriptionList = (props) => {
  return (
    <div className="subscription-list">
      {
        props.channels.map(channel =>
          <SubscriptionItem
            channel={channel.Channel}
            account={props.account}
            key={channel.id}
          />,
        )
      }
    </div>
  );
};

class SubscriptionItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subscribed: true,
      error: false,
      errMsg: '',
    };
  }

  numOfVideos() {
    if (this.props.channel.Videos.length === 1) {
      return '1 video';
    }

    return `${this.props.channel.Videos.length} videos`;
  }

  numOfSubscribers() {
    if (this.props.channel.subscribers === '1') {
      return '1 subscriber';
    }

    return `${this.props.channel.subscribers} subscribers`;
  }

  render() {
    const { channel, account } = this.props;
    let style = {};
    let width;
    let height;
    let fontSize;
    let channelName;
    const channelDesc = channel.desc.length > 217 ? `${channel.desc.substring(0, 217)}...` : channel.desc;

    if (!isMobile.phone) {
      style = {
        width: 150,
        height: 150,
        fontSize: 33,
        backgroundColor: '#DDDDDD',
      };
      width = 150;
      height = 150;
      fontSize = 33;
      channelName = channel.name;
    } else {
      style = {
        width: 60,
        height: 60,
        fontSize: 15,
        backgroundColor: '#F7F7F7',
      };
      width = 60;
      height = 60;
      fontSize = 15;
      channelName = channel.name.length > 22 ? `${channel.name.substring(0, 21)}...` : channel.name;
    }

    return (
      <div className="subscription-list-item">
        <AlertHandle
          message={this.state.errMsg}
          visible={this.state.error}
          onClose={() => this.setState({ errMsg: '', error: false })}
        />
        <div className="left-wrapper">
          <Link to={`/channel/${channel.name}`}>
            { channel.User.avatarPath ?
              <Avatar
                image={channel.User.avatarPath}
                name={channel.name}
                color={channel.color}
                avatarStyle={style}
              /> :
              <NoAvatar
                letter={channel.name.substring(0, 2)}
                color={channel.color}
                width={width}
                height={height}
                fontSize={fontSize}
              />
            }
          </Link>
        </div>
        <div className="right-wrapper">
          <div className="channel-name">
            <Link to={`/channel/${channel.name}`}>
              <strong>{channelName}</strong>
            </Link>
          </div>
          <div className="channel-info">
            { this.numOfSubscribers() } - { this.numOfVideos() }
          </div>
          <div className="channel-desc">
            {channelDesc}
          </div>
        </div>
        <div className="button-wrapper">
          <Subscribe
            subscribed={this.state.subscribed}
            totalSubscriber={channel.subscribers}
            channel={channel}
            account={account}
          />
        </div>
      </div>
    );
  }
}

export default SubscriptionList;
