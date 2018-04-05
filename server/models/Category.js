import db from './../models';
import updateCategories from './../lib/category/updateCategories';

export default (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  });
  return Category;
};

exports.getAll = () => {
  return new Promise((resolve, reject) => {
    db.Category.findAll({ attributes: ['id', 'name'] })
      .then(resolve)
      .catch(reject);
  });
};

exports.getCategory = (channelid) => {
  const { channelId } = channelid;
  return new Promise((resolve, reject) => {
    db.ChannelCategory.findAll({
      where: { channelId },
      attributes: ['categoryId'],
    })
      .then(resolve)
      .catch(reject);
  });
};

exports.update = (categories, channelId) => {
  return new Promise((resolve, reject) => {
    updateCategories(categories, channelId)
      .then(() => {
        resolve({ msg: 'success' });
      })
      .catch(reject);
  });
};
