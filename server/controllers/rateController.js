import db from './../models';
import { videoIndex } from './../config/algolia';

const rateController = {};

rateController.getRates = (req, res) => {
  if (req.user) {
    const { videoId } = req.params;
    const { id } = req.user;

    db.RateVideo.findAndCountAll({
      where: {
        videoId,
        isLiked: true,
      },
    }).then((liked) => {
      const likedCount = liked.count;
      db.RateVideo.findAndCountAll({
        where: {
          videoId,
        },
      }).then((total) => {
        const totalCount = total.count;
        db.RateVideo.find({
          where: {
            videoId,
            userId: id,
          },
        }).then((rate) => {
          res.status(200).json({
            rate,
            likedCount,
            totalCount,
            success: true,
          });
        });
      });
    }).catch((err) => {
      console.error(err);
      res.status(500).json({
        err,
      });
    });
  } else {
    const { videoId } = req.params;

    db.RateVideo.findAndCountAll({
      where: {
        videoId,
        isLiked: true,
      },
    }).then((liked) => {
      const likedCount = liked.count;
      db.RateVideo.findAndCountAll({
        where: {
          videoId,
        },
      }).then((total) => {
        const totalCount = total.count;
        res.status(200).json({
          likedCount,
          totalCount,
          success: true,
        });
      });
    }).catch((err) => {
      res.status(500).json({
        err,
      });
    });
  }
};

rateController.rateVideo = (req, res) => {
  const { videoId } = req.params;
  const { isLiked, searchId } = req.body;

  if (req.user) {
    const { id } = req.user;
    db.RateVideo.findOrCreate({
      where: {
        videoId,
        userId: id,
      },
      defaults: {
        videoId,
        userId: id,
        isLiked,
      },
    }).then((rate) => {
      if (isLiked) {
        // INCREMENT LIKE IF USER LIKED THE VIDEO
        if (searchId && process.env.NODE_ENV === 'production') {
          videoIndex.partialUpdateObject({
            likes: {
              value: 1,
              _operation: 'Increment',
            },
            objectID: searchId,
          }, (err, content) => {
            if (err) {
              console.error(err);
            }
            console.log('Video Like Incremented');
          });
        }
      }

      if (rate[0].dataValues.isLiked === !!isLiked) {
        res.status(200).json({
          success: true,
        });
      } else {
        db.RateVideo.update({
          isLiked,
        }, {
          where: {
            videoId,
            userId: id,
          },
        }).then(() => {
          res.status(200).json({
            success: true,
          });
        });
      }
    }).catch((err) => {
      console.error(err);
      res.status(500).json({
        err,
      });
    });
  } else {
    return res.status(401).json({
      login: false,
    });
  }
};

rateController.destroyRate = (req, res) => {
  const { videoId } = req.params;
  const { isLiked, searchId } = req.body;

  if (req.user) {
    const { id } = req.user;
    db.RateVideo.destroy({
      where: {
        videoId,
        userId: id,
      },
    }).then(() => {
      if (isLiked) {
        // DECREMENT VIDEO LIKES IF RATE WAS LIKE
        if (searchId && process.env.NODE_ENV === 'production') {
          videoIndex.partialUpdateObject({
            likes: {
              value: 1,
              _operation: 'Decrement',
            },
            objectID: searchId,
          }, (err, content) => {
            if (err) {
              console.error(err);
            }
            console.log('Video Like Decremented');
          });
        }
      }

      return res.status(200).json({
        success: true,
      });
    }).catch((err) => {
      console.error(err);
      return res.status(500).json({
        err,
      });
    });
  } else {
    return res.status(401).json({
      login: false,
    });
  }
};

export default rateController;
