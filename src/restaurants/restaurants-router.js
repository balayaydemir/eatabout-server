const express = require('express');
const RestaurantsService = require('./restaurants-service');
const { requireAuth } = require('../middleware/jwt-auth');
const path = require('path');

const restaurantsRouter = express.Router();
const jsonBodyParser = express.json();


restaurantsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    RestaurantsService.getAllRestaurants(
      req.app.get('db'),
      req.user.id
    )
      .then(restaurants => {
        res.json(RestaurantsService.serializeRestaurants(restaurants));
      })
      .catch(next);
  });

restaurantsRouter
  .route('/:restaurant_id')
  .all(requireAuth)
  .all(checkRestaurantExists)
  .get((req, res) => {
      res.json(RestaurantsService.serializeRestaurant(res.restaurant))
  });

restaurantsRouter
  .route('/:restaurant_id/entries/')
  .all(requireAuth)
  .all(checkRestaurantExists)
  .get((req, res, next) => {
      RestaurantsService.getRestaurantEntries(
          req.app.get('db'),
          req.params.restaurant_id
      )
        .then(entries => {
            res.json(RestaurantsService.serializeRestaurantEntries(entries))
        })
        .catch(next)
  })

 restaurantsRouter
    .route('/all/:restaurant_id')
    .post(requireAuth, jsonBodyParser, (req, res, next) => {
        const { name, website, cuisine, city, state } = req.body;
        const newRestaurant = { name, website, cuisine, city, state };
        for (const [key, value] of Object.entries(newRestaurant))
            if (value == null)
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
                    .json(restaurant)
            })
            .catch(next);
    })

restaurantsRouter
    .route('/')
    .post(requireAuth, jsonBodyParser, (req, res, next) => {
        const { visited, rating, description, date_visited, restaurant_id, user_id } = req.body;
        const newUserRestaurantRequired = { visited, restaurant_id, user_id };
        const newUserRestaurant = { visited, rating, description, date_visited, restaurant_id, user_id };

        for (const [key, value] of Object.entries(newUserRestaurantRequired))
            if (value == null)
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
                    .json(restaurant)
            })
            .catch(next);
    })


async function checkRestaurantExists(req, res, next) {
    try {
        const restaurant = await RestaurantsService.getById(
            req.app.get('db'),
            req.params.restaurant_id,
            res.user.id
        )
        if (!restaurant)
            return res.status(404).json({
                error: 'Restaurant doesn\'t exist'
            })
        res.restaurant = restaurant
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = restaurantsRouter;