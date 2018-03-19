import _ from 'lodash';

import db from './../../models';
import createTags from './createTags';

const updateTags = (tags, userId, videoId) => {
  return new Promise((resolve, reject) => {
    db.VideoTag.destroy({ // Destroy all relationships
      where: { videoId },
    }).then(() => {
      createTags(tags, userId).then((newTags) => { // Create new relationships and tags
        resolve(newTags);
      }).catch((err) => {
        reject(err);
      });
    }).catch((err) => {
      reject(err);
    });
  });
};

export default updateTags;
