import React, { Component } from 'react';

class ViewMoreVideos extends Component {
  render() {
    const style = {};

    if (this.props.thumbnail) {
      style.backgroundImage = `url("${this.props.thumbnail}")`;
    }
    return (
      <div className="view-more-videos">
        <div className="view-more-wrapper" onClick={this.props.changeTab}>
          <div className="img-overlay">
            <p>View More</p>
          </div>
          <div
            className="view-more-thumbnail"
            style={style}
          />
        </div>
      </div>
    );
  }
}

export default ViewMoreVideos;
