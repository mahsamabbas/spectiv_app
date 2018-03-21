import _ from 'lodash';
import db from './../models';
import updateCategories from './../lib/category/updateCategories';
const categoryModel = require('./../models/Category');

const categoryController = {};

categoryController.get = (req, res) => {
  categoryModel.get()
  .then(function(data){
    res.status(200).json(data);
  }).catch(function(err){
    res.status(500).json(err)
  })

};

categoryController.getCurrent = (req, res) => {
  categoryModel.getCurrent(req.params)
  .then(function(data){
    res.status(200).json(_.map(data, obj => obj.categoryId));
  })
  .catch(function(err){
    res.status(500).json(err);
  })
};

categoryController.update = (req, res) => {
categoryModel.update(req.body.categories, req.body.channelId)
.then(function(data){
  res.status(200).json(data);
}).catch(function(err){
  res.status(500).json(err);
})
};

export default categoryController;
