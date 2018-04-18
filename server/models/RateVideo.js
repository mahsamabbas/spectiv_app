import _ from 'lodash';
import { videoIndex } from './../config/algolia';


export default (sequelize, DataTypes) => {
  const RateVideo = sequelize.define('RateVideo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isLiked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    videoId: {
      type: DataTypes.INTEGER,
    },
    userId: {
      type: DataTypes.INTEGER,
    },
  }, {
    instanceMethods: {
      like: function () {
        return this.update({ isLiked: true });
      },
      dislike: function () {
        return this.update({ isLiked: false });
      }
    },
    classMethods: {
      getForVideo: (videoId, userId) => {
        return new Promise((resolve, reject) => {
          const returnData = {
            rate: null,
            likedCount: null,
            totalCount: null
          };
          RateVideo.findAndCountAll({ where: { videoId } })
            .then(rateData => {
              if (userId) {
                returnData.rate = _.find(rateData.rows, { userId });
              }
              returnData.totalCount = rateData.count;
              returnData.likedCount = _.filter(rateData.rows, { isLiked: true }).length;
              return resolve(returnData)
            })
            .catch(reject);
        });
      },
      destroyRate: (videoId, userId, searchId, isLiked) => {
        return new Promise((resolve, reject) => {
          RateVideo.destroy({
            where: {
              videoId,
              userId
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
                }, err => {
                  if (err) {
                    return reject(err);
                  }
                  console.log('Video Like Decremented');
                  resolve();
                });
              }
            }

            return resolve({ success: true });
          }).catch((err) => {
            return reject(err);
          });
        });
      },
      rateVideo: (videoId, isLiked, userid) => {
        
        return new Promise((resolve, reject) => {
          RateVideo.findOrCreate({
            where: {
              videoId,
              userId: userid,
            },
            defaults: {
              videoId,
              userId: userid,
              isLiked,
            },
          }).then((rate) => {
            rate = rate[0];
            const rateMethod = isLiked ? rate.like.bind(rate) : rate.dislike.bind(rate);
            rateMethod()
              .then(() => {
                return resolve({ success: true });
              })
              .catch(err => {
                console.error(err);
                return reject({ err });
              });
          });
        })
      }
    }
  });

  return RateVideo;
};
