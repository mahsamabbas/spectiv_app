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

exports.getAllByUserId = function(userId){
  const { id } = userId;

  return new Promise(function(resolve, reject){
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
    }).then(function(subscriptions){
      resolve({subscriptions, success:true,})
    }).catch(function(err){
      reject({err});
    })
  });
}

exports.getUserSubscription = function(channelid, userId){
  const { channelId } = channelid;
  return new Promise(function(resolve, reject){
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
      reject({err});
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
      reject({err});
    });
  }
  });
}

exports.createSubscription = function(channelId, userId){
  return new Promise(function(resolve, reject){
    db.UserSubscription.create(
      { userId: userId, channelId 
      }, {
      where: {
        channelId,
        userId: userId,
      },
    }).then(function(userSub){
      resolve(userSub);
    }).catch(function(err){
      reject({err})
    });
  });
}

exports.removeSubscription = function(channelId, userId){
  return new Promise(function(resolve, reject){
    db.UserSubscription.destroy({
      where: {
        channelId,
        userId: userId,
      },
    }).then(function(userSub){
      resolve(userSub);
    }).catch(function(err){
      reject({err});
    })
  });
}
