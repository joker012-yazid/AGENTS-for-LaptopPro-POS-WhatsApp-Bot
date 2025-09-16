const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('supertest');
const JSZip = require('jszip');
const createApp = require('../app');
const { createDb, exec, run } = require('../db');

async function setupDb() {
  const db = createDb(':memory:');
  const dir = path.join(__dirname, '..', 'db', 'migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    await exec(db, sql);
  }
  const now = new Date().toISOString();
  await run(db, 'INSERT INTO customers (id, name, phone, wa_jid) VALUES (1,?,?,?)', ['Ali', '0123456789', '1@s.whatsapp.net']);
  await run(
    db,
    'INSERT INTO tickets (id, customer_id, device_type, brand, problem_text, status, created_at) VALUES (1,1,?,?,?,?,?)',
    ['Laptop', 'Dell', 'No Power', 'open', now]
  );
  await run(
    db,
    'INSERT INTO whatsapp_messages (id, ticket_id, remote_jid, text, media_path, created_at) VALUES (1,1,?,?,?,?)',
    ['1@s.whatsapp.net', 'Hello', null, now]
  );
  return db;
}

describe('backup endpoints', () => {
  let app;
  let db;
  beforeAll(async () => {
    db = await setupDb();
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
        res.on('data', chunk => {
          res.data += chunk;
        });
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

  test('filters issues by search and media flag', async () => {
    const now = new Date().toISOString();
    const mediaPath = path.join(os.tmpdir(), 'laptoppro-resit.jpg');
    fs.writeFileSync(mediaPath, 'dummy');
    await run(
      db,
      'INSERT INTO whatsapp_messages (id, ticket_id, remote_jid, text, media_path, created_at) VALUES (2,1,?,?,?,?)',
      ['1@s.whatsapp.net', 'Sila lihat gambar resit', mediaPath, now]
    );
    await run(
      db,
      'INSERT INTO whatsapp_messages (id, ticket_id, remote_jid, text, media_path, created_at) VALUES (3,1,?,?,?,?)',
      ['1@s.whatsapp.net', 'Tiada lampiran', null, now]
    );

    const res = await request(app)
      .get('/api/backup/issues.zip')
      .query({ search: 'gambar', hasMedia: 'true' })
      .set('x-token', 'admin-token')
      .buffer()
      .parse((stream, cb) => {
        const chunks = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => cb(null, Buffer.concat(chunks)));
      });

    expect(res.status).toBe(200);
    const zip = await JSZip.loadAsync(res.body);
    const issuesJson = JSON.parse(await zip.file('issues.json').async('string'));
    expect(issuesJson.count).toBe(1);
    expect(issuesJson.messages[0].text).toMatch(/gambar resit/);

    const ndjson = await zip.file('chats/ticket-1.ndjson').async('string');
    const lines = ndjson.trim().split('\n');
    expect(lines).toHaveLength(1);
    const message = JSON.parse(lines[0]);
    expect(message.media_path).toBe(mediaPath);

    const fileName = path.basename(mediaPath);
    expect(zip.file(`media/ticket-1/${fileName}`)).toBeTruthy();

    fs.rmSync(mediaPath, { force: true });
  });
});
