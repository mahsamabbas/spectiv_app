import React, { Component } from 'react';
import { Link } from 'react-router';

import Avatar from './../general/Avatar.jsx';
import loadImage from './../../utils/loadImage';

class BannerItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      image: '#000000',
      loading: true,
      error: false,
    };
  }

  componentDidMount() {
    this.loadImage();
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  loadImage() {
    if (!this.props.advertisement) {
      loadImage(this.props.video.thumbnailPath)
        .then((image) => {
          const newImage = `url(${image})`;
          if (this.mounted) {
            this.setState({ image: newImage, loading: false });
          }
        }).catch(() => {
          if (this.mounted) {
            this.setState({ loading: false, error: true });
          }
        });
    }
  }

  render() {
    const { video, advertisement, title, big, watchNow, injectStyle } = this.props;

    const inlineStyle = injectStyle || {};

    if (advertisement) {
      return (
        <div className="banner-item" style={{ backgroundImage: "url('/static/images/bg.png')", ...inlineStyle }}>
          <div className="overlay light">
            <div className="overlay-left">
              <p>Interested in creating or putting your content on the site?</p>
              <Link to={'/apply'}>Become a publisher</Link>
            </div>
            <div className="overlay-right">
              <img src="/static/images/goldplay.svg" alt="Publisher Icon" />
            </div>
          </div>
        </div>
      );
    }

    let style = {};

    if (video.thumbnailPath) {
      this.state.loading ? style = {
        background: this.state.image,
      } : style = {
        backgroundImage: this.state.image,
      };
    }

    return (
      <Link to={`/v/${video.id}`} style={{ ...style, ...inlineStyle }} className="banner-item">
        <div className="overlay">
          <div className="content">
            <div className="top">
              <h5>{title}</h5>
              <h3>{video.title}</h3>
              <div className="channel-wrapper" style={{ marginTop: big ? 16 : 4 }}>
                <Avatar
                  image={video.Channel.User.avatarPath}
                  name={video.Channel.name}
                  color={video.Channel.color}
                  size="xs"
                  avatarStyle={{
                    width: 34,
                    height: 34,
                    fontSize: 14,
                    backgroundColor: '#DDDDDD',
                  }}
                />
                <span>from {video.Channel.name}</span>
              </div>
            </div>
            <div className="bottom">
              { watchNow ? <button className="watch-now-btn">WATCH NOW</button> : null }
            </div>
          </div>
        </div>
      </Link>
    );
  }
}

export default BannerItem;
