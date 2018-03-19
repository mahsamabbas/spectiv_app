import { CHANGE_VIDEO_FILE, CHANGE_EDIT_VIDEO_INFO } from './../constants/actionTypes';


export const changeVideoFile = uploadFile => dispatch => dispatch({
  type: CHANGE_VIDEO_FILE,
  payload: {
    uploadFile,
  },
});

export const changeEditVideoInfo = videoInfo => dispatch => dispatch({
  type: CHANGE_EDIT_VIDEO_INFO,
  payload: {
    videoInfo,
  },
});
