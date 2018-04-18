import db from './../models';
const commentModel = require('./../models/Comment');
const commentController = {};

commentController.getComments = (req, res) => {
  let { offset, more } = req.query;
  offset = parseInt(offset, 10);
  more = (more === 'true');
  const { videoId } = req.params;

  commentModel.getComments(offset, more, videoId, req.user ,req)
    .then((data) => {
      return res.status(200).json(data);
    }).catch((err) => {
      return res.status(500).json({
        err,
      });
    })
};

commentController.getSubComments = (req, res) => {
  const { videoId, parentCommentId } = req.params;

  commentModel.getSubComments(videoId, parentCommentId)
  .then((data) => {
    res.status(200).json(data);
  }).catch((err) => {
    res.status(500).json(err);
  })
};

commentController.createComment = (req, res) => {
  const { comment, parentId, replyId } = req.body;
  const { videoId } = req.params;

  if (req.user) {
    const { id } = req.user;

    commentModel.createComment(comment, parentId, replyId, videoId, id, req.user.username)
    .then((data) => {
      res.status(200).json(data);
    }).catch((err) => {
      res.status(500).json(err);
    })
  } else {
    res.status(401).json({
      login: false,
    });
  }
};

commentController.editComment = (req, res) => {
  const { comment, id } = req.body;

  if (req.user) {
    if (req.user.username === comment.User.username) {
      commentModel.editComment(comment, id)
      .then((data) => {
        res.status(200).json(data);
      }).catch((err) => {
        res.status(500).json(err);
      })
    } else {
      res.status(401).json({
        owner: false,
      });
    }
  } else {
    res.status(401).json({
      login: false,
    });
  }
};

commentController.deleteComment = (req, res) => {
  const { comment, owner } = req.body;

  if (req.user) {
    if (req.user.username === comment.User.username || owner) {
      commentModel.deleteComment(comment.id)
      .then((data) => {
        res.status(200).json(data);
      }).catch((err) => {
        res.status.json(err);
      })
    } else {
      res.status(401).json({
        owner: false,
      });
    }
  } else {
    res.status(401).json({
      login: false,
    });
  }
};

export default commentController;
