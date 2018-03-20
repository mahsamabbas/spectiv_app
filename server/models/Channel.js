import db from "./../models";
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

exports.getChannel = function(user, res){
  let userId;
  if (user) {
    // Set id if user is logged in.
    userId = user.id;
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

exports.myChannel = function(user){

var a = new Promise(function(resolve,reject){
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
  }).then(function(channel){
    if(channel){
      //console.log(channel);
     resolve(channel);
    }else{
      //reject({message: "You do not have a channel."});
      console.log("channel not found");
    }
  }).catch(function(err){
    reject(err);
  });
});

var b = a.then(function(channel){

  return new Promise(function(resolve, reject){
    db.User.findOne({
      where: {
        id: channel.userId
      },
      attributes: ["avatarPath"]
    }).then(function(user){
      //console.log(user);
      resolve(user);
    }).catch(function(err){
      reject(err);
    })
  })
});

return Promise.all([a,b])
.then(function([channel, user]){
  console.log(user);
  var data = {
    channel,
    user: user
  }
  return data;
  
}).catch( function(err){
})
}

exports.createChannel = function(user,body,res){
  const { id } = user;
  const { name, desc, businessEmail, categories, color } = body;
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

exports.updateChannel = function (body, res){
  const { id, name, desc, businessEmail, color, searchId } = body;
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
exports.getAllFeatured = function(){
  return new Promise(function(resolve,reject){
    
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
      resolve(channels,{success:true});
    }).catch(function(err){
      reject(err);
    })
  });
  }
// exports.getAllFeatured = function(){
//   db.Channel.findAll({
//     where: { isFeatured: true },
//     group: ["Channel.id", "User.id"],
//     attributes: [
//       "id",
//       "name",
//       "desc",
//       "userId",
//       "color",
//       "channelURL",
//       [
//         db.sequelize.fn("COUNT", db.sequelize.col("UserSubscriptions.id")),
//         "subscribers"
//       ]
//     ],
//     include: [
//       {
//         model: db.User,
//         attributes: ["avatarPath"]
//       },
//       {
//         model: db.UserSubscription,
//         duplicating: false,
//         attributes: []
//       }
//     ],
//     limit: 4
//   })
//     .then(channels => {
//       return res.status(200).json({
//         channels,
//         success: true
//       });
//       // var result = res.status(200).json({
//       //   channels,
//       //   success: true
//       // });
//       // return callback(false,result);
//     })
//     .catch(err => {
//       console.log(err);
//       return res.status(500).json({
//         err
//       });
//       //return callback(true,false);
//     });
// };

// exports.myChannel = function(user, res){
//   if (!user) {
//     // Check if user is logged in
//     return res.status(401).json({
//       message: "Channel Not Found"
//     });
//   }

//   db.Channel.findOne({
//     where: { userId: user.id },
//     attributes: {
//       exclude: ["createdAt", "updatedAt"]
//     },
//     include: [
//       {
//         model: db.Video,
//         limit: 7,
//         where: {
//           accessibility: 1,
//           pathToOriginal: {
//             $ne: null
//           },
//           isDeleted: {
//             $ne: true
//           }
//         },
//         order: [["createdAt", "DESC"]]
//       }
//     ]
//   })
//     .then(channel => {
//       if (!channel) {
//         return res.status(404).json({
//           message: "You do not have a channel."
//         });
//       }

//       db.User.findOne({
//         where: {
//           id: channel.userId
//         },
//         attributes: ["avatarPath"]
//       })
//         .then(() => {
//           // TODO - find out why userAvatar is unused here ... clearly there was some intent
//           return res.status(200).json({
//             channel,
//             user: user
//           });
//         })
//         .catch(err => {
//           console.log(err);
//           return res.status(500).json({ err });
//         });
//     })
//     .catch(err => {
//       console.log(err);
//       return res.status(500).json({ err });
//     });
// };





