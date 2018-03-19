import { CHANGE_VIDEO_FILE, CHANGE_EDIT_VIDEO_INFO } from './../../../constants/actionTypes';

const initialState = {
  uploadFile: {},
  videoInfo: {
    title: '',
    desc: '',
    accessibility: '1',
    canComment: true,
    canLike: true,
    tags: [],
  },
};

const upload = (state = initialState, action = {}) => {
  switch (action.type) {
    case CHANGE_VIDEO_FILE: {
      return {
        ...state,
        uploadFile: action.payload.uploadFile,
      };
    }
    case CHANGE_EDIT_VIDEO_INFO: {
      return {
        ...state,
        videoInfo: action.payload.videoInfo,
      };
    }
    default: {
      return state;
    }
  }
};

export default upload;
