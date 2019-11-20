const xss = require('xss');
const Treeize = require('treeize');

const RestaurantsService = {
  getAllRestaurants(db, user_id) {
    return db
      .from('user_restaurants AS ur')
      .select('*')
      .where('user_id', user_id)
      .join(
        'restaurants AS res',
        'ur.restaurant_id',
        'res.id'
      )
      .join(
        'cuisines AS cus',
        'res.cuisine',
        'cus.cuisine_id'
      );
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
  serializeRestaurants(restaurants) {
    return restaurants.map(this.serializeRestaurant);
  },
  serializeRestaurant(restaurant) {
    const restaurantTree = new Treeize();
    const restaurantData = restaurantTree.grow([ restaurant ]).getData()[0];

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
  serializeRestaurantEntry(entry) {
    const entryTree = new Treeize();
    const entryData = entryTree.grow([ entry ]).getData()[0]
    
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
  }
};

module.exports = RestaurantsService;