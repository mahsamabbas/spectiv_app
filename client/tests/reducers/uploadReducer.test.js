import deepFreeze from 'deep-freeze';
import reducer from './../../store/reducers/upload/uploadReducer';
import * as actions from './../../constants/actionTypes';

describe('Upload Reducer', () => {
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

  it('should return the initial state', (done) => {
    expect(reducer(undefined, {})).toEqual(initialState);
    done();
  });

  describe('CHANGE_VIDEO_FILE', () => {
    it('should set the state with different video file', (done) => {
      const action = {
        type: actions.CHANGE_VIDEO_FILE,
        payload: {
          uploadFile: {
            name: 'Test Upload',
          },
        },
      };

      deepFreeze(initialState);

      const changedState = reducer(initialState, action);
      expect(changedState).not.toEqual(initialState);
      expect(typeof changedState.uploadFile).toBe('object');
      expect(changedState.uploadFile.name).toBe('Test Upload');
      done();
    });
  });

  describe('CHANGE_EDIT_VIDEO_INFO', () => {
    it('should set the state with different video info', (done) => {
      const action = {
        type: actions.CHANGE_EDIT_VIDEO_INFO,
        payload: {
          videoInfo: {
            title: 'Test Video',
            desc: 'Testing Video',
            accessibility: '1',
            canComment: false,
            canLike: true,
            tags: ['test'],
          },
        },
      };

      deepFreeze(initialState);

      const changedState = reducer(initialState, action);
      expect(changedState).not.toEqual(initialState);
      expect(typeof changedState.videoInfo).toBe('object');
      expect(changedState.videoInfo.title).toBe('Test Video');
      expect(changedState.videoInfo.desc).toBe('Testing Video');
      expect(changedState.videoInfo.canComment).toBe(false);
      expect(changedState.videoInfo.tags[0]).toBe('test');
      done();
    });
  });
});
