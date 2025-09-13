const path = require('path');
const express = require('express');
const backupRoutes = require('./routes/backup');
const formSettingsRoutes = require('./routes/formSettings');
const { authenticate } = require('./middleware/auth');

function createApp(db) {
  const app = express();
  app.set('db', db);
  app.use(express.json());
  app.use(authenticate);
  app.use('/api/backup', backupRoutes);
  app.use('/api/form-settings', formSettingsRoutes);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });
  return app;
}

module.exports = createApp;
