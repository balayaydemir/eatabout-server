require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV, CLIENT_ORIGIN } = require('./config');
const authRouter = require('./auth/auth-router');
const usersRouter = require('./users/users-router');
const restaurantsRouter = require('./restaurants/restaurants-router');
const entriesRouter = require('./entries/entries-router');
const itemsRouter = require('./items/items-router');
const cuisinesRouter = require('./cuisines/cuisines-router');
const uploadRouter = require('./upload/upload-router');



const app = express();

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
  skip: () => NODE_ENV === 'test',
}));
app.use(helmet());
app.use(cors());
app.use(express.static('public'));



app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/entries', entriesRouter);
app.use('/api/items', itemsRouter);
app.use('/api/cuisines', cuisinesRouter);
app.use('/api/upload',uploadRouter);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;