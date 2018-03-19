import React, { Component } from 'react';
import { Link } from 'react-router';
import path from 'path';
import _ from 'lodash';
import { avatar } from './../../constants/actionTypes';

import loadImage from './../../utils/loadImage';

class Avatar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      image: '#dddddd',
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
    if (this.props.image) {
      let imagePath = this.props.image;
      const size = this.props.size;
      if (size) {
        const baseName = path.basename(imagePath);
        const dirName = path.dirname(imagePath);
        const delimiter = '/'; // path.delimiter(image);
        
        imagePath = `${dirName}${delimiter}${size}${delimiter}${baseName}`;
      }

      loadImage(imagePath)
        .then((image) => {
          const newImage = `url(${image})`;
          if (this.mounted) {
            this.setState({ image: newImage, loading: false });
          }
        }).catch((err) => {
          console.error(err);
          if (this.mounted) {
            this.setState({ loading: false, error: true });
          }
        });
    }
  }

  render() {
    const avatar = {
      xs: '50',
      sm: '100',
      md: '250',
      lg: '500',
      xl: '800'
  }
    const { image, color, name, doesLink, avatarStyle } = this.props;
    let style = {};

    const displayname = name || 'NA';

    let givenStyle = {};

    if (!_.isEmpty(avatarStyle)) {
      givenStyle = avatarStyle;
    }

    if (!image) {
      if (color) {
        style.color = color;
      }
      if (doesLink) {
      //   style.width = 100;
      // style.height = 100;
        return (
          <Link style={{ ...style, ...givenStyle }} to={`/channel/${name}`} className="no-avatar">
            { displayname.substring(0, 2) }
          </Link>
        );
      }

      return (
        <div style={{ ...style, ...givenStyle }} className="no-avatar">
          { displayname.substring(0, 2) }
        </div>
      );
    }

    this.state.loading ? style = {
      background: this.state.image,
    } : style = {
      backgroundImage: this.state.image,
    };

    if (doesLink) {
      style.width = avatar.xs;
      return (
        <Link style={{ ...style, ...givenStyle }} to={`/channel/${name}`} className="avatar" />
      );
    }

    return (
      <div className="avatar" style={{ ...style, ...givenStyle }} />
    );
  }
}

export default Avatar;
