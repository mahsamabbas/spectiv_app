import async from 'async';

const seedChannels = (db) => {
  const jwChannel = (callback) => {
    db.Channel.build({
      id: 1,
      name: "jwood's channel",
      userId: 2,
    }).save().then(() => {
      console.log(`Channel ${"jwood's channel"} created!`);
      callback();
    });
  };

  const jcChannel = (callback) => {
    db.Channel.build({
      id: 2,
      name: "jchung's channel",
      userId: 3,
    }).save().then(() => {
      console.log(`Channel ${"jchung's channel"} created!`);
      callback();
    });
  };

  const cpChannel = (callback) => {
    db.Channel.build({
      id: 3,
      name: "cpena's channel",
      userId: 1,
    }).save().then(() => {
      console.log(`Channel ${"cpena's channel"} created!`);
      callback();
    });
  };

  async.waterfall([
    jwChannel,
    jcChannel,
    cpChannel,
  ], (err) => {
    if (err) {
      console.log(err);
    }
  });
};

export default seedChannels;
