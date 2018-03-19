import React, { Component } from 'react';

class Disabled extends Component {
  render() {
    let content;

    if (this.props.content === 'rate') {
      content = 'Rating';
    } else if (this.props.content === 'comment') {
      content = 'Comment';
    }

    return (
      <div style={this.props.style || {}} className={`disabled-comp disabled-${this.props.content}`}>
        {content}s have been disabled.
      </div>
    );
  }
}

export default Disabled;
