import async from 'async';

const seedUsers = (db) => {
  const cpena = (callback) => {
    db.User.build({
      username: 'cpena',
      password: 'password',
      firstName: 'Chris',
      lastName: 'Pena',
      email: 'chris.pena@gmail.com',
      phone: '281-123-4567',
      isInactive: false,
    }).save().then(() => {
      console.log('User "chrispena" created!');
      callback();
    });
  };

  const jwood = (callback) => {
    db.User.build({
      username: 'jwood',
      password: 'password',
      firstName: 'Justin',
      lastName: 'Wood',
      email: 'j.wood@gmail.com',
      phone: '281-321-7654',
      isInactive: false,
    }).save().then(() => {
      console.log('User "justinwood" created!');
      callback();
    });
  };

  const jchung = (callback) => {
    db.User.build({
      username: 'jchung',
      password: 'password',
      firstName: 'Jin',
      lastName: 'Chung',
      email: 'jin.chung@gmail.com',
      phone: '281-987-6543',
      isInactive: false,
    }).save().then(() => {
      console.log('User "jinchung" created!');
      callback();
    });
  };

  async.waterfall([
    cpena,
    jwood,
    jchung,
  ], (err) => {
    if (err) {
      console.log(err);
    }
  });
};

export default seedUsers;
