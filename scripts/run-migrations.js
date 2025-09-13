const fs = require('fs');
const path = require('path');
const { createDb, exec } = require('../db');

async function runMigrations() {
  const dbPath = process.env.SQLITE_PATH || path.join(__dirname, '..', 'db', 'app.sqlite');
  const db = createDb(dbPath);
  const dir = path.join(__dirname, '..', 'db', 'migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    await exec(db, sql);
  }
  db.close();
}

runMigrations().catch(err => {
  console.error(err);
  process.exit(1);
});
