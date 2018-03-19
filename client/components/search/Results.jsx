import React, { Component } from 'react';
import _ from 'lodash';
import axios from 'axios';

import Tabs from './../general/Tabs.jsx';
import ResultList from './ResultList.jsx';
import SmallLoading from './../general/SmallLoading.jsx';
import ErrorHandle from './../alertHandle/index.jsx';

class Results extends Component {
  constructor(props) {
    super(props);

    this.getSearchResult = this.getSearchResult.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.changeTab = this.changeTab.bind(this);

    this.state = {
      results: [],
      error: false,
      numberOfVideoResults: 0,
      numberOfChannelResults: 0,
      numberOfPages: 0,
      filter: 'relevance',
      filterOpen: false,
      page: 0,
      activeName: 'Videos',
      loading: true,
    };
  }

  componentDidMount() {
    const { query } = this.props.location.query;
    this.getSearchResult(query);
    document.querySelector('#app').addEventListener('scroll', this.onScroll, false);
    document.getElementById('app').addEventListener('click', (e) => {
      if (!e.target.closest('#filter-wrapper')) this.setState({ filterOpen: false });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.query.query !== this.props.location.query.query) {
      const { query } = nextProps.location.query;
      this.setState({
        results: [],
        error: false,
        numberOfVideoResults: 0,
        numberOfChannelResults: 0,
        numberOfPages: 0,
        filter: 'relevance',
        filterOpen: false,
        page: 0,
        activeName: 'Videos',
        loading: true,
      }, () => {
        this.getSearchResult(query);
      });
    }
  }

  componentWillUnmount() {
    document.querySelector('#app').removeEventListener('scroll', this.onScroll, false);
  }

  onScroll() {
    const { query } = this.props.location.query;
    const element = document.querySelector('#search-results');
    const body = document.querySelector('#app');
    const isAtBottom = (body.scrollTop + body.clientHeight) > (element.clientHeight - 200);

    if (isAtBottom && (this.state.page < this.state.numberOfPages)) {
      this.getSearchResult(query);
    }
  }

  getSearchResult(query) {
    axios({
      method: 'GET',
      url: `/api/search?query=${query}&page=${this.state.page}&filter=${this.state.filter}`,
    }).then((res) => {
      if (res.data.content.results) {
        const videos = res.data.content.results[0];
        const channels = res.data.content.results[1];
        const combinedResult = channels.hits.concat(videos.hits);
        const page = this.state.page + 1;
        const results = this.state.results.concat(combinedResult);
        const numberOfPages = Math.max(videos.nbPages, channels.nbPages);
        this.setState({
          results,
          page,
          numberOfVideoResults: videos.nbHits,
          numberOfChannelResults: channels.nbHits,
          numberOfPages,
          loading: false,
        });
      }
    }).catch((err) => {
      console.error(err);
      this.setState({
        error: true,
      });
    });
  }

  handleFilter(filter) {
    if (filter !== this.state.filter) {
      this.setState({
        filter,
        results: [],
        page: 0,
        filterOpen: false,
        loading: true,
      }, () => {
        const { query } = this.props.location.query;
        this.getSearchResult(query);
      });
    }
  }

  numberOfResults() {
    let numberOfResults;
    if (this.state.activeName === 'Videos') {
      numberOfResults = this.state.numberOfVideoResults;
    } else if (this.state.activeName === 'Channels') {
      numberOfResults = this.state.numberOfChannelResults;
    }
    if (numberOfResults > 0) {
      return (<h3 className="results-count">About {numberOfResults} results.</h3>);
    }

    return (<h3 className="results-count">No results for {this.props.location.query.query}.</h3>);
  }

  changeTab(name) {
    const displayResults = name === 'Videos'
      ? _.filter(this.state.results, result => result.title)
      : _.filter(this.state.results, result => result.name);
    this.setState({
      activeName: name,
      displayResults,
      numberOfResults: displayResults.length,
    });
  }

  createTabContent() {
    const options = [
      {
        name: 'Videos',
        content: (
          <div>
            <ResultList
              results={_.filter(this.state.results, result => result.title)}
              account={this.props.account}
            />
          </div>
        ),
      },
      {
        name: 'Channels',
        content: (
          <div>
            <ResultList
              results={_.filter(this.state.results, result => result.name)}
              account={this.props.account}
            />
          </div>
          ),
      },
    ];

    return options;
  }

  filterButton() {
    return (
      <div id="filter-wrapper">
        <button
          className="filter-btn"
          onClick={() => {
            this.setState({ filterOpen: !this.state.filterOpen });
          }}
        >
          <img src="/static/images/filter.svg" alt="no image" />
          FILTER
        </button>
        <div className={`filter-menu ${this.state.filterOpen ? 'filter-open' : ''}`}>
          <div
            className="filter-item"
            onClick={() => this.handleFilter('relevance')}
          >
            Relevance
          </div>
          <div
            className="filter-item"
            onClick={() => this.handleFilter('recent')}
          >
            Recent
          </div>
          <div
            className="filter-item"
            onClick={() => this.handleFilter('most')}
          >
            Most Views
          </div>
          <div
            className="filter-item"
            onClick={() => this.handleFilter('popularity')}
          >
            Popularity
          </div>
        </div>
      </div>
    );
  }

  renderContent() {
    const loading = this.state.loading ?
      <SmallLoading message="Loading..." /> :
      (<Tabs
        options={this.createTabContent()}
        activeName={this.state.activeName}
        changeTab={this.changeTab}
      />);

    if (this.state.error) {
      return (<ErrorHandle />);
    }

    return (
      <section id="results">
        <div className="results-wrapper">
          <div className="results-banner">
            { this.numberOfResults() }
            {this.filterButton()}
          </div>
          { loading }
        </div>
      </section>
    );
  }

  render() {
    return (
      <section id="search-results">
        {this.renderContent()}
      </section>
    );
  }
}

export default Results;
