import _ from 'lodash';
import db from './../models';
import updateCategories from './../lib/category/updateCategories';
const logging = require('./../config/logging');
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

exports.getAll = function(){
  return new Promise(function(resolve, reject){
    db.Category.findAll({ attributes: ['id', 'name'] })
    .then(function(data){
      resolve(data);
    }).catch(function(err){
      reject(err);
    })
  });
}

exports.getCategory = function(channelid){
  const { channelId } = channelid;
  return new Promise(function(resolve, reject){
    db.ChannelCategory.findAll({
      where: { channelId },
      attributes: ['categoryId'],
    }).then(function(data){
      resolve(data);
    }).catch(function(err){
      reject(err);
    })
  });
}

exports.update = function(categories, channelId){

  return new Promise(function(resolve, reject){
    updateCategories(categories, channelId)
    .then(function(){
      resolve({ msg: 'success' });
      logging.saveInfoLog("Categories updated for the channel: "+channelId);
    }).catch(function(err){
      reject(err);
    })
  });
  // updateCategories(req.body.categories, req.body.channelId)
  // .then(() => res.status(200).json({ msg: 'success' }))
  // .catch(err => res.status(500).json(err));
}
