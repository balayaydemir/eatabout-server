const CuisinesService = {
  getAllCuisines(db) {
    return db
      .from('cuisines')
      .select('*');
  }
};

module.exports = CuisinesService;