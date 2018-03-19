import React, { Component } from 'react';

class Confirm extends Component {
  render() {
    const { isOpen } = this.props;

    return (
      <div
        className="confirm" style={{
          display: isOpen ? 'flex' : 'none',
        }}
      >
        <div className="center-card">
          <h4>Are you sure you want to delete this video?</h4>
          <div className="btn-wrapper">
            <button onClick={this.props.close}>No</button>
            <button onClick={this.props.confirm}>Yes</button>
          </div>
        </div>
      </div>
    );
  }
}

export default Confirm;
