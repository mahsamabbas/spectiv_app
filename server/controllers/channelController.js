import createCategories from "./../lib/category/createCategories";
import { channelIndex, videoIndex } from "./../config/algolia";
const channelModel = require('./../models/Channel');

const channelController = {};

channelController.getChannel = (req, res) => {
  channelModel.getChannel(req,res);
};

channelController.myChannel = (req, res) => {
  channelModel.myChannel(req, res);
};

channelController.createChannel = (req, res) => {
  channelModel.createChannel(req,res);
};

channelController.updateChannel = (req, res) => {
  channelModel.updateChannel(req,res);
};

 channelController.getAllFeatured = (req, res) => {
  channelModel.getAllFeatured(req,res);
 };

export default channelController;
