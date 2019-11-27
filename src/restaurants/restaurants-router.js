const express = require('express');
const RestaurantsService = require('./restaurants-service');
const { requireAuth } = require('../middleware/jwt-auth');
const path = require('path');


const restaurantsRouter = express.Router();
const jsonBodyParser = express.json();



restaurantsRouter
  .route('/')
  .get(requireAuth, (req, res, next) => {
    RestaurantsService.getAllRestaurants(
      req.app.get('db'),
      req.user.id
    )
      .then(restaurants => {
        res.json(RestaurantsService.treeizeRestaurants(restaurants));
      })
      .catch(next);
  })
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { visited, rating, description, date_visited, restaurant_id } = req.body;
    const newUserRestaurantRequired = { visited, restaurant_id };
    const newUserRestaurant = { visited, rating, description, date_visited, restaurant_id };

    for (const [key, value] of Object.entries(newUserRestaurantRequired))
      if (value === null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
        
    newUserRestaurant.user_id = req.user.id;
    RestaurantsService.insertUserRestaurant(
      req.app.get('db'), 
      newUserRestaurant,
      req.user.id
    )
      .then(restaurant => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${restaurant.id}`))
          .json(RestaurantsService.serializeUserRestaurant(restaurant));
      })
      .catch(next);
  });

restaurantsRouter
  .route('/:restaurant_id(\\d+)')
  .get(requireAuth, (req, res, next) => {
    RestaurantsService.getById(
      req.app.get('db'),
      req.params.restaurant_id,
      req.user.id
    )
      .then(restaurant => {
        res.json(RestaurantsService.treeizeRestaurant(restaurant));
      })
      .catch(next);
  })
  .patch(requireAuth, jsonBodyParser, (req, res, next) => {
    const { visited, rating, date_visited, description } = req.body;
    const newFields = { visited, rating, date_visited, description };

    if (rating === null || date_visited === null) {
      return res.status(400).json({
        error: 'Request body must contain \'rating\' and \'date_visited\''
      });
    }
    
    RestaurantsService.updateUserRestaurant(
      req.app.get('db'),
      req.params.restaurant_id,
      newFields
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .delete(requireAuth, (req, res, next) => {
    RestaurantsService.deleteUserRestaurant(
      req.app.get('db'),
      req.params.restaurant_id
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

restaurantsRouter
  .route('/:restaurant_id/entries/')
  .get(requireAuth, (req, res, next) => {
    RestaurantsService.getRestaurantEntries(
      req.app.get('db'),
      req.params.restaurant_id
    )
      .then(entries => {
        res.json(RestaurantsService.treeizeRestaurantEntries(entries));
      })
      .catch(next);
  });

restaurantsRouter
  .route('/all')
  .get(requireAuth, (req, res, next) => {
    RestaurantsService.getMainRestaurants(
      req.app.get('db')
    )
      .then(restaurants => {
        res.json(RestaurantsService.serializeRestaurantsMain(restaurants));
      })
      .catch(next);
  })
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { name, website, cuisine, city, state } = req.body;
    const newRestaurant = { name, website, cuisine, city, state };
    for (const [key, value] of Object.entries(newRestaurant))
      if (value === null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
        
    RestaurantsService.insertRestaurant(
      req.app.get('db'),
      newRestaurant
    )
      .then(restaurant => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${restaurant.id}`))
          .json(RestaurantsService.serializeRestaurantMain(restaurant));
      })
      .catch(next);
  });




module.exports = restaurantsRouter;