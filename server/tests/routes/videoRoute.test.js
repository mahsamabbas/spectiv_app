import DUMMY_DATA from './../testData';
import login from './../login';
import db from './../../models';

const request = require('supertest');

const rq = request('http://localhost:1337');
const User = DUMMY_DATA.User;
const URL = 'http://localhost:1337';

let userId;
let videoId;
let Video;

describe('Video Route', () => {
  beforeAll(() => {
    return db.User.create(User)
      .then((user) => { userId = user.id; });
  });

  afterAll(() => {
    return db.User.destroy({ where: {} })
      .then(() => db.Channel.destroy({ where: {} }));
  });

  afterEach(() => {
    return db.Video.destroy({ where: {} })
      .then(() => db.VideoTag.destroy({ where: {} }))
      .then(() => db.Tag.destroy({ where: {} }));
  });

  describe('/api/video', () => {
    describe('POST', () => {
      it('shouldn\'t create a video if user is not logged in', (done) => {
        rq.post('/api/video')
          .send({
            title: 'Test Video',
            desc: 'Test Desc',
          }).then((response) => {
            expect(response.statusCode).toBe(401);
            done();
          });
      });

      it('should create a new video', (done) => {
        const agent = request.agent(URL);

        login(agent, User)
          .then(() => {
            agent.post('/api/video')
              .send({
                title: 'Test Video',
                desc: 'Test Desc',
                tags: [{ name: 'test' }, { name: 'tag' }],
              }).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body.createdVideo.title).toBe('Test Video');
                expect(response.body.createdVideo.desc).toBe('Test Desc');
                done();
              });
          });
      });
    });

    describe('PATCH', () => {
      beforeEach(() => {
        Video = DUMMY_DATA.Video(userId);
        return db.Video.create(Video)
          .then((video) => { videoId = video.id; });
      });

      it('shouldn\'t update the video information if user is not logged in', (done) => {
        rq.patch('/api/video')
          .send({
            videoId,
            title: 'Edit Title',
            desc: 'Edit Desc',
            canComment: false,
            canLike: true,
            accessibility: 1,
          }).then((response) => {
            expect(response.statusCode).toBe(401);
            done();
          });
      });

      it('should update the video with new information', (done) => {
        const agent = request.agent(URL);

        login(agent, User)
          .then(() => {
            agent.patch('/api/video')
              .send({
                videoId,
                title: 'Edit Title',
                desc: 'Edit Desc',
                canComment: false,
                canLike: true,
                accessibility: 1,
                tags: [{ name: 'test' }, { name: 'tag' }],
              }).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body.video[1].title).toBe('Edit Title');
                expect(response.body.video[1].desc).toBe('Edit Desc');
                expect(response.body.video[1].canComment).toBe(false);
                done();
              });
          });
      });
    });
  });

  describe('/api/video/:videoId', () => {
    beforeEach(() => {
      Video = DUMMY_DATA.Video(userId);
      return db.Video.create(Video)
        .then((video) => { videoId = video.id; });
    });

    describe('GET', () => {
      it('should get the video\'s information', (done) => {
        rq.get(`/api/video/${videoId}`)
          .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.body.video.title).toBe(Video.title);
            expect(response.body.video.desc).toBe(Video.desc);
            done();
          });
      });
    });
  });

  describe('/api/edit/video/:videoId', () => {
    beforeEach(() => {
      Video = DUMMY_DATA.Video(userId);
      return db.Video.create(Video)
        .then((video) => { videoId = video.id; });
    });

    describe('GET', () => {
      it('shouldn\'t get the video information if user is not logged in', (done) => {
        rq.get(`/api/edit/video/${videoId}`)
          .then((response) => {
            expect(response.statusCode).toBe(401);
            done();
          });
      });

      it('should get the video\'s information to edit', (done) => {
        const agent = request.agent(URL);
        const channel = DUMMY_DATA.Channel(userId);
        db.Channel.create(channel);

        login(agent, User)
          .then(() => {
            agent.get(`/api/edit/video/${videoId}`)
              .then((response) => {
                console.log(response.statusCode);
                done();
              });
          });
      });
    });
  });

  describe('/api/my-videos', () => {
    beforeEach(() => {
      Video = DUMMY_DATA.Video(userId);
      return db.Video.create(Video)
        .then((video) => { videoId = video.id; });
    });

    describe('GET', () => {
      it('shouldn\'t get any videos if user is not logged in', (done) => {
        rq.get('/api/my-videos')
          .then((response) => {
            expect(response.statusCode).toBe(401);
            done();
          });
      });

      it('should get all of user\'s videos', (done) => {
        const agent = request.agent(URL);

        login(agent, User)
          .then(() => {
            agent.get('/api/my-videos')
              .then((response) => {
                expect(response.statusCode).toBe(200);
                done();
              });
          });
      });
    });
  });

  describe('/api/tags', () => {
    beforeEach(() => {
      return db.Tag.create({ name: 'TestTag' });
    });

    describe('GET', () => {
      it('should get all the tags', (done) => {
        rq.get('/api/tags')
          .then((response) => {
            expect(response.body.tags[0].name).toBe('TestTag');
            expect(response.statusCode).toBe(200);
            done();
          });
      });
    });
  });
});
