const knex = require('knex');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const helpers = require('./test-helpers');


describe('entries endpoints', function() {
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

    it('responds with 401 \'Missing bearer token\' when no bearer token', () => {
      return supertest(app)
        .get('/api/cuisines')
        .expect(401, { error: 'Missing bearer token' });
    });
    it('responds with 401 \'Unauthorized request\' when no credentials in token', () => {
      const validUser = testUsers[0];
      const invalidSecret = 'bad-secret';
      return supertest(app)
        .get('/api/cuisines')
        .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
        .expect(401, { error: 'Unauthorized request' });
    });
    it('responds with 401 \'Unauthorized request\' when invalid sub in payload', () => {
      const invalidUser = { user_name: 'bad', id: 1 };
      return supertest(app)
        .get('/api/cuisines')
        .set('Authorization', helpers.makeAuthHeader(invalidUser))
        .expect(401, { error: 'Unauthorized request' });
    });  
  });

  describe('GET /api/cuisines', () => {
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

    it('responds with 200 and all cuisines', () => {
      return supertest(app)
        .get('/api/cuisines')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200, testCuisines);
    });
  });
});
