import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import { InstantSearch, Highlight, Configure, Index, RefinementList } from 'react-instantsearch/dom';
import { connectSearchBox, connectStateResults, connectHits } from 'react-instantsearch/connectors';
import isMobile from 'ismobilejs';

import EmptyList from './../general/EmptyList.jsx';

class SearchBar extends Component {
  constructor(props) {
    super(props);

    this.handleSearch = this.handleSearch.bind(this);
    this.submitSearch = this.submitSearch.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.goTo = this.goTo.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);

    this.state = {
      search: '',
      showResult: false,
      activeCategory: 'Video',
    };
  }

  componentDidMount() {
    document.querySelector(':not(.search-result)').addEventListener('click', (e) => {
      if (!e.target.closest('.search-result') && !e.target.closest('.search-bar-wrapper') && this.state.showResult) {
        this.setState({
          showResult: false,
        });
      }
    });
  }

  handleSearch(e) {
    if (e.target.value !== '') {
      this.setState({
        showResult: true,
        search: e.target.value,
      });
    } else {
      this.setState({
        showResult: false,
        search: '',
      });
    }
  }

  submitSearch() {
    if (this.state.search !== '') {
      browserHistory.push(`/results?query=${this.state.search}`);
      this.setState({
        search: '',
        showResult: false,
      });
    }
  }

  handleChange(category) {
    if (category === 'video') {
      this.setState({
        activeCategory: 'Video',
      });
    } else if (category === 'channel') {
      this.setState({
        activeCategory: 'Channel',
      });
    }
  }

  handleKeyPress(e) {
    const key = e.which || e.keyCode;
    if (key === 13) {
      this.submitSearch();
    }
  }

  goTo(index, idOrName) {
    this.setState({
      search: '',
      showResult: false,
    });
    if (index === 'video') {
      // Video uses id for route
      browserHistory.push(`/v/${idOrName}`);
    } else if (index === 'channel') {
      // Channel uses name for route
      browserHistory.push(`/channel/${idOrName}`);
    }
  }

  searchResult() {
    if (this.state.showResult) {
      if (this.state.activeCategory === 'Video') {
        return <Search index="video" handle={this.handleChange} goTo={this.goTo} />;
      } else if (this.state.activeCategory === 'Channel') {
        return <Search index="channel" handle={this.handleChange} goTo={this.goTo} />;
      }
    }
  }

  render() {
    return (
      <InstantSearch
        appId="72SEBBNV6W"
        apiKey="0b904f2c94ebf36724292743e224acd2"
        indexName="video_index"
      >
        <Configure hitsPerPage={10} />
        <RefinementList attributeName="createdAt" />
        <ConnectedSearchBox
          handle={this.handleSearch}
          submit={this.submitSearch}
          searchValue={this.state.search}
          handleKeyPress={this.handleKeyPress}
        />
        { this.searchResult() }
      </InstantSearch>
    );
  }
}

const MySearchBox = ({ refine, handle, submit, searchValue, handleKeyPress }) => {
  const customClass = searchValue !== '' ? 'expand' : '';
  if (isMobile.phone) {
    return (
      <div className="search-bar-wrapper mobile">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => {
            refine(e.target.value);
            handle(e);
          }}
          onKeyDown={handleKeyPress}
          className={customClass}
          placeholder="Search"
        />
        <button className="search-bar-btn" onClick={submit} type="submit">
          <img alt="Search Button" src="/static/images/videopage_search.svg" />
        </button>
      </div>
    );
  }
  return (
    <div className="search-bar-wrapper">
      <input
        type="text"
        value={searchValue}
        onChange={(e) => {
          refine(e.target.value);
          handle(e);
        }}
        onKeyDown={handleKeyPress}
        className={customClass}
        placeholder="Search"
      />
      <button className="search-bar-btn" onClick={submit} type="submit">
        <img alt="Search Button" src="/static/images/search_green.svg" />
      </button>
    </div>
  );
};

const Search = ({ index, handle, goTo }) => {
  if (index === 'video') {
    return (
      <div className="search-result">
        <button className="active" style={{ borderRadius: 0 }}>Video</button>
        <button onClick={() => handle('channel')} style={{ borderRadius: 0 }}>Channel</button>
        <Index indexName="video_index">
          <VideoResults goTo={goTo} />
        </Index>
      </div>
    );
  } else if (index === 'channel') {
    return (
      <div className="search-result">
        <button onClick={() => handle('video')} style={{ borderRadius: 0 }}>Video</button>
        <button className="active" style={{ borderRadius: 0 }}>Channel</button>
        <Index indexName="channel_index">
          <ChannelResults goTo={goTo} />
        </Index>
      </div>
    );
  }
};

const VideoResults = connectStateResults(
  ({ searchResults, goTo }) =>
  searchResults && searchResults.nbHits !== 0 ? (
    <VideoResultItem goTo={goTo} />
  ) : <EmptyList text="No video results found" />,
);

const ChannelResults = connectStateResults(
  ({ searchResults, goTo }) =>
  searchResults && searchResults.nbHits !== 0 ? (
    <ChannelResultItem goTo={goTo} />
  ) : <EmptyList text="No channel results found" />,
);

const VideoResultItem = connectHits(({ hits, goTo }) => {
  return (
    <div>
      { hits.map(hit =>
        <div className="search-result-item" key={hit.objectID}>
          <Link onClick={() => goTo('video', hit.id)}>
            <Highlight attributeName="title" hit={hit} />
          </Link>
        </div>,
      )}
    </div>
  );
});

const ChannelResultItem = connectHits(({ hits, goTo }) => {
  return (
    <div>
      { hits.map(hit =>
        <div className="search-result-item" key={hit.objectID}>
          <Link onClick={() => goTo('channel', hit.name)}>
            <Highlight attributeName="name" hit={hit} />
          </Link>
        </div>,
      )}
    </div>
  );
});

const ConnectedSearchBox = connectSearchBox(MySearchBox);

export default SearchBar;
