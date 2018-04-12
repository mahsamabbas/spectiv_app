import async from 'async';
import db from './../models';

export default (sequelize, DataTypes) => {
  const Video = sequelize.define('Video', {
    filename: DataTypes.STRING,
    title: DataTypes.STRING(100),
    thumbnailPath: DataTypes.STRING,
    desc: DataTypes.STRING(600),
    accessibility: DataTypes.INTEGER, // 1 = Public, 2 = Unlisted, 3 = Private
    canLike: DataTypes.BOOLEAN,
    canComment: DataTypes.BOOLEAN,
    pathToOriginal: DataTypes.STRING,
    pathTo1440p: DataTypes.STRING,
    pathTo1080p: DataTypes.STRING,
    isFeatured: DataTypes.BOOLEAN,
    isStaffPick: DataTypes.BOOLEAN,
    isVideoOfTheDay: DataTypes.BOOLEAN,
    isViewerPick: DataTypes.BOOLEAN,
    duration: DataTypes.INTEGER,
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isDeleted: DataTypes.BOOLEAN,
    searchId: {
      type: DataTypes.STRING,
      unique: true,
    },
    channelId: DataTypes.INTEGER,
    videoHash: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    instanceMethods: {
      getVideoHashFromThumbnailPath: function () {
        const path = this.thumbnailPath;
        return new Promise(resolve => {
          const rx = /\/[a-f0-9]{32}\//i;
          const hash = this.thumbnailPath.match(rx)[0].replace(/\//g, ''); // TODO - regex match group and nix .replace() - BRW
          return resolve(hash);
        });
      },
      getChannel: function () {
        return new Promise((resolve, reject) => {
          db.Channel.findById(this.channelId)
            .then(resolve)
            .catch(reject);
        });
      },
      getChannelUserId: function () {
        return new Promise((resolve, reject) => {
          this.getChannel()
            .then(channel => {
              resolve(channel.userId)
            })
            .catch(reject);
        });
      },
      getChannelUser: function () {
        return new Promise((resolve, reject) => {
          this.getChannel()
            .then(channel => {
              channel.getUser()
                .then(resolve)
                .catch(reject);
              })
            .catch(reject);
        });
      }
    }
  });

  return Video;
};

// TODO - move to  User model
exports.setUploading = function (userId, boolVal) {

  return new Promise(function (resolve, reject) {
    db.User.update({
      isUploading: boolVal,
    }, {
        where: {
          id: userId,
        },
      }).then(function () {
        resolve();
      }).catch(function (err) {
        reject(err);
      })
  });
}

exports.markDeleted = function (videoId) {
  return new Promise(function (resolve, reject) {
    db.Video.update({ isDeleted: true }, { where: { id: videoId } })
      .then(function () {
        resolve();
      })
      .catch(function (err3) {
        reject(err3);
      });
  });
}

exports.updateVideoDelete = function (videoId) {
  return new Promise(function (resolve, reject) {
    db.Video.update({ isDeleted: true }, { where: { id: videoId } })
      .then(function () {
        resolve();
      })
      .catch(function (err3) {
        reject(err3);
      });
  });
}

exports.videoCreate = function (fileName, ChannelId, videoDuration) {
  return new Promise(function (resolve, reject) {
    db.Video.create({
      filename: fileName,
      title: fileName.split('/').reverse()[0].split('.')[0],
      videoPath: '',
      thumbnailPath: '',
      desc: '',
      channelId: ChannelId,
      isDeleted: false,
      accessibility: 1,
      canLike: true,
      canComment: true,
      duration: videoDuration,
    }).then(function (result) {
      resolve(result);
    }).catch(function (err) {
      reject(err);
    })
  });
}

exports.updateVideo = function (videoId, userId, videoHash, videoName, suffix) {
  return new Promise(function (resolve, reject) {
    db.Video.update({
      pathToOriginal: `${process.env.AWS_VIDEO_CDN}/user_${userId}/${videoHash}/${videoName}.${suffix}`,
    }, {
        where: { id: videoId },
      }).then(function () {
        resolve();
      }).catch(function (err5) {
        reject(err5);
        
      });
  });
}

exports.findById = function (videoId) {
  return new Promise(function (resolve, reject) {
    db.Video.findOne({
      where: { id: videoId, isDeleted: false },
    }).then(function (result2) {
      resolve(result2);
    }).catch(function (err) {
      reject(err);
    })
  });
}

exports.updateVideoPath = function (videopaths, videoId) {
  return new Promise(function (resolve, reject) {
    db.Video.update({
      ...videopaths,
    }, {
        where: { id: videoId, isDeleted: false },
      }).then(function () {
        resolve();
      }).catch(function (err3) {
        reject(err3);
      })
  });
}

exports.deleteVideo = function (videoId) {
  return new Promise(function (resolve, reject) {
    db.Video.update({ isDeleted: true }, { where: { id: videoId } })
      .then(function () {
        resolve();
      }).catch(function (err) {
        reject(err);
      })
  });
}

exports.getVideoInfo = function (videoId) {
  const { id } = videoId;
  return new Promise(function (resolve, reject) {
    db.Video.findOne({
      where: { id },
      include: [{
        model: db.Tag,
        through: {
          model: db.VideoTag,
          attributes: [],
        },
        attributes: ['id', 'name'],
      }],
    }).then(function (data) {
      const { title, desc, thumbnailPath, canLike, canComment, accessibility } = data;
      const tags = data.Tags;
      resolve({ title, desc, thumbnailPath, canLike, canComment, accessibility, tags });
    }).catch(function (err) {
      reject(err);
    })
  });
}

exports.getFeaturedChannels =  () => {
  return new Promise((resolve, reject) => {
    db.Channel.findAll({
      where: {
        $or: [{
          name: 'Photos of Africa VR',
        }, {
          name: 'TycerX',
        }, {
          name: 'AeroFotografie',
        }, {
          name: 'Jeremy Sciapappa',
        }],
      },
      order: 'name',
      include: [
        {
          model: db.UserSubscription,
          attributes: ['id'],
        },
        {
          model: db.Video,
          where: {
            accessibility: 1,
            pathToOriginal: {
              $ne: null,
            },
            isDeleted: {
              $ne: true,
            },
            // isFeatured: true,
          },
          order: 'filename ASC',
          limit: 5,
          include: [{
            model: db.RateVideo,
            attributes: ['isLiked'],
          }, {
            model: db.Tag,
            through: {
              model: db.VideoTag,
              attributes: [],
            },
            attributes: ['id', 'name'],
          }],
        },
        {
          model: db.User,
          attributes: ['id', 'avatarPath'],
        },
      ],
    }).then((featuredChannels) => {
      resolve({
        featuredChannels,
        success: true,
      });
    }).catch(err => {
      reject(err);
    })
  })
}
