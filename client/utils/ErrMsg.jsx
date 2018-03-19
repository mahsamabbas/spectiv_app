import React, { Component } from 'react';

class ErrMsg extends Component {
  render() {
    const style = Object.assign({
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: '999',
    });

    const buttonStyle = {
      cursor: 'pointer',
      border: 'none',
      color: 'white',
      padding: '12px 38px',
      borderRadius: '6px',
      background: '#4EBD94',
      fontSize: '14px',
      transition: 'all .15s ease-in-out',
    };

    const cardStyle = {
      backgroundColor: 'white',
      width: '40%',
      padding: '30px',
      WebkitBoxShadow: '5px 5px 15px 0px rgba(0,0,0,0.65)',
      MozBoxShadow: '5px 5px 15px 0px rgba(0,0,0,0.65)',
      boxShadow: '5px 5px 15px 0px rgba(0,0,0,0.65)',
    };

    return (
      <div id="err-msg" style={style}>
        <div style={cardStyle}>
          <h2 style={{ textAlign: 'center' }}>
            {this.props.msg}
          </h2>
          <div style={{ textAlign: 'center' }}>
            <button style={buttonStyle} onClick={() => this.props.close()}>OK</button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrMsg;
