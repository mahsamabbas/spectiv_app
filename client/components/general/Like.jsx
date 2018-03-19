import React, { Component } from 'react';
import axios from 'axios';

import AlertHandle from './../alertHandle/AlertHandle.jsx';
import SmallLoading from './../general/SmallLoading.jsx';

class LikeButton extends Component {
  constructor(props) {
    super(props);

    this.rateVideo = this.rateVideo.bind(this);
    this.destroyRate = this.destroyRate.bind(this);

    this.state = {
      liked: false,
      rate: false,
      likes: 0,
      total: 0,
      error: false,
      errMsg: '',
      loading: true,
    };
  }

  componentDidMount() {
    this.getVideoLike();
  }

  getVideoLike() {
    axios({
      method: 'GET',
      url: `/api/video/${this.props.video.id}/like`,
    }).then((res) => {
      if (res.data.rate) {
        this.setState({
          liked: res.data.rate.isLiked,
          rate: true,
          likes: res.data.likedCount,
          total: res.data.totalCount,
          loading: false,
        });
      } else {
        this.setState({
          liked: false,
          rate: false,
          likes: res.data.likedCount,
          total: res.data.totalCount,
          loading: false,
        });
      }
    }).catch(() => {
      this.setState({
        liked: false,
        loading: false,
      });
    });
  }

  rateVideo(isLiked) {
    if (this.props.account.username) {
      if (isLiked) {
        if (this.state.rate) {
          const likes = this.state.likes + 1;
          this.setState({
            liked: !!isLiked,
            rate: true,
            likes,
          });
        } else {
          const likes = this.state.likes + 1;
          const total = this.state.total + 1;
          this.setState({
            liked: !!isLiked,
            rate: true,
            likes,
            total,
          });
        }
      } else if (this.state.rate) {
        const likes = this.state.likes - 1;
        this.setState({
          liked: !!isLiked,
          rate: true,
          likes,
        });
      } else {
        const total = this.state.total + 1;
        this.setState({
          liked: !!isLiked,
          rate: true,
          total,
        });
      }

      axios({
        method: 'POST',
        url: `/api/video/${this.props.video.id}/like`,
        data: {
          isLiked,
          searchId: this.props.channel.searchId,
        },
      }).catch((err) => {
        console.error(err);
        this.setState({
          liked: false,
          rate: false,
          error: true,
          errMsg: 'There was an unexpected error please rate the video again!',
        });
      });
    } else {
      this.setState({ error: true, errMsg: 'You need to login to rate video' });
    }
  }

  destroyRate() {
    if (this.state.liked) {
      const likes = this.state.likes - 1;
      const total = this.state.total - 1;
      this.setState({
        liked: false,
        rate: false,
        likes,
        total,
      });
    } else {
      const total = this.state.total - 1;
      this.setState({
        liked: false,
        rate: false,
        total,
      });
    }

    axios({
      method: 'DELETE',
      url: `/api/video/${this.props.video.id}/like`,
      data: {
        isLiked: this.state.liked,
        searchId: this.props.channel.searchId,
      },
    }).catch((err) => {
      console.error(err);
      this.getVideoLike();
      this.setState({ error: true, errMsg: 'There was an unexpected error please rate the video again!' });
    });
  }

  calcLikePercentage(likes, dislikes) {
    return likes / (likes + dislikes) * 100;
  }

  buttons() {
    const likePercentage = this.calcLikePercentage(this.state.likes, this.state.total - this.state.likes);
    const dislikePercentage = (100 - likePercentage).toFixed(4);

    if (this.state.loading) {
      return <SmallLoading />;
    }

    if (!this.state.rate) {
      return (
        <div className="like-button">
          <div className="video-info-rate-top">
            <div
              className="like"
              onClick={() => this.rateVideo(1)}
            >
              <img
                src="/static/images/videopage_like.svg"
                alt="Like Icon"
              />
              <p
                style={{
                  color: '#4EBD94',
                  marginRight: 12,
                }}
              >{this.state.likes}</p>
            </div>
            <div
              className="dislike"
              onClick={() => this.rateVideo(0)}
            >
              <img
                src="/static/images/videopage_dislike.svg"
                alt="Dislike Icon"
              />
              <p
                style={{
                  color: '#FF5562',
                }}
              >{this.state.total - this.state.likes}</p>
            </div>
          </div>
          <div className="video-info-rate-bottom">
            <div className="rate-bar-wrapper">
              <div className="like-bar" style={{ width: `${likePercentage.toFixed(4)}%` }} />
              <div className="dislike-bar" style={{ width: `${dislikePercentage}%` }} />
            </div>
          </div>
        </div>
      );
    } else if (this.state.rate) {
      if (this.state.liked) {
        return (
          <div className="like-button">
            <div className="video-info-rate-top">
              <div className="like" onClick={this.destroyRate}>
                <img
                  src="/static/images/videopage_like_fill.svg"
                  alt="Like Icon"
                />
                <p
                  style={{
                    color: '#4EBD94',
                    marginRight: 12,
                  }}
                >{this.state.likes}</p>
              </div>
              <div className="dislike" onClick={() => this.rateVideo(0)}>
                <img
                  src="/static/images/videopage_dislike.svg"
                  alt="Dislike Icon"
                />
                <p
                  style={{
                    color: '#FF5562',
                  }}
                >{this.state.total - this.state.likes}</p>
              </div>
            </div>
            <div className="video-info-rate-bottom">
              <div className="rate-bar-wrapper">
                <div className="like-bar" style={{ width: `${likePercentage.toFixed(4)}%` }} />
                <div className="dislike-bar" style={{ width: `${dislikePercentage}%` }} />
              </div>
            </div>
          </div>
        );
      } else if (!this.state.liked) {
        return (
          <div className="like-button">
            <div className="video-info-rate-top">
              <div className="like" onClick={() => this.rateVideo(1)}>
                <img
                  src="/static/images/videopage_like.svg"
                  alt="Like Icon"
                />
                <p
                  style={{
                    color: '#4EBD94',
                    marginRight: 12,
                  }}
                >{this.state.likes}</p>
              </div>
              <div className="dislike" onClick={this.destroyRate}>
                <img
                  src="/static/images/videopage_dislike_fill.svg"
                  alt="Dislike Icon"
                />
                <p
                  style={{
                    color: '#FF5562',
                  }}
                >{this.state.total - this.state.likes}</p>
              </div>
            </div>
            <div className="video-info-rate-bottom">
              <div className="rate-bar-wrapper">
                <div className="like-bar" style={{ width: `${likePercentage.toFixed(4)}%` }} />
                <div className="dislike-bar" style={{ width: `${dislikePercentage}%` }} />
              </div>
            </div>
          </div>
        );
      }
    }
  }

  render() {
    return (
      <div>
        <AlertHandle
          message={this.state.errMsg}
          visible={this.state.error}
          onClose={() => this.setState({ errMsg: '', error: false })}
        />
        {this.buttons()}
      </div>
    );
  }

}

export default LikeButton;
