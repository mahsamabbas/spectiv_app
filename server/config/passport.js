import passport from 'passport';
import passportLocal from 'passport-local';
import db from './../models';

const LocalStrategy = passportLocal.Strategy;

// Serialize Sessions
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize Sessions
passport.deserializeUser((user, done) => {
  db.User.findOne({
    where: { id: user.id },
    attributes: {
      exclude: ['password'],
    },
    include: [
      {
        model: db.Channel,
      },
    ],
  }).then((dbUser) => {
    done(null, dbUser);
  }).error((err) => {
    done(err, null);
  });
});

// For Authenication Purposes
passport.use(new LocalStrategy(
  (username, password, done) => {
    db.User.findOne({
      where: { username: db.Sequelize.where(db.Sequelize.fn('lower', db.Sequelize.col('username')), db.Sequelize.fn('lower', username)) },
      include: [
        {
          model: db.Channel,
        },
      ],
    }).then((user) => {
      const pwd = user ? user.password : '';
      db.User.validatePassword(password, pwd, done, user);
    }).catch((err) => {
      console.log(err);
      done(err, null);
    });
  },
));
