const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const { createDb, exec, run, all } = require('../db');

jest.mock('../services/dialogflow', () => ({ detectIntent: jest.fn() }));
const { detectIntent } = require('../services/dialogflow');
const messageRouter = require('../bot/messageRouter');

describe('messageRouter', () => {
  test('responds with ticket status', async () => {
    const db = createDb(':memory:');
    const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'migrations', '001_init.sql'), 'utf8');
    await exec(db, sql);
    await run(db, 'INSERT INTO customers (id, name, phone, wa_jid) VALUES (1, "Ali", "012", "1@s.whatsapp.net")');
    await run(db, 'INSERT INTO tickets (id, customer_id, device_type, brand, problem_text, status, created_at) VALUES (1,1,\'laptop\',\'Dell\',\'rosak\',\'Selesai\',\'2025-09-01\')');

    detectIntent.mockResolvedValue({
      queryText: 'semak status LP-250901-0001',
      intent: { displayName: 'Semak Status' },
      parameters: { fields: { ticket_id: { stringValue: 'LP-250901-0001' } } }
    });

    const sock = { ev: new EventEmitter(), sendMessage: jest.fn().mockResolvedValue() };
    messageRouter(sock, db);

    sock.ev.emit('messages.upsert', { messages: [{ key: { remoteJid: '1@s.whatsapp.net' }, message: { conversation: 'semak status LP-250901-0001' } }] });
    await new Promise(r => setTimeout(r, 10));

    expect(sock.sendMessage).toHaveBeenCalledTimes(1);
    const [, msg] = sock.sendMessage.mock.calls[0];
    expect(msg.text).toMatch(/Selesai/);
  });

  test('queues unknown intent to database', async () => {
    const db = createDb(':memory:');
    const migration1 = fs.readFileSync(path.join(__dirname, '..', 'db', 'migrations', '001_init.sql'), 'utf8');
    await exec(db, migration1);
    const migration3 = fs.readFileSync(path.join(__dirname, '..', 'db', 'migrations', '003_queue_manual.sql'), 'utf8');
    await exec(db, migration3);

    detectIntent.mockResolvedValue({ queryText: 'hello', intent: { displayName: 'Unknown' } });

    const sock = { ev: new EventEmitter(), sendMessage: jest.fn().mockResolvedValue() };
    messageRouter(sock, db);

    sock.ev.emit('messages.upsert', { messages: [{ key: { remoteJid: '1@s.whatsapp.net' }, message: { conversation: 'hello' } }] });
    await new Promise(r => setTimeout(r, 10));

    const rows = await all(db, 'SELECT * FROM queue_manual');
    expect(rows.length).toBe(1);
    expect(rows[0].remote_jid).toBe('1@s.whatsapp.net');
  });
});
