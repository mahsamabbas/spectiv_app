import React, { Component } from 'react';

class NoVideos extends Component {
  render() {
    return (
      <div className="no-videos" style={{ width: '100%', background: '#EEEEEE' }}>
        <h5 style={{ textAlign: 'center', color: '#333', fontSize: 16, padding: this.props.padding || 4 }}>No Videos</h5>
      </div>
    );
  }
}

export default NoVideos;
