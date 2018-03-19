import React, { Component } from 'react';

import SmallVideoInfo from './../channel/SmallVideoInfo.jsx';

class RecentUploads extends Component {
  constructor(props) {
    super(props);

    this.renderSmallVideoList = this.renderSmallVideoList.bind(this);
  }

  renderSmallVideoList() {
    return this.props.recentVideos.map((video, i) => {
      return (
        <SmallVideoInfo video={video} key={i} inlineStyle={{ width: '25%' }} />
      );
    });
  }

  render() {
    return (
      <section id="recent-uploads">
        <h4>Recent Uploads</h4>
        <div className="recent-uploads-wrapper">
          {this.renderSmallVideoList()}
        </div>
      </section>
    );
  }
}

export default RecentUploads;
