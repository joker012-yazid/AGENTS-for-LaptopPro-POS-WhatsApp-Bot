const express = require('express');
const backupRoutes = require('./routes/backup');

function createApp(db) {
  const app = express();
  app.set('db', db);
  app.use('/api/backup', backupRoutes);
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });
  return app;
}

module.exports = createApp;
