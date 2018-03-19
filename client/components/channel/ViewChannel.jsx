import React, { Component } from 'react';
import anchorme from 'anchorme';
import renderHTML from 'react-render-html';
import { browserHistory } from 'react-router';
import isMobile from 'ismobilejs';

import SubscribeButton from './../general/Subscribe.jsx';
import NoAvatar from './../general/NoAvatar.jsx';
import Tabs from './../general/Tabs.jsx';
import ChannelFeaturedVideos from './ChannelFeaturedVideos.jsx';
import AllVideos from './AllVideos.jsx';

class ViewChannel extends Component {
  constructor(props) {
    super(props);

    // Bind methods to component
    this.changeTab = this.changeTab.bind(this);

    this.avatarEnter = this.avatarEnter.bind(this);
    this.avatarLeave = this.avatarLeave.bind(this);
    this.showDetail = this.showDetail.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.state = {
      activeName: 'Home',
      showAvaDetailIcon: false,
      showDetail: false,
      filter: 'Recent',
      showFilter: false,
      videos: this.props.videos,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.videos.length === 0) {
      this.setState({
        videos: nextProps.videos,
      });
    }
  }

  subscribeButton(color) {
    if (this.props.isUserChannel) {
      const style = {};
      if (color) {
        style.backgroundColor = color;
      }
      return (
        <button
          className="sub-btn"
          style={style}
          onClick={() => browserHistory.push('/my-channel/edit')}
        >
          Edit Channel
        </button>
      );
    }
    return (
      <SubscribeButton
        subscribed={this.props.subscribed}
        totalSubscriber={this.props.totalSubscriber}
        channel={this.props.channel}
        account={this.props.account}
        color={color}
      />
    );
  }

  createTabContent() {
    const options = [
      {
        name: 'Home',
        content: (
          <ChannelFeaturedVideos
            videos={this.props.videos}
            channelName={this.props.channel.name}
            changeTab={() => this.changeTab('Videos')}
            loading={this.props.loading}
            channelColor={this.props.channel.color}
          />
        ),
      },
      {
        name: 'Videos',
        content: <AllVideos
          videos={this.props.videos}
          getMoreVideos={this.props.getMoreVideos}
        />,
      },
    ];

    if (isMobile.phone) {
      const { desc } = this.props.channel;
      options.splice(1, -1, {
        name: 'Description',
        content: <p className="channel-desc">{desc ? renderHTML(anchorme(desc, { attributes: [{ name: 'target', value: 'blank' }, { name: 'style', value: `color: ${this.props.channel.color}` }] })) : null}</p>,
      });
    }

    return options;
  }

  changeTab(name) {
    this.setState({
      activeName: name,
    });
    if (name === 'Videos') {
      document.getElementById('app').addEventListener('click', (e) => {
        if (!e.target.closest('.filter-wrapper')) this.setState({ showFilter: false });
      });
    }
  }
  avatarEnter() {
    this.setState({
      showAvaDetailIcon: true,
    }, () => {

    });
  }
  avatarLeave() {
    this.setState({
      showAvaDetailIcon: false,
    });
  }
  showDetail() {
    this.setState({
      showDetail: !this.state.showDetail,
    });
  }

  handleFilter(filter) {
    const { videos } = this.state;
    let filteredVideos;

    if (filter !== this.state.filter) {
      if (filter === 'Recent') {
        filteredVideos = videos.sort((a, b) => {
          if (a.createdAt === b.createdAt) {
            return b.viewCount - a.viewCount;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      } else if (filter === 'Views') {
        filteredVideos = videos.sort((a, b) => {
          if (a.viewCount === b.viewCount) {
            return b.createdAt - a.createdAt;
          }
          return b.viewCount - a.viewCount;
        });
      } else if (filter === 'Oldest') {
        filteredVideos = videos.sort((a, b) => {
          if (a.createdAt === b.createdAt) {
            return b.viewCount - a.viewCount;
          }
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
      } else if (filter === 'Duration') {
        filteredVideos = videos.sort((a, b) => {
          if (a.duration === b.duration) {
            return b.viewCount - a.viewCount;
          }
          return b.duration - a.duration;
        });
      }
    }

    this.setState({
      filter,
      videos: filteredVideos,
      showFilter: false,
    });
  }

  filterButton() {
    if (this.state.activeName === 'Videos') {
      return (
        <div className="filter-wrapper">
          <button
            className="filter-btn"
            onClick={() => {
              this.setState({ showFilter: !this.state.showFilter });
            }}
          >
            <img src="/static/images/filter.svg" alt="no image" />
            FILTER
            <div className={`filter-menu ${this.state.showFilter ? 'filter-open' : ''}`}>
              <div
                className="filter-item"
                onClick={() => this.handleFilter('Recent')}
              >Recent
              </div>

              <div
                className="filter-item"
                onClick={() => this.handleFilter('Views')}
              >Views
              </div>

              <div
                className="filter-item"
                onClick={() => this.handleFilter('Oldest')}
              >Oldest
              </div>

              <div
                className="filter-item"
                onClick={() => this.handleFilter('Duration')}
              >Duration
              </div>
            </div>
          </button>
        </div>
      );
    }
  }

  render() {
    const { name, desc, businessEmail, avatarPath, color } = this.props.channel;
    const style = {};

    if (color) {
      style.background = `linear-gradient(180deg, #4EBD94, ${color})`;
    }

    console.log(style);
    const addStyle = {
      opacity: 1,
      visibility: 'visible',
      height: 'fit-content',
    };

    return (
      <div className="view-channel">
        <div className="channel-banner" style={style} />
        <div className="channel-wrap">
          <div className="channel-left-col">
            { /* this.state.showAvaDetailIcon ? <div className="avatar-overlay" onMouseLeave={this.avatarLeave} onClick={this.showDetail} /> : null */ }
            <div className="header-wrapper">
              { avatarPath ?
                <div className="channel-avatar" style={{ backgroundImage: `url('${avatarPath}')` }} />
                :
                <NoAvatar
                  letter={name.substring(0, 2)}
                  color={color}
                  width={112}
                  height={112}
                  fontSize={28}
                />
              }

              <h4>{name}</h4>
              <h5>{this.props.totalSubscriber} subscribers</h5>
              { this.subscribeButton(color) }
            </div>

            <div className="description">
              <p>{desc ? renderHTML(anchorme(desc, { attributes: [{ name: 'target', value: 'blank' }, { name: 'style', value: `color: ${color}` }] })) : null}</p>
              <div className="divider" />
            </div>
          </div>
          <div className="channel-right-col">
            { this.filterButton() }
            <Tabs
              options={this.createTabContent()}
              activeName={this.state.activeName}
              changeTab={this.changeTab}
              color={color}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default ViewChannel;
