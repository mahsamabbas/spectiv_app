import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

// Reducers
import test from './test/testReducer';
import account from './account/accountReducer';
import upload from './upload/uploadReducer';

const rootReducer = combineReducers({
  test,
  upload,
  account,
  routing: routerReducer,
});

export default rootReducer;
