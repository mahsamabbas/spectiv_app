import { LOGIN_USER_USERNAME, SET_USER_CHANNEL, SET_ACCOUNT_INFO, SET_USER_AVATAR, ACCOUNT_NOT_FOUND } from './../../../constants/actionTypes';

const initialState = {
  id: null,
  username: null,
  firstName: null,
  lastName: null,
  email: null,
  active: false,
  channel: {
    Videos: [],
  },
  loading: true,
};

const account = (state = initialState, action = {}) => {
  switch (action.type) {
    // JUST FOR CLIENTSIDE RENDERING PURPOSES. DOES NOT ACTUALLY AUTHENTICATE.
    case LOGIN_USER_USERNAME: {
      return {
        ...state,
        username: action.payload.username,
        active: true,
        loading: false,
      };
    }
    case SET_ACCOUNT_INFO: {
      return {
        ...state,
        ...action.payload.accountInfo,
        active: true,
        loading: false,
      };
    }
    case ACCOUNT_NOT_FOUND: {
      return {
        ...state,
        loading: false,
      };
    }
    case SET_USER_AVATAR: {
      return {
        ...state,
        ...action.payload.userAvatar,
        channel: {
          ...state.channel,
          ...action.payload.userAvatar,
        },
        active: true,
      };
    }
    case SET_USER_CHANNEL: {
      return {
        ...state,
        channel: {
          ...state.channel,
          ...action.payload.channel,
        },
      };
    }
    default: {
      return state;
    }
  }
};

export default account;
