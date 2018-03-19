import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';

class NotFound extends Component {
  render() {
    return (
      <section id="error">
        <div className="back-wrapper">
          <div className="error-content">
            <h1 className="error-title">Opps, you've entered <strike>virtual</strike> reality...</h1>
            <p className="error-message">This page is not available. But our Lead Dev <b>Justin Wood</b> is and has been for some time.</p>
            <Link style={{ display: 'block', textDecoration: 'none' }} to={'/'} className="contact-btn">Back To Safety</Link>
          </div>
        </div>
      </section>
    );
  }
}

export default NotFound;
