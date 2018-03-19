import React, { Component } from 'react';
import { Link } from 'react-router';

class ChannelNotFound extends Component {
  render() {
    return (
      <div className="channel-not-found">
        <h4>No Channel found ({this.props.channelName})</h4>
        <Link to={'/'}>Back To Home</Link>
      </div>
    );
  }
}

export default ChannelNotFound;
