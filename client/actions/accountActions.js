import { LOGIN_USER_USERNAME, SET_USER_CHANNEL, SET_ACCOUNT_INFO, SET_USER_AVATAR, ACCOUNT_NOT_FOUND } from '../constants/actionTypes';

export const loginUserUsername = username => dispatch => dispatch({
  type: LOGIN_USER_USERNAME,
  payload: {
    username,
  },
});

export const setAccountInfo = accountInfo => dispatch => dispatch({
  type: SET_ACCOUNT_INFO,
  payload: {
    accountInfo,
  },
});

export const setUserAvatar = userAvatar => dispatch => dispatch({
  type: SET_USER_AVATAR,
  payload: {
    userAvatar,
  },
});

export const setUserChannel = channel => dispatch => dispatch({
  type: SET_USER_CHANNEL,
  payload: {
    channel,
  },
});

export const accountNotFound = () => dispatch => dispatch({
  type: ACCOUNT_NOT_FOUND,
});
