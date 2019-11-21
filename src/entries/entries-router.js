const express = require('express');
const EntriesService = require('./entries-service');
const { requireAuth } = require('../middleware/jwt-auth');
const path = require('path');

const entriesRouter = express.Router();
const jsonBodyParser = express.json();

entriesRouter
  .route('/')
  .get(requireAuth, (req, res, next) => {
    EntriesService.getAllEntries(
      req.app.get('db'),
      req.user.id
    )
      .then(entries => {
        res.json(EntriesService.serializeEntries(entries));
      })
      .catch(next);
  })
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { date, user_restaurant_id, user_id } = req.body;
    const newEntry = { date, user_restaurant_id, user_id };

    for (const [key, value] of Object.entries(newEntry))
      if (value === null) 
        return res.status(400).json({
          error: `Request body must contain ${key}`
        });
    
    EntriesService.insertEntry(
      req.app.get('db'),
      newEntry
    )
      .then(entry => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${entry.id}`))
          .json(entry);
      })
      .catch(next);
  });

entriesRouter
  .route('/:entry_id')
  .get(requireAuth, (req, res, next) => {
    EntriesService.getById(
      req.app.get('db'),
      req.params.entry_id,
      req.user.id
    )
      .then(entry => {
        res.json(EntriesService.serializeEntry(entry));
      })
      .catch(next);
  })
  .delete(requireAuth, (req, res, next) => {
    EntriesService.deleteEntry(
      req.app.get('db'),
      req.params.entry_id
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = entriesRouter;

