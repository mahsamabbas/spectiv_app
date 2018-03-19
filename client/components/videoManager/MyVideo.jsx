import React, { Component } from 'react';
import axios from 'axios';
import moment from 'moment';
import isMobile from 'ismobilejs';
import { browserHistory, Link } from 'react-router';

import loadImage from './../../utils/loadImage';

class MyVideo extends Component {
  constructor(props) {
    super(props);

    this.deleteVideo = this.deleteVideo.bind(this);

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
    if (this.props.video.thumbnailPath) {
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

  goToEditVideo() {
    browserHistory.push(`/edit/${this.props.video.id}`);
  }

  deleteVideo() {
    // Grabs the folder's name out of the path to the original file in s3 storage
    const folderName = this.props.video.pathToOriginal.split(`user_${this.props.video.Channel.userId}`)[1].split('/')[1];
    axios({
      method: 'DELETE',
      url: `/api/video-delete/${folderName}/${this.props.video.id}`,
      data: {
        searchId: this.props.video.searchId,
      },
    }).then(() => {
      this.props.refreshList();
    }).catch(err => console.log(err));
  }

  render() {
    const { video } = this.props;
    const { loading, image } = this.state;
    const style = {};
    if (video.thumbnailPath) {
      if (loading) {
        style.background = image;
      } else {
        style.backgroundImage = image;
        style.animation = 'fadeImage .1s';
      }
    }

    return (
      <div className="my-video">
        <div className="my-video-wrapper">
          <Link to={`/v/${video.id}`} className="video-thumbnail" style={style} />
          {!isMobile.phone ?
            <div className="video-action">
              <button onClick={() => this.goToEditVideo()}>Edit</button>
              <button onClick={() => this.props.openConfirm(this.deleteVideo)}>Delete</button>
            </div>
            : null}
          <Link to={`/v/${video.id}`} className="video-info">
            <h4>{video.title}</h4>
            <div className="date">{ moment(new Date(video.createdAt)).format('MMM Do YYYY h:mm a') }</div>
          </Link>
        </div>
      </div>
    );
  }
}

export default MyVideo;
