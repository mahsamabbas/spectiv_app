import React, { Component } from 'react';

class EmptyList extends Component {
  render() {
    const { text } = this.props;

    return (
      <div className="empty-list">
        <div className="empty-list-text">
          { text }
        </div>
      </div>
    );
  }
}

export default EmptyList;
