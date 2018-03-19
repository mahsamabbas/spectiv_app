import React, { Component } from 'react';
import isMobile from 'ismobilejs';

import FeaturedChannel from './FeaturedChannel.jsx';

class FeaturedChannelList extends Component {
  constructor(props) {
    super(props);

    this.renderFeaturedChannels = this.renderFeaturedChannels.bind(this);
  }

  renderFeaturedChannels() {
    return this.props.featuredChannels.map((channel, index) => {
      return <FeaturedChannel key={index} channel={channel} />;
    });
  }

  render() {
    const style = {};

    if (isMobile.phone) {
      style.display = 'none';
    }

    return (
      <section id="featured-channels" style={style}>
        <h4>Featured Creators</h4>
        <div className="featured-channels-wrapper">
          {this.renderFeaturedChannels()}
        </div>
      </section>
    );
  }
}

export default FeaturedChannelList;
