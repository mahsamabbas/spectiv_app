const DUMMY_DATA = {};

DUMMY_DATA.User = {
  username: 'TestUser',
  password: 'TestTestTest',
  email: 'Testing@gmail.com',
};

DUMMY_DATA.UserTwo = {
  username: 'TestUserTwo',
  password: 'TestTestTest',
  email: 'TestingTwo@gmail.com',
};

DUMMY_DATA.Comment = (videoId, userId) => {
  return {
    comment: 'Test Comment',
    videoId,
    userId,
  };
};

DUMMY_DATA.Rate = (videoId, userId) => {
  return {
    isLiked: true,
    videoId,
    userId,
  };
};

DUMMY_DATA.Channel = (userId) => {
  return {
    name: 'Test Channel',
    userId,
  };
};

DUMMY_DATA.Video = (userId) => {
  return {
    title: 'Test Video',
    desc: 'This is only for testing purpose',
    userId,
  };
};

export default DUMMY_DATA;
