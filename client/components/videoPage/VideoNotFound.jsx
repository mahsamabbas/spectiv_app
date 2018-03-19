import React, { Component } from 'react';
import { Link } from 'react-router';

class VideoNotFound extends Component {
  render() {
    return (
      <div className="channel-not-found">
        <h4>Video Could Not Be Found</h4>
        <Link to={'/'}>Back To Home</Link>
      </div>
    );
  }
}


export default VideoNotFound;
