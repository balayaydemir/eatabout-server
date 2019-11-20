const xss = require('xss');
const Treeize = require('treeize');

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
        'ur.user_id',
        'res.name AS restaurant:name', 
        'res.website AS restaurant:website', 
        'res.cuisine AS restaurant:cuisine', 
        'res.city AS restaurant:city', 
        'res.state AS restaurant:state',
        'cus.cuisine_name AS restaurant:cuisine_name'
      )
      .join(
        'restaurants AS res',
        'ur.restaurant_id',
        'res.id'
      )
      .join(
        'cuisines AS cus',
        'res.cuisine',
        'cus.id'
      )
      .groupBy('ur.id', 'res.id', 'cus.id');
  },
  getMainRestaurants(db) {
    return db
      .from('restaurants')
      .select('*');
  },
  getById(db, id, user_id) {
    return RestaurantsService.getAllRestaurants(db, user_id)
      .where('ur.id', id);
  },
  getRestaurantEntries(db, id) {
    return db
      .from('entries AS ent')
      .select(
        'ent.id',
        'ent.date',
        'ent.user_restaurant_id',
        'ent.user_id',
        'itm.name AS items:name',
        'itm.image AS items:image',
        'itm.description AS items:description',
        'itm.entry_id AS items:entry_id'
      )
      .where('ent.user_restaurant_id', id)
      .join(
        'items AS itm',
        'ent.id',
        'itm.entry_id'
      )
      .groupBy('ent.id', 'itm.id');
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
  serializeRestaurant(restaurant) {
    return this.serializeRestaurants(restaurant)[0];
  },
  serializeRestaurants(restaurants) {
    const restaurantsTree = new Treeize();
    const restaurantsData = restaurantsTree.grow(restaurants).getData();
    return restaurantsData;
  },
  serializeRestaurantEntry(entry) {
    return this.serializeRestaurantEntries(entry)[0];
  },
  serializeRestaurantEntries(entries) {
    const entriesTree = new Treeize();
    const entriesData = entriesTree.grow(entries).getData();
    
    return entriesData;
  },
  serializeRestaurantsMain(restaurants) {
    return restaurants.map(this.serializeRestaurantMain);
  },
  serializeRestaurantMain(restaurantData) {
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