import _ from 'lodash';
import db from './../models';
import { channelIndex } from './../config/algolia';

const subscriptionController = {};

subscriptionController.getAllSubscription = (req, res) => {
  const { id } = req.user;

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
    return res.status(200).json({
      subscriptions,
      success: true,
    });
  }).catch((err) => {
    return res.status(501).json({
      err,
    });
  });
};

subscriptionController.getSubscription = (req, res) => {
  const { channelId } = req.params;
  if (req.user) {
    const { id } = req.user;
    db.UserSubscription.findOne({
      where: {
        userId: id,
        channelId,
      },
    }).then((userSub) => {
      db.UserSubscription.count({
        where: { channelId },
      }).then((count) => {
        return res.status(200).json({
          subscribed: !_.isEmpty(userSub),
          totalSubscriber: count,
          success: true,
        });
      });
    }).catch((err) => {
      return res.status(500).json({
        err,
      });
    });
  } else {
    db.UserSubscription.count({
      where: { channelId },
    }).then((count) => {
      return res.status(200).json({
        subscribed: false,
        totalSubscriber: count,
      });
    }).catch((err) => {
      return res.status(500).json({
        err,
      });
    });
  }
};

subscriptionController.newSubscription = (req, res) => {
  const { channelId, searchId } = req.body;

  if (req.user) {
    const { id } = req.user;
    db.UserSubscription.create({ userId: id, channelId }, {
      where: {
        channelId,
        userId: id,
      },
    }).then((userSub) => {
      // INCREMENT CHANNEL SUBSCRIBER IN SEARCH INDEX
      if (searchId && process.env.NODE_ENV === 'production') {
        channelIndex.partialUpdateObject({
          subscribers: {
            value: 1,
            _operation: 'Increment',
          },
          objectID: searchId,
        }, (err, content) => {
          if (err) {
            console.error(err);
          }
          console.log('Channel Subscriber Incremented');
        });
      }

      return res.status(200).json({ userSub, success: true });
    }).catch((err) => {
      return res.status(500).json({ err });
    });
  } else {
    return res.status(401).json({
      login: false,
      message: 'User is not logged in.',
    });
  }
};

subscriptionController.deleteSubscription = (req, res) => {
  const { channelId, searchId } = req.body;

  if (req.user) {
    const { id } = req.user;
    db.UserSubscription.destroy({
      where: {
        channelId,
        userId: id,
      },
    }).then((userSub) => {
      // DECREMENT CHANNEL SUBSCRIBER IN SEARCH INDEX
      if (searchId && process.env.NODE_ENV === 'production') {
        channelIndex.partialUpdateObject({
          subscribers: {
            value: 1,
            _operation: 'Decrement',
          },
          objectID: searchId,
        }, (err, content) => {
          if (err) {
            console.error(err);
          }
          console.log('Channel Subscriber Decremented');
        });
      }

      return res.status(200).json({ userSub, success: true });
    }).catch((err) => {
      return res.status(500).json({ err });
    });
  } else {
    return res.status(401).json({
      login: false,
      message: 'User is not logged in.',
    });
  }
};

export default subscriptionController;
