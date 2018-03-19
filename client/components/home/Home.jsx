import React, { Component } from 'react';
import axios from 'axios';
import _ from 'lodash';
import isMobile from 'ismobilejs';

import LikeButton from './../general/Like.jsx';
import SubscribeButton from './../general/Subscribe.jsx';
import FeaturedChannelList from './FeaturedChannelList.jsx';
import HomeFeaturedVideo from './HomeFeaturedVideo.jsx';
import BannerSection from './BannerSection.jsx';
import RecentUploads from './RecentUploads.jsx';
import PageLoading from './../general/PageLoading.jsx';
import ErrorHandle from './../alertHandle/index.jsx';
import ScrollDown from './ScrollDown.jsx';
import SliderContent from './../general/SliderContent.jsx';
import ThumbContent from './../general/ThumbContent.jsx';
import BannerItem from './BannerItem.jsx';
import FeaturedChannel from './FeaturedChannel.jsx';
import HeroSection from './HeroSection.jsx';

class Home extends Component {
  constructor(props) {
    super(props);

    this.getHomepageContent = this.getHomepageContent.bind(this);
    this.getBannerSlides = this.getBannerSlides.bind(this);

    this.state = {
      featuredChannelsAndVideos: [],
      recentVideos: [],
      featuredChannels: [],
      featuredChannelVideos: [],
      featuredVideo: {},
      pickedVideos: [],
      loading: true,
      error: false,
    };
  }

  componentDidMount() {
    this.getHomepageContent();
  }

  getHomepageContent() {
    this.setState({
      loading: true,
    });

    const promiseList = [
      axios({
        method: 'GET',
        url: '/api/featured-video',
      }),
      axios({
        method: 'GET',
        url: '/api/featured-channels',
      }),
      axios({
        method: 'GET',
        url: '/api/featured-home',
      }),
    ];

    Promise.all(promiseList).then((res) => {
      const [videosResult, channelsResult, featuredChannelVideos] = res;
      const { recentVideos, pickedVideos } = videosResult.data;
      const { channels } = channelsResult.data;

      const [channel1, channel2, channel3, channel4] = featuredChannelVideos.data.featuredChannels;
      const [featured1, featured2, featured3, featured4] = channels;

      this.setState({
        recentVideos,
        loading: false,
        pickedVideos,
        featuredChannels: [featured4, featured3, featured2, featured1],
        featuredVideo: videosResult.data.featuredVideo,
        featuredChannelVideos: [channel2, channel4, channel3, channel1],
      });
    }).catch((err) => {
      this.setState({
        loading: false,
        error: true,
      });
    });
  }

  getBannerSlides(pickedVideos) {
    let staffPick;
    let viewerPick;
    let videoOfTheDay;

    pickedVideos.forEach((video) => {
      if (video.isStaffPick) {
        staffPick = video;
      } else if (video.isViewerPick) {
        viewerPick = video;
      } else {
        videoOfTheDay = video;
      }
    });

    return [
      <BannerItem
        big
        video={staffPick}
        title={'Staff Pick'}
      />,
      <BannerItem advertisement />,
      <BannerItem
        video={viewerPick}
        title={'Viewer Pick'}
      />,
      <BannerItem
        big
        video={videoOfTheDay}
        title={'Video of the Day'}
        watchNow
      />,
    ];
  }

  getThumbContent(featuredChannels) {
    return featuredChannels.map((channel, index) => <FeaturedChannel key={index} channel={channel} />);
  }

  likeButtons() {
    if (this.state.featuredVideo.canLike) {
      return (
        <LikeButton
          video={this.state.featuredVideo}
          account={this.props.account}
          channel={this.state.featuredVideo.Channel}
        />
      );
    }
  }

  subscribeButton() {
    if (this.state.featuredVideo.Channel) {
      return (
        <SubscribeButton
          channel={this.state.featuredVideo.Channel}
          account={this.props.account}
        />
      );
    }
  }

  renderContent() {
    if (this.state.loading) {
      return <PageLoading message={'Loading Homepage...'} />;
    }

    if (this.state.error) {
      return <ErrorHandle />;
    }

    const { featuredVideo, pickedVideos, recentVideos, featuredChannels, featuredChannelVideos, loading } = this.state;

    return (
      <section id="homepage">
        { !_.isEmpty(featuredChannelVideos) && !isMobile.phone ? <HeroSection channels={featuredChannelVideos} account={this.props.account} /> : null }
        { !_.isEmpty(featuredVideo) && isMobile.phone ? <HomeFeaturedVideo account={this.props.account} video={featuredVideo} /> : null }
        { !_.isEmpty(pickedVideos) ? <ScrollDown /> : null }
        { !_.isEmpty(pickedVideos) ? <SliderContent slides={this.getBannerSlides(pickedVideos)} /> : null }
        { !_.isEmpty(pickedVideos) ? <BannerSection pickedVideos={pickedVideos} /> : null }
        { !_.isEmpty(recentVideos) ? <RecentUploads recentVideos={recentVideos} /> : null }
        { !_.isEmpty(featuredChannels) ? <ThumbContent content={this.getThumbContent(featuredChannels)} /> : null }
        { !_.isEmpty(featuredChannels) ? <FeaturedChannelList featuredChannels={featuredChannels} /> : null }
      </section>
    );
  }

  render() {
    return this.renderContent();
  }
}

export default Home;
