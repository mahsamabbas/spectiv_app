import passport from 'passport';
import validator from 'validator';
import crypto from 'crypto';
import async from 'async';
import nodemailer from 'nodemailer';

import db from './../models';

const userController = {};

userController.login = (req, res) => {
  const renderOptions = {};
  if (req.isAuthenticated()) { // Check if user is logged in
    return res.redirect('/');
  }

  if (req.query.reset) {
    renderOptions.resetMessage = 'Your password has successfully reset.';
  }

  return res.status(200).render('login.html', renderOptions);
};

userController.checkUploading = (req, res) => {
  res.status(200).json({
    isUploading: req.user.isUploading
  });
};

userController.signUp = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  return res.status(200).render('signUp.html');
};

userController.createUser = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!validator.isEmail(email)) {
    return res.status(500).json({
      err: 'Not a valid email.',
    });
  }

  if (!username) {
    return res.status(500).json({
      err: 'Username is required',
    });
  }

  if (!email) {
    return res.status(500).json({
      err: 'Email is required',
    });
  }

  if (!password) {
    return res.status(500).json({
      err: 'Password is required',
    });
  }

  if (password.length < 8) {
    return res.status(500).json({
      err: 'Password must be more than 8 characters.',
    });
  }

  db.User.create({
    username,
    email,
    password,
    isInactive: false,
    isApproved: false,
  }).then((createdUser) => {
    // console.log(createdUser);
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err); // will generate a 500 error
      }
      // Generate a JSON response reflecting authentication status
      if (!user) {
        return res.status(500).json({
          success: false,
          message: 'Username or password is invalid.',
        });
      }
      req.login(user, (err2) => {
        if (err2) {
          return next(err2);
        }
        return res.status(200).json({
          success: true,
          message: 'You have successfully logged in!',
          route: '/',
        });
      });
    })(req, res, next);
  }).catch((err) => {
    return res.status(500).json({
      err,
    });
  });
};

userController.logout = (req, res) => {
  req.logOut();
  req.session.destroy();
  res.redirect('/');
};

userController.getUsername = (req, res) => {
  if (req.user) {
    return res.status(200).json({
      username: req.user.username,
      success: true,
    });
  }
  return res.status(200).json({
    message: 'User not logged in',
    success: false,
  });
};

userController.getUserInfo = (req, res) => {
  if (req.user) {
    return res.status(200).json({
      user: req.user,
      success: true,
    });
  }
  return res.status(200).json({
    message: 'User not logged in',
    success: false,
  });
};

userController.forgot = (req, res) => {
  return res.status(200).render('forgot.html');
};

userController.reset = (req, res) => {
  return res.status(200).render('reset.html');
};

userController.sendPasswordChange = (req, res) => {
  const { username, email } = req.body;

  if (!validator.isEmail(email)) {
    return res.status(500).json({
      message: 'Not a valid email',
      success: false,
    });
  }

  if (!username) {
    return res.status(500).json({
      message: 'Username is required',
      success: false,
    });
  }

  async.waterfall([
    (done) => {
      crypto.randomBytes(20, (err, buffer) => {
        const token = buffer.toString('hex');
        done(err, token);
      });
    },
    (token, done) => {
      db.User.findOne({
        where: {
          username,
          email,
        },
      }).then((user) => {
        if (!user) {
          // TODO - update flow so that this security hole is closed.
          // A bad actor could use this to find what email addresses / usernames
          // are registered and then brute force password
          return res.status(500).json({
            message: 'There isn\'t a user with that username and email',
            success: false,
          });
        }
        const date = Date.now() + (7 * 24 * 60 * 60 * 1000);

        user.updateAttributes({
          resetPasswordToken: token,
          resetPasswordExpires: date,
        });
        done(null, token, user);
      }).catch((err) => {
        done(err, null, null);
      });
    },
    (token, user, done) => {
      const smtpInfo = nodemailer.createTransport(process.env.EMAIL_CONNECTION_STRING);
      const mailOption = {
        to: user.email,
        from: 'no-reply@spectivvr.com',
        subject: 'Spectiv Password Reset',
        text: `You are receiving this email because you have requested for a password reset for your account.\n\nPlease click on the following link, or paste this into your browser to complete your password reset.\n\n http://${req.headers.host}/reset/${token}\n\n If you did not request this, please ignore this email and your password will remain unchanged.\n\n Please do not reply to this email.`,
        html: `<p>You are receiving this email because you have requested for a password reset for your account.</p><p>Please click on the following link, or paste this into your browser to complete your password reset.</p><p>http://${req.headers.host}/reset/${token}</p><p>If you did not request this, please ignore this email and your password will remain unchanged.</p><p>Please do not reply to this email.</p>`,
      };

      smtpInfo.sendMail(mailOption, (err) => {
        done(err, null);
      });
    },
  ], (err) => {
    if (err) {
      return res.status(500).json({
        err,
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
    });
  });
};

userController.changePassword = (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  async.waterfall([
    (done) => {
      db.User.findOne({
        where: {
          resetPasswordToken: token,
        },
      }).then((user) => {
        if (!user) {
          return res.status(500).json({
            message: 'There is no user with reset token.',
            success: false,
          });
        } else if (user.resetPasswordExpires < Date.now()) {
          return res.status(500).json({
            message: 'The time exceeded for the token please get a new token.',
            success: false,
          });
        }
        user.updateAttributes({
          password,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        });

        done(null, user);
      }).catch((err) => {
        done(err, null);
      });
    }, (user, done) => {
      const smtpInfo = nodemailer.createTransport(process.env.EMAIL_CONNECTION_STRING);
      const mailOption = {
        to: user.email,
        from: 'no-reply@spectivvr.com',
        subject: 'Your Spectiv password has been changed',
        text: `Hello, \n\n This is a confirmation email that your password has been changed for your ${user.email} account.\n\n If you did not request this change please contact the administrative.\n\n Please do not reply to this email.`,
        html: `<p>Hello, </p><p>This is a confirmation email that your password has been changed for your ${user.email} account.</p><p>If you did not request this change please contact the administrative.</p><p>Please do not reply to this email.</p>`,
      };

      smtpInfo.sendMail(mailOption, (err) => {
        done(err, null);
      });
    },
  ], (err) => {
    if (err) {
      return res.status(500).json({
        err,
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
    });
  });
};

userController.apply = (req, res) => {
  if (req.user) {
    db.Questionnaire.findOne({
      where: {
        userId: req.user.id,
      },
    }).then((questionnaire) => {
      if (questionnaire) {
        db.User.findOne({
          where: {
            id: req.user.id,
          },
          attributes: ['isApproved'],
        }).then((user) => {
          return res.status(200).json({
            success: true,
            questionnaire,
            isApproved: user.isApproved,
          });
        }).catch((err) => {
          return res.status(500).json({
            err,
            success: false,
          });
        });
      } else {
        return res.status(200).json({
          success: true,
        });
      }
    }).catch((err) => {
      return res.write('There was an internal server error.');
    });
  } else {
    return res.status(200).json({
      login: false,
    });
  }
};

userController.submitApplication = (req, res) => {
  const { technology, yesNo, explain } = req.body;

  if (req.user) {
    const { id } = req.user;
    db.Questionnaire.create({
      technology,
      yesNo,
      explain,
      userId: id,
    }).then(() => {
      return res.status(200).json({
        success: true,
      });
    }).catch((err) => {
      return res.status(500).json({
        err,
        success: false,
      });
    });
  } else {
    return res.status(401).json({
      login: false,
    });
  }
};

userController.getApplications = (req, res) => {
  db.Questionnaire.find({ where: {} })
    .then((applications) => {
      return res.status(200).json({
        applications,
        success: true,
      });
    }).catch((err) => {
      return res.status(500).json({
        err,
        success: false,
      });
    });
};

userController.editUserInfo = (req, res) => {
  const { id } = req.user;
  const { firstName, lastName, email } = req.body;

  db.User.update({
    firstName,
    lastName,
    email,
  }, {
    where: { id },
  }).then(() => {
    return res.status(200).json({
      success: true,
    });
  }).catch((err) => {
    return res.status(500).json({
      err,
    });
  });
};

userController.editPassword = (req, res) => {
  const { id } = req.user;
  const { oldPassword, newPassword } = req.body;

  db.User.findOne({ where: { id } })
    .then((user) => {
      if (!user) {
        return res.status(500).json({
          message: 'There isn\'t a user with that id',
          success: false,
        });
      }

      db.User.validatePassword(oldPassword, user.password, (err, matchedUser) => {
        if (matchedUser) {
          user.updateAttributes({
            password: newPassword,
          });

          const smtpInfo = nodemailer.createTransport(process.env.EMAIL_CONNECTION_STRING);
          const mailOption = {
            to: user.email,
            from: 'no-reply@spectivvr.com',
            subject: 'Your Spectiv password has been changed',
            text: `Hello, \n\n This is a confirmation email that your password has been changed for your ${user.email} account.\n`,
            html: `<p>Hello,</p><p>This is a confirmation email that your password has been changed for ${user.email} account.</p><p>Please do not respond to this email</p>`,
          };

          smtpInfo.sendMail(mailOption, (error) => {
            if (error) {
              console.log(error);
            }
          });

          return res.status(200).json({
            success: true,
          });
        }

        return res.status(500).json({
          message: 'The old password was incorrect',
          success: false,
        });
      }, user);
    }).catch((err) => {
      return res.status(500).json({
        err,
        success: false,
      });
    });
};

export default userController;
