import React, { Component } from 'react';
import DropZone from 'react-dropzone';

class UploadVideo extends Component {
  render() {
    const { isDragged } = this.props;

    return (
      <div className="upload-video">
        <DropZone
          onDrop={this.props.onUploadVideo}
          accept="video/*"
          className="drop-zone"
          activeClassName="active"
          multiple={false}
          style={{
            paddingTop: isDragged ? 24 : 0,
          }}
        >
          { isDragged ? null : <img src="/static/images/cloud.svg" alt="Upload Icon" /> }
          <button>Choose files to upload</button>
          <span>or drag and drop them here.</span>
          <div className="overlay">
            <b>DROP FILE</b>
          </div>
        </DropZone>
      </div>
    );
  }
}

export default UploadVideo;
