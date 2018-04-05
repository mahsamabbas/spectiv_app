import AWS from 'aws-sdk';
import _ from 'lodash';
import async from 'async';
import fetch from 'node-fetch';
const search = require('./../config/search');
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
        search.partialUpdateChannel({avatarUrl: `${process.env.AWS_AVATAR_CDN}/${key}`,objectID: searchId})
        .then(function(object){
          console.log("avatar url is updated in search index");
          cb();
        })
        // channelIndex.partialUpdateObject(
        //   {
        //     avatarUrl: `${process.env.AWS_AVATAR_CDN}/${key}`,
        //     objectID: searchId
        //   },
        //   error => {
        //     if (error) {
        //       return cb(error);
        //     }
        //     cb();
        //   }
        // );
      },
      (cb) => {
        search.getChannelObject(searchId)
        .then(function(response){
          console.log("fetching channel object by searchId from search");
          return cb();
        })
        // channelIndex.getObject(
        //   searchId,
        //   (error2, channelContent) => {
        //     if (error2) {
        //       console.error(error2);
        //       return cb(error2);
        //     }
        //     if (channelContent.videos) {
        //       channelVideos = _.map(channelContent.videos, (vidId) => {
        //         return {
        //           channelAvatar: `${process.env.AWS_AVATAR_CDN}/${key}`,
        //           objectID: vidId
        //         };
        //       }
        //       );
        //     }
        //     return cb();
        //   }
        // );
      },
      (cb) => {
        if (!channelVideos) {
          return cb();
        }
        search.partialUpdateVideo(channelVideos)
        .then(function(object){
          console.log("updating video index with channelVideos");
          return cb();
        })
        
        // videoIndex.partialUpdateObjects(
        //   channelVideos,
        //   err => {
        //     if (err) {
        //       console.error(err);
        //       return cb(err);
        //     }
        //     return cb();
        //   }
        // );
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
        const resizeHost = process.env.SPECTIV_IMAGE_RESIZE_HOST;
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

function handleThumbnailUpload(req) {
  const { id } = req.user;
  const { videoHash, videoId, searchId } = req.body;
  const fileName = req.file.originalname.replace(/[^\w.]/g, '');
  const thumbnailsDir = `user_${id}/thumbnails/${videoHash}`;
  const sizeDirs = ['xs', 'sm', 'md', 'lg', 'xl'];
  const originalKey = `${thumbnailsDir}/${fileName}`;
  const originalUrl = `${process.env.AWS_AVATAR_CDN}/${originalKey}`;
  const params = {
    Bucket: process.env.AWS_AVATAR_BUCKET,
    Key: originalKey
  };
  const s3 = new AWS.S3({ params });


  return new Promise((resolve, reject) => {
    if (!id) {
      return reject({
        code: 401,
        body: 'Unauthorized'
      });
    }
    let objList;
    async.series([
      cb => {
        s3.listObjectsV2({ Bucket: params.Bucket, Prefix: thumbnailsDir }, (err, data) => {
          if (err) {
            return cb({
              code: 500,
              err
            });
          }
          objList = _.map(data.Contents, obj => ({ Key: obj.Key }));
          return cb();
        });
      },
      cb => {
        // deleteObjects
        if (!objList.length) {
          return cb();
        }
        s3.deleteObjects({
          Bucket: params.Bucket,
          Delete: {
            Objects: objList,
            Quiet: true,
          },
        }, (err2) => {
          if (err2) {
            console.error('deletObjects() error');
            return cb({
              code: 500,
              err: err2
            });
          }
          return cb();
        });
      },
      cb => {
        // upload initial
        s3.upload({ Body: req.file.buffer, Key: originalKey }, (err) => {
          if (err) {
            return cb({
              code: 500,
              err
            });
          }
          return cb();
        });
      },
      cb => {
        // upload to resize into size dirs
        async.eachSeries(sizeDirs, (sizeDir, cb2) => {
          const sizeKey = `${thumbnailsDir}/${sizeDir}/${fileName}`;
          s3.upload({ Body: req.file.buffer, Key: sizeKey }, err => {
            if (err) {
              return cb({
                code: 500,
                err
              });
            }
            return cb2();
          });
        }, cb);
      },
      cb => {
        // update record URL
        db.Video.update({
          thumbnailPath: originalUrl
        }, {
          where: {
            id: videoId,
            isDeleted: false,
          },
        });
        return cb();
      },
      cb => {
        // update search
        if (!searchId || process.env.NODE_ENV !== 'production') {
          return cb();
        }
        search.partialUpdateVideo({thumbnailPath: originalUrl, objectID: searchId})
        .then(function(object){
          console.log("update video index with thumbnailPath and searchID");
          return cb();
        })
        // videoIndex.partialUpdateObject({
        //   thumbnailPath: originalUrl,
        //   objectID: searchId,
        // }, (error) => {
        //   if (error) {
        //     return cb({
        //       status: 500, err: error
        //     });
        //   }
        //   return cb();
        // });
      },
      (cb) => {
        const resizeHost = process.env.SPECTIV_IMAGE_RESIZE_HOST;
        fetch(`${resizeHost}/resize/thumbnail/${encodeURIComponent(thumbnailsDir)}`, { method: 'POST' })
          .then(() => {
            return cb();
          })
          .catch(err => {
            return cb({ code: 500, err });
          });
      }
    ], err => {
      if (err) {
        console.error(err);
        return reject(err);
      }
      return resolve(originalUrl);
    });
  });
}

imageController.upload = (req, res) => {
  if (req.user.id) {
    if (req.body.videoHash) {
      handleThumbnailUpload(req)
        .then(path => {
          return res.status(200).json({ avatarPath: path });
        })
        .catch(err => {
          return res.status(err.code).json({ Err: err.err });
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
