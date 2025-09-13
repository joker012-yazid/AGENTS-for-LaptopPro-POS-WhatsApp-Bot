const fs = require('fs');
const path = require('path');
const { createDb, exec } = require('./db');
const createApp = require('./app');

(async () => {
  const dbPath = process.env.SQLITE_PATH || path.join(__dirname, 'db', 'app.sqlite');
  const db = createDb(dbPath);
  const dir = path.join(__dirname, 'db', 'migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    await exec(db, sql);
  }
  const app = createApp(db);
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on ${port}`);
  });
})();
