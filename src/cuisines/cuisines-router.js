const express = require('express');
const CuisinesService = require('./cuisines-service');
const { requireAuth } = require('../middleware/jwt-auth');


const cuisinesRouter = express.Router();

cuisinesRouter
  .route('/')
  .get(requireAuth, (req, res, next) => {
    CuisinesService.getAllCuisines(
      req.app.get('db')
    )
      .then(cuisines => {
        res.json(cuisines);
      })
      .catch(next);
  });

cuisinesRouter
  .route('/report')
  .get(requireAuth, (req, res, next) => {
    CuisinesService.getCuisineChartData(
      req.app.get('db'),
      req.user.id
    )
      .then(cuisines => {
        res.json(cuisines);
      })
      .catch(next);
  });

module.exports = cuisinesRouter;