import React, { Component } from 'react';
import { Link } from 'react-router';
import anchorme from 'anchorme';
import renderHTML from 'react-render-html';
import isMobile from 'ismobilejs';

import Avatar from './../general/Avatar.jsx';

class FeaturedChannel extends Component {
  render() {
    const { channel } = this.props;
    const style = {};
    const subCountStyle = {};
    const descStyle = {};
    const contentRightStyle = {};
    if (channel.color) {
      style.background = `linear-gradient(180deg, ${channel.color} ,#4EBD94)`;
    }

    if (isMobile.phone) {
      subCountStyle.marginBottom = 8;
      descStyle.display = 'block';
      contentRightStyle.display = 'none';
    }

    return (
      <div className="featured-channel">
        <div className="featured-channel-wrapper">
          <div className="channel-card">
            <div className="top-banner" style={style} />
            <div className="content">
              <div className="content-left">
                <Avatar
                  image={channel.User.avatarPath}
                  name={channel.name}
                  color={channel.color}
                  size="sm"
                  avatarStyle={{
                    height: 72,
                    width: 72,
                    fontSize: 20,
                  }}
                  doesLink
                />
                <h5>{ channel.name }</h5>
                <div style={subCountStyle} className="sub-count">{ channel.subscribers } Subscribers</div>
                <p style={descStyle} className="channel-desc">{channel.desc ? renderHTML(anchorme(channel.desc, { attributes: [{ name: 'target', value: 'blank' }, { name: 'style', value: `color: ${channel.color}` }] })) : null}</p>
                <Link to={`/channel/${channel.channelURL}`} className="go-to-channel-btn">GO TO CHANNEL</Link>
              </div>
              <div style={contentRightStyle} className="content-right">
                <p>{channel.desc ? renderHTML(anchorme(channel.desc, { attributes: [{ name: 'target', value: 'blank' }, { name: 'style', value: `color: ${channel.color}` }] })) : null}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default FeaturedChannel;
