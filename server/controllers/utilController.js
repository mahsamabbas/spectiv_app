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

const handleUploadToSizeDirs = (userId, avatarUrlFromDb, localPath) => {
  return new Promise((resolve, reject) => {
    const bucketName = process.env.AWS_AVATAR_BUCKET;
    const baseDir = `user_${userId}`;
    const baseName = path.basename(avatarUrlFromDb);

    const sizeDirs = ['xs', 'sm', 'md', 'lg', 'xl'];

    async.eachLimit(sizeDirs, 4, (sizeDir, cbEachLimit) => {
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

const handleUpdate = (userId, avatarUrlFromDb) => {
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
            handleUploadToSizeDirs(userId, avatarUrlFromDb, localOriginalPath)
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
        handleUpdate(user.id, user.avatarPath)
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
