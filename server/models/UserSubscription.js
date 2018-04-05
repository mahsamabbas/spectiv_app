import db from './../models';
import _ from 'lodash';
export default (sequelize, DataTypes) => {
  const UserSubscription = sequelize.define('UserSubscription', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  });

  return UserSubscription;
};

exports.getAllByUserId = (userId) => {
  const { id } = userId;

  return new Promise((resolve, reject) => {
    db.UserSubscription.findAll({
      where: { userId: id },
      group: ['UserSubscription.id', 'Channel.id', 'Channel.Videos.id', 'Channel.User.id'],
      order: [
        ['createdAt', 'ASC'],
      ],
      include: [
        {
          model: db.Channel,
          attributes: ['id', 'name', 'desc', 'userId', 'searchId', 'color', [db.sequelize.fn('COUNT', db.sequelize.col('Channel.UserSubscriptions.id')), 'subscribers']],
          include: [{
            model: db.UserSubscription,
            attributes: [],
          }, {
            model: db.Video,
            attributes: ['id'],
          }, {
            model: db.User,
            attributes: ['id', 'avatarPath'],
          }],
        },
      ],
    }).then((subscriptions) => {
      resolve({ subscriptions, success: true, })
    }).catch((err) => {
      reject({ err });
    })
  });
}

exports.getUserSubscription = (channelid, userId) => {
  const { channelId } = channelid;
  return new Promise((resolve, reject) => {
    if (userId) {
      const { id } = userId;
      db.UserSubscription.findOne({
        where: {
          userId: id,
          channelId,
        },
      }).then((userSub) => {
        db.UserSubscription.count({
          where: { channelId },
        }).then((count) => {
          var data = {
            subscribed: !_.isEmpty(userSub),
            totalSubscriber: count,
            success: true,
          }
          resolve(data);
        });
      }).catch((err) => {
        reject({ err });
      });
    } else {
      db.UserSubscription.count({
        where: { channelId },
      }).then((count) => {
        var data = {
          subscribed: false,
          totalSubscriber: count,
        }
        resolve(data);
      }).catch((err) => {
        reject({ err });
      });
    }
  });
}

exports.createSubscription = (channelId, userId) => {
  return new Promise((resolve, reject) => {
    db.UserSubscription.create(
      {
        userId: userId, channelId
      }, {
        where: {
          channelId,
          userId: userId,
        },
      }).then((userSub) => {
        resolve(userSub);
      }).catch((err) => {
        reject({ err })
      });
  });
}

exports.removeSubscription = (channelId, userId) => {
  return new Promise((resolve, reject) => {
    db.UserSubscription.destroy({
      where: {
        channelId,
        userId: userId,
      },
    }).then((userSub) => {
      resolve(userSub);
    }).catch((err) => {
      reject({ err });
    })
  });
}
