import React, { Component } from 'react';
import _ from 'lodash';

import sizedThumbnailUrl from '../../utils/sizedThumbnailUrl';

class VideoPlayer extends Component {
  componentDidMount() {
    _.forEach(this.props.source, (src) => {
      if (src.quality) {
        document.getElementById(`${this.props.title}-${src.quality}`).setAttribute('quality', src.quality);
      }
    });
    if (this.props.getVideoHeight) {
      document.querySelector('dl8-video').addEventListener('loadeddata', this.props.getVideoHeight);
      document.querySelector('dl8-video').start();
    }
  }

  componentWillUnmount() {
    if (this.props.getVideoHeight) {
      document.querySelector('dl8-video').removeEventListener('loadeddata', this.props.getVideoHeight);
    }
  }

  getSource() {
    return _.map(this.props.source, (srcLink, idx) => {
      const { src, type, quality } = srcLink;
      return <source key={idx} id={`${this.props.title}-${quality}`} src={src} type={type} />;
    });
  }

  makeCorsUrl() {
    // let source=[];
    let sourceUrl = '';
    const fallBackUrl = `https://d3f7ofkyxfh4ff.cloudfront.net/fallback.html?format=${this.props.format}&title=${this.props.title}`;
    _.map(this.props.source, (srcInfo, index) => {
      const { src, type } = srcInfo;
      const sourceSrc = `source_${index + 1}_src=${src}`;
      const sourceType = `source_${index + 1}_type=${type}`;
      sourceUrl = `${sourceUrl}&${sourceSrc}&${sourceType}`;
    });
    return `${fallBackUrl + sourceUrl}`;
  }

  render() {
    const corsFallBackUrl = this.makeCorsUrl();
    let poster = this.props.poster;

    if (!this.props.poster) {
      poster = '/static/images/play.svg';
    }

    if (this.props.poster) {
      poster = sizedThumbnailUrl(this.props.poster, this.props.size || 'md');
      console.log(poster);
    }

    return (
      <dl8-video
        className={this.props.className}
        title={this.props.title}
        author={this.props.author}
        author-href={this.props['author-href']}
        format={this.props.format}
        width={this.props.width}
        poster={poster}
        display-mode="inline"
        source={this.props.source}
        id={this.props.id}
        cors-fallback-url={corsFallBackUrl}
      >
        {this.getSource()}
      </dl8-video>
    );
  }
}

export default VideoPlayer;
