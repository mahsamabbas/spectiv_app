import axios from 'axios';
import React, { Component } from 'react';
import isMobile from 'ismobilejs';
import { browserHistory, Link } from 'react-router';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import classNames from 'classnames';
import anchorme from 'anchorme';
import renderHTML from 'react-render-html';
import moment from 'moment';

import VideoPlayer from '../general/VideoPlayer.jsx';
import LikeButton from './../general/Like.jsx';
import SubscribeButton from './../general/Subscribe.jsx';
import CommentSection from './CommentSection.jsx';
import VideoNotFound from './VideoNotFound.jsx';
import Disabled from './Disabled.jsx';
import RecommendList from './RecommendList.jsx';
import PageLoading from './../general/PageLoading.jsx';
import Avatar from './../general/Avatar.jsx';
import ErrorHandle from './../alertHandle/index.jsx';

class Video extends Component {
  constructor(props) {
    super(props);

    this.getVideo = this.getVideo.bind(this);
    this.renderContent = this.renderContent.bind(this);
    this.renderClosableContent = this.renderClosableContent.bind(this);
    this.toggleContentOption = this.toggleContentOption.bind(this);
    this.updateMinHeight = this.updateMinHeight.bind(this);


    this.state = {
      video: {},
      videoSources: [],
      owner: false,
      subscribed: false,
      totalSubscriber: 0,
      channel: {},
      notFound: false,
      loading: true,
      canLike: true,
      canComment: true,
      copied: 'Copy',
      isContentOpen: true,
      activeContent: 'Comment',
      isMobile: false,
      fullScreenMode: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.videoId !== this.props.params.videoId) {
      this.getVideo(nextProps.params.videoId);
    }
  }

  componentDidUpdate() {
    const videoPlayerContainer = document.querySelector('.video-player-container');
    const videoPlayerHeight = document.querySelector('dl8-video');
    if (videoPlayerContainer && videoPlayerHeight) {
      if (videoPlayerContainer.clientHeight < videoPlayerHeight.clientHeight) {
        videoPlayerHeight.style.height = `${videoPlayerContainer.clientHeight}px`;
      }
    }
  }

  componentDidMount() {
    this.getVideo(this.props.params.videoId);
    if (!isMobile.phone) {
      window.addEventListener('resize', this.updateMinHeight);
    }
    if (window.innerWidth <= 800) {
      this.setState({ isMobile: true });
    }
  }

  componentWillUmount() {
    if (!isMobile.phone) {
      window.removeEventListener('resize', this.updateMinHeight);
    }
  }

  correctVideoContainer() {
    const videoPlayerHeight = document.querySelector('dl8-video');
    videoPlayerHeight.style.height = `${parseInt(videoPlayerHeight.style.height) - 60}px`;
  }

  updateMinHeight() {
    if (window.innerWidth <= 800 && !this.state.isMobile) {
      this.setState({ isMobile: true });
    } else if (window.innerWidth > 800 && this.state.isMobile) {
      this.setState({ isMobile: false });
    }

    const videoPage = document.getElementById('video-page');
    const videoPlayerContainer = document.querySelector('.video-player-container');
    const videoPlayerHeight = document.querySelector('dl8-video');

    // if (videoPlayerContainer && videoPlayerHeight) {
    //   if (videoPlayerContainer.clientHeight < videoPlayerHeight.clientHeight) {
    //     videoPlayerHeight.style.height = `${videoPlayerContainer.clientHeight}px`;
    //   }
    // }

    if (videoPage && videoPlayerHeight) {
      setTimeout(() => {
        if (videoPlayerContainer && videoPlayerHeight) {
          if (videoPlayerContainer.clientHeight < videoPlayerHeight.clientHeight) {
            videoPlayerHeight.style.height = `${videoPlayerContainer.clientHeight}px`;
          }
        }
        if (videoPage.style.minHeight > 650) {
          videoPage.style.minHeight = `${parseInt(videoPlayerHeight.style.height) - 70}px`;
        }
      }, 1000);
    }

    if (screen.width === window.innerWidth && !this.state.fullScreenMode) {
      this.setState({ fullScreenMode: true });
    } else if (screen.width !== window.innerWidth && this.state.fullScreenMode) {
      this.setState({ fullScreenMode: false });
      setTimeout(() => {
        videoPlayerHeight.style.height = `${parseInt(videoPlayerHeight.style.height) - 60}px`;
        videoPage.style.minHeight = `${parseInt(document.querySelector('dl8-video').style.height) - 70}px`;
      }, 300);
    }
  }

  getVideo(videoId) {
    this.setState({ loading: true });

    axios({
      method: 'GET',
      url: `/api/video/${videoId}`,
    }).then((res) => {
      const { video, isSubscribed, owner, totalSubscriber } = res.data;
      if (video.accessibility === 3) {
        this.setState({
          notFound: true,
          loading: false,
        });
      } else {
        const videoSources = [];
        if (isMobile.phone) {
          videoSources.push({ src: video.pathTo1080p, type: 'application/x-mpegurl' });
        } else {
          videoSources.push({ src: video.pathToOriginal, type: 'video/mp4', quality: '4k' });
          if (video.pathTo1440p) videoSources.push({ src: video.pathTo1440p, type: 'video/mp4', quality: '1440p' });
        }

        this.setState({
          video,
          videoSources,
          channel: video.Channel,
          owner,
          subscribed: isSubscribed,
          totalSubscriber: parseInt(totalSubscriber),
          loading: false,
          canLike: video.canLike,
          canComment: video.canComment,
        }, () => {
          // this.updateMinHeight();
        });
      }
    }).catch((err) => {
      if (!err.response) {
        return this.setState({
          loading: false,
          error: true,
        });
      }
      if (err.response.status === 404) {
        return this.setState({
          notFound: true,
          loading: false,
        });
      }

      return this.setState({
        loading: false,
        error: true,
      });
    });
  }

  getVideoPlayer() {
    if (this.state.videoSources.length) {
      return (
        <VideoPlayer
          title={this.state.video.title}
          author={this.state.channel.name}
          author-href={`/channel/${this.state.channel.name}`}
          format="MONO_360"
          poster={this.state.video.thumbnailPath}
          display-mode="inline"
          width="100%"
          source={this.state.videoSources}
          videoId={this.state.video.id}
        />
      );
    }
  }

  likeButtons() {
    if (this.state.canLike) {
      return (
        <div>
          <LikeButton
            video={this.state.video}
            account={this.props.account}
            channel={this.state.channel}
          />
        </div>
      );
    }

    return <Disabled content="rate" />;
  }

  subscribeButton() {
    if (this.props.account.id === this.state.video.Channel.userId) {
      return (
        <button
          className="sub-btn"
          onClick={() => browserHistory.push(`/edit/${this.state.video.id}`)}
        >
          Edit Video
        </button>
      );
    }
    return (
      <SubscribeButton
        subscribed={this.state.subscribed}
        totalSubscriber={this.state.totalSubscriber}
        channel={this.state.channel}
        account={this.props.account}
      />
    );
  }

  commentSection() {
    if (this.state.canComment) {
      return (
        <CommentSection
          params={this.props.params}
          account={this.props.account}
          owner={this.state.owner}
        />
      );
    }

    return (<Disabled
      content="comment" style={{
        textAlign: 'center',
        paddingTop: 16,
        paddingBottom: 16,
        background: '#EEEEEE',
        marginLeft: 8,
        marginRight: 8,
        marginTop: 12,
      }}
    />);
  }

  calcLikePercentage(likes, dislikes) {
    return likes / (likes + dislikes) * 100;
  }

  toggleContentOption() {
    this.setState({ isContentOpen: false });
    setTimeout(() => {
      this.setState({ activeContent: '' });
    }, 250);
  }

  renderClosableContent() {
    const { activeContent, video, channel, totalSubscriber } = this.state;

    if (activeContent === 'Comment') {
      return [
        <div className="top-content">
          <h5>Comments</h5>
          <button className="toggle-btn" onClick={this.toggleContentOption}>
            <img src="/static/images/right-arrow.svg" alt="Right Arrow" />
          </button>
        </div>,
        this.commentSection(),
      ];
    }

    if (activeContent === 'Recommend') {
      return [
        <div className="top-content">
          <h5>Recommended</h5>
          <button className="toggle-btn" onClick={this.toggleContentOption}>
            <img src="/static/images/right-arrow.svg" alt="Right Arrow" />
          </button>
        </div>,
        <RecommendList video={this.state.video} />,
      ];
    }

    if (activeContent === 'Description') {
      return [
        <div className="top-content">
          <h5>Description</h5>
          <button className="toggle-btn" onClick={this.toggleContentOption}>
            <img src="/static/images/right-arrow.svg" alt="Right Arrow" />
          </button>
        </div>,
        <div className="description-wrapper">
          <div className="channel-desc-wrapper">
            <Avatar
              image={channel.User.avatarPath}
              name={channel.name}
              color={channel.color}
              doesLink
            />
            <div className="channel-col-wrapper">
              <Link className="title" to={`/channel/${channel.name}`}>{channel.name}</Link>
              <Link className="title" to={`/channel/${channel.name}`}>{totalSubscriber} subscribers</Link>
            </div>
          </div>
          <p>Uploaded on {moment(video.createdAt).format('MM/DD/YYYY')}</p>
          <p>{video.desc ? renderHTML(anchorme(video.desc, { attributes: [{ name: 'target', value: 'blank' }, { name: 'style', value: 'color: #4EBD94' }] })) : null}</p>
        </div>,
      ];
    }

    if (activeContent === 'Share') {
      return [
        <div className="top-content">
          <h5>Share</h5>
          <button className="toggle-btn" onClick={this.toggleContentOption}>
            <img src="/static/images/right-arrow.svg" alt="Right Arrow" />
          </button>
        </div>,
        <div className="description-wrapper">
          <p>Copy This Link</p>
          <div className="share-link">
            <input id="url" className="url" type="text" value={window.location} readOnly />
            <div className="share-link-buttons">
              <CopyToClipboard
                text={window.location}
                onCopy={() => {
                  this.setState({ copied: 'Copied' });
                  setTimeout(() => {
                    this.setState({
                      copied: 'Copy',
                    });
                  }, 2500);
                }}
              ><button disabled={this.state.copied === 'Copied'}>{this.state.copied}</button>
              </CopyToClipboard>
            </div>
          </div>
        </div>,
      ];
    }
  }

  changeNavOption(nav) {
    if (this.state.activeContent === nav) {
      this.setState({
        activeContent: '',
        isContentOpen: false,
      });
    } else {
      this.setState({
        activeContent: nav,
        isContentOpen: true,
      });
    }
  }

  renderContent() {
    const { channel, video, isContentOpen } = this.state;
    if (this.state.loading) {
      return <PageLoading message={'Loading Video...'} />;
    }

    if (this.state.error) {
      return <ErrorHandle />;
    }

    if (this.state.notFound) {
      return <VideoNotFound />;
    }

    if (isMobile.phone || this.state.isMobile) {
      return (
        <section id="video-page" style={{ maxHeight: '100vh' }}>
          <div
            className="video-wrapper"
            style={{
              width: '100%',
              marginTop: 24,
            }}
          >
            {this.getVideoPlayer()}
            <div className="mobile-video-info">
              <div className="mobile-video-info-left">
                <Avatar
                  image={channel.User.avatarPath}
                  name={channel.name}
                  color={channel.color}
                  doesLink
                />
                <div className="video-title-views-wrapper">
                  <h5>{video.title}</h5>
                  <p>Views: {video.viewCount}</p>
                </div>
              </div>
              <div className="mobile-video-info-right">
                { this.likeButtons() }
                { this.subscribeButton() }
              </div>
            </div>
          </div>
          <div className="options-nav-wrapper">
            <div
              className={classNames('video-nav-option', { active: this.state.activeContent === 'Comment' })}
              onClick={() => this.changeNavOption('Comment')}
            >
              { this.state.activeContent === 'Comment'
                ? <img src="/static/images/videopage_comment.svg" alt="Comment Icon" />
                : <img src="/static/images/white_comment.svg" alt="Comment Icon" />
              }
            </div>
            <div
              className={classNames('video-nav-option', { active: this.state.activeContent === 'Recommend' })}
              onClick={() => this.changeNavOption('Recommend')}
            >
              { this.state.activeContent === 'Recommend'
                ? <img src="/static/images/recommendedgreen.svg" alt="Recommend Icon" />
              : <img src="/static/images/recommended.svg" alt="Recommend Icon" />
              }
            </div>
            <div
              className={classNames('video-nav-option', { active: this.state.activeContent === 'Description' })}
              onClick={() => this.changeNavOption('Description')}
            >
              { this.state.activeContent === 'Description'
                ? <img src="/static/images/description_green.svg" alt="Description Icon" />
              : <img src="/static/images/videopage_description-15.svg" alt="Description Icon" />
              }
            </div>
            <div
              className={classNames('video-nav-option', { active: this.state.activeContent === 'Share' })}
              onClick={() => this.changeNavOption('Share')}
            >
              { this.state.activeContent === 'Share'
                ? <img src="/static/images/share_green.svg" alt="Share Icon" />
              : <img src="/static/images/share_white.svg" alt="Share Icon" />
              }
            </div>
          </div>
          <div className="closable-content-wrapper">
            { this.renderClosableContent() }
          </div>
        </section>
      );
    }

    return (
      <section id="video-page">
        <div
          className="video-wrapper"
          style={{
            width: isContentOpen ? 'calc(75% - 25px)' : 'calc(100% - 50px)',
          }}
        >
          <div className="video-player-container">

            {this.getVideoPlayer()}
          </div>
          <div className="video-info-bar">
            <div className="video-info-left">
              <Avatar
                image={channel.User.avatarPath}
                name={channel.name}
                color={channel.color}
                doesLink
              />
              <div className="video-title-views-wrapper">
                <h5>{video.title}</h5>
                <p>Views: {video.viewCount}</p>
              </div>
              { this.subscribeButton() }
            </div>
            <div className="video-info-right">
              { this.likeButtons() }
            </div>
          </div>
        </div>
        <div
          className="closable-content-wrapper"
          style={{
            width: isContentOpen ? 'calc(25% - 25px)' : '0px',
          }}
        >
          { this.renderClosableContent() }
        </div>
        <div className="options-nav-wrapper">
          <div
            className={classNames('video-nav-option', { active: this.state.activeContent === 'Comment' })}
            onClick={() => this.changeNavOption('Comment')}
          >
            { this.state.activeContent === 'Comment'
              ? <img src="/static/images/videopage_comment.svg" alt="Comment Icon" />
              : <img src="/static/images/white_comment.svg" alt="Comment Icon" />
            }
          </div>
          <div
            className={classNames('video-nav-option', { active: this.state.activeContent === 'Recommend' })}
            onClick={() => this.changeNavOption('Recommend')}
          >
            { this.state.activeContent === 'Recommend'
              ? <img src="/static/images/recommendedgreen.svg" alt="Recommend Icon" />
            : <img src="/static/images/recommended.svg" alt="Recommend Icon" />
            }
          </div>
          <div
            className={classNames('video-nav-option', { active: this.state.activeContent === 'Description' })}
            onClick={() => this.changeNavOption('Description')}
          >
            { this.state.activeContent === 'Description'
              ? <img src="/static/images/description_green.svg" alt="Description Icon" />
            : <img src="/static/images/videopage_description-15.svg" alt="Description Icon" />
            }
          </div>
          <div
            className={classNames('video-nav-option', { active: this.state.activeContent === 'Share' })}
            onClick={() => this.changeNavOption('Share')}
          >
            { this.state.activeContent === 'Share'
              ? <img src="/static/images/share_green.svg" alt="Share Icon" />
            : <img src="/static/images/share_white.svg" alt="Share Icon" />
            }
          </div>
        </div>
      </section>
    );
  }

  // NOTE: Need loading state for entire page to load before rendering.

  render() {
    return this.renderContent();
  }
}

export default Video;
