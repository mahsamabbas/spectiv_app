import db from "./../models";
import createCategories from "./../lib/category/createCategories";
import { channelIndex, videoIndex } from "./../config/algolia";

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

  db.Channel.findOne({
    where: {
      channelURL
    },
    include: [
      {
        where: {
          accessibility: 1,
          pathToOriginal: {
            $ne: null
          },
          isDeleted: {
            $ne: true
          }
        },
        model: db.Video,
        limit: 12,
        order: [["createdAt", "DESC"]]
      }
    ],
    attributes: [
      "id",
      "name",
      "channelURL",
      "desc",
      "businessEmail",
      "userId",
      "searchId",
      "color"
    ]
  })
    .then(channel => {
      if (!channel) {
        return res.status(404).json({
          message: "Channel not found"
        });
      }
      db.User.findOne({
        where: { id: channel.userId },
        attributes: ["avatarPath"]
      })
        .then(userAvatar => {
          channel.dataValues.avatarPath = userAvatar.avatarPath;
          if (userId) {
            db.UserSubscription.findOne({
              where: { userId, channelId: channel.id }
            })
              .then(userSub => {
                let isUserChannel = false;
                let isSubscribed = false;
                if (channel.userId === userId) isUserChannel = true;
                if (userSub) isSubscribed = true;

                db.UserSubscription.count({
                  where: { channelId: channel.id }
                }).then(count => {
                  return res.status(200).json({
                    channel,
                    isUserChannel,
                    isSubscribed,
                    totalSubscriber: count
                  });
                });
              })
              .catch(err => {
                console.log(err);
                return res.status(500).json({ err });
              });
          } else {
            db.UserSubscription.count({
              where: { channelId: channel.id }
            }).then(count => {
              return res.status(200).json({ channel, totalSubscriber: count });
            });
          }
        })
        .catch(err => {
          console.log(err);
          return res.status(500).json({ err });
        });
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({ err });
    });
};

channelController.myChannel = (req, res) => {
  if (!req.user) {
    // Check if user is logged in
    return res.status(401).json({
      message: "Channel Not Found"
    });
  }

  db.Channel.findOne({
    where: { userId: req.user.id },
    attributes: {
      exclude: ["createdAt", "updatedAt"]
    },
    include: [
      {
        model: db.Video,
        limit: 7,
        where: {
          accessibility: 1,
          pathToOriginal: {
            $ne: null
          },
          isDeleted: {
            $ne: true
          }
        },
        order: [["createdAt", "DESC"]]
      }
    ]
  })
    .then(channel => {
      if (!channel) {
        return res.status(404).json({
          message: "You do not have a channel."
        });
      }

      db.User.findOne({
        where: {
          id: channel.userId
        },
        attributes: ["avatarPath"]
      })
        .then(() => {
          // TODO - find out why userAvatar is unused here ... clearly there was some intent
          return res.status(200).json({
            channel,
            user: req.user
          });
        })
        .catch(err => {
          console.log(err);
          return res.status(500).json({ err });
        });
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({ err });
    });
};

channelController.createChannel = (req, res) => {
  const { id } = req.user;
  const { name, desc, businessEmail, categories, color } = req.body;
  const channelURL = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");

  db.Channel.create({
    userId: id,
    name,
    channelURL,
    desc,
    businessEmail,
    color
  })
    .then(channel => {
      // ADD NEW CHANNEL TO THE SEARCH INDEX
      db.User.findOne({
        where: { id }
      })
        .then(user => {
          let channelObj;
          if (user.avatarPath !== null) {
            channelObj = {
              id: channel.id,
              name: channel.name,
              channelURL: channel.channelURL,
              desc: channel.desc,
              subscribers: 0,
              avatarPath: user.avatarPath,
              channelColor: channel.color,
              videos: [],
              createdAt: Date.now()
            };
          } else {
            channelObj = {
              id: channel.id,
              name: channel.name,
              channelURL: channel.channelURL,
              desc: channel.desc,
              subscribers: 0,
              channelColor: channel.color,
              videos: [],
              createdAt: Date.now()
            };
          }
          if (process.env.NODE_ENV === 'production') {
            channelIndex.addObject(channelObj, (error, channelContent) => {
              if (error) {
                console.error(error);
              }
              channel.updateAttributes({
                searchId: channelContent.objectID
              });
              console.log("Channel was added to the index");
            });
          }
        })
        .catch(err => {
          console.error(err);
        });

      createCategories(categories, channel.id)
        .then(() => res.status(200).json({ channel }))
        .catch(err => res.status(500).json(err));
    })
    .catch(err => {
      return res.status(500).json({ err });
    });
};

channelController.updateChannel = (req, res) => {
  const { id, name, desc, businessEmail, color, searchId } = req.body;
  const channelURL = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");

  db.Channel.update(
    {
      name,
      channelURL,
      desc,
      businessEmail,
      color
    },
    { where: { id } }
  )
    .then(() => {
      // UPDATE CHANNEL IN THE SEARCH INDEX
      if (searchId && process.env.NODE_ENV === 'production') {
        channelIndex.partialUpdateObject(
          {
            name,
            desc,
            channelColor: color,
            objectID: searchId
          },
          err => {
            if (err) {
              console.error(err);
            } else {
              console.log("Channel info in search index is updated");
              channelIndex.getObject(searchId, (err2, channelContent) => {
                if (err2) {
                  console.error(err2);
                }
                const channelVideos = channelContent.videos.map(vidId => {
                  return {
                    channelName: name,
                    channelColor: color,
                    channelUrl: channelURL,
                    objectID: vidId
                  };
                });
                videoIndex.partialUpdateObjects(channelVideos, err3 => {
                  if (err3) {
                    console.error(err3);
                  } else {
                    console.log("Channel info on videos are updated");
                  }
                });
              });
            }
          }
        );
      }

      return res.status(200).json({ msg: "success" });
    })
    .catch(err => res.status(500).json({ err }));
};

channelController.getAllFeatured = (req, res) => {
  db.Channel.findAll({
    where: { isFeatured: true },
    group: ["Channel.id", "User.id"],
    attributes: [
      "id",
      "name",
      "desc",
      "userId",
      "color",
      "channelURL",
      [
        db.sequelize.fn("COUNT", db.sequelize.col("UserSubscriptions.id")),
        "subscribers"
      ]
    ],
    include: [
      {
        model: db.User,
        attributes: ["avatarPath"]
      },
      {
        model: db.UserSubscription,
        duplicating: false,
        attributes: []
      }
    ],
    limit: 4
  })
    .then(channels => {
      return res.status(200).json({
        channels,
        success: true
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        err
      });
    });
};

export default channelController;
