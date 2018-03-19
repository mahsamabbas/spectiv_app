const initialState = {
  test: 'Chris',
};

const test = (state = initialState, action = {}) => {
  switch (action.type) {
    case 'TEST': {
      return {
        ...state,
        test: 'TEST',
      };
    }
    default: {
      return state;
    }
  }
};

export default test;
