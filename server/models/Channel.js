import db from "./../models";
const search = require('./../config/search');

export default (sequelize, DataTypes) => {
  const Channel = sequelize.define('Channel', {
    name: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    channelURL: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    desc: DataTypes.STRING(600),
    businessEmail: DataTypes.STRING,
    isFeatured: DataTypes.BOOLEAN,
    color: DataTypes.STRING,
    searchId: {
      type: DataTypes.STRING,
      unique: true,
    },
  });

  return Channel;
};

exports.myChannel = function (user) {

  var a = new Promise(function (resolve, reject) {
    db.Channel.findOne({
      where: { userId: user.id },
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
    }).then(function (channel) {
      if (channel) {
        //console.log(channel);
        resolve(channel);
      } else {
        //reject({message: "You do not have a channel."});
        console.log("channel not found");
      }
    }).catch(function (err) {
      reject(err);
    });
  });

  var b = a.then(function (channel) {

    return new Promise(function (resolve, reject) {
      db.User.findOne({
        where: {
          id: channel.userId
        },
        attributes: ["avatarPath"]
      }).then(function (user) {
        //console.log(user);
        resolve(user);
      }).catch(function (err) {
        reject(err);
      })
    })
  });

  return Promise.all([a, b])
    .then(function ([channel, user]) {
      console.log(user);
      var data = {
        channel,
        user: user
      }
      return data;

    }).catch(function (err) {
    })
}

exports.createChannel = function (user, channelData) {
  const { id } = user;
  const { name, desc, businessEmail, categories, color } = channelData;
  const channelURL = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");

  var a = new Promise(function (resolve, reject) {
    db.Channel.create({
      userId: id,
      name,
      channelURL,
      desc,
      businessEmail,
      color
    }).then(function (channel) {
      resolve(channel);
    }).catch(function (err) {
      reject(err);
    })
  });

  var b = a.then(function (channel) {
    return new Promise(function (resolve, reject) {
      db.User.findOne({
        where: { id }
      }).then(function (user) {
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
          search.addObjectToChannel(channelObj)
          .then(function(channelObj){
            console.log("Channel was added to the search index");
            channel.updateAttributes({
                  searchId: channelContent.objectID
                });
                resolve(channel);
          }).catch(function(){
            console.log("Error occured while adding channel to index");
          });
          // channelIndex.addObject(channelObj, (error, channelContent) => {
          //   if (error) {
          //     console.error(error);
          //   }
          //   channel.updateAttributes({
          //     searchId: channelContent.objectID
          //   });
          //   console.log("Channel was added to the index");
          //   resolve(channel);
          // });
        }
      }).catch(function (err) {
        reject(err);
      })
    });
  });

  var c = b.then(function (channel) {
    return new Promise(function (resolve, reject) {
      createCategories(categories, channel.id)
        .then(function (channel) {
          resolve(channel);
        }).catch(function (err) {
          reject(err);
        });
    });
  });

  return Promise.all([a, b, c])
    .then(function ([channel1, channel2, channel3]) {
      console.log(channel3);
      var data = {
        channel3
      }
      return data;
    }).catch(function (err) { });
};

exports.updateChannel = function (channelData) {
  const { id, name, desc, businessEmail, color, searchId } = channelData;
  const channelURL = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");

  return new Promise(function (resolve, reject) {
    db.Channel.update(
      {
        name,
        channelURL,
        desc,
        businessEmail,
        color
      },
      { where: { id } }
    ).then(function () {
      if (searchId && process.env.NODE_ENV === 'production') {

        search.partialUpdateChannel({name,desc,channelColor: color,objectID: searchId})
        .then(function(object){
          console.log("Channel info in search index is updated");
          const channelVideos = channelContent.videos.map(vidId => {
            return {
              channelName: name,
              channelColor: color,
              channelUrl: channelURL,
              objectID: vidId
            };
            search.partialUpdateVideo(channelVideos)
            .then(function(object){
              console.log("Channel info on videos are updated");
            }).catch(function(){

            });
          });
        }).catch(function(){

        });

      
        // channelIndex.partialUpdateObject(
        //   {
        //     name,
        //     desc,
        //     channelColor: color,
        //     objectID: searchId
        //   },
        //   err => {
        //     if (err) {
        //       console.error(err);
        //     } else {
        //       console.log("Channel info in search index is updated");
        //       channelIndex.getObject(searchId, (err2, channelContent) => {
        //         if (err2) {
        //           console.error(err2);
        //         }
        //         const channelVideos = channelContent.videos.map(vidId => {
        //           return {
        //             channelName: name,
        //             channelColor: color,
        //             channelUrl: channelURL,
        //             objectID: vidId
        //           };
        //         });
        //         videoIndex.partialUpdateObjects(channelVideos, err3 => {
        //           if (err3) {
        //             console.error(err3);
        //           } else {
        //             console.log("Channel info on videos are updated");
        //           }
        //         });
        //       });
        //     }
        //   }
        // );
      }
      // if ends
      resolve({ msg: "success" });
    }).catch(function (err) {
      reject(err);
    })
  });
};
exports.getAllFeatured = function () {
  return new Promise(function (resolve, reject) {

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
    }).then(function (channels) {
      resolve(channels, { success: true });
    }).catch(function (err) {
      reject(err);
    })
  });
}


//this is a test and it is under construction
exports.getOneByUrl = function (user, channelUrl) {

  let userId;
  if (user) {
    // Set id if user is logged in.
    userId = user.id;
  }
  const channelURL = channelUrl
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");

  return new Promise(function (resolve, reject) {
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
    }).then(function (channel) {
      if (channel) {

        db.User.findOne({
          where: { id: channel.userId },
          attributes: ["avatarPath"]
        }).then(function (userAvatar) {
          channel.dataValues.avatarPath = userAvatar.avatarPath;
          if (userId) {
            db.UserSubscription.findOne({
              where: { userId, channelId: channel.id }
            }).then(function (userSub) {
              let isUserChannel = false;
              let isSubscribed = false;
              if (channel.userId === userId) isUserChannel = true;
              if (userSub) isSubscribed = true;

              db.UserSubscription.count({
                where: { channelId: channel.id }
              }).then(function (count) {
                resolve({ channel, isUserChannel, isSubscribed, totalSubscriber: count });
              }).catch(function (err) {
                reject(err);
              })
            })
              .catch(function (err) {
                reject(err);
              })
          } else {
            db.UserSubscription.count({
              where: { channelId: channel.id }
            }).then(function (count) {
              resolve({ channel, totalSubscriber: count });
            }).catch(function (err) {
              reject(err);
            })
          }
        }).catch(function (err) {
          reject(err);
        })

      } else {
        reject({ message: "Channel not found" });
      }
    }).catch(function (err) {
      reject(err);
    })
  });
}


