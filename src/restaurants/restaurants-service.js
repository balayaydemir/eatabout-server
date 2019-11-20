const xss = require('xss');
// const Treeize = require('treeize');

const RestaurantsService = {
  getAllRestaurants(db, user_id) {
    return db
      .from('user_restaurants AS ur')
      .where('user_id', user_id)
      .select(
        'ur.id',
        'ur.visited',
        'ur.rating',
        'ur.description',
        'ur.date_visited',
        'ur.restaurant_id',
        'ur.user_id'
      )
      .join(
        'restaurants AS res',
        'ur.restaurant_id',
        'res.id'
      )
      .select('res.name', 'res.website', 'res.cuisine', 'res.city', 'res.state')
      .join(
        'cuisines AS cus',
        'res.cuisine',
        'cus.id'
      )
      .select('cus.cuisine_name')
      .groupBy('ur.id', 'res.id', 'cus.id');
  },
  getMainRestaurants(db) {
    return db
      .from('restaurants')
      .select('*');
  },
  getById(db, id, user_id) {
    return RestaurantsService.getAllRestaurants(db, user_id)
      .where('ur.id', id)
      .first();
  },
  getRestaurantEntries(db, id) {
    return db
      .from('entries AS ent')
      .select('*')
      .where('ent.user_restaurant_id', id)
      .join(
        'items AS itm',
        'ent.id',
        'itm.entry_id'
      );
  },
  insertRestaurant(db, newRestaurant) {
    return db 
      .insert(newRestaurant)
      .into('restaurants')
      .returning('*')
      .then(([restaurant]) => restaurant);
  },
  insertUserRestaurant(db, newRestaurant) {
    return db
      .insert(newRestaurant)
      .into('user_restaurants')
      .returning('*')
      .then(([restaurant]) => restaurant);
  },
  updateUserRestaurant(db, id, newFields) {
    return db('user_restaurants')
      .where({ id })
      .update(newFields);
  },
  deleteUserRestaurant(db, id) {
    return db('user_restaurants')
      .where({ id })
      .delete();
  },
  serializeRestaurants(restaurants) {
    return restaurants.map(this.serializeRestaurant);
  },
  serializeRestaurant(restaurantData) {
    // const restaurantTree = new Treeize();
    // const restaurantData = restaurantTree.grow([ restaurant ]).getData()[0];

    return {
      id: restaurantData.id,
      visited: restaurantData.visited,
      rating: restaurantData.rating,
      description: xss(restaurantData.description),
      date_visited: restaurantData.date_visited,
      restaurant_id: restaurantData.restaurant_id,
      user_id: restaurantData.user_id,
      name: xss(restaurantData.name),
      website: xss(restaurantData.website),
      cuisine: restaurantData.cuisine,
      city: xss(restaurantData.city),
      state: xss(restaurantData.state),
      cuisine_id: restaurantData.cuisine_id,
      cuisine_name: xss(restaurantData.cuisine_name)
    };
  },
  serializeRestaurantEntries(entries) {
    return entries.map(this.serializeRestaurantEntry);
  },
  serializeRestaurantEntry(entryData) {
    // const entryTree = new Treeize();
    // const entryData = entryTree.grow([ entry ]).getData()[0];
    
    return {
      id: entryData.id,
      date: entryData.date,
      user_restaurant_id: entryData.user_restaurant_id,
      user_id: entryData.user_id,
      name: xss(entryData.name),
      image: entryData.image,
      description: xss(entryData.description),
      entry_id: entryData.entry_id,
    };
  },
  serializeRestaurantsMain(restaurants) {
    return restaurants.map(this.serializeRestaurantMain);
  },
  serializeRestaurantMain(restaurantData) {
    // const restaurantTree = new Treeize();
    // const restaurantData = restaurantTree.grow([ restaurant ]).getData()[0];

    return {
      id: restaurantData.id, 
      name: xss(restaurantData.name),
      website: xss(restaurantData.website),
      cuisine: restaurantData.cuisine,
      city: xss(restaurantData.city),
      state: xss(restaurantData.state),
    };
  },
  serializeUserRestaurant(restaurantData) {
    // const restaurantTree = new Treeize();
    // const restaurantData = restaurantTree.grow([ restaurant ]).getData()[0];

    return {
      id: restaurantData.id,
      visited: restaurantData.visited,
      rating: restaurantData.rating,
      description: xss(restaurantData.description),
      date_visited: restaurantData.date_visited,
      restaurant_id: restaurantData.restaurant_id,
      user_id: restaurantData.user_id,
    };
  }
};

module.exports = RestaurantsService;