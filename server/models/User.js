import bcrypt from 'bcrypt-nodejs';

const SALT_WORK_FACTOR = 12;

const classMethods = {
  classMethods: {
    validatePassword: (password, pwd, done, user) => {
      bcrypt.compare(password, pwd, (err, isMatch) => {
        if (err) {
          console.error(err);
        }
        if (isMatch) {
          return done(null, user);
        }
        return done(null, false);
      });
    },
  },
};

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING(36),
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    isUploading: DataTypes.BOOLEAN,
    avatarPath: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    phone: DataTypes.STRING,
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpires: DataTypes.DATE,
    isApproved: DataTypes.BOOLEAN,
    isInactive: DataTypes.BOOLEAN,
    isAdmin: DataTypes.BOOLEAN,
  }, classMethods);

  User.hook('beforeCreate', (user, options, fn) => {
    console.log(fn);
    const salt = bcrypt.genSalt(SALT_WORK_FACTOR, (err, gennedSalt) => {
      return gennedSalt;
    });
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) {
        console.error(err);
      }
      user.password = hash;
      return fn(null, user);
    });
  });

  User.hook('beforeUpdate', (user, options, fn) => {
    const salt = bcrypt.genSalt(SALT_WORK_FACTOR, (err, gennedSalt) => {
      return gennedSalt;
    });
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) {
        throw new Error(err);
      }
      user.password = hash;
      return fn(null, user);
    });
  });

  return User;
};
