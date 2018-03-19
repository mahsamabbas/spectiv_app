import React, { Component } from 'react';

class PageLoading extends Component {
  render() {
    const { message } = this.props;

    return (
      <div className="page-loading">
        <img src="/static/images/animationLoading.svg" alt="Loading Image" />
        <h2>{ message }</h2>
      </div>
    );
  }
}

export default PageLoading;
