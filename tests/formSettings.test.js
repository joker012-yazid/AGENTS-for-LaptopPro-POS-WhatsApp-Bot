const fs = require('fs');
const path = require('path');
const request = require('supertest');
const createApp = require('../app');
const { createDb, exec } = require('../db');

async function setupDb() {
  const db = createDb(':memory:');
  const migration1 = fs.readFileSync(path.join(__dirname, '..', 'db', 'migrations', '001_init.sql'), 'utf8');
  await exec(db, migration1);
  const migration2 = fs.readFileSync(path.join(__dirname, '..', 'db', 'migrations', '002_form_settings.sql'), 'utf8');
  await exec(db, migration2);
  return db;
}

describe('form settings API', () => {
  let app;
  beforeAll(async () => {
    const db = await setupDb();
    app = createApp(db);
  });

  test('rejects non-admin', async () => {
    const res = await request(app).get('/api/form-settings').set('x-token', 'kaunter-token');
    expect(res.status).toBe(403);
  });

  test('GET and POST form settings', async () => {
    let res = await request(app).get('/api/form-settings').set('x-token', 'admin-token');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});

    res = await request(app)
      .post('/api/form-settings')
      .set('x-token', 'admin-token')
      .send({ greeting: 'Hello' });
    expect(res.status).toBe(200);

    res = await request(app).get('/api/form-settings').set('x-token', 'admin-token');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ greeting: 'Hello' });
  });
});
