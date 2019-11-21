const knex = require('knex');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const helpers = require('./test-helpers');


describe('restaurants endpoints', function() {
  let db;

  const { testUsers, testCuisines, testRestaurants, testUserRestaurants, testEntries, testItems } = helpers.makeFixtures();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());
  before('cleanup', () => helpers.cleanTables(db));
  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('protected endpoints', () => {
    beforeEach('seed user table with data', () => {
      helpers.seedUsers(
        db,
        testUsers
      );
    });

    const protectedEndpoints = [
      {
        name: 'GET /api/restaurants',
        path: '/api/restaurants',
        method: supertest(app).get
      },
      {
        name: 'POST /api/restaurants',
        path: '/api/restaurants',
        method: supertest(app).post
      },
      {
        name: 'GET /api/restaurants/:restaurant_id',
        path: '/api/restaurants/1',
        method: supertest(app).get
      },
      {
        name: 'PATCH /api/restaurants/:restaurant_id',
        path: '/api/restaurants/1',
        method: supertest(app).patch
      },
      {
        name: 'DELETE /api/restaurants/:restaurant_id',
        path: '/api/restaurants/1',
        method: supertest(app).delete
      },
      {
        name: 'GET /api/restaurants/:restaurant_id/entries',
        path: '/api/restaurants/1/entries',
        method: supertest(app).get
      },
      {
        name: 'GET /api/restaurants/all',
        path: '/api/restaurants/all',
        method: supertest(app).get
      },
      {
        name: 'POST /api/restaurants/all',
        path: '/api/restaurants/all',
        method: supertest(app).post
      },
    ];

    protectedEndpoints.forEach(endpoint => {
      describe(endpoint.name, () => {
        it('responds with 401 \'Missing bearer token\' when no bearer token', () => {
          return endpoint.method(endpoint.path)
            .expect(401, { error: 'Missing bearer token' });
        });
        it('responds with 401 \'Unauthorized request\' when no credentials in token', () => {
          const validUser = testUsers[0];
          const invalidSecret = 'bad-secret';
          return endpoint.method(endpoint.path)
            .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
            .expect(401, { error: 'Unauthorized request' });
        });
        it('responds with 401 \'Unauthorized request\' when invalid sub in payload', () => {
          const invalidUser = { user_name: 'bad', id: 1 };
          return endpoint.method(endpoint.path)
            .set('Authorization', helpers.makeAuthHeader(invalidUser))
            .expect(401, { error: 'Unauthorized request' });
        });
      });
    });
  });

  describe.only('GET /api/restaurants', () => {
    beforeEach('seed tables', () => 
      helpers.seedTables(
        db, 
        testUsers,
        testCuisines, 
        testRestaurants,
        testUserRestaurants,
        testEntries,
        testItems
      )
    );
    it('responds with 200 and all user restaurants', () => {
      const user = testUsers[0];
      const expectedResult = helpers.makeExpectedUserRestaurants(
        user, 
        testUserRestaurants,
        testRestaurants
      );
      return supertest(app)
        .get('/api/restaurants')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200, expectedResult);
    });
  });

});