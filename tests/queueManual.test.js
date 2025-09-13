const fs = require('fs');
const path = require('path');
const request = require('supertest');
const createApp = require('../app');
const { createDb, exec, run, get } = require('../db');

async function setupDb() {
  const db = createDb(':memory:');
  const migration1 = fs.readFileSync(path.join(__dirname, '..', 'db', 'migrations', '001_init.sql'), 'utf8');
  await exec(db, migration1);
  const migration3 = fs.readFileSync(path.join(__dirname, '..', 'db', 'migrations', '003_queue_manual.sql'), 'utf8');
  await exec(db, migration3);
  return db;
}

describe('queue manual API', () => {
  let app;
  let db;
  beforeAll(async () => {
    db = await setupDb();
    const now = new Date().toISOString();
    await run(
      db,
      'INSERT INTO queue_manual (id, remote_jid, last_text, reason, created_at, status) VALUES (1,?,?,?,?,?)',
      ['1@s.whatsapp.net', 'Help me', 'out_of_scope', now, 'pending']
    );
    app = createApp(db);
  });

  test('GET queue items', async () => {
    const res = await request(app).get('/api/queue/manual').set('x-token', 'admin-token');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].remote_jid).toBe('1@s.whatsapp.net');
  });

  test('resolve queue item', async () => {
    let res = await request(app).post('/api/queue/manual/1/resolve').set('x-token', 'admin-token');
    expect(res.status).toBe(200);
    res = await request(app).get('/api/queue/manual').set('x-token', 'admin-token');
    expect(res.body.length).toBe(0);
    const row = await get(db, 'SELECT status, handled_by FROM queue_manual WHERE id = 1');
    expect(row.status).toBe('done');
    expect(row.handled_by).toBe('admin');
  });
});
