const express = require('express');
const ItemsService = require('./items-service');
const { requireAuth } = require('../middleware/jwt-auth');
const path = require('path');


const itemsRouter = express.Router();
const jsonBodyParser = express.json();



itemsRouter
  .route('/')
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { name, description, entry_id, image } = req.body;
    const newItem = { name, description, entry_id, image };

       
    if (name === null || entry_id === null) {
      return res.status(400).json({
        error: 'Request body must contain name and entry_id'
      });
    }

    ItemsService.insertItem(
      req.app.get('db'),
      newItem
    )
      .then(item => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${item.id}`))
          .json(item);
      })
      .catch(next);
  });

itemsRouter
  .route('/:item_id')
  .delete(requireAuth, (req, res, next) => {
    ItemsService.deleteItem(
      req.app.get('db'),
      req.params.item_id
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = itemsRouter;