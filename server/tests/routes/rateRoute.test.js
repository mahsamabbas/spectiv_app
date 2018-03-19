import DUMMY_DATA from './../testData';
import login from './../login';
import db from './../../models';

const request = require('supertest');

const rq = request('http://localhost:1337');
const User = DUMMY_DATA.User;
const URL = 'http://localhost:1337';

let userId;
let videoId;
let rate;

describe('Rate Route', () => {
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
    return db.RateVideo.destroy({ where: {} });
  });

  describe('/api/video/:videoId/like', () => {
    describe('GET', () => {
      beforeEach(() => {
        rate = DUMMY_DATA.Rate(videoId, userId);
        return db.RateVideo.create(rate);
      });

      it('should get all of video\'s likes and total', (done) => {
        rq.get(`/api/video/${videoId}/like`)
          .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.totalCount).toBe(1);
            expect(response.body.likedCount).toBe(1);
            done();
          });
      });

      it('should get user\'s rating if they logged in', (done) => {
        const agent = request.agent(URL);

        login(agent, User)
          .then(() => {
            agent.get(`/api/video/${videoId}/like`)
              .then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.totalCount).toBe(1);
                expect(response.body.likedCount).toBe(1);
                expect(response.body.rate.isLiked).toBe(true);
                done();
              });
          });
      });
    });

    describe('POST', () => {
      it('shouldn\'t add to the video\'s rate if user is not logged in', (done) => {
        rq.post(`/api/video/${videoId}/like`)
          .send({
            isLiked: false,
          }).then((response) => {
            expect(response.statusCode).toBe(401);
            expect(response.body.login).toBe(false);
            done();
          });
      });

      it('should add to the video\'s rate if user is logged in', (done) => {
        const agent = request.agent(URL);

        login(agent, User)
          .then(() => {
            agent.post(`/api/video/${videoId}/like`)
              .send({
                isLiked: false,
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
        rate = DUMMY_DATA.Rate(videoId, userId);
        return db.RateVideo.create(rate);
      });

      it('shouldn\'t delete rate if user is not logged in', (done) => {
        rq.delete(`/api/video/${videoId}/like`)
          .then((response) => {
            expect(response.statusCode).toBe(401);
            expect(response.body.login).toBe(false);
            done();
          });
      });

      it('should delete user\'s rate from the video', (done) => {
        const agent = request.agent(URL);

        login(agent, User)
          .then(() => {
            agent.delete(`/api/video/${videoId}/like`)
              .then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
                done();
              });
          });
      });
    });
  });
});
