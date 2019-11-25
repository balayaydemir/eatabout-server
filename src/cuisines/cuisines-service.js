const CuisinesService = {
  getAllCuisines(db) {
    return db
      .from('cuisines')
      .select('*');
  },
  getCuisineChartData(db, user_id) {
    return db
      .from('user_restaurants AS ur')
      .where('user_id', user_id)
      .select(
        'cus.cuisine_name'
      )
      .count('cus.cuisine_name AS count')
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
      .groupBy('cus.cuisine_name');
  }
};

module.exports = CuisinesService;