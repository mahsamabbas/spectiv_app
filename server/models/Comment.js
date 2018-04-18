import db from './../models';

export default (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    comment: DataTypes.STRING,
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return Comment;
};

exports.getComments = (offset, more, videoId, user, req) => {
 
  return new Promise((resolve, reject) => {

    if (user && more) {
      const { id } = user;

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
          resolve({ comments: userComments, limit: 20, more: true });
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
          resolve({
            comments,
            limit: otherComments.length,
            more: false,
          });
        })
      }).catch((err) => {
        reject({ err });
      })
    } else {
      const id = user ? user.id : 0;
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
        resolve({
          comments,
          success: true,
          limit: comments.length + offset,
          more: false,
        });
      }).catch((err) => {
        reject({err});
      });
    }
  })
}

exports.getSubComments = (videoId, parentCommentId) => {

  return new Promise((resolve, reject) => {
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
      resolve({comments, success: true,});
    }).catch((err) => {
      reject({err});
    })
  })
}

exports.createComment = (comment, parentId, replyId, videoId, userId, userName) => {
  return new Promise((resolve, reject) => {
    db.Comment.create({
      userId: userId,
      videoId,
      comment,
      parentCommentId: parentId,
      replyCommentId: replyId,
    }).then((comm) => {
      resolve({comment: comm, user: userName, success: true,});
    }).catch((err) => {
      reject({err});
    })
  })
}

exports.editComment = (comment, id) => {
  return new Promise((resolve, reject) => {
    db.Comment.update({
      comment: comment.comment,
      isEdited: true,
    }, {
        where: {
          id,
        },
      }).then((newComment) => {
          resolve({comment: newComment,success: true,})
      }).catch((err) => {
          reject({err, success:false,});
      })
  })
}

exports.deleteComment = (commentId) => {
  return new Promise((resolve, reject) => {
    db.Comment.destroy({
      where: {
        id: commentId,
      },
    }).then(() => {
      resolve({success: true,});
    }).catch((err) => {
      reject({err,});
    });
  })
}
