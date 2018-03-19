import React, { Component } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import _ from 'lodash';
import isMobile from 'ismobilejs';
import { browserHistory, Link } from 'react-router';

import UploadContainer from './../../containers/UploadContainer';
import UploadVideo from './UploadVideo.jsx';
import EditVideo from './../editVideo/EditVideo.jsx';
import VideoPlayer from './../general/VideoPlayer.jsx';
import ProgressBar from './../general/ProgressBar.jsx';
import displayDuration from './../../utils/displayDuration';
import AlertHandle from './../alertHandle/AlertHandle.jsx';

class Upload extends Component {
  constructor(props) {
    super(props);

    this.state = {
      uploadType: '',
      videoLink: '',
      videoTitle: '',
      loaded: '',
      total: '',
      videoId: null,
      searchId: null,
      videoHash: '',
      videoHeight: '',
      videoDuration: '',
      isUploading: true,
      alert: false,
      alertMsg: '',
      success: false,
    };

    // Bind methods to component
    this.onUploadVideo = this.onUploadVideo.bind(this);
    this.uploadField = this.uploadField.bind(this);
    this.getVideoHeight = this.getVideoHeight.bind(this);
  }

  componentDidMount() {
    if (!this.props.account.active) {
      browserHistory.push('/');
    } else {
      axios.get('/api/user-uploading')
      .then((res) => {
        this.createPusher();
        this.setState({ isUploading: res.data.isUploading });
      }).catch(err => console.log(err));
    }
  }

  componentWillReceiveProps() {
    this.createPusher();
    if (this.state.uploadType === 'complete') {
      this.setState({
        uploadType: '',
        videoLink: '',
        videoTitle: '',
        loaded: '',
        total: '',
        videoId: null,
        searchId: null,
        videoHash: '',
        videoHeight: '',
        videoDuration: '',
        isUploading: false,
        alert: false,
        alertMsg: '',
        success: false,
      });
    }
  }

  componentWillUnmount() {
    if (this.pusherChannel) this.pusherChannel.unsubscribe();
  }

  onUploadVideo(acceptedFiles, rejectedFiles) {
    if (rejectedFiles.length) {
      this.setState({
        success: false,
        alertMsg: `${_.map(rejectedFiles, file => file.name).join(', ')} were rejected. Only 1 VIDEO file can be uploaded at a time.`,
        alert: true,
      });
    } else if (acceptedFiles[0].name.length > 60) {
      this.setState({
        success: false,
        alertMsg: 'File name can\'t be longer than 60 characters.',
        alert: true,
      });
    } else {
      this.setState({ videoTitle: acceptedFiles[0].name, videoSize: acceptedFiles[0].size });
      this.props.actions.changeEditVideoInfo({
        title: acceptedFiles[0].name,
        desc: '',
        canLike: true,
        canComment: true,
        accessibility: '1',
        tags: [],
      });
      this.props.actions.changeVideoFile(acceptedFiles[0]);
      this.setState({ uploadType: 'ready', sourceChange: false });
      setTimeout(() => {
        this.setState({ sourceChange: true });
      }, 200);
    }
  }

  getProgressBar() {
    const { uploadType, loaded, total } = this.state;
    if (_.indexOf(['processing', 'uploading', 'encoding'], uploadType) > -1) {
      return (
        <div style={{ width: '100%' }}>
          {uploadType === 'encoding' ?
            <div>
              Your video is uploaded! We are still encoding it but you can view your video <Link to={`/v/${this.state.videoId}`} style={{ color: '#4EBD94' }}>here!</Link>
            </div>
          : null}
          <ProgressBar
            bottomText={uploadType}
            progress={(loaded / total).toFixed(2)}
            uploadType={uploadType}
          />
        </div>
      );
    }
    return null;
  }

  getVideoHeight(e) {
    if (e.path) {
      this.setState({
        videoHeight: e.path[0].videoHeight,
        videoDuration: Math.round(e.path[0].duration),
      });
    } else {
      this.setState({
        videoHeight: e.target.videoHeight,
        videoDuration: Math.round(e.target.duration),
      });
    }
  }

  getVideoInfo(videoId) {
    axios.get(`/api/video-info/${videoId}`)
    .then((results) => {
      const { title, desc, thumbnailPath, canLike, canComment, accessibility, tags } = results.data;
      this.props.actions.changeEditVideoInfo({
        title,
        desc,
        thumbnailPath,
        canLike,
        canComment,
        accessibility,
        tags: _.map(tags, tag => ({ text: tag.name })),
      });
    });
  }

  createPusher() {
    if (!this.pusher && !this.pusherChannel && this.props.account.id) {
      this.pusher = new Pusher('484bec97617b22d89c5b', {
        encrypted: true,
        cluster: 'us2',
      });
      this.pusherChannel = this.pusher.subscribe('videos');

      this.pusherChannel.bind(`upload-progress-${this.props.account.id}`, (data) => {
        const { loaded, total, videoId } = data;
        if (!this.state.videoId) this.getVideoInfo(videoId);
        this.setState({ videoId, loaded, total, uploadType: 'uploading' });
      });

      this.pusherChannel.bind(`encode-progress-${this.props.account.id}`, (videoId) => {
        if (!this.state.videoId) this.getVideoInfo(videoId);
        this.setState({ uploadType: 'encoding', loaded: 1, total: 1, videoId });
      });

      this.pusherChannel.bind(`videoHash-${this.props.account.id}`, (videoHash) => {
        this.setState({ videoHash });
      });

      this.pusherChannel.bind(`upload-crashed-${this.props.account.id}`, () => {
        this.setState({ uploadType: 'crashed' });
      });

      this.pusherChannel.bind(`upload-complete-${this.props.account.id}`, (videoId) => {
        if (!this.state.videoId) this.getVideoInfo(videoId);
        this.getVideoInfo(videoId);
        this.setState({
          loaded: '',
          total: '',
          videoId,
          videoLink: `/v/${videoId}`,
          uploadType: 'complete',
        });
      });
    }
  }

  initializeUploadVideo() {
    const formData = new FormData();
    const { name, avatarPath, channelURL, color, searchId } = this.props.account.channel;
    formData.append('video', this.props.upload.uploadFile);
    formData.append('videoHeight', this.state.videoHeight);
    formData.append('videoDuration', this.state.videoDuration);
    formData.append('channelName', name);
    formData.append('channelAvatar', avatarPath);
    formData.append('channelUrl', channelURL);
    formData.append('channelColor', color);
    formData.append('channelSearchId', searchId);

    axios({
      method: 'POST',
      url: '/api/video-upload',
      data: formData,
      onUploadProgress: (e) => {
        const { loaded, total } = e;
        if (e.lengthComputable) {
          this.setState({ loaded, total, uploadType: 'processing' });
        }
      },
    }).then((res) => {
      this.setState({ videoId: res.data.videoId, searchId: res.data.searchId });
      console.log(res);
    }).catch((err) => {
      console.log(err);
    });
  }

  uploadField() {
    if (!this.props.account.id) {
      window.location = '/login';
      return <div>loading...</div>;
    }
    if (!this.state.uploadType) {
      if (!this.props.account.channel.id) {
        return browserHistory.push('/my-channel');
      } else if (this.state.isUploading) {
        return (
          <div className="loading-video-progress">
            <img src="/static/images/loading.svg" alt="loading..." />
            <h2>Please wait while we get your current upload's progress!</h2>
          </div>
        );
      }
      return (
        <div className="upload-video-wrapper">
          <UploadVideo onUploadVideo={this.onUploadVideo} />
        </div>
      );
    }

    if (this.state.uploadType === 'ready') {
      return (
        <div className="upload-video-wrapper">
          <UploadVideo onUploadVideo={this.onUploadVideo} isDragged />
          <div className="video-preview-wrapper">
            <div className="preview-wrapper">
              <div style={{ width: '75%', height: 'auto' }}>
                <div className="top-preview-content">
                  <h2>{`${this.props.upload.videoInfo.title}`}</h2>
                  <div className="preview-tag" >Preview</div>
                </div>
                {this.state.sourceChange ?
                  <VideoPlayer
                    getVideoHeight={this.getVideoHeight}
                    title={this.props.upload.uploadFile.name}
                    author={this.props.account.channel.name}
                    format="MONO_360"
                    display-mode="inline"
                    width="100%"
                    source={[
                        { src: this.props.upload.uploadFile.preview, type: 'video/mp4' },
                    ]}
                  /> : null}
                <div className="video-specs">{`${Math.round(this.state.videoSize / 1000000)}MB/${displayDuration(this.state.videoDuration)}`}</div>
                <button
                  className="upload-btn"
                  onClick={() => this.initializeUploadVideo()}
                  disabled={!this.state.videoHeight}
                >
                  CONFIRM FILE UPLOAD
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (this.state.uploadType === 'processing') {
      return (
        <div className="processing-wrapper">
          <h2>{`${this.props.upload.videoInfo.title}`}</h2>
          {this.getProgressBar()}
        </div>
      );
    } else if (this.state.uploadType === 'crashed') {
      return (
        <div>
          <h2>{`${this.props.upload.videoInfo.title}`}</h2>
          <div>I'm sorry. Your upload crashed. Please try uploading your video again.</div>
          <button
            onClick={() => {
              this.setState({
                myChannel: '',
                uploadType: '',
                videoLink: '',
                videoTitle: '',
                loaded: '',
                total: '',
                videoId: null,
                searchId: null,
                videoHash: '',
                thumbnailLoading: false,
                thumbnail: null,
                thumbnailErr: false,
              });
            }}
          >Try Again</button>
        </div>
      );
    }
    return (
      <div className="uploading-wrapper" style={{ marginTop: this.state.uploadType === 'complete' ? 36 : 120 }}>
        <div className="top-content">
          {this.state.uploadType === 'complete'
            ? (
              <div className="top-wrap">
                <Link to={this.state.videoLink} className="play-link">
                  <span>Click here to view video.</span>
                </Link>
                <button
                  className="upload-btn"
                  onClick={() => {
                    this.setState({
                      uploadType: '',
                      videoLink: '',
                      videoTitle: '',
                      loaded: '',
                      total: '',
                      videoId: null,
                      searchId: null,
                      videoHash: '',
                      videoHeight: '',
                      videoDuration: '',
                      isUploading: false,
                      alert: false,
                      alertMsg: '',
                      success: false,
                    });
                  }}
                >Upload another video</button>
              </div>
            )
            : this.getProgressBar()}
        </div>
        <EditVideo
          isFromUpload
          file={this.props.upload.uploadFile}
          videoInfo={this.props.upload.videoInfo}
          actions={this.props.actions}
          videoId={this.state.videoId}
          videoHash={this.state.videoHash}
          searchId={this.state.searchId}
        />
      </div>
    );
  }

  render() {
    if (isMobile.any) {
      return (
        <div style={{ width: '80%', margin: '50px auto', textAlign: 'center' }}>Please login to desktop to upload videos</div>
      );
    }
    return (
      <section id="upload">
        <AlertHandle
          success={this.state.success}
          message={this.state.alertMsg}
          visible={this.state.alert}
          onClose={() => this.setState({ alertMsg: '', alert: false })}
        />
        {this.props.account.loading ? <div>loading...</div> : this.uploadField()}
      </section>
    );
  }
}

export default UploadContainer(Upload);
