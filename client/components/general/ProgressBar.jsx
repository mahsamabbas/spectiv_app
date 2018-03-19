import React, { Component } from 'react';

class ProgressBar extends Component {
  render() {
    const { progress, bottomText, uploadType } = this.props;
    let progressPercent = 0;
    let progressImg;
    if (progress > 0) {
      progressPercent = `${(progress * 100).toFixed(0)}%`;
    }

    if (uploadType) {
      if (uploadType === 'uploading') {
        progressImg = <img src="/static/images/uploadcomputer.svg" alt="Computer Icon" />;
      }
      if (uploadType === 'encoding') {
        progressImg = <img src="/static/images/encodingcomputer.svg" alt="Encoding Computer Icon" />;
      }
    }



    return (
      <div className="progress-wrapper">
        <div className="progress-bar">
          <div className="progress" style={{ width: progressPercent }}>
            { progressImg }
          </div>
        </div>
        <div className="bottom-text">{bottomText} {progressPercent}</div>
      </div>
    );
  }
}

export default ProgressBar;
