import DUMMY_DATA from './../testData';
import login from './../login';
import db from './../../models';

const request = require('supertest');

const rq = request('http://localhost:1337');
const User = DUMMY_DATA.User;
const URL = 'http://localhost:1337';

let userId;
let channelId;

describe('Subscription Route', () => {
  beforeAll(() => {
    return db.User.create(User)
      .then((user) => {
        userId = user.id;
        const channel = DUMMY_DATA.Channel(userId);
        return db.Channel.create(channel);
      }).then((channel) => { channelId = channel.id; });
  });

  afterAll(() => {
    return db.User.destroy({ where: {} })
      .then(() => db.Channel.destroy({ where: {} }));
  });

  afterEach(() => {
    return db.UserSubscription.destroy({ where: {} });
  });

  describe('/api/subscription', () => {
    describe('GET', () => {
      beforeEach(() => {
        return db.UserSubscription.create({
          userId,
          channelId,
        });
      });

      it('shouldn\'t get any subscription if user is not logged in', (done) => {
        rq.get('/api/subscription')
          .then((response) => {
            expect(response.statusCode).toBe(401);
            expect(response.body.login).toBe(false);
            done();
          });
      });

      it('should get all of user\'s subscriptions', (done) => {
        const agent = request.agent(URL);

        login(agent, User)
          .then(() => {
            agent.get('/api/subscription')
              .then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.subscriptions[0].Channel.name).toBe('Test Channel');
                done();
              });
          });
      });
    });

    describe('POST', () => {
      it('shouldn\'t add subscription if user is not logged in', (done) => {
        rq.post('/api/subscription')
          .send({
            channelId,
          }).then((response) => {
            expect(response.statusCode).toBe(401);
            expect(response.body.login).toBe(false);
            done();
          });
      });

      it('should add new subscription', (done) => {
        const agent = request.agent(URL);

        login(agent, User)
          .then(() => {
            agent.post('/api/subscription')
              .send({
                channelId,
              }).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
                expect(typeof response.body.userSub).toBe('object');
                done();
              });
          });
      });
    });

    describe('DELETE', () => {
      beforeEach(() => {
        return db.UserSubscription.create({
          userId,
          channelId,
        });
      });

      it('shouldn\'t delete subscription if user is not logged in', (done) => {
        rq.delete('/api/subscription')
          .send({
            channelId,
          }).then((response) => {
            expect(response.statusCode).toBe(401);
            expect(response.body.login).toBe(false);
            done();
          });
      });

      it('should delete the subscription', (done) => {
        const agent = request.agent(URL);

        login(agent, User)
          .then(() => {
            agent.delete('/api/subscription')
              .send({
                channelId,
              }).then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
                done();
              });
          });
      });
    });
  });
});
