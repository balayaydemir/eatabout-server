const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const bcrypt = require('bcryptjs');

describe('Users endpoints', function() {
  let db;
  const { testUsers } = helpers.makeFixtures();
  const testUser = testUsers[0];

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

  describe('POST /api/users', () => {
      context('user validation', () => {
          beforeEach('insert users', () => 
              helpers.seedUsers(
                  db, 
                  testUsers,
              )
          )
          const requiredFields = ['user_name', 'password', 'full_name'];

          requiredFields.forEach(field => {
              const registerAttemptBody = {
                  user_name: 'test user_name',
                  password: 'test password',
                  full_name: 'test full name',
              }
            
            it(`responds with 400 required error when '${field}' is missing`, () => {
                delete registerAttemptBody[field]

                return supertest(app)
                    .post('/api/users')
                    .send(registerAttemptBody)
                    .expect(400, {
                        error: `Missing '${field}' in request body`,
                    })
            })
          })
          it(`responds with 400 'Password must be longer than 8 characters' when empty password`, () => {
              const userShortPass = {
                  user_name: 'test name',
                  password: '1234567',
                  full_name: 'test full name',
              }
              return supertest(app)
                .post('/api/users')
                .send(userShortPass)
                .expect(400, { error: 'Password must be longer than 8 characters' })
          })
          it(`responds with 400 'Password must be less than 72 characters' when long password`, () => {
              const userLongPass = {
                  user_name: 'test name',
                  password: '*'.repeat(73),
                  full_name: 'test full name',
              }
              return supertest(app)
                .post('/api/users')
                .send(userLongPass)
                .expect(400, { error: 'Password must be less than 72 characters' })
          })
          it('responds with 400 error when password starts with spaces', () => {
              const userPassSpaces = {
                  user_name: 'test name',
                  password: ' 1Aa!2Bb@',
                  full_name: 'test full name'
              }
              return supertest(app)
                .post('/api/users')
                .send(userPassSpaces)
                .expect(400, { error: 'Password must not start or end with empty spaces' })
          })
          it('responds with 400 error when password ends with spaces', () => {
            const userPassSpaces = {
                user_name: 'test name',
                password: '1Aa!2Bb@ ',
                full_name: 'test full name'
            }
            return supertest(app)
              .post('/api/users')
              .send(userPassSpaces)
              .expect(400, { error: 'Password must not start or end with empty spaces' })
        })
        it('responds 400 error when password is not complex enough', () => {
            const userPassNotComplex = {
                user_name: 'test user name',
                password: '11AAbbaa',
                full_name: 'test full name'
            }
            return supertest(app)
                .post('/api/users')
                .send(userPassNotComplex)
                .expect(400, { error: 'Password must contain 1 upper case, lower case, number and special character' })       
        })
        it('responds with 400 error when user_name not unique', () => {
            const duplicateUser = {
                user_name: testUser.user_name,
                password: '11aaAAbb!!',
                full_name: 'test full name'
            }
            return supertest(app)
                .post('/api/users')
                .send(duplicateUser)
                .expect(400, { error: 'Username already taken' })
        })
      })
      context('Happy path', () => {
          it('responds with 201, serialized user, storing bcrypted password', () => {
              const newUser = {
                  user_name: 'test user name',
                  password: '11aaAA!!',
                  full_name: 'test full name'
              }
              return supertest(app)
                .post('/api/users')
                .send(newUser)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.user_name).to.eql(newUser.user_name)
                    expect(res.body.full_name).to.eql(newUser.full_name)
                    expect(res.body).to.not.have.property('password')
                    expect(res.headers.location).to.eql(`/api/users/${res.body.id}`)
                    const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                    const actualDate = new Date(res.body.date_created).toLocaleString()
                    expect(actualDate).to.eql(expectedDate)
                })
                .expect(res => 
                    db
                        .from('users')
                        .select('*')
                        .where({ id: res.body.id })
                        .first()
                        .then(row => {
                            expect(row.user_name).to.eql(newUser.user_name)
                            expect(row.full_name).to.eql(newUser.full_name)
                            const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                            const actualDate = new Date(row.date_created).toLocaleString()
                            expect(actualDate).to.eql(expectedDate)

                            return bcrypt.compare(newUser.password, row.password)
                        })
                        .then(compareMatch => {
                            expect(compareMatch).to.be.true
                        })    
                )
          })
      })
  })
});