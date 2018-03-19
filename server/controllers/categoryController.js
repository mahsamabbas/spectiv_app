import _ from 'lodash';
import db from './../models';
import updateCategories from './../lib/category/updateCategories';

const categoryController = {};

categoryController.get = (req, res) => {
  db.Category.findAll({ attributes: ['id', 'name'] })
  .then(data => res.status(200).json(data))
  .catch(err => res.status(500).json(err));
};

categoryController.getCurrent = (req, res) => {
  const { channelId } = req.params;
  db.ChannelCategory.findAll({
    where: { channelId },
    attributes: ['categoryId'],
  })
  .then((data) => {
    res.status(200).json(_.map(data, obj => obj.categoryId));
  })
  .catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
};

categoryController.update = (req, res) => {
  updateCategories(req.body.categories, req.body.channelId)
  .then(() => res.status(200).json({ msg: 'success' }))
  .catch(err => res.status(500).json(err));
};

export default categoryController;
