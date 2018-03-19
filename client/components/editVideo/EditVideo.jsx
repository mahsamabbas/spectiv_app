import React, { Component } from 'react';
import { WithContext as ReactTags } from 'react-tag-input';
import axios from 'axios';
import { browserHistory } from 'react-router';
import isMobile from 'ismobilejs';

import EditVideoContainer from './../../containers/EditVideoContainer';
import ImageUploader from './../general/ImageUploader.jsx';
import Checkbox from './../general/Checkbox.jsx';
import OverlaySaving from './../general/OverlaySaving.jsx';
import infoValidation from './../../utils/infoValidation';
import AlertHandle from './../alertHandle/AlertHandle.jsx';

class EditVideo extends Component {
  constructor(props) {
    super(props);

      // Bind methods to component
    this.handleDelete = this.handleDelete.bind(this);
    this.handleAddition = this.handleAddition.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.getTags = this.getTags.bind(this);
    this.createVideo = this.createVideo.bind(this);
    this.updateVideo = this.updateVideo.bind(this);
    this.onChangeInput = this.onChangeInput.bind(this);

    this.state = {
      suggestions: [],
      videoHash: this.props.videoHash || null,
      videoId: this.props.videoId || null,
      videoOwner: false,
      loading: false,
      alert: false,
      alertmMsg: '',
      success: false,
    };
  }

  componentDidMount() {
    this.getTags();

    if (!this.props.isFromUpload) {
      this.getEditVideoInfo();
    }
  }

  onChangeInput(key, value) {
    this.props.actions.changeEditVideoInfo({
      ...this.props.videoInfo,
      [key]: value,
    });
  }

  getEditVideoInfo() {
    const { videoId } = this.props.params;
    axios({
      method: 'GET',
      url: `/api/edit/video/${videoId}`,
    }).then((res) => {
      const { title, desc, Tags, canComment, canLike, accessibility, thumbnailPath } = res.data.video;

      this.setState({ videoHash: res.data.video.pathToOriginal.split('/')[4], videoId, videoOwner: true });

      this.props.actions.changeEditVideoInfo({
        title,
        desc,
        canComment,
        canLike,
        accessibility,
        thumbnailPath,
        tags: Tags.map(tag => ({ id: tag.id, text: tag.name })),
      });
    }).catch((err) => {
      console.log(err);
      return browserHistory.push('/');
    });
  }

  getTags() {
    axios({
      url: '/api/tags',
      method: 'GET',
    }).then((res) => {
      const { tags } = res.data;

      this.setState({
        suggestions: tags.map(tag => tag.name),
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  handleDelete(idx) {
    const { tags } = this.props.videoInfo;

    this.props.actions.changeEditVideoInfo({
      ...this.props.videoInfo,
      tags: [
        ...tags.slice(0, idx),
        ...tags.slice(idx + 1),
      ],
    });
  }

  handleAddition(tag) {
    this.props.actions.changeEditVideoInfo({
      ...this.props.videoInfo,
      tags: [...this.props.videoInfo.tags, { text: tag }],
    });
  }

  handleDrag(tag, currPos, newPos) {
    const { tags } = this.props.videoInfo;

      // mutate array
    tags.splice(currPos, 1);
    tags.splice(newPos, 0, tag);

    // re-render
    this.props.actions.changeEditVideoInfo({
      ...this.props.videoInfo,
      tags,
    });
  }


  createVideo(e) {
    e.preventDefault();

    axios({
      method: 'POST',
      url: '/api/video',
      data: {
        title: this.title.value,
        desc: this.desc.value,
        tags: this.state.tags.map((tag) => { return { name: tag.text }; }),
      },
    }).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log(err);
    });
  }

  updateVideo(e) {
    e.preventDefault();
    const videoId = this.props.videoId || this.props.params.videoId;
    const { title, desc, tags } = this.props.videoInfo;
    const searchId = this.props.searchId;

    infoValidation('Video', title, desc, null, tags)
    .then((result) => {
      this.setState({
        loading: true,
        ...result,
      });
      if (!this.state.alert) {
        axios({
          method: 'PATCH',
          url: '/api/video',
          data: {
            ...this.props.videoInfo,
            tags: [...this.props.videoInfo.tags.map(tag => ({ name: tag.text }))],
            videoId,
            searchId,
          },
        }).then((res) => {
          console.log(res);
          this.setState({
            loading: false,
            success: true,
            alertMsg: 'Your video information has been updated!',
            alert: true,
          });
        }).catch((err) => {
          console.log(err);
          this.setState({
            loading: false,
            success: false,
            alertMsg: 'Something went wrong, please refresh the page and try again.',
            alert: true,
          });
        });
      } else {
        this.setState({ loading: false });
      }
    });
  }

  checkThumbnailSize(file) {
    if (file.size > 10000000) {
      this.setState({ thumbnail: null, thumbnailErr: true });
    } else {
      this.setState({ thumbnail: file, thumbnailErr: false });
    }
  }

  getRowCount(descCount) {
    if (descCount < 60) {
      return 1;
    }

    if (Math.ceil(descCount / 60) > 4) {
      return 4;
    }

    return Math.ceil(descCount / 60);
  }

  render() {
    const { suggestions, videoId, videoHash } = this.state;
    if (isMobile.phone) return <div style={{ marginTop: '50px', textAlign: 'center' }}>Login from a desktop to edit your videos.</div>;
    return (
      <section id="edit-video">
        <AlertHandle
          success={this.state.success}
          message={this.state.alertMsg}
          visible={this.state.alert}
          onClose={() => this.setState({ alertMsg: '', alert: false })}
        />
        <div className="edit-video-wrapper">
          <div className="edit-video-left">
            <ImageUploader
              title={'Thumbnail Preview'}
              type="thumbnail"
              options={{ videoId, videoHash }}
              imageUrl={this.props.videoInfo.thumbnailPath}
              searchId={this.props.searchId}
              isThumbnail="true"
            />
          </div>
          <form onSubmit={this.updateVideo}>
            <div className="edit-video-right">
              <input
                placeholder="Title"
                className="input-field"
                ref={(r) => { this.title = r; }}
                value={this.props.videoInfo.title}
                onChange={e => this.onChangeInput('title', e.currentTarget.value)}
              />
              <textarea
                placeholder="Description"
                rows={this.getRowCount((this.props.videoInfo.desc || '').length)}
                ref={(r) => { this.desc = r; }}
                value={this.props.videoInfo.desc}
                onChange={e => this.onChangeInput('desc', e.currentTarget.value)}
              />
              <div className="tag-access-wrapper">
                <div className="left">
                  <ReactTags
                    tags={this.props.videoInfo.tags}
                    placeholder={'Add Tags'}
                    suggestions={suggestions}
                    handleDelete={this.handleDelete}
                    handleAddition={this.handleAddition}
                    handleDrag={this.handleDrag}
                  />
                </div>
                <div className="right">
                  <select
                    ref={(r) => { this.accessibility = r; }}
                    value={this.props.videoInfo.accessibility}
                    onChange={e => this.onChangeInput('accessibility', e.currentTarget.value)}
                  >
                    <option value="1">Public</option>
                    <option value="2">Unlisted</option>
                    <option value="3">Private</option>
                  </select>
                </div>
              </div>
              <div className="label-wrapper">
                <Checkbox
                  onChange={value => this.onChangeInput('canLike', value)}
                  checked={this.props.videoInfo.canLike}
                  label={'Allow Likes?'}
                />
                <Checkbox
                  onChange={value => this.onChangeInput('canComment', value)}
                  checked={this.props.videoInfo.canComment}
                  label={'Allow Comments?'}
                />
              </div>
              <button className="save-btn" type="submit">Save</button>
              { this.state.loading ? <OverlaySaving /> : null }
            </div>
          </form>
        </div>
      </section>
    );
  }
}

export default EditVideoContainer(EditVideo);
