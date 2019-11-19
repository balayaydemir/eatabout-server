const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      full_name: 'testuser1',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 2,
      user_name: 'test-user-2',
      full_name: 'testuser2',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 3,
      user_name: 'test-user-3',
      full_name: 'testuser3',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z',
    },
  ];
}

function makeCuisinesArray() {
  return [
    {
      id: 1,
      name: 'Mexican'
    },
    {
      id: 2,
      name: 'American'
    },
    {
      id: 3,
      name: 'Italian'
    },
  ];
}

function makeRestaurantsArray(cuisines) {
  return [
    {
      id: 1,
      name: 'test restaurant 1',
      website: 'www.google.com',
      cuisine: cuisines[0].id,
      city: 'San Diego',
      state: 'CA',
      rating: null,
    },
    {
      id: 2,
      name: 'test restaurant 2',
      website: 'www.google.com',
      cuisine: cuisines[1].id,
      city: 'San Diego',
      state: 'CA',
    },
    {
      id: 3,
      name: 'test restaurant 3',
      website: 'www.google.com',
      cuisine: cuisines[2].id,
      city: 'San Diego',
      state: 'CA',
    },
  ];
}

function makeEntriesArray(user_restaurants, users) {
  return [
    {
      id: 1,
      restaurant_id: user_restaurants[1].id,
      user_id: users[0].id,
    },
    {
      id: 2,
      restaurant_id: user_restaurants[1].id,
      user_id: users[0].id,
    },
    {
      id: 3,
      restaurant_id: user_restaurants[1].id,
      user_id: users[0].id,
    },
  ];
}

function makeItemsArray(entries) {
  return [
    {
      id: 1,
      name: 'spaghetti',
      image: null,
      description: 'yummy',
      entry_id: entries[0].id,
    },
    {
      id: 2,
      name: 'spaghetti',
      image: null,
      description: 'yummy',
      entry_id: entries[1].id,
    },
    {
      id: 3,
      name: 'spaghetti',
      image: null,
      description: 'yummy',
      entry_id: entries[2].id,
    },
  ];
}

function makeUserRestaurantsArray(restaurants, users) {
  return [
    {
      id: 1,
      visited: false,
      rating: null,
      description: null,
      date_visited: null, 
      restaurant_id: restaurants[0].id,
      user_id: users[0].id
    },
    {
      id: 2,
      visited: true,
      rating: 4,
      description: 'so good',
      date_visited: '2029-01-22T16:28:32.615Z', 
      restaurant_id: restaurants[0].id,
      user_id: users[0].id
    },
    {
      id: 3,
      visited: false,
      rating: null,
      description: null,
      date_visited: null, 
      restaurant_id: restaurants[1].id,
      user_id: users[0].id
    },
  ];
}

function makeFixtures() {
  const testUsers = makeUsersArray();
  const testCuisines = makeCuisinesArray();
  const testRestaurants = makeRestaurantsArray(testCuisines);
  const testUserRestaurants = makeUserRestaurantsArray(testRestaurants, testUsers);
  const testEntries = makeEntriesArray(testUserRestaurants, testUsers);
  const testItems = makeItemsArray(testEntries);
  return { testUsers, testCuisines, testRestaurants, testEntries, testItems, testUserRestaurants };
}

function cleanTables(db) {
  return db.transaction(trx => 
    trx.raw(
      `TRUNCATE
          items,
          entries, 
          user_restaurants,
          users,
          restaurants,
          cuisines
          `
    )
      .then(() => 
        Promise.all([
          trx.raw('ALTER SEQUENCE items_id_seq minvalue 0 START WITH 1'),
          trx.raw('ALTER SEQUENCE entries_id_seq minvalue 0 START WITH 1'),
          trx.raw('ALTER SEQUENCE user_restaurants_id_seq minvalue 0 START WITH 1'),
          trx.raw('ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1'),
          trx.raw('ALTER SEQUENCE restaurants_id_seq minvalue 0 START WITH 1'),
          trx.raw('ALTER SEQUENCE cuisines_id_seq minvalue 0 START WITH 1'),
          trx.raw('SELECT setVal(\'items_id_seq\', 0)'),
          trx.raw('SELECT setVal(\'entries_id_seq\', 0)'),
          trx.raw('SELECT setVal(\'user_restaurants_id_seq\', 0)'),
          trx.raw('SELECT setVal(\'users_id_seq\', 0)'),
          trx.raw('SELECT setVal(\'restaurants_id_seq\', 0)'),
          trx.raw('SELECT setVal(\'cuisines_id_seq\', 0)'),
        ])
      )
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user, 
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('users').insert(preppedUsers)
    .then(() => 
      db.raw(
        `SELECT setVal('users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

module.exports = {
  makeUsersArray,
  makeCuisinesArray, 
  makeRestaurantsArray,
  makeEntriesArray, 
  makeItemsArray,
  makeUserRestaurantsArray,
  makeFixtures,
  seedUsers, 
  makeAuthHeader,
  cleanTables,
}