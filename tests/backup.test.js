const fs = require('fs');
const path = require('path');
const request = require('supertest');
const JSZip = require('jszip');
const createApp = require('../app');
const { createDb, exec, run } = require('../db');

async function setupDb() {
  const db = createDb(':memory:');
  const migration = fs.readFileSync(path.join(__dirname, '..', 'db', 'migrations', '001_init.sql'), 'utf8');
  await exec(db, migration);
  const now = new Date().toISOString();
  await run(db, 'INSERT INTO customers (id, name, phone, wa_jid) VALUES (1,?,?,?)', ['Ali', '0123456789', '1@s.whatsapp.net']);
  await run(db, 'INSERT INTO tickets (id, customer_id, device_type, brand, problem_text, status, created_at) VALUES (1,1,?,?,?,?,?)', ['Laptop', 'Dell', 'No Power', 'open', now]);
  await run(db, 'INSERT INTO whatsapp_messages (id, ticket_id, remote_jid, text, media_path, created_at) VALUES (1,1,?,?,?,?)', ['1@s.whatsapp.net', 'Hello', null, now]);
  await run(db, 'INSERT INTO whatsapp_messages_fts (rowid, text) VALUES (1, ?)', ['Hello']);
  return db;
}

describe('backup endpoints', () => {
  let app;
  beforeAll(async () => {
    const db = await setupDb();
    app = createApp(db);
  });

  test('GET /api/backup/customers.xlsx returns excel', async () => {
    const res = await request(app)
      .get('/api/backup/customers.xlsx')
      .set('x-token', 'admin-token')
      .buffer()
      .parse((res, cb) => {
        res.setEncoding('binary');
        res.data = '';
        res.on('data', chunk => { res.data += chunk; });
        res.on('end', () => cb(null, Buffer.from(res.data, 'binary')));
      });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/sheet/);
    expect(res.headers['content-disposition']).toMatch(/attachment/);
    expect(res.body.length).toBeGreaterThan(1024);
  });

  test('GET /api/backup/issues.zip has issues.json', async () => {
    const res = await request(app)
      .get('/api/backup/issues.zip')
      .set('x-token', 'admin-token')
      .buffer()
      .parse((res, cb) => {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => cb(null, Buffer.concat(chunks)));
      });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/zip/);
    const zip = await JSZip.loadAsync(res.body);
    const files = Object.keys(zip.files);
    expect(files).toContain('issues.json');
  });
});
