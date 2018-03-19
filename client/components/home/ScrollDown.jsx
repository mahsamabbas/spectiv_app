import React, { Component } from 'react';

class ScrollDown extends Component {

  render() {
    return (
      <div
        className="scroll-down"
        style={{
          minHeight: 40,
          marginTop: 40,
          marginBottom: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <img
          src="/static/images/scroll-down.svg"
          alt="Scroll Down"
          style={{
            height: 32,
            cursor: 'pointer',
          }}
          onClick={() => {
            document.querySelector('#app').scrollTo(0, 1000);
          }}
        />
      </div>
    );
  }
}

export default ScrollDown;
