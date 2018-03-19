import React, { Component } from 'react';
import isMobile from 'ismobilejs';

import BannerItem from './BannerItem.jsx';

class BannerSection extends Component {
  render() {
    const { pickedVideos } = this.props;

    let staffPick,
      viewerPick,
      videoOfTheDay;

    pickedVideos.forEach((video) => {
      if (video.isStaffPick) {
        staffPick = video;
      } else if (video.isViewerPick) {
        viewerPick = video;
      } else {
        videoOfTheDay = video;
      }
    });

    const style = {};
    if (isMobile.phone) {
      style.display = 'none';
    }

    return (
      <section style={style} className="banner-section">
        <div className="banner-left">
          <BannerItem
            big
            video={staffPick}
            title={'Staff Pick'}
          />
        </div>
        <div className="banner-center">
          <BannerItem advertisement />
          <BannerItem
            video={viewerPick}
            title={'Viewer Pick'}
          />
        </div>
        <div className="banner-right">
          <BannerItem
            big
            video={videoOfTheDay}
            title={'Video of the Day'}
            watchNow
          />
        </div>
      </section>
    );
  }
}

export default BannerSection;
