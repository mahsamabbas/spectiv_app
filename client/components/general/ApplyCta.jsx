import React, { Component } from 'react';
import { Link } from 'react-router';

class ApplyCta extends Component {
  top() {
    const { topText } = this.props;
    if (topText) {
      return <h2>{topText}</h2>;
    }
  }

  bottom() {
    const { bottomText } = this.props;
    if (bottomText) {
      return <h4>{ bottomText }</h4>;
    }
  }

  button() {
    const { status } = this.props;
    if (status === 'notApproved') {
      return <Link to={'/apply'}>Click here to apply</Link>;
    } else if (status === 'reviewing') {
      return <Link to={'/'}>Go to Homepage</Link>;
    } else if (status === 'approved') {
      return <Link to={'/my-channel'}>Click here to get started</Link>;
    } else if (status === 'login') {
      return <Link onClick={() => { window.location = '/login'; }}>Click here to login</Link>;
    }
  }

  render() {
    return (
      <section id="apply-cta">
        <div className="cta-card">
          { this.top() }
          <div className="bottom-wrapper">
            { this.bottom() }
            { this.button() }
          </div>
        </div>
      </section>
    );
  }
}

export default ApplyCta;
