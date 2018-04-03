import _ from 'lodash';
import db from './../models';
import { channelIndex } from './../config/algolia';
const subscriptionModel = require('./../models/UserSubscription');
const errorLogging = require('./../config/logging');
const subscriptionController = {};

subscriptionController.getAllSubscription = (req, res) => {
  subscriptionModel.getAllByUserId(req.user)
  .then(function(data){
    return res.status(200).json(data);
  }).catch(function(err){
    return res.status(501).json(err);
  })
};

subscriptionController.getSubscription = (req, res) => {
  subscriptionModel.getUserSubscription(req.params, req.user)
  .then(function(data){
    return res.status(200).json(data);
  }).catch(function(err){
    return res.status(500).json(err);
  })
};

subscriptionController.newSubscription = (req, res) => {
  const { channelId, searchId } = req.body;

  if (req.user) {
    const { id } = req.user;
    subscriptionModel.createSubscription(channelId, id)
    .then(function(userSub){
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
              errorLogging.saveErrorLog(err);
            }
            errorLogging.saveInfoLog('Channel Subscriber Incremented for the channelId: '+channelId);
          });
        }
      return res.status(200).json(userSub);
    }).catch(function(err){
      return res.status(500).json( err );
    })
  } else {
    errorLogging.saveErrorLog("User is not loggedin / Authorized to subscribe a channel with id: "+channelId);
    return res.status(401).json({
      login: false,
      message: 'User is not logged in.',
    });
  }
};

subscriptionController.deleteSubscription = (req, res) => {
  const { channelId, searchId } = req.body;

  if(req.user){
    const { id } = req.user;
    subscriptionModel.removeSubscription(channelId, id)
    .then(function(userSub){
      if (searchId && process.env.NODE_ENV === 'production') {
        channelIndex.partialUpdateObject({
          subscribers: {
            value: 1,
            _operation: 'Decrement',
          },
          objectID: searchId,
        }, (err, content) => {
          if (err) {
            errorLogging.saveErrorLog(err);
          }
          errorLogging.saveInfoLog('Channel Subscriber Decremented for the channelId: '+channelId);
        });
      }

      return res.status(200).json({ userSub, success: true });
    }).catch(function(err){
      return res.status(500).json({ err });
    })
  }else{
    return res.status(401).json({
      login: false,
      message: 'User is not logged in.',
    });
  }
};

export default subscriptionController;
