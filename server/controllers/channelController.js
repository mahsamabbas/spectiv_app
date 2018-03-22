import db from "./../models";
import createCategories from "./../lib/category/createCategories";
import { channelIndex, videoIndex } from "./../config/algolia";
const channelModel = require('./../models/Channel');

const channelController = {};

channelController.getChannel = (req, res) => {

  // channelModel.getFinalChannel(req)
  // .then(function(data){
  //   return res.status(200).json(data);
  // }).catch(function(err){
  //   console.log("i am here main");
  //   return res.status(500).json({err});
  // })
  let userId;
  if (req.user) {
    // Set id if user is logged in.
    userId = req.user.id;
  }

  const channelURL = req.params.channelURL
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");

    channelModel.velidateChannel(channelURL)
    .then(function(channel){
      if(channel){

        channelModel.findUser(channel.userId)
        .then(function(userAvatar){
          channel.dataValues.avatarPath = userAvatar.avatarPath;
          if(userId){

            channelModel.userSubscription(userId, channel.id)
            .then(function(userSub){
                let isUserChannel = false;
                let isSubscribed = false;
                if (channel.userId === userId) isUserChannel = true;
                if (userSub) isSubscribed = true;

                channelModel.userSubscriptionCount(channel.id)
                .then(function(count){
                  return res.status(200).json({
                    channel,
                    isUserChannel,
                    isSubscribed,
                    totalSubscriber: count
                  });
                }).catch(function(err){
                  return res.status(500).json({ err });
                })

            }).catch(function(err){
              return res.status(500).json({ err });
            })
          }else{
            channelModel.userSubscriptionCount(channel.id)
            .then(function(count){
              return res.status(200).json({ channel, totalSubscriber: count });
            }).catch(function(err){
              return res.status(500).json({ err });
            })
          }
        }).catch(function(err){
          return res.status(500).json({ err });
        })

      }else{
        return res.status(404).json({
          message: "Channel not found"
        });
      }

    }).catch(function(err){
      return res.status(500).json({ err });
    })
};

channelController.myChannel = (req, res) => {

  if (!req.user) {
    return res.status(401).json({
      message: "Channel Not Found"
    });
  }

  channelModel.myChannel(req.user)
    .then(function (result) {
        res.status(200).json(result);
      }
    )
    .catch(function (error) {
        console.log("in catch");
        res.send(error);
      }
    );
};

channelController.createChannel = (req, res) => {
  channelModel.createChannel(req.user,req.body)
  .then(function(result){
    res.status(200).json(result);
  })
  .catch(function(error){
    res.send(error);
  });
};

channelController.updateChannel = (req, res) => {
  channelModel.updateChannel(req.body)
  .then(function(result){
    res.status(200).json(result);
  }).catch(function(err){
    res.status(500).json({ err })
  });
};

 channelController.getAllFeatured = (req, res) => {
  channelModel.getAllFeatured()
  .then(function(channels){
    res.status(200).json({
      channels
    });
  })
  .catch(function(err){
    res.status(500).json({
      err
    });
  });
 };

export default channelController;
