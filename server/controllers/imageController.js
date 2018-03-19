import AWS from 'aws-sdk';
import _ from 'lodash';

import db from '../models';
import { videoIndex, channelIndex } from './../config/algolia';

const imageController = {};

imageController.upload = (req, res) => {
  const { id } = req.user;
  if (id) {
    if (req.body.videoHash) {
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
              console.log(err2);
              return res.status(500).json({ Err: err });
            }
          }).send(() => {
            const thumbnailPath = `${process.env.AWS_VIDEO_CDN}/${Key}`;
            // UPDATE SEARCH INDEX WITH THUMBNAIL PATH
            if (searchId) {
              videoIndex.partialUpdateObject({
                thumbnailPath,
                objectID: searchId,
              }, (error, videoContent) => {
                if (error) {
                  console.error(error);
                } else {
                  console.log('Video thumbnail is updated');
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
      console.log('uploading avatar');
      const { searchId } = req.body;
      const Key = `user_${id}/${req.file.originalname.replace(/[^\w.]/g, '')}`;
      const params = { Bucket: process.env.AWS_AVATAR_BUCKET, Key };
      const s3 = new AWS.S3({ params });

      s3.listObjectsV2({ Bucket: params.Bucket, Prefix: `user_${id}` }, (err, data) => {
        const objList = _.map(data.Contents, obj => ({ Key: obj.Key }));
        s3.deleteObjects({
          Bucket: process.env.AWS_AVATAR_BUCKET,
          Delete: {
            Objects: objList,
            Quiet: true,
          },
        }, () => {
          s3.upload({ Body: req.file.buffer }, (err3) => {
            if (err3) {
              console.log(err3);
              return res.status(500).json({ Err: err3 });
            }
          }).send(() => {
            // UPDATE THE CHANNEL AVATAR URL IN SEARCH INDEX
            if (searchId) {
              channelIndex.partialUpdateObject({
                avatarUrl: `${process.env.AWS_AVATAR_CDN}/${Key}`,
                objectID: searchId,
              }, (error) => {
                if (error) {
                  console.error(err);
                } else {
                  console.log('Channel Avatar Path Updated');
                  channelIndex.getObject(searchId, (error2, channelContent) => {
                    if (error2) {
                      console.error(error2);
                    }
                    if (channelContent.videos) {
                      const channelVideos = _.map(channelContent.videos, (vidId) => {
                        return {
                          channelAvatar: `${process.env.AWS_AVATAR_CDN}/${Key}`,
                          objectID: vidId,
                        };
                      });
                      videoIndex.partialUpdateObjects(channelVideos, (err3) => {
                        if (err3) {
                          console.error(err3);
                        } else {
                          console.log('Channel info on videos are updated');
                        }
                      });
                    }
                  });
                }
              });
            }

            db.User.update({
              avatarPath: `${process.env.AWS_AVATAR_CDN}/${Key}`,
            }, {
              where: {
                id,
              },
            }).then(() => res.status(200).json({ avatarPath: `${process.env.AWS_AVATAR_CDN}/${Key}` }));
          });
        });
      });
    }
  } else {
    return res.status(500).json({ message: 'no user found' });
  }
};

export default imageController;
