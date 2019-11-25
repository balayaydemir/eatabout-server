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
    
    const protectedEndpoints = [
      {
        name: 'GET /api/entries',
        path: '/api/entries',
        method: supertest(app).get
      },
      {
        name: 'POST /api/entries',
        path: '/api/entries',
        method: supertest(app).post
      },
      {
        name: 'GET /api/entries/:entry_id',
        path: '/api/entries/1',
        method: supertest(app).get
      },
      {
        name: 'DELETE /api/entries/:entry_id',
        path: '/api/entries/1',
        method: supertest(app).get
      }
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

  describe('GET /api/entries', () => {
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
    it('responds with 200 and all entries', () => {
      return supertest(app)
        .get('/api/entries')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200, helpers.makeExpectedEntries(testEntries, testItems));
    });
  });

  describe('POST /api/entries', () => {
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

    it('responds with 201 and new entry', () => {
      const newEntry = {
        date: '2029-01-22T16:28:32.615Z', 
        user_restaurant_id: 1, 
        user_id: 1
      };
      return supertest(app)
        .post('/api/entries')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newEntry)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/api/entries/${res.body.id}`);
          expect(res.body.date).to.eql(newEntry.date);
          expect(res.body.user_restaurant_id).to.eql(newEntry.user_restaurant_id);
          expect(res.body.user_id).to.eql(newEntry.user_id);
        });
    });
  });

  describe('GET /api/entries/:entry_id', () => {
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
    it('responds with the correct entry', () => {
      const entryId = 1;
      return supertest(app)
        .get(`/api/entries/${entryId}`)
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200, helpers.makeExpectedEntries(testEntries, testItems).find(entry => entry.id === entryId));
    });
  });

  describe('DELETE /api/entries/:entry_id', () => {
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
    it('responds with 204 and deletes correct entry', () => {
      const entryId = 1;
      const expectedEntries = testEntries.filter(entry => entry.id !== entryId);
      return supertest(app)
        .delete(`/api/entries/${entryId}`)
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(204)
        .then(res =>
          supertest(app)
            .get('/api/entries')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(helpers.makeExpectedEntries(expectedEntries, testItems))
        );
    });
  });

});