import deepFreeze from 'deep-freeze';
import reducer from './../../store/reducers/account/accountReducer';
import * as actions from './../../constants/actionTypes';

describe('Account Reducer', () => {
  const initialState = {
    id: null,
    username: null,
    firstName: null,
    lastName: null,
    email: null,
    active: false,
    channel: {},
  };

  it('should return the initial state', (done) => {
    expect(reducer(undefined, {})).toEqual(initialState);
    done();
  });

  describe('LOGIN_USER_USERNAME', () => {
    it('should set the state with user\'s username', (done) => {
      const action = {
        type: actions.LOGIN_USER_USERNAME,
        payload: {
          username: 'TestUser',
        },
      };

      deepFreeze(initialState);

      const changedState = reducer(initialState, action);
      expect(changedState).not.toEqual(initialState);
      expect(changedState.username).toBe('TestUser');
      done();
    });
  });

  describe('SET_ACCOUNT_INFO', () => {
    it('should set the state with user\'s account info', (done) => {
      const action = {
        type: actions.SET_ACCOUNT_INFO,
        payload: {
          accountInfo: {
            id: 0,
            firstName: 'Tess',
            lastName: 'Tington',
            username: 'TestUser',
            email: 'tesstington@test.com',
          },
        },
      };

      deepFreeze(initialState);

      const changedState = reducer(initialState, action);
      expect(changedState).not.toEqual(initialState);
      expect(changedState.firstName).toBe('Tess');
      expect(changedState.lastName).toBe('Tington');
      expect(changedState.email).toBe('tesstington@test.com');
      done();
    });
  });

  describe('SET_USER_CHANNEL', () => {
    it('should set the state with user\'s channel', (done) => {
      const action = {
        type: actions.SET_USER_CHANNEL,
        payload: {
          channel: {
            name: 'Test Channel',
            desc: 'This is test channel',
            businessEmail: 'testbusiness@business.com',
          },
        },
      };

      deepFreeze(initialState);

      const changedState = reducer(initialState, action);
      expect(changedState).not.toEqual(initialState);
      expect(typeof changedState.channel).toBe('object');
      expect(changedState.channel.name).toBe('Test Channel');
      expect(changedState.channel.desc).toBe('This is test channel');
      expect(changedState.channel.businessEmail).toBe('testbusiness@business.com');
      done();
    });
  });
});
