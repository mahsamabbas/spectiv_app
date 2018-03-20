import createCategories from "./../lib/category/createCategories";
import { channelIndex, videoIndex } from "./../config/algolia";
const channelModel = require('./../models/Channel');

const channelController = {};

channelController.getChannel = (req, res) => {
  channelModel.getChannel(req.user,res);
};

channelController.myChannel = (req, res) => {

  if (!req.user) {
    return res.status(401).json({
      message: "Channel Not Found"
    });
  }

  channelModel.myChannel(req.user)
    .then(function (result) {
        res.status(200).json(result);
      }
    )
    .catch(function (error) {
        console.log("in catch");
        res.send(error);
      }
    );
};

channelController.createChannel = (req, res) => {
  channelModel.createChannel(req.user,req.body,res);
};

channelController.updateChannel = (req, res) => {
  channelModel.updateChannel(req.body,res);
};

 channelController.getAllFeatured = (req, res) => {
  channelModel.getAllFeatured()
  .then(function(channels){
    res.status(200).json({
      channels
    });
  })
  .catch(function(err){
    res.status(500).json({
      err
    });
  });
 };

export default channelController;
