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
  });

  return Video;
};

// TODO - move to  User model
exports.setUploading = (userId, boolVal) => {

  return new Promise((resolve, reject) => {
    db.User.update({
      isUploading: boolVal,
    }, {
        where: {
          id: userId,
        },
      }).then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      })
  });
}

exports.markDeleted = (videoId) => {
  return new Promise((resolve, reject) => {
    db.Video.update({ isDeleted: true }, { where: { id: videoId } })
      .then(() => {
        resolve();
      })
      .catch((err3) => {
        reject(err3);
      });
  });
}

exports.updateVideoDelete = (videoId) => {
  return new Promise((resolve, reject) => {
    db.Video.update({ isDeleted: true }, { where: { id: videoId } })
      .then(() => {
        resolve();
      })
      .catch((err3) => {
        reject(err3);
      });
  });
}

exports.videoCreate = (fileName, ChannelId, videoDuration) => {
  return new Promise((resolve, reject) => {
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
    }).then((result) => {
      resolve(result);
    }).catch((err) => {
      reject(err);
    })
  });
}

exports.updateVideo = (videoId, userId, videoHash, videoName, suffix) => {
  return new Promise((resolve, reject) => {
    db.Video.update({
      pathToOriginal: `${process.env.AWS_VIDEO_CDN}/user_${userId}/${videoHash}/${videoName}.${suffix}`,
    }, {
        where: { id: videoId },
      }).then(() => {
        resolve();
      }).catch((err5) => {
        reject(err5);
        
      });
  });
}

exports.findById = (videoId) => {
  return new Promise((resolve, reject) => {
    db.Video.findOne({
      where: { id: videoId, isDeleted: false },
    }).then((result2) => {
      resolve(result2);
    }).catch((err) => {
      reject(err);
    })
  });
}

exports.updateVideoPath = (videopaths, videoId) => {
  return new Promise((resolve, reject) => {
    db.Video.update({
      ...videopaths,
    }, {
        where: { id: videoId, isDeleted: false },
      }).then(() => {
        resolve();
      }).catch((err3) => {
        reject(err3);
      })
  });
}

exports.deleteVideo = (videoId) => {
  return new Promise((resolve, reject) => {
    db.Video.update({ isDeleted: true }, { where: { id: videoId } })
      .then(() => {
        resolve();
      }).catch((err) => {
        reject(err);
      })
  });
}

exports.getVideoInfo = (videoId) => {
  const { id } = videoId;
  return new Promise((resolve, reject) => {
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
    }).then((data) => {
      const { title, desc, thumbnailPath, canLike, canComment, accessibility } = data;
      const tags = data.Tags;
      resolve({ title, desc, thumbnailPath, canLike, canComment, accessibility, tags });
    }).catch((err) => {
      reject(err);
    })
  });
}
