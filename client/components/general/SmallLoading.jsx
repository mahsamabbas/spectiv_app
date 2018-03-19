import React, { Component } from 'react';

class SmallLoading extends Component {
  render() {
    const { message } = this.props;

    return (
      <div className="small-loading">
        <img alt="Loading Icon" src="/static/images/animationLoading.svg" />
        <h4>{ message }</h4>
      </div>
    );
  }
}

export default SmallLoading;
