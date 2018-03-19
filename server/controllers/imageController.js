import AWS from 'aws-sdk';
import _ from 'lodash';
import async from 'async';
import fetch from 'node-fetch';

import db from '../models';
import { videoIndex, channelIndex } from './../config/algolia';

const imageController = {};

// TODO - move to model
function handleSearchIndexUpdate(key, searchId) {
  let channelVideos;


  return new Promise((resolve, reject) => {
    async.series([
      cb => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Algolia disabled outside of production. resolving');
          return resolve();
        }
        return cb();
      },
      (cb) => {
        channelIndex.partialUpdateObject(
          {
            avatarUrl: `${process.env.AWS_AVATAR_CDN}/${key}`,
            objectID: searchId
          },
          error => {
            if (error) {
              return cb(error);
            }
            cb();
          }
        );
      },
      (cb) => {
        channelIndex.getObject(
          searchId,
          (error2, channelContent) => {
            if (error2) {
              console.error(error2);
              return cb(error2);
            }
            if (channelContent.videos) {
              channelVideos = _.map(channelContent.videos, (vidId) => {
                return {
                  channelAvatar: `${process.env.AWS_AVATAR_CDN}/${key}`,
                  objectID: vidId
                };
              }
              );
            }
            return cb();
          }
        );
      },
      (cb) => {
        if (!channelVideos) {
          return cb();
        }
        videoIndex.partialUpdateObjects(
          channelVideos,
          err => {
            if (err) {
              console.error(err);
              return cb(err);
            }
            return cb();
          }
        );
      }
    ], (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    }
  );
  });
}

// TODO - move to model
function handleAvatarUpload(req) {
  const { id } = req.user;
  const { searchId } = req.body;
  const fileName = req.file.originalname.replace(/[^\w.]/g, "");
  const baseDir = `user_${id}`;
  const Key = `${baseDir}/${fileName}`;
  const sizeDirs = ['xs', 'sm', 'md', 'lg', 'xl'];
  const params = { Bucket: process.env.AWS_AVATAR_BUCKET, Key };
  const s3 = new AWS.S3({ params });

  let objList;
  return new Promise((resolve, reject) => {
    async.series([
      (cb) => {
        // s3.listObjectsV2
        s3.listObjectsV2(
          { Bucket: params.Bucket, Prefix: `user_${id}` },
          (err, data) => {
            objList = _.map(data.Contents, obj => ({ Key: obj.Key }));
            return cb(err);
          });
      },
      (cb) => {
        // s3.deleteObjects
        s3.deleteObjects(
          {
            Bucket: process.env.AWS_AVATAR_BUCKET,
            Delete: { Objects: objList, Quiet: true }
          },
          (err) => {
            return cb(err);
          });
      },
      (cb) => {
        s3
        .upload({ Body: req.file.buffer }, err => {
          if (err) {
            cb(err);
          }
        })
        .send(cb);
      },
      cb => {
        async.eachSeries(sizeDirs, (sizeDir, cb2) => {
          const sizeKey = `${baseDir}/${sizeDir}/${fileName}`;
          s3.upload({ Body: req.file.buffer, Key: sizeKey }, err => {
            if (err) {
              cb2(err);
            }
          })
          .send(cb2);
        }, cb);
      },
      (cb) => {
        if (!searchId || searchId === {}) {
          return cb();
        }
        handleSearchIndexUpdate(searchId, Key)
          .then(() => {
            return cb();
          })
          .catch(err => {
            return cb(err);
          });
      },
      (cb) => {
        // db.user.update
        db.User.update(
          { avatarPath: `${process.env.AWS_AVATAR_CDN}/${Key}` },
          { where: { id } }
        ).then(() => {
          return cb();
        });
      },
      (cb) => {
        const resizeHost = process.env.IMAGE_RESIZE_HOST;
        fetch(`${resizeHost}/resize/avatar/${baseDir}`, { method: 'POST' })
          .then(() => {
            return cb();
          })
          .catch(err => {
            console.error(err);
            return cb(err);
          });
      }
    ], (err) => {
      if (err) {
        return reject(err);
      }
      return resolve(`${process.env.AWS_AVATAR_CDN}/${Key}`);
    });
  });
}

imageController.upload = (req, res) => {
  const { id } = req.user;
  if (id) {
    if (req.body.videoHash) {
      // TODO - handle video image upload in own function
      const { videoHash, videoId, searchId } = req.body;
      const Key = `user_${id}/${videoHash}/thumbnails/${req.file.originalname.replace(/[^\w.]/g, '')}`;
      const params = { Bucket: process.env.AWS_VIDEO_BUCKET, Key };
      const s3 = new AWS.S3({ params });

      s3.listObjectsV2({ Bucket: params.Bucket, Prefix: `user_${id}/${videoHash}/thumbnails` }, (err, data) => {
        const objList = _.map(data.Contents, obj => ({ Key: obj.Key }));
        s3.deleteObjects({
          Bucket: params.Bucket,
          Delete: {
            Objects: objList,
            Quiet: true,
          },
        }, () => {
          s3.upload({ Body: req.file.buffer }, (err2) => {
            if (err2) {
              console.error(err2);
              return res.status(500).json({ Err: err2 });
            }
          }).send(() => {
            const thumbnailPath = `${process.env.AWS_VIDEO_CDN}/${Key}`;
            // UPDATE SEARCH INDEX WITH THUMBNAIL PATH
            if (searchId) {
              videoIndex.partialUpdateObject({
                thumbnailPath,
                objectID: searchId,
              }, (error) => {
                if (error) {
                  console.error(error);
                }
              });
            }

            db.Video.update({
              thumbnailPath: `${process.env.AWS_VIDEO_CDN}/${Key}`,
            }, {
              where: {
                id: videoId,
                isDeleted: false,
              },
            });
            return res.status(200).json({ avatarPath: `${process.env.AWS_VIDEO_CDN}/${Key}` });
          });
        });
      });
    } else {
      handleAvatarUpload(req)
        .then((path) => {
          return res.status(200).json({ avatarPath: path });
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).json({ Err: err });
        });
    }
  } else {
    return res.status(500).json({ message: 'no user found' });
  }
};

export default imageController;
