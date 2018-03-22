import db from "./../models";
import createCategories from "./../lib/category/createCategories";
import { channelIndex, videoIndex } from "./../config/algolia";
const channelModel = require('./../models/Channel');

const channelController = {};

channelController.getChannel = (req, res) => {
  let userId;
  if (req.user) {
    // Set id if user is logged in.
    userId = req.user.id;
  }

  const channelURL = req.params.channelURL
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");

    channelModel.getDbChannel(channelURL)
    .then(function(channel){
      if(channel){

        channelModel.userFindOne(channel.userId)
        .then(function(userAvatar){
          channel.dataValues.avatarPath = userAvatar.avatarPath;
          if(userId){

            channelModel.userSubscriptionFind(userId, channel.id)
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

  // db.Channel.findOne({
  //   where: {
  //     channelURL
  //   },
  //   include: [
  //     {
  //       where: {
  //         accessibility: 1,
  //         pathToOriginal: {
  //           $ne: null
  //         },
  //         isDeleted: {
  //           $ne: true
  //         }
  //       },
  //       model: db.Video,
  //       limit: 12,
  //       order: [["createdAt", "DESC"]]
  //     }
  //   ],
  //   attributes: [
  //     "id",
  //     "name",
  //     "channelURL",
  //     "desc",
  //     "businessEmail",
  //     "userId",
  //     "searchId",
  //     "color"
  //   ]
  // })
  //   .then(channel => {
  //     if (!channel) {
  //       return res.status(404).json({
  //         message: "Channel not found"
  //       });
  //     }
  //     db.User.findOne({
  //       where: { id: channel.userId },
  //       attributes: ["avatarPath"]
  //     })
  //       .then(userAvatar => {
  //         channel.dataValues.avatarPath = userAvatar.avatarPath;
  //         if (userId) {
  //           db.UserSubscription.findOne({
  //             where: { userId, channelId: channel.id }
  //           })
  //             .then(userSub => {
  //               let isUserChannel = false;
  //               let isSubscribed = false;
  //               if (channel.userId === userId) isUserChannel = true;
  //               if (userSub) isSubscribed = true;

  //               db.UserSubscription.count({
  //                 where: { channelId: channel.id }
  //               }).then(count => {
  //                 return res.status(200).json({
  //                   channel,
  //                   isUserChannel,
  //                   isSubscribed,
  //                   totalSubscriber: count
  //                 });
  //               });
  //             })
  //             .catch(err => {
  //               console.log(err);
  //               return res.status(500).json({ err });
  //             });
  //         } else {
  //           db.UserSubscription.count({
  //             where: { channelId: channel.id }
  //           }).then(count => {
  //             return res.status(200).json({ channel, totalSubscriber: count });
  //           });
  //         }
  //       })
  //       .catch(err => {
  //         console.log(err);
  //         return res.status(500).json({ err });
  //       });
  //   })
  //   .catch(err => {
  //     console.log(err);
  //     return res.status(500).json({ err });
  //   });

// channelModel.getChannel1(req.user, req.params.channelURL)
// .then(function(result){
//   if(result.message){
//     res.status(404).json(result);
//   }
// }).catch(function(err){
//   console.log("in catch");
//   res.send(err);
// })
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
  //channelModel.createChannel(req.user,req.body,res);
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
