const path = require('path');
const { createDb, run } = require('../db');

async function seed() {
  const dbPath = process.env.SQLITE_PATH || path.join(__dirname, '..', 'db', 'app.sqlite');
  const db = createDb(dbPath);
  const now = new Date().toISOString();
  await run(db, 'INSERT INTO customers (id, name, phone, wa_jid) VALUES (1, ?, ?, ?)', ['Ali', '0123456789', '1@s.whatsapp.net']);
  await run(db, 'INSERT INTO tickets (id, customer_id, device_type, brand, problem_text, status, created_at) VALUES (1,1,?,?,?,?,?)', ['Laptop', 'Dell', 'No Power', 'open', now]);
  await run(db, 'INSERT INTO whatsapp_messages (id, ticket_id, remote_jid, text, media_path, created_at) VALUES (1,1,?,?,?,?)', ['1@s.whatsapp.net', 'Hello', null, now]);
  await run(db, 'INSERT INTO whatsapp_messages_fts (rowid, text) VALUES (1, ?)', ['Hello']);
  db.close();
}

seed().catch(err => { console.error(err); process.exit(1); });
