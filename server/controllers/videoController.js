import _ from 'lodash';

import db from './../models';
import createTags from './../lib/tag/createTags';
import updateTags from './../lib/tag/updateTags';
import { videoIndex } from './../config/algolia';

const videoController = {};

videoController.createVideo = (req, res) => {
  const {
    title,
    desc,
    tags,
  } = req.body;
  const { id } = req.user;
  const cleanTags = _.uniqBy(tags.map(tag => ({ name: tag.name.toLowerCase() })), 'name');

  if (!title && !desc) {
    return res.status(500).json({
      message: 'Title and Description are required.',
    });
  }

  db.Video.create({
    userId: id,
    title,
    desc,
    canComment: true,
    canLike: true,
    accessibility: 1,
  }).then((createdVideo) => {
    if (tags.length > 0) {
      createTags(cleanTags, id).then((createdTags) => {
        const videoTags = createdTags.map((tag) => {
          return {
            videoId: createdVideo.id,
            tagId: tag.id,
          };
        });
        db.VideoTag.bulkCreate(videoTags).then(() => {
          return res.status(200).json({
            createdVideo,
          });
        }).catch((err) => {
          console.log(err);
          return res.status(500).json({ err });
        });
      }).catch((err) => {
        console.log(err);
        return res.status(500).json({
          err,
        });
      });
    } else {
      return res.status(200).json({
        createdVideo,
      });
    }
  }).catch((err) => {
    console.log(err);
    res.status(500).json({ err });
  });
};

videoController.updateVideo = (req, res) => {
  const {
    title,
    desc,
    tags,
    videoId,
    canComment,
    canLike,
    accessibility,
    searchId,
  } = req.body;
  const { id } = req.user;
  const cleanTags = _.uniqBy(tags.map(tag => ({ name: tag.name.toLowerCase() })), 'name');

  db.Video.findOne({
    where: {
      id: videoId,
      isDeleted: false,
    },
    include: [
      {
        model: db.Channel,
        where: { userId: id },
        include: [
          {
            model: db.User,
            where: { isApproved: true },
          },
        ],
      },
    ],
  }).then((video) => {
    if (!video) {
      return res.status(401).json({
        err: 'Not authorized to get video.',
      });
    }
    video.update({
      title,
      desc,
      canComment,
      canLike,
      accessibility: Number(accessibility),
    });
    if (searchId && process.env.NODE_ENV === 'production') {
      videoIndex.partialUpdateObject({
        title,
        desc,
        objectID: searchId,
      }, (err, content) => {
        if (err) { console.error(err); }
        console.log('Video index was updated');
      });
    }
    updateTags(cleanTags, id, videoId).then((createdTags) => {
      const videoTags = createdTags.map((tag) => {
        return {
          videoId,
          tagId: tag.id,
        };
      });
      db.VideoTag.bulkCreate(videoTags).then((createdVideoTags) => {
        return res.status(200).json({
          video,
          createdVideoTags,
        });
      }).catch((err) => {
        console.log(err);
        return res.status(500).json({ err });
      });
    }).catch((err) => {
      console.log(err);
      return res.status(500).json({ err });
    });
  }).catch((err) => {
    console.log(err);
    return res.status(500).json({ err });
  });
};

videoController.getVideo = (req, res) => {
  const { videoId } = req.params;

  if (!Number(videoId)) {
    return res.status(404).json({ err: 'Not video was found' });
  }

  if (!videoId) {
    return res.status(500).json({
      message: 'Video ID is required.',
    });
  }

  db.Video.findOne({
    where: { id: videoId, isDeleted: false },
    include: [
      {
        model: db.Channel,
        attributes: ['id', 'name', 'userId'],
        include: [
          {
            model: db.Category,
            attributes: ['id'],
            through: {
              attributes: [],
            },
          },
          {
            model: db.User,
            attributes: ['avatarPath'],
          },
        ],
      },
      {
        model: db.Tag,
        through: {
          model: db.VideoTag,
          attributes: [],
        },
        attributes: ['id', 'name'],
      },
    ],
  }).then((video) => {
    if (!video) {
      return res.status(404).json({
        err: 'Not video was found',
      });
    }
    video.increment('viewCount');
    // UPDATE THE VIDEO IN SEARCH INDEX
    if (video.searchId && process.env.NODE_ENV === 'production') {
      videoIndex.partialUpdateObject({
        views: {
          value: 1,
          _operation: 'Increment',
        },
        objectID: video.searchId,
      }, (err, content) => {
        if (err) { console.error(err); }
        console.log('Video Index view was incremented');
      });
    }
    let owner = false;
    if (req.user) {
      if (video.Channel.userId === req.user.id) {
        owner = true;
      }
      db.UserSubscription.findOne({
        where: {
          channelId: video.Channel.id,
          userId: req.user.id,
        },
      }).then((userSub) => {
        db.UserSubscription.count({
          where: { channelId: video.Channel.id },
        }).then((count) => {
          return res.status(200).json({
            video,
            success: true,
            owner,
            isSubscribed: !_.isEmpty(userSub),
            totalSubscriber: count,
          });
        });
      }).catch((err) => {
        return res.status(500).json({ err });
      });
    } else {
      db.UserSubscription.count({
        where: { channelId: video.Channel.id },
      }).then((count) => {
        return res.status(200).json({
          video,
          success: true,
          owner,
          totalSubscriber: count,
        });
      });
    }
  }).catch((err) => {
    console.error(err);
    return res.status(500).json({
      err,
    });
  });
};

videoController.getEditVideo = (req, res) => {
  const { videoId } = req.params;
  const { id } = req.user;

  if (!videoId) {
    return res.status(500).json({
      message: 'Video ID is required.',
    });
  }

  db.Video.findOne({
    where: { id: videoId, isDeleted: false },
    include: [
      {
        model: db.Channel,
        where: { userId: id },
        include: [
          {
            model: db.User,
            where: { isApproved: true },
          },
        ],
      },
      {
        model: db.Tag,
        through: {
          model: db.VideoTag,
        },
        attributes: ['id', 'name'],
      },
    ],
  }).then((video) => {
    if (!video) {
      return res.status(401).json({
        err: 'Not authorized to get video.',
      });
    }
    return res.status(200).json({
      video,
      success: true,
    });
  }).catch((err) => {
    console.log(err);
    return res.status(500).json({
      err,
    });
  });
};

videoController.getMyVideos = (req, res) => {
  const { id } = req.user;

  db.Video.findAll({
    where: { isDeleted: false },
    include: [
      {
        model: db.Channel,
        where: { userId: id },
      },
    ],
  }).then((videos) => {
    return res.status(200).json({ videos });
  }).catch((err) => {
    return res.status(500).json({ err });
  });
};

videoController.getTags = (req, res) => {
  db.Tag.findAll({ where: {} }).then((tags) => {
    return res.status(200).json({ tags });
  }).catch((err) => {
    return res.status(500).json({ err });
  });
};

videoController.getFeatured = (req, res) => {
  db.Video.findOne({
    where: { isFeatured: true, isDeleted: false },
    include: [
      {
        model: db.Channel,
        attributes: ['id', 'name', 'color', 'userId'],
        include: [{
          model: db.User,
          attributes: ['avatarPath'],
        }],
      },
      {
        model: db.Tag,
        through: {
          model: db.VideoTag,
          attributes: [],
        },
        attributes: ['id', 'name'],
      },
    ],
  }).then((featuredVideo) => {
    db.Video.findAll({
      where: {
        accessibility: 1,
        pathToOriginal: {
          $ne: null,
        },
        isDeleted: {
          $ne: true,
        },
      },
      order: [
        ['createdAt', 'DESC'],
      ],
      limit: 8,
    }).then((recentVideos) => {
      db.Video.findAll({
        where: {
          $or: {
            isStaffPick: true,
            isVideoOfTheDay: true,
            isViewerPick: true,
          },
        },
        include: [
          {
            model: db.Channel,
            attributes: ['id', 'name', 'color', 'userId'],
            include: [{
              model: db.User,
              attributes: ['avatarPath'],
            }],
          },
          {
            model: db.Tag,
            through: {
              model: db.VideoTag,
              attributes: [],
            },
            attributes: ['id', 'name'],
          },
        ],
      }).then((pickedVideos) => {
        return res.status(200).json({
          featuredVideo,
          recentVideos,
          pickedVideos,
          success: true,
        });
      }).catch((err) => {
        return res.status(500).json({
          err,
        });
      });
    });
  }).catch((err) => {
    return res.status(500).json({
      err,
    });
  });
};

videoController.recommendedVideos = (req, res) => {
  const { categoryId } = req.params;
  const { offset, vid } = req.query;
  const categories = categoryId.split(',');
  const catIds = _.map(categories, (category) => {
    return { id: category };
  });

  db.Video.findAll({
    where: {
      id: {
        $ne: vid,
      },
      isDeleted: {
        $ne: true,
      },
    },
    order: [
      ['createdAt', 'DESC'],
      ['viewCount', 'DESC'],
    ],
    limit: 10,
    offset,
    attributes: ['id', 'title', 'thumbnailPath', 'viewCount', 'createdAt', 'duration'],
    include: [{
      model: db.Channel,
      attributes: ['userId', 'name'],
      include: [{
        model: db.Category,
        where: { $or: catIds },
        attributes: [],
        through: {
          attributes: [],
        },
      }, {
        model: db.User,
        attributes: ['username'],
      }],
    }],
  }).then((videos) => {
    return res.status(200).json({
      videos,
      success: true,
    });
  }).catch((err) => {
    console.error(err);
    return res.status(500).json({
      err,
    });
  });
};

videoController.getFeaturedChannelVideos = (req, res) => {
  const { channelId } = req.params;
  db.Channel.findAll({
    where: { id: channelId },
    include: [
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
        },
        limit: 5,
        order: [
          ['createdAt', 'DESC'],
        ],
      },
    ],
  }).then((channel) => {
    console.log(channel);
    return res.status(200).json({
      channel,
    });
  }).catch((err) => {
    console.log(err);
    return res.status(500).json({
      err,
    });
  });
};

videoController.getFeaturedChannelsAndVideos = (req, res) => {
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
    db.Video.findAll({
      where: {
        accessibility: 1,
        pathToOriginal: {
          $ne: null,
        },
        isDeleted: {
          $ne: true,
        },
      },
      order: [
        ['createdAt', 'DESC'],
      ],
      limit: 8,
    }).then((recentVideos) => {
      db.Video.findAll({
        where: {
          $or: {
            isStaffPick: true,
            isVideoOfTheDay: true,
            isViewerPick: true,
          },
        },
        include: [
          {
            model: db.Channel,
            attributes: ['id', 'name', 'color', 'userId'],
            include: [{
              model: db.User,
              attributes: ['avatarPath'],
            }],
          },
          {
            model: db.Tag,
            through: {
              model: db.VideoTag,
              attributes: [],
            },
            attributes: ['id', 'name'],
          },
        ],
      }).then((pickedVideos) => {
        return res.status(200).json({
          featuredChannels,
          recentVideos,
          pickedVideos,
          success: true,
        });
      }).catch((err) => {
        return res.status(500).json({
          err,
        });
      });
    });
  }).catch((err) => {
    return res.status(500).json({
      err,
    });
  });
};

videoController.getChannelVideos = (req, res) => {
  const { channelId } = req.params;
  const { offset } = req.query;

  db.Video.findAll({
    where: {
      channelId,
      accessibility: 1,
      pathToOriginal: {
        $ne: null,
      },
      isDeleted: {
        $ne: true,
      },
    },
    order: [
      ['createdAt', 'DESC'],
    ],
    offset,
    limit: 12,
  }).then((videos) => {
    return res.status(200).json({
      videos,
      success: true,
    });
  }).catch((err) => {
    return res.status(500).json({
      err,
    });
  });
};

export default videoController;
