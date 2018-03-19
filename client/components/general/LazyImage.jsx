import React, { Component } from 'react';

import loadImage from './../../utils/loadImage';

class LazyImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: '#e0e0e0',
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
    loadImage(this.props.srcImg)
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

  render() {
    let style = {};
    this.state.loading ? style = {
      background: this.state.image,
    } : style = {
      backgroundImage: this.state.image,
      animation: 'fadeImage .1s',
    };

    if (this.state.error) {
      style = {
        background: null,
      };
    }

    return (<div style={style} className={this.props.imgClass} />);
  }
}

export default LazyImage;
