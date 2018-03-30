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
        len: {
          args: 8,
          msg: "Password must be 8 characters or more."
      }
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: {
          msg: "Not a valid email."
      }
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

exports.createUser = function(username, email, password){
  return new Promise(function(resolve, reject){
    db.User.create({
      username,
      email,
      password,
      isInactive: false,
      isApproved: false,
    }).then(function(createdUser){
      resolve(createdUser);
    }).catch(function(err){
      reject(err);
    });
  });
}

exports.findUser = function(object){
  return new Promise(function(resolve, reject){
    db.User.findOne({
      where: object,
    }).then(function(user){
      resolve(user);
    }).catch(function(err){
      reject(err);
    })
  });
}

exports.apply = function(userid){

  var a = new Promise(function(resolve, reject){
    db.Questionnaire.findOne({
      where: {
        userId: userid,
      },
    }).then(function(questionnaire){
      resolve(questionnaire);
    }).catch(function(err){
      reject(err);
    })
  });

  var b = a.then(function(questionnaire){
    return new Promise(function(resolve, reject){
      if(questionnaire){
        db.User.findOne({
          where: {
            id: userid,
          },
          attributes: ['isApproved'],
        }).then(function(user){
          var data = {
            success: true,
            questionnaire,
            isApproved: user.isApproved,
          }
          resolve(data);
        }).catch(function(err){
          reject({err, success:false});
        })
      }else{
        resolve({success:true});
      }
    })
  });

  return Promise.all([a, b])
  .then(function(a, data){
    return data;
  }).catch(function(err){
    return err;
  })
}

exports.submitApplication = function(user, technology, yesNo, explain){
  return new Promise(function(resolve, reject){
    db.Questionnaire.create({
      technology,
      yesNo,
      explain,
      userId: user,
    }).then(function(){
      resolve();
    }).catch(function(err){
      reject({err, success:false})
    })
  });
}

exports.getApplications = function(){
  return new Promise(function(resolve, reject){
    db.Questionnaire.find({ where: {} })
    .then(function(applications){
      var data = {
        applications,
        success: true,
      }
      resolve(data);
    }).catch(function(err){
      reject({err, success:false});
    })
  });
}

exports.editUserInfo = function(id, firstName, lastName, email){
  return new Promise(function(resolve, reject){
    db.User.update({
      firstName,
      lastName,
      email,
    }, {
      where: { id },
    }).then(function(){
      resolve();
    }).catch(function(err){
      reject(err);
    })
  });
}

