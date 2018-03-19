import React from 'react';
import { Link } from 'react-router';

class Approved extends React.Component {
  render() {
    return (
      <section id="approved">
        <div className="approved-wrapper">
          <div className="back">
            <div className="content">
              <h1>Your application has been submitted. We are reviewing it now.</h1>
              <Link className="to-homepage" to="/">Go to Homepage</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }
}
export default Approved;
