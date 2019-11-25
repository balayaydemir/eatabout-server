module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://eatabout-admin@localhost/eatabout',
  CLIENT_ORIGIN: 'https://eatabout-app.balayaydemir.now.sh',
  JWT_SECRET: process.env.JWT_SECRET || '8854829f-fd62-4b0b-8f92-66ae25a53a16',
};