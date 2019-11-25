const knex = require('knex');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const helpers = require('./test-helpers');


describe('items endpoints', function() {
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
        name: 'POST /api/items',
        path: '/api/items',
        method: supertest(app).post
      },
      {
        name: 'DELETE /api/items/:item_id',
        path: '/api/items/1',
        method: supertest(app).delete
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

  describe('POST /api/items', () => {
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
    it('responds with 201 and created item', () => {
      const newItem = {
        name: 'test', 
        description: 'test', 
        entry_id: 1, 
        image: 'test'
      };
      return supertest(app)
        .post('/api/items')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newItem)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/api/items/${res.body.id}`);
          expect(res.body.name).to.eql(newItem.name);
          expect(res.body.description).to.eql(newItem.description);
          expect(res.body.entry_id).to.eql(newItem.entry_id);
          expect(res.body.image).to.eql(newItem.image);
        });
    });
  });

  describe('DELETE /api/items/:item_id', () => {
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
    it('should return 204 and delete correct item', () => {
      const itemId = 1;
      const expectedItems = testItems.filter(itm => itm.id !== itemId);
      return supertest(app)
        .delete(`/api/items/${itemId}`)
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(204)
        .expect(res => {
          expect(expectedItems).to.be.an('array').that.does.not.include(testItems.find(itm => itm.id === itemId));
        });
    });
  });

});