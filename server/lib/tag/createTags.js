import _ from 'lodash';

import db from './../../models';

const createTags = (tags, userId) => {
  return new Promise((resolve, reject) => {
    const foundTagsArray = [];
    const notFoundTagsArray = [];
    db.Tag.findAll({
      where: {
        $or: tags,
      },
    }).then((foundTags) => {
      tags.forEach((tag) => {
        const matchedFoundTag = _.find(foundTags, { name: tag.name });

        if (matchedFoundTag) {
          foundTagsArray.push({
            id: matchedFoundTag.id,
            name: matchedFoundTag.name,
          });
        } else {
          notFoundTagsArray.push(tag);
        }
      });
      if (notFoundTagsArray.length > 0) {
        db.Tag.bulkCreate(
          notFoundTagsArray.map((tag) => {
            return ({ ...tag, userId });
          }),
          {
            returning: true,
          },
        ).then((result) => {
          result.forEach((createdTag) => {
            foundTagsArray.push({
              id: createdTag.id,
              name: createdTag.name,
            });
          });

          resolve(foundTagsArray);
        }).catch(err => reject(err));
      } else {
        resolve(foundTagsArray);
      }
    }).catch(err => reject(err));
  });
};

export default createTags;
