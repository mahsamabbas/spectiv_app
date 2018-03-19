import React, { Component } from 'react';
import isMobile from 'ismobilejs';
import axios from 'axios';

class ImageUploader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: null,
      imageFileReaderUrl: '',
      imageLoading: false,
      imageErr: false,
    };
  }
  createFormData() {
    const formData = new FormData();
    const { videoHash, videoId } = this.props.options;
    formData.append('image', this.state.image);

    if (this.props.channel) {
      if (this.props.channel.searchId) {
        formData.append('searchId', this.props.channel.searchId);
      }
    }

    if (this.props.searchId) {
      formData.append('searchId', this.props.searchId);
    }

    if (this.props.type === 'thumbnail') {
      formData.append('videoHash', videoHash);
      formData.append('videoId', videoId);
    }

    return formData;
  }

  checkImageSize(file) {
    if (file) {
      if (file.size > 10000000 || file.name.length > 120) {
        this.setState({ image: null, imageErr: 'File size exceeds 10mb or file name is too long.' });
      } else {
        this.setState({ image: file, imageErr: false });
        const reader = new FileReader();

        reader.onload = (e) => {
          this.setState({ imageFileReaderUrl: e.target.result });
        };

        reader.readAsDataURL(file);
      }
    } else {
      this.setState({ image: null, imageErr: false });
    }
  }

  uploadImage() {
    this.setState({ imageLoading: true });

    axios({
      method: 'POST',
      url: '/api/image-upload',
      data: this.createFormData(),
    })
    .then((res) => {
      const { avatarPath } = res.data;
      this.setState({
        imageLoading: false,
        image: null,
        imageFileReaderUrl: avatarPath,
      });
      if (this.props.type === 'avatar') {
        this.props.updateUserAvatar({ avatarPath });
      }
    })
    .catch((err) => {
      console.log(err);
      this.setState({ imageErr: 'Something went wrong with the upload. Please contact support.', imageLoading: false });
    });
  }

  render() {
    const { imageFileReaderUrl, image, imageLoading } = this.state;
    const style = {};
    let typeClass;
    if (imageFileReaderUrl || this.props.imageUrl) {
      style.backgroundImage = `url('${imageFileReaderUrl || this.props.imageUrl}')`;
    }

    if (this.props.isAvatar) {
      typeClass = 'isAvatar';
    } else if (this.props.isThumbnail) {
      typeClass = 'isThumbnail';
    }

    if (isMobile.any) return null;

    return (
      <div className="image-upload">
        <div style={style} className={`image-preview ${typeClass}`}>
          <div className="overlay">
            { imageLoading ? <img src="/static/images/oval.svg" width="30" /> : <b>{image ? 'Not Saved' : this.props.title || 'Preview'}</b> }
          </div>
        </div>
        {
          image ?
            <div className="btn-wrapper">
              <button disabled={imageLoading} onClick={() => this.uploadImage()}>Save</button>
              <button disabled={imageLoading} onClick={() => { this.setState({ image: null, imageFileReaderUrl: '' }); }}>Cancel</button>
            </div>
          :
            <button
              className="select-file-btn"
              onClick={() => this.uploader.click()}
            >Select File</button>
        }
        <input
          id="image-select"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={r => this.uploader = r}
          onChange={e => this.checkImageSize(e.target.files[0])}
        />
      </div>
    );
  }
}

export default ImageUploader;
