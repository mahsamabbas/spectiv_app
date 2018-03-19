import React, { Component } from 'react';

const ErrorHandle = props => (
  <section id="error">
    <div className="back-wrapper">
      <div className="error-content">
        <h1 className="error-title">Opps, you've entered <strike>virtual</strike> reality...</h1>
        <p className="error-message">Try that again, and if it's still not working, let us know.</p>
        <a href="mailto:info@spectivvr.com" style={{ textDecoration: 'none' }} className="contact-btn">GET IN TOUCH</a>
      </div>
    </div>
  </section>
);
export default ErrorHandle;
