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

  describe('GET /api/restaurants', () => {
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
        testRestaurants,
        testCuisines
      );
      return supertest(app)
        .get('/api/restaurants')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200, expectedResult);
    });
  });

  describe('POST /api/restaurants', () => {
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
    it('responds with 201 and the added restaurant', () => {
      const user = testUsers[0];
      const newUserRestaurant = {
        visited: true, 
        rating: 5, 
        description: 'test', 
        date_visited: '2029-01-22T16:28:32.615Z', 
        restaurant_id: 1
      };
      return supertest(app)
        .post('/api/restaurants')
        .set('Authorization', helpers.makeAuthHeader(user))
        .send(newUserRestaurant)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id');
          expect(res.body.visited).to.eql(newUserRestaurant.visited);
          expect(res.body.rating).to.eql(newUserRestaurant.rating);
          expect(res.body.description).to.eql(newUserRestaurant.description);
          expect(res.body.date_visited).to.eql(newUserRestaurant.date_visited);
          expect(res.body.restaurant_id).to.eql(newUserRestaurant.restaurant_id);
          expect(res.body.user_id).to.eql(user.id);
          expect(res.headers.location).to.eql(`/api/restaurants/${res.body.id}`);
        });
    });
  });

  describe('PATCH /api/restaurants/:restaurant_id', () => {
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
    it('responds with 204 created when restaurant is successfully edited', () => {
      const user = testUsers[0];
      const restaurantId = 2;
      const newFields = {
        visited: true, 
        rating: 5, 
        date_visited: '2029-01-22T16:28:32.615Z', 
        description: 'test'
      };
      return supertest(app)
        .patch(`/api/restaurants/${restaurantId}`)
        .set('Authorization', helpers.makeAuthHeader(user))
        .send(newFields)
        .expect(204);
    });
  });

  describe('DELETE /api/restaurants/:restaurant_id', () => {
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
    it('responds with 204 when restaurant is deleted', () => {
      const user = testUsers[0];
      const restaurantId = 1;
      const expectedRestaurants = testUserRestaurants.filter(restaurant => restaurant.id !== restaurantId);
      return supertest(app)
        .delete(`/api/restaurants/${restaurantId}`)
        .set('Authorization', helpers.makeAuthHeader(user))
        .expect(204)
        .then(res =>
          supertest(app)
            .get('/api/restaurants')
            .set('Authorization', helpers.makeAuthHeader(user))
            .expect(helpers.makeExpectedRestaurants(expectedRestaurants, testRestaurants, testCuisines))
        );
    });
  });

  describe('GET /api/restaurants/:restaurant_id/entries', () => {
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
    it('responds with correct restaurant entries', () => {
      const user = testUsers[0];
      const restaurantId = 2;
      return supertest(app)
        .get(`/api/restaurants/${restaurantId}/entries`)
        .set('Authorization', helpers.makeAuthHeader(user))
        .expect(helpers.makeExpectedRestaurantEntries(restaurantId, testEntries, testItems));
    });
  });

  describe('POST /api/restaurants/all', () => {
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
    it('responds with 201 and the added restaurant', () => {
      const user = testUsers[0];
      const newRestaurant = {
        name: 'test', 
        website: 'test', 
        cuisine: 1, 
        city: 'test', 
        state: 'tt'
      };
      return supertest(app)
        .post('/api/restaurants/all')
        .set('Authorization', helpers.makeAuthHeader(user))
        .send(newRestaurant)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/api/restaurants/all/${res.body.id}`);
          expect(res.body.name).to.eql(newRestaurant.name);
          expect(res.body.website).to.eql(newRestaurant.website);
          expect(res.body.cuisine).to.eql(newRestaurant.cuisine);
          expect(res.body.city).to.eql(newRestaurant.city);
          expect(res.body.state).to.eql(newRestaurant.state);
        });
    });
  });



});