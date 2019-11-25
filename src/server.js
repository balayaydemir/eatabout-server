const app = require('./app');
const knex = require('knex');
const { PORT, DATABASE_URL } = require('./config');
const express = require('express');

const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
});



app.use(express.static('public'));
app.set('db', db);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});