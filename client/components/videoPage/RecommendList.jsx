import React, { Component } from 'react';
import axios from 'axios';
import { browserHistory, Link } from 'react-router';

import EmptyList from './../general/EmptyList.jsx';
import SmallLoading from './../general/SmallLoading.jsx';
import RecommendedVideoItem from './RecommendedVideoItem.jsx';
import AlertHandle from './../alertHandle/AlertHandle.jsx';

class RecommendList extends Component {
  constructor(props) {
    super(props);

    this.onScroll = this.onScroll.bind(this);

    this.state = {
      recommendVideos: [],
      loading: true,
      offset: 0,
      more: true,
      recommended: true,
      alert: false,
      alertMsg: '',
    };
  }

  componentDidMount() {
    this.getRecommendedVideos();
    document.querySelector('.recommend-list-wrapper').addEventListener('scroll', this.onScroll, false);
  }

  componentWillUnmount() {
    document.querySelector('.recommend-list-wrapper').removeEventListener('scroll', this.onScroll, false);
  }

  onScroll() {
    const element = document.querySelector('.recommend-list');
    const body = document.querySelector('.recommend-list-wrapper');
    const isAtBottom = (body.scrollTop + body.clientHeight) > (element.clientHeight - 100);
    if (isAtBottom && (this.state.more && this.state.recommendVideos.length < 20)) {
      this.getRecommendedVideos();
    }
  }

  getRecommendedVideos() {
    const catagoryID = this.props.video.Channel.Categories.map(catagory =>
      catagory.id,
    ).join(',');
    axios({
      method: 'GET',
      url: `/api/recommend/${catagoryID}?offset=${this.state.offset}&vid=${this.props.video.id}`,
    }).then((res) => {
      if (res.data.videos) {
        const { videos } = res.data;
        const recommendVideos = this.state.recommendVideos.concat(videos);
        const offset = this.state.offset + videos.length;
        if (videos.length < 10) {
          this.setState({
            recommendVideos,
            offset,
            more: false,
            loading: false,
          });
        } else {
          this.setState({
            recommendVideos,
            offset,
            loading: false,
            more: true,
          });
        }
      } else {
        this.setState({
          recommended: false,
          loading: false,
        });
      }
    }).catch((err) => {
      console.error(err);
      this.setState({ alert: true, alertMsg: 'There was an unexpected error please try again' });
    });
  }

  renderContent() {
    if (this.state.loading) {
      return <SmallLoading message={'Loading...'} />;
    }

    if (this.state.recommendVideos.length > 0) {
      return this.state.recommendVideos.map((video, i) =>
        <RecommendedVideoItem video={video} key={i} />,
      );
    }

    return <EmptyList text={'No Videos'} />;
  }

  render() {
    return (
      <div className="recommend-list-wrapper">
        <AlertHandle
          message={this.state.alertMsg}
          visible={this.state.alert}
          onClose={() => this.setState({ alertMsg: '', alert: false })}
        />
        <div className="recommend-list">
          { this.renderContent() }
        </div>
      </div>
    );
  }
}

export default RecommendList;
