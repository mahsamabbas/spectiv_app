import React, { Component } from 'react';

class OverlaySaving extends Component {
  render() {
    return (
      <div
        className="overlay-saving"
      >
        <img src="/static/images/loading.svg" alt="Loading Icon" />
        <h4>Saving...</h4>
      </div>
    );
  }
}

export default OverlaySaving;
