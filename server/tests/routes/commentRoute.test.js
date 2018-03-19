import DUMMY_DATA from './../testData';
import login from './../login';
import db from './../../models';

const request = require('supertest');

const rq = request('http://localhost:1337');
const User = DUMMY_DATA.User;
const UserTwo = DUMMY_DATA.UserTwo;
const URL = 'http://localhost:1337';

let userId;
let videoId;
let comment;
let commentId;

describe('Comment Route', () => {
  beforeAll(() => {
    return db.User.create(User)
      .then((user) => {
        userId = user.id;
        const Video = DUMMY_DATA.Video(userId);
        return db.Video.create(Video);
      }).then((video) => { videoId = video.id; });
  });

  afterAll(() => {
    return db.User.destroy({ where: {} })
      .then(() => db.Video.destroy({ where: {} }));
  });

  afterEach(() => {
    return db.Comment.destroy({ where: {} });
  });

  describe('/api/video/:videoId/comment', () => {
    describe('GET', () => {
      beforeEach(() => {
        comment = DUMMY_DATA.Comment(videoId, userId);
        return db.Comment.create(comment);
      });

      it('should get all the comments for the video', (done) => {
        rq.get(`/api/video/${videoId}/comment?offset=0&more=false`)
          .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(typeof response.body.comments).toBe('object');
            expect(response.body.comments[0].comment).toBe(comment.comment);
            done();
          });
      });

      it('should get user comments first if they logged in', (done) => {
        db.User.create(UserTwo)
          .then((user) => {
            comment = DUMMY_DATA.Comment(videoId, user.id);
            db.Comment.create(comment);
          });

        const agent = request.agent(URL);

        login(agent, User)
          .then(() => {
            agent.get(`/api/video/${videoId}/comment?offset=0&more=true`)
            .then((response) => {
              expect(response.statusCode).toBe(200);
              expect(response.body.success).toBe(true);
              expect(response.body.comments[0].User.username).toBe(User.username);
              expect(response.body.comments[1].User.username).toBe(UserTwo.username);
              done();
            });
          });
      });
    });

    describe('POST', () => {
      it('shouldn\'t add comment if user is not logged in', (done) => {
        comment = {
          comment: 'Testing Comment',
        };
        rq.post(`/api/video/${videoId}/comment`)
          .send(comment)
          .then((response) => {
            expect(response.statusCode).toBe(401);
            expect(response.body.login).toBe(false);
            done();
          });
      });

      it('should add comment to the video\'s comments', (done) => {
        const agent = request.agent(URL);
        comment = {
          comment: 'Testing Comment',
        };

        login(agent, User)
          .then(() => {
            agent.post(`/api/video/${videoId}/comment`)
              .send(comment)
              .then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body.comment.comment).toBe(comment.comment);
                expect(response.body.user).toBe(User.username);
                expect(response.body.success).toBe(true);
                done();
              });
          });
      });
    });

    describe('PUT', () => {
      beforeEach(() => {
        comment = DUMMY_DATA.Comment(videoId, userId);
        comment.User = {
          username: User.username,
        };
        comment.comment = 'Edit Test Comment';
        return db.Comment.create(comment)
          .then((com) => { commentId = com.id; });
      });

      it('shouldn\'t edit comment if user is not logged in', (done) => {
        rq.put(`/api/video/${videoId}/comment`)
          .send({
            comment,
            id: commentId,
          }).then((response) => {
            expect(response.statusCode).toBe(401);
            expect(response.body.login).toBe(false);
            done();
          });
      });

      it('shouldn\'t edit comment if user is not the owner', (done) => {
        const agent = request.agent(URL);

        login(agent, UserTwo)
          .then(() => {
            agent.put(`/api/video/${videoId}/comment`)
              .send({
                comment,
                id: commentId,
              }).then((response) => {
                expect(response.statusCode).toBe(401);
                expect(response.body.owner).toBe(false);
                done();
              });
          });
      });

      it('should edit the existing comment', (done) => {
        const agent = request.agent(URL);

        login(agent, User)
          .then(() => {
            agent.put(`/api/video/${videoId}/comment`)
              .send({
                comment,
                id: commentId,
              }).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
                done();
              });
          });
      });
    });

    describe('DELETE', () => {
      beforeEach(() => {
        comment = DUMMY_DATA.Comment(videoId, userId);
        comment.User = {
          username: User.username,
        };
        return db.Comment.create(comment)
          .then((com) => { commentId = com.id; });
      });

      it('shouldn\'t delete comment if user is not logged in', (done) => {
        rq.delete(`/api/video/${videoId}/comment`)
          .send({
            comment,
            owner: false,
          }).then((response) => {
            expect(response.statusCode).toBe(401);
            expect(response.body.login).toBe(false);
            done();
          });
      });

      it('shouldn\'t delete comment if user is not the owner of the comment or video', (done) => {
        const agent = request.agent(URL);

        login(agent, UserTwo)
          .then(() => {
            agent.delete(`/api/video/${videoId}/comment`)
              .send({
                comment,
                owner: false,
              }).then((response) => {
                expect(response.statusCode).toBe(401);
                expect(response.body.owner).toBe(false);
                done();
              });
          });
      });

      it('should delete the comment if you are the video owner', (done) => {
        const agent = request.agent(URL);

        login(agent, UserTwo)
          .then(() => {
            agent.delete(`/api/video/${videoId}/comment`)
              .send({
                comment,
                owner: true,
              }).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
                done();
              });
          });
      });

      it('should delete the comment from the video\'s comments', (done) => {
        const agent = request.agent(URL);

        login(agent, User)
          .then(() => {
            agent.delete(`/api/video/${videoId}/comment`)
              .send({
                comment,
                owner: false,
              }).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
                done();
              });
          });
      });
    });
  });

  describe('/api/video/:videoId/comment/:parentCommentId', () => {
    beforeEach(() => {
      comment = DUMMY_DATA.Comment(videoId, userId);
      return db.Comment.create(comment)
        .then((com) => {
          commentId = com.id;
          const subcomment = {
            comment: 'Test Subcomment',
            videoId,
            userId,
            parentCommentId: com.id,
          };
          db.Comment.create(subcomment);
        });
    });

    describe('GET', () => {
      it('should return parent comment\'s subcomments', (done) => {
        rq.get(`/api/video/${videoId}/comment/${commentId}`)
          .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.comments[0].comment).toBe('Test Subcomment');
            done();
          });
      });
    });
  });
});
