import React, { Component } from 'react';

class SpectivLoading extends Component {
  render() {
    return (
      <div
        className="spectiv-loading" style={{
          width: '100%',
          marginTop: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img alt="Spectiv Loading" src="/static/images/loading.svg" style={{ width: '25%' }} />
      </div>
    );
  }
}

export default SpectivLoading;
