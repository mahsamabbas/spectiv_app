import React, { Component } from 'react';
import isMobile from 'ismobilejs';

class ThumbContent extends Component {
  render() {
    const style = {};

    if (isMobile.phone) {
      style.display = 'block';
    }

    return (
      <div className="thumb-content" style={style}>
        <h4>Featured Creator</h4>
        <div className="thumb-flex-wrapper">
          {this.props.content}
        </div>
      </div>
    );
  }
}

export default ThumbContent;
