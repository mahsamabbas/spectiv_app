import bcrypt from 'bcrypt-nodejs';
import db from './../models';

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

exports.createUser = (username, email, password) => {
  return new Promise((resolve, reject) => {
    db.User.create({
      username,
      email,
      password,
      isInactive: false,
      isApproved: false,
    }).then((createdUser) => {
      resolve(createdUser);
    }).catch((err) => {
      reject(err);
    });
  });
}

exports.findUser = (object) => {
  return new Promise((resolve, reject) => {
    db.User.findOne({
      where: object,
    }).then((user) => {
      resolve(user);
    }).catch((err) => {
      reject(err);
    })
  });
}

exports.apply = (userid) => {

  var a = new Promise((resolve, reject) => {
    db.Questionnaire.findOne({
      where: {
        userId: userid,
      },
    }).then((questionnaire) => {
      resolve(questionnaire);
    }).catch((err) => {
      reject(err);
    })
  });

  var b = a.then((questionnaire) => {
    return new Promise((resolve, reject) => {
      if (questionnaire) {
        db.User.findOne({
          where: {
            id: userid,
          },
          attributes: ['isApproved'],
        }).then((user) => {
          var data = {
            success: true,
            questionnaire,
            isApproved: user.isApproved,
          }
          resolve(data);
        }).catch((err) => {
          reject({ err, success: false });
        })
      } else {
        resolve({ success: true });
      }
    })
  });

  return Promise.all([a, b])
    .then((a, data) => {
      return data;
    }).catch((err) => {
      return err;
    })
}

exports.submitApplication = (user, technology, yesNo, explain) => {
  return new Promise((resolve, reject) => {
    db.Questionnaire.create({
      technology,
      yesNo,
      explain,
      userId: user,
    }).then(() => {
      resolve();
    }).catch((err) => {
      reject({ err, success: false })
    })
  });
}

exports.getApplications = () => {
  return new Promise((resolve, reject) => {
    db.Questionnaire.find({ where: {} })
      .then((applications) => {
        var data = {
          applications,
          success: true,
        }
        resolve(data);
      }).catch((err) => {
        reject({ err, success: false });
      })
  });
}

exports.editUserInfo = (id, firstName, lastName, email) => {
  return new Promise((resolve, reject) => {
    db.User.update({
      firstName,
      lastName,
      email,
    }, {
        where: { id },
      }).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      })
  });
}

