import db from "./../models";
import createCategories from "./../lib/category/createCategories";
import { channelIndex, videoIndex } from "./../config/algolia";
const channelModel = require('./../models/Channel');

const channelController = {};

channelController.getChannel = (req, res) => {

  channelModel.getOneByUrl(req.user, req.params.channelURL)
  .then(function(data){
    return res.status(200).json(data);
  }).catch(function(err){
    if(err.message){
      return res.status(404).json(err);
    }else{
      return res.status(500).json(err);
    }
  })
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
  channelModel.createChannel(req.user,req.body)
  .then(function(result){
    res.status(200).json(result);
  })
  .catch(function(error){
    res.send(error);
  });
};

channelController.updateChannel = (req, res) => {
  channelModel.updateChannel(req.body)
  .then(function(result){
    res.status(200).json(result);
  }).catch(function(err){
    res.status(500).json({ err })
  });
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
