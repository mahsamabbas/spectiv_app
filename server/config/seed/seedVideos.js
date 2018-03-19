import async from 'async';

const seedVideos = (db) => {
  const video1 = (callback) => {
    db.Video.build({
      id: 1,
      name: 'testvid',
      videoPath: 'video path to storage',
      thumbnailPath: 'thumbnail path to storage',
      channelId: 1,
    }).save().then(() => {
      console.log('Video "testvid" created!');
      callback();
    });
  };

  async.waterfall([
    video1,
  ], (err) => {
    if (err) {
      console.log(err);
    }
  });
};

export default seedVideos;
