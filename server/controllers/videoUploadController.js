import async from 'async';
import AWS from 'aws-sdk';
import formidable from 'formidable';
import Pusher from 'pusher';
import md5 from 'js-md5';
import _ from 'lodash';
import fs from 'fs';
import transcoder from '../lib/helpers/transcoder';
import db from '../models';
import { videoIndex, channelIndex } from './../config/algolia';

const videoModel = require('./../models/Video');

const pusher = new Pusher({
  appId: '401028',
  key: '484bec97617b22d89c5b',
  secret: 'f62ffaf346ecc53f3591',
  cluster: 'us2',
  encrypted: true,
});

const videoUploadController = {};

const crashReport = (res, userId, videoId, videoHash, searchId) => {
  async.parallel([
    cb => {
      pusher.trigger('videos', `upload-crashed-${userId}`, {});
      cb();
    },
    cb => {
      // TODO - move to User model
      db.User.update({
        isUploading: false,
      }, {
        where: { id: userId, }
      })
      .then(cb)
      .catch((userErr) => {
        cb('ERROR updating user "isUploading" to false: ', userErr);
      });
    },
    cb => {
      if (!videoId) {
        return cb();
      }

      videoModel.markDeleted(videoId)
        .then(() => {
          cb();
        }).catch((userErr) => {
          cb(`ERROR destroying video id: ${videoId}: `, userErr);
        });
    },
    cb => {
      if (!videoId || !videoHash) {
        return cb();
      }
      const params = { Bucket: process.env.AWS_VIDEO_BUCKET, Prefix: `user_${userId}/${videoHash}` };
      const s3 = new AWS.S3();
      // TODO - move to Video model
      // TODO - use async.serial
      s3.listObjectsV2(params, (err, data) => {
        const objList = _.map(data.Contents, obj => ({ Key: obj.Key }));
        s3.deleteObjects({
          Bucket: process.env.AWS_VIDEO_BUCKET,
          Delete: {
            Objects: objList,
            Quiet: true,
          },
        }, (err2) => {
          if (err2) {
            return cb('file not found: ', err);
          }
          cb();
        });
      });
    },
    cb => {
      videoModel.updateVideoDelete(videoId)
        .then(() => {
          cb();
        })
        .catch(cb);
    },
    cb => {
      if (!searchId || process.env.NODE_ENV !== 'production') {
        return cb();
      }
      // DELETE THE VIDEO FROM SEARCH INDEX
      videoIndex.deleteObject(searchId, cb);
    }
  ], err => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        error: 'An error occurred. Video not properly deleted.'
      });
    }
    return res.status(200).json({
      status: 'ok'
    });
  });
};

videoUploadController.delete = (req, res) => {
  if (req.user.isApproved) {
    const { folderName, videoId } = req.params;
    const { searchId } = req.body;
    const params = { Bucket: process.env.AWS_VIDEO_BUCKET, Prefix: `user_${req.user.id}/${folderName}` };
    const s3 = new AWS.S3();

    let objList;

    async.series([
      cb => {
        s3.listObjectsV2(params, (err, data) => {
          if (err) {
            return cb(err);
          }
          objList = _.map(data.Contents, obj => ({ Key: obj.Key }));
          cb();
        });
      },
      cb => {
        if (!objList || objList.length === 0) {
          return cb();
        }
        s3.deleteObjects({
          Bucket: process.env.AWS_VIDEO_BUCKET,
          Delete: {
            Objects: objList,
            Quiet: true,
          },
        }, (err) => {
          return cb(err);
        });
      },
      cb => {
        db.Video.update({ isDeleted: true }, { where: { id: videoId } })
          .then(() => {
            // DELETE THE VIDEO FROM SEARCH INDEX
            if (process.env.NODE_ENV === 'production') {
              videoIndex.deleteObject(searchId, error => {
                return cb(error);
              });
            } else {
              return cb();
            }
          })
          .catch(cb);
      }
    ], err => {
      if (err) return res.status(500).json({ message: err });
      res.status(200).json({ status: 'ok' });
    });
  } else {
    return res.status(403).json({ message: 'Not authorized to delete video' });
  }
};

videoUploadController.upload = (req, res) => {
  if (req.user.isApproved) {
    const form = new formidable.IncomingForm();

    form.parse(req, (formerr, fields, files) => {
      if (formerr) console.log(formerr);
      const file = files.video;
      const videoHash = md5(`${file.name}${Date.now()}`);
      const videoName = file.name.split('/').reverse()[0].split('.')[0].replace(/[^\w.]/g, '');
      const suffix = file.type.split('/')[1];
      const s3 = new AWS.S3({
        params: {
          Bucket: process.env.AWS_VIDEO_BUCKET
        }
      });

      videoModel.videoCreate(file.name, req.user.Channel.id, fields.videoDuration)
        .then((result) => {
          const videoId = result.id;

          pusher.trigger('videos', `videoHash-${req.user.id}`, videoHash);

          let searchId;
          // ADD NEW VIDEO TO THE SEARCH INDEX
          const videoObj = {
            id: videoId,
            title: file.name.split('/').reverse()[0].split('.')[0],
            views: 0,
            likes: 0,
            createdAt: Date.now(),
            duration: fields.videoDuration,
            channelName: fields.channelName,
            channelAvatar: fields.channelAvatar,
            channelUrl: fields.channelUrl,
            channelColor: fields.channelColor,
          };

          videoModel.setUploading(req.user.id, true)
            .then(() => {
              // ...
            }).catch((err) => {
              console.log('ERROR updating user "isUploading" to true: ', err);
              crashReport(res, req.user.id, videoId, videoHash, searchId);
            });

          if (process.env.NODE_ENV === 'production') {
            videoIndex.addObject(videoObj, (err, videoContent) => {
              if (err) {
                console.error(err);
                crashReport(res, req.user.id, videoId, videoHash, searchId);
                return res.status(500).json(err);
              }
              searchId = videoContent.objectID;
              result.updateAttributes({
                searchId,
              });
              console.log('Video was added to the index');
              res.status(200).json({
                videoId: result.id,
                searchId
              });
              channelIndex.partialUpdateObject({
                videos: {
                  value: searchId,
                  _operation: 'Add',
                },
                objectID: fields.channelSearchId,
              }, (err2) => {
                if (err2) {
                  console.error(err2);
                  crashReport(res, req.user.id, videoId, videoHash, searchId);
                }
                console.log('Video objectID was added to Channel index');
              });
            });
          }

          const s3Stream = require('s3-upload-stream')(new AWS.S3());
          const upload = s3Stream.upload({
            Bucket: process.env.AWS_VIDEO_BUCKET,
            Key: `user_${req.user.id}/${videoHash}/${videoName}.${suffix}`,
          });
          upload.maxPartSize(5000000);
          upload.concurrentParts(5);

          upload.on('error', (error) => {
            console.log(error);
            crashReport(res, req.user.id, videoId, videoHash, searchId);
          });

          upload.on('part', (details) => {
            console.log(details);
            pusher.trigger('videos', `upload-progress-${req.user.id}`, {
              loaded: details.uploadedSize,
              total: file.size,
              videoId
            });
          });

          upload.on('uploaded', (details) => {
            console.log('Video uploaded', details);

            videoModel.updateVideo(videoId, req.user.id, videoHash, videoName, suffix)
              .then(() => {

              }).catch((err5) => {
                console.log('FAILED updating video pathToOriginal in DB', err5);
                crashReport(res, req.user.id, videoId, videoHash, searchId);
              });

            transcoder(
              `user_${req.user.id}/${videoHash}`,
              videoName,
              suffix,
              req.user.id,
              fields.videoHeight,
              videoId,
            ).then((job) => {
              s3.listObjectsV2({
                Prefix: `user_${req.user.id}/${videoHash}/temp-thumbnails`
              },
              (err2, data2) => {
                // TODO - eliminate multi-line ternary
                const videopaths = job.Outputs.length > 1 ?
                {
                  pathTo1080p: `${process.env.AWS_VIDEO_CDN}/user_${req.user.id}/${videoHash}/${videoName}-master.m3u8`,
                  pathTo1440p: `${process.env.AWS_VIDEO_CDN}/user_${req.user.id}/${videoHash}/${job.Outputs[1].Key}`,
                } :
                {
                  pathTo1080p: `${process.env.AWS_VIDEO_CDN}/user_${req.user.id}/${videoHash}/${videoName}-master.m3u8`,
                };

                videoModel.findById(result.id)
                  .then((result2) => {
                    if (result2) {
                      const objList = _.map(data2.Contents, obj => ({
                        Key: obj.Key
                      }));
                      // IF USER ALREADY UPLOADED A THUMBNAIL
                      if (result2.dataValues.thumbnailPath.length) {
                        // DELETE THE AUTO GENERATED THUMBNAILS
                        s3.deleteObjects({
                          Delete: {
                            Objects: objList,
                            Quiet: true,
                          },
                        }, (err3) => {
                          if (err3) {
                            crashReport(res, req.user.id, videoId, videoHash, searchId);
                          }
                        });
                      } else {
                        // IF USER HAS NOT UPLOADED A THUMBNAIL, COPY THE MIDDLE THUMBNAIL
                        // TO /THUMBNAILS S3 STORAGE AND DELETE ALL /TMP-THUMBNAILS
                        const index = Math.round(data2.KeyCount / 2) - 1;
                        const oldKey = data2.Contents[index].Key;
                        const newKey = oldKey.replace(/temp-thumbnails/g, 'thumbnails');

                        videopaths.thumbnailPath = `${process.env.AWS_VIDEO_CDN}/${newKey}`;

                        if (process.env.NODE_ENV === 'production') {
                          videoIndex.partialUpdateObject({
                            thumbnailPath: `${process.env.AWS_VIDEO_CDN}/${newKey}`,
                            objectID: searchId,
                          }, (error) => {
                            if (error) {
                              console.error(error);
                            } else {
                              console.log('Video thumbnail is updated');
                            }
                          });
                        }

                        s3.copyObject({
                          CopySource: `${process.env.AWS_VIDEO_BUCKET}/${oldKey}`,
                          Key: newKey
                        },
                        (err4) => {
                          if (err4) return console.log('ERROR 4!!!!', err4.stack);
                          s3.deleteObjects({
                            Delete: {
                              Objects: objList,
                              Quiet: true,
                            },
                          }, (err3) => {
                            if (err3) {
                              crashReport(res, req.user.id, videoId, videoHash, searchId);
                            }
                          });
                        });
                      }
                      videoModel.updateVideoPath(videopaths, result2.id)
                        .then(() => console.log('Video path successfully updated'))
                        .catch((err3) => {
                          console.log('Video path update error', err3);
                          crashReport(res, req.user.id, videoId, videoHash, searchId);
                        });
                    } else {
                      console.error(`Can't find the video with id (${result.id}) in video table`);
                      crashReport(res, req.user.id, videoId, videoHash, searchId);
                    }
                    videoModel.setUploading(req.user.id, false)
                      .then(() => {

                      })
                      .catch((userErr) => {
                        console.log('ERROR updating user "isUploading" to false: ', userErr);
                        crashReport(res, req.user.id, videoId, videoHash, searchId);
                      });
                    pusher.trigger('videos', `upload-complete-${req.user.id}`, videoId);
                  });
              });
            }).catch((err2) => {
              console.log('Transcoder failed', err2);
              crashReport(res, req.user.id, videoId, videoHash, searchId);
            });
          });
          const read = fs.createReadStream(file.path, {
            highWaterMark: 65536
          }); // try 32768 131072
          read.pipe(upload);
        }).catch((err) => {
          console.log(err);
          crashReport(res, req.user.id);
          return res.status(500).json({
            message: `Failed to create Video record in DB: ${err}`
          });
        });
    });
  } else {
    console.log('FAILED!');
    crashReport(res, req.user.id);
    return res.status(500).json({ message: 'Not authorized to upload video' });
  }
};

videoUploadController.getVideoInfo = (req, res) => {
  videoModel.getVideoInfo(req.params)
    .then((result) => {
      res.status(200).json(result);
    }).catch((err) => {
      res.status(500).json(err);
    });
};

export default videoUploadController;
