import async from 'async';

const seedRoles = (db) => {
  const admin = (callback) => {
    db.Role.build({
      id: 1,
      name: 'admin',
    }).save().then(() => {
      console.log('Role "admin" created!');
      callback();
    });
  };

  const user = (callback) => {
    db.Role.build({
      id: 2,
      name: 'user',
    }).save().then(() => {
      console.log('Role "user" created!');
      callback();
    });
  };

  const visitor = (callback) => {
    db.Role.build({
      id: 3,
      name: 'visitor',
    }).save().then(() => {
      console.log('Role "visitor" created!');
      callback();
    });
  };

  async.waterfall([
    admin,
    user,
    visitor,
  ], (err) => {
    if (err) {
      console.log(err);
    }
  });
};

export default seedRoles;
