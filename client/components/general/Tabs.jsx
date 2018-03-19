import React, { Component } from 'react';
import classNames from 'classnames';
import _ from 'lodash';

class Tabs extends Component {
  constructor(props) {
    super(props);

    this.renderTabContent = this.renderTabContent.bind(this);
  }

  // filterButton() {
  //   if (this.state.activeName === 'Videos') {
  //     return (
  //       <div className="filter-wrapper">
  //         <button
  //           className="filter-btn"
  //           onClick={() => {
  //             this.setState({ showFilter: !this.state.showFilter });
  //           }}
  //         >
  //           <img src="/static/images/filter.svg" alt="no image" />
  //           FILTER
  //         </button>
  //
  //         <div className={`filter-menu ${this.state.showFilter ? 'filter-open' : ''}`}>
  //           <div
  //             className="filter-item"
  //             onClick={() => this.handleFilter('Recent')}
  //           >Recent
  //           </div>
  //
  //           <div
  //             className="filter-item"
  //             onClick={() => this.handleFilter('Views')}
  //           >Views
  //           </div>
  //
  //           <div
  //             className="filter-item"
  //             onClick={() => this.handleFilter('Oldest')}
  //           >Oldest
  //           </div>
  //
  //           <div
  //             className="filter-item"
  //             onClick={() => this.handleFilter('Duration')}
  //           >Duration
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   }
  // }

  renderTabContent() {
    return _.find(this.props.options, { name: this.props.activeName }).content;
  }

  render() {
    return (
      <section className="tabs">
        { this.props.options.map((tab, key) => {
          const style = {};

          if (this.props.color && tab.name === this.props.activeName) {
            style.borderBottomColor = this.props.color;
          }

          return (
            <button
              key={key}
              style={style}
              className={classNames('tab-btn', { active: tab.name === this.props.activeName })}
              onClick={() => this.props.changeTab(tab.name)}
            >{tab.name}</button>
          );
        }) }
        {this.renderTabContent()}
      </section>
    );
  }
}

export default Tabs;
