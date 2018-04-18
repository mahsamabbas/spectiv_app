import db from './../models';
const rateModel = require('./../models/RateVideo');

const rateController = {};

rateController.getRates = (req, res) => {
  const { videoId } = req.params;
  const id = req.user ? req.user.id : null;

  db.RateVideo.getForVideo(videoId, id)
    .then(rateData => {
      rateData.success = true;
      res.status(200).json(rateData);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ err });
    });
};

rateController.rateVideo = (req, res) => {
  const { videoId } = req.params;
  const { isLiked } = req.body;
  const { id } = req.user;

  if (!req.user) {
    return res.status(401).json({
      login: false,
    });
  }

  db.RateVideo.rateVideo(videoId, isLiked, id)
  .then((data) => {
    res.status(200).json(data);
  }).catch((err) => {
    console.log("in err");
    res.status(500).json(err);
  })
  // db.RateVideo.findOrCreate({
  //   where: {
  //     videoId,
  //     userId: id,
  //   },
  //   defaults: {
  //     videoId,
  //     userId: id,
  //     isLiked,
  //   },
  // }).then((rate) => {
  //   rate = rate[0];
  //   const rateMethod = isLiked ? rate.like.bind(rate) : rate.dislike.bind(rate);
  //   rateMethod()
  //     .then(() => {
  //       return res.status(200).json({
  //         success: true,
  //       });
  //     })
  //     .catch(err => {
  //       console.error(err);
  //       return res.status(500).json({
  //         err
  //       });
  //     });
  // });
};

rateController.destroyRate = (req, res) => {
  const { videoId } = req.params;
  const { isLiked, searchId } = req.body;

  if (!req.user) {
    return res.status(401).json({
      login: false,
    });
  }

  const userId = req.user.id;
  db.RateVideo.destroyRate(videoId, userId, searchId, isLiked)
    .then(() => {
      return res.status(200)
        .json({
          success: true
        });
    })
    .catch(err => {
      console.log(err);
      return res.status(500)
        .json({
          err
        });
    });
};

export default rateController;
