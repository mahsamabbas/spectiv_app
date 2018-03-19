import db from './../models';

const commentController = {};

commentController.getComments = (req, res) => {
  let { offset, more } = req.query;
  offset = parseInt(offset, 10);
  more = (more === 'true');
  if (req.user && more) {
    const { id } = req.user;
    const { videoId } = req.params;

    db.Comment.findAll({
      where: {
        videoId,
        parentCommentId: null,
        userId: id,
      },
      order: [
        ['createdAt', 'DESC'],
      ],
      offset,
      limit: 20,
      include: [
        {
          model: db.User,
          attributes: ['id', 'username'],
        },
        {
          model: db.Comment,
          as: 'ParentComment',
          attributes: ['id'],
        },
      ],
    }).then((userComments) => {
      const limit = 20 - userComments.length;
      if (limit <= 0) {
        return res.status(200).json({
          comments: userComments,
          limit: 20,
          more: true,
        });
      }

      offset = 0;
      db.Comment.findAll({
        where: {
          videoId,
          parentCommentId: null,
          userId: {
            $ne: id,
          },
        },
        order: [
          ['createdAt', 'ASC'],
        ],
        limit,
        offset,
        include: [
          {
            model: db.User,
            attributes: ['id', 'username'],
          },
          {
            model: db.Comment,
            as: 'ParentComment',
            attributes: ['id'],
          },
        ],
      }).then((otherComments) => {
        const comments = userComments.concat(otherComments);
        return res.status(200).json({
          comments,
          limit: otherComments.length,
          more: false,
        });
      });
    }).catch((err) => {
      console.log(err);
      return res.status(500).json({
        err,
      });
    });
  } else {
    const { videoId } = req.params;
    const id = req.user ? req.user.id : 0;
    db.Comment.findAll({
      where: {
        videoId,
        parentCommentId: null,
        userId: {
          $ne: id,
        },
      },
      offset,
      limit: 20,
      order: [
        ['createdAt', 'ASC'],
      ],
      include: [
        {
          model: db.User,
          attributes: ['id', 'username'],
        },
        {
          model: db.Comment,
          as: 'ParentComment',
          attributes: ['id'],
        },
      ],
    }).then((comments) => {
      return res.status(200).json({
        comments,
        success: true,
        limit: comments.length + offset,
        more: false,
      });
    }).catch((err) => {
      return res.status(500).json({
        err,
      });
    });
  }
};

commentController.getSubComments = (req, res) => {
  const { videoId, parentCommentId } = req.params;

  db.Comment.findAll({
    where: {
      videoId,
      parentCommentId,
    },
    order: [
      ['createdAt', 'ASC'],
    ],
    include: [
      {
        model: db.User,
        attributes: ['id', 'username'],
      },
      {
        model: db.Comment,
        as: 'ReplyComment',
        attributes: ['id', 'comment'],
        include: [
          {
            model: db.User,
            attributes: ['id', 'username'],
          },
        ],
      },
    ],
  }).then((comments) => {
    res.status(200).json({
      comments,
      success: true,
    });
  }).catch((err) => {
    console.error(err);
    res.status(500).json({
      err,
    });
  });
};

commentController.createComment = (req, res) => {
  const { comment, parentId, replyId } = req.body;
  const { videoId } = req.params;

  if (req.user) {
    const { id } = req.user;
    db.Comment.create({
      userId: id,
      videoId,
      comment,
      parentCommentId: parentId,
      replyCommentId: replyId,
    }).then((comm) => {
      res.status(200).json({
        comment: comm,
        user: req.user.username,
        success: true,
      });
    }).catch((err) => {
      console.error(err);
      res.status(500).json({
        err,
      });
    });
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
      db.Comment.update({
        comment: comment.comment,
        isEdited: true,
      }, {
        where: {
          id,
        },
      }).then((newComment) => {
        res.status(200).json({
          comment: newComment,
          success: true,
        });
      }).catch((err) => {
        console.error(err);
        res.status(500).json({
          err,
          success: false,
        });
      });
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
      db.Comment.destroy({
        where: {
          id: comment.id,
        },
      }).then(() => {
        res.status(200).json({
          success: true,
        });
      }).catch((err) => {
        res.status(500).json({
          err,
        });
      });
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
