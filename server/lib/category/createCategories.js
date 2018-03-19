import _ from 'lodash';

import db from './../../models';

const createCategories = (categories, channelId) => {
  const channelCats = _.map(categories, id => ({ channelId, categoryId: id }));
  return new Promise((resolve, reject) => {
    db.ChannelCategory.bulkCreate(channelCats)
    .then(() => resolve())
    .catch(err => reject(err));
  });
};

export default createCategories;
