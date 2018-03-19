import db from './../../models';
import createCategories from './createCategories';

const updateCategories = (categories, channelId) => {
  return new Promise((resolve, reject) => {
    db.ChannelCategory.destroy({ where: { channelId } })
    .then(() => {
      createCategories(categories, channelId)
      .then(() => resolve())
      .catch(err => reject(err));
    })
    .catch(err => reject(err));
  });
};

export default updateCategories;
