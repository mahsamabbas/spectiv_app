import React, { Component } from 'react';

class NoAvatar extends Component {
  render() {
    const { height, width, fontSize, color } = this.props;

    return (
      <div
        style={{
          height: height || 42,
          width: width || 42,
          background: '#686578',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          color: color || '#4EBD94',
          boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.12) 0px 1px 2px',
          fontSize: fontSize || 16,
        }}
      >{this.props.letter}</div>
    );
  }
}

export default NoAvatar;
