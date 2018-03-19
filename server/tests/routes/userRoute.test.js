import DUMMY_DATA from './../testData';
import login from './../login';
import db from './../../models';

const request = require('supertest');

const rq = request('http://localhost:1337');
const User = DUMMY_DATA.User;
const URL = 'http://localhost:1337';


describe('User Route', () => {
  afterEach(() => {
    // Delete the TestUser from the database
    return db.User.destroy({ where: {} });
  });

  describe('/api/sign-up', () => {
    describe('POST', () => {
      it('should create new user', (done) => {
        rq.post('/api/sign-up')
          .send(User)
          .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            done();
          });
      });

      it('shouldn\'t create user without username or password', (done) => {
        rq.post('/api/sign-up')
          .send({
            username: 'TestUser',
            email: 'Testing@gmail.com',
          }).then((response) => {
            expect(response.statusCode).toBe(500);
            done();
          });
      });

      it('shouldn\'t create user with existing username', (done) => {
        rq.post('/api/sign-up')
          .send(User)
          .then(() => {
            rq.post('/api/sign-up')
              .send(User)
              .then((response) => {
                expect(response.statusCode).toBe(500);
                done();
              });
          });
      });
    });
  });

  describe('/authenticate', () => {
    beforeEach(() => {
      // Put the test user into the database
      return db.User.create(User);
    });

    describe('POST', () => {
      it('should login user', (done) => {
        rq.post('/authenticate')
          .send({
            username: User.username,
            password: User.password,
          }).then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.route).toBe('/');
            done();
          });
      });

      it('should return error if no username or password', (done) => {
        rq.post('/authenticate')
          .send({
            username: User.username,
          }).then((response) => {
            expect(response.statusCode).toBe(500);
            expect(response.body.success).toBe(false);
            done();
          });
      });
    });
  });

  describe('/api/account/username', () => {
    beforeEach(() => {
      // Put the test user into the database
      return db.User.create(User);
    });

    describe('GET', () => {
      it('shouldn\'t return username if not logged in', (done) => {
        rq.get('/api/account/username')
          .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('User not logged in');
            done();
          });
      });

      it('should return username if logged in', (done) => {
        const agent = request.agent(URL);

        login(agent, User)
          .then(() => {
            agent.get('/api/account/username')
              .then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.username).toBe(User.username);
                done();
              });
          });
      });
    });
  });

  describe('/api/account/user-info', () => {
    beforeEach(() => {
      // Put the test user into the database
      return db.User.create(User);
    });

    describe('GET', () => {
      it('shouldn\'t return user info if not logged in', (done) => {
        rq.get('/api/account/user-info')
          .then((response) => {
            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('User not logged in');
            done();
          });
      });

      it('should return user info if logged in', (done) => {
        const agent = request.agent(URL);

        login(agent, User)
          .then(() => {
            agent.get('/api/account/user-info')
              .then((response) => {
                expect(response.statusCode).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.user.username).toBe(User.username);
                done();
              });
          });
      });
    });
  });
});
