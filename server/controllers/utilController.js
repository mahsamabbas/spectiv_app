import async from 'async';
import fetch from 'node-fetch';
import s3 from 's3';
import tmp from 'tmp';
import path from 'path';

import db from './../models';

const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const client = s3.createClient({
  s3Options: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey
  }
});

const utilController = {};

const handleAvatarUploadToSizeDirs = (userId, avatarUrlFromDb, localPath) => {
  return new Promise((resolve, reject) => {
    const bucketName = process.env.AWS_AVATAR_BUCKET;
    const baseDir = `user_${userId}`;
    const baseName = path.basename(avatarUrlFromDb);

    const sizeDirs = ['xs', 'sm', 'md', 'lg', 'xl'];

    async.eachLimit(sizeDirs, 1, (sizeDir, cbEachLimit) => {
      const remoteKey = `${baseDir}/${sizeDir}/${baseName}`;
      const params = {
        localFile: localPath,
        s3Params: {
          Bucket: bucketName,
          Key: remoteKey,
        }
      };
      const uploader = client.uploadFile(params);
      uploader.on('error', (err) => {
        return cbEachLimit(err);
      });
      uploader.on('end', () => {
        cbEachLimit();
      });
    }, err => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

const handleAvatarUpdate = (userId, avatarUrlFromDb) => {
  return new Promise((resolve, reject) => {
    const bucketName = process.env.AWS_AVATAR_BUCKET;
    const baseDir = `user_${userId}`;
    const baseName = path.basename(avatarUrlFromDb);
    const Key = `${baseDir}/${baseName}`;

    tmp.file((err, localOriginalPath, fd, cleanupCallback) => {
      if (err) {
        throw err;
      }
      async.series([
        cb => {
          const params = {
            localFile: localOriginalPath,
            s3Params: {
              Bucket: bucketName,
              Key
            }
          };
          const downloader = client.downloadFile(params);
          downloader.on('error', (errDownload) => {
            cb(errDownload);
          });
          downloader.on('end', () => {
            console.log(`Starting size dir upload for ${avatarUrlFromDb}`);
            handleAvatarUploadToSizeDirs(userId, avatarUrlFromDb, localOriginalPath)
              .then(() => {
                const resizeHost = process.env.SPECTIV_IMAGE_RESIZE_HOST;
                const resizeDir = `${resizeHost}/resize/avatar/${baseDir}`;
                console.log(`Sending resize job for ${avatarUrlFromDb}`);
                fetch(resizeDir, { method: 'POST' })
                  .then(() => {
                    return cb();
                  })
                  .catch(errFetch => {
                    return cb(errFetch);
                  });
              })
              .catch(cb);
          });
        }
      ], errTmp => {
        cleanupCallback();
        if (errTmp) {
          return reject(errTmp);
        }
        return resolve();
      });
    });
  });
};


const handleThumbnailUploadOriginalPath = (userId, videoHash, thumbnailUrlFromDb, localPath) => {
  return new Promise((resolve, reject) => {
    const bucketName = process.env.AWS_AVATAR_BUCKET;
    const baseDir = `user_${userId}/thumbnails/${videoHash}`;
    const baseName = path.basename(thumbnailUrlFromDb);

    const remoteKey = `${baseDir}/${baseName}`;
    const params = {
      localFile: localPath,
      s3Params: {
        Bucket: bucketName,
        Key: remoteKey,
      }
    };
    console.log(params);
    const uploader = client.uploadFile(params);
    uploader.on('error', (err) => {
      return reject(err);
    });
    uploader.on('end', () => {
      resolve(remoteKey);
    });
  });
};

const handleThumbnailUploadToSizeDirs = (userId, videoHash, thumbnailUrlFromDb, localPath) => {
  return new Promise((resolve, reject) => {
    const bucketName = process.env.AWS_AVATAR_BUCKET;
    const baseDir = `user_${userId}/thumbnails/${videoHash}`;
    const baseName = path.basename(thumbnailUrlFromDb);

    const sizeDirs = ['xs', 'sm', 'md', 'lg', 'xl'];

    async.eachLimit(sizeDirs, 1, (sizeDir, cbEachLimit) => {
      const remoteKey = `${baseDir}/${sizeDir}/${baseName}`;
      const params = {
        localFile: localPath,
        s3Params: {
          Bucket: bucketName,
          Key: remoteKey,
        }
      };
      console.log(params);
      const uploader = client.uploadFile(params);
      uploader.on('error', (err) => {
        return cbEachLimit(err);
      });
      uploader.on('end', () => {
        cbEachLimit();
      });
    }, err => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

const handleThumbnailUpdate = (video) => {
  return new Promise((resolve, reject) => {
    let userId;
    let videoHash;

    async.series([
      cb => {
        // get userId
        video.getChannelUserId()
          .then(res => {
            userId = res;
            return cb();
          })
          .catch(cb);
      },
      cb => {
        // get videoHash
        video.getVideoHashFromThumbnailPath()
          .then(res => {
            videoHash = res;
            console.log(videoHash);
            return cb();
          })
          .catch(cb);
      },
      cb => {
        video.update({ userId, videoHash })
          .then(res => {
            console.log(res);
            cb();
          })
          .catch(cb);
      }
    ], err => {
      if (err) {
        return reject(err);
      }
      const thumbnailUrlFromDb = video.thumbnailPath;
      const bucketName = process.env.AWS_VIDEO_BUCKET;
      const baseDir = `user_${userId}/${videoHash}/thumbnails`;
      const baseName = path.basename(thumbnailUrlFromDb);
      const Key = `${baseDir}/${baseName}`;
      console.log();
      console.log(Key);
      console.log();
      tmp.file((tmpErr, localOriginalPath, fd, cleanupCallback) => {
        console.log(localOriginalPath);
        const localFile = localOriginalPath;
        if (tmpErr) {
          throw tmpErr;
        }
        async.series([
          cb => {
            const params = {
              localFile,
              s3Params: {
                Bucket: bucketName,
                Key
              }
            };
            const downloader = client.downloadFile(params);
            downloader.on('error', (errDownload) => {
              cb(errDownload);
            });
            downloader.on('end', () => {
              console.log(`Starting size dir upload for ${thumbnailUrlFromDb}`);
              async.parallel([
                cbParallel => {
                 // upload original
                  handleThumbnailUploadOriginalPath(userId, videoHash, thumbnailUrlFromDb, localFile)
                    .then((remoteKey) => {
                      const thumbnailPath = `${process.env.AWS_AVATAR_CDN}/${remoteKey}`;
                      video.update({ thumbnailPath })
                        .then(() => {
                          cbParallel();
                        })
                        .catch(cbParallel);
                    })
                    .catch(cbParallel);
                },
                cbParallel => {
                  // upload to size dirs
                  handleThumbnailUploadToSizeDirs(userId, videoHash, thumbnailUrlFromDb, localFile)
                    .then(() => {
                      const resizeHost = process.env.SPECTIV_IMAGE_RESIZE_HOST;
                      const resizeFile = `user_${userId}/thumbnails/${videoHash}`;
                      const resizeDir = `${resizeHost}/resize/thumbnail/${encodeURIComponent(resizeFile)}`;
                      console.log(`Sending resize job to ${resizeDir}`);
                      fetch(resizeDir, { method: 'POST' })
                        .then(() => {
                          return cbParallel();
                        })
                        .catch(errFetch => {
                          return cbParallel(errFetch);
                        });
                    })
                    .catch(cbParallel);
                }
              ], errParallel => {
                if (errParallel) {
                  return cb(errParallel);
                }
                return cb();
              });
            });
          }
        ], errTmp => {
          cleanupCallback();
          if (errTmp) {
            return reject(errTmp);
          }
          return resolve();
        });
      });
    });
  });
};

utilController.updateThumbnailStructure = (req, res) => {
  let videos;

  async.series([
    cb => {
      // get array of all user ids where avatarPath is not null
      db.Video.findAll({
        where: {
          thumbnailPath: {
            $ne: null
          }
        }
      })
      .then(data => {
        videos = data;
        cb();
      })
      .catch(cb);
    },
    cb => {
      async.eachLimit(videos, 4, (video, cbEachLimit) => {
        console.log(`Starting video: ${video.id}`);
        handleThumbnailUpdate(video)
          .then(() => {
            cbEachLimit();
          })
          .catch(err => {
            console.error(err);
            cbEachLimit();
          });
      }, cb);
    },
  ], err => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: 'error',
        error: err
      });
    }
    res.status(200).json({ status: 'ok' });
  });
};

utilController.updateAvatarStructure = (req, res) => {
  let users;

  async.series([
    cb => {
      // get array of all user ids where avatarPath is not null
      db.User.findAll({
        attributes: ['id', 'avatarPath'],
        where: {
          avatarPath: {
            $ne: null
          }
        }
      })
      .then(data => {
        users = data;
        cb();
      })
      .catch(cb);
    },
    cb => {
      async.eachLimit(users, 5, (user, cbEachLimit) => {
        console.log(`Starting user: ${user.id}`);
        handleAvatarUpdate(user.id, user.avatarPath)
          .then(() => {
            cbEachLimit();
          })
          .catch(err => {
            console.error(err);
            cbEachLimit();
          });
      }, cb);
    },
  ], err => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        status: 'error',
        error: err
      });
    }
    res.status(200).json({ status: 'ok' });
  });
};
export default utilController;
