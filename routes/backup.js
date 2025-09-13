const express = require('express');
const ExcelJS = require('exceljs');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');
const { all } = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/customers.xlsx', requireRole('admin', 'teknikal'), async (req, res, next) => {
  const db = req.app.get('db');
  const from = req.query.from || null;
  const to = req.query.to || null;
  try {
    const rows = await all(db,
      `SELECT customer_id, name, phone, wa_jid, latest_ticket, device_type, brand, problem_text, status, ticket_created_at
       FROM v_customer_latest_ticket
       WHERE (? IS NULL OR ticket_created_at >= ?)
         AND (? IS NULL OR ticket_created_at <= ?)`,
      [from, from, to, to]
    );
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="customers.xlsx"');
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
    const sheet = workbook.addWorksheet('customers');
    sheet.columns = [
      { header: 'customer_id', key: 'customer_id' },
      { header: 'name', key: 'name' },
      { header: 'phone', key: 'phone' },
      { header: 'wa_jid', key: 'wa_jid' },
      { header: 'latest_ticket', key: 'latest_ticket' },
      { header: 'device_type', key: 'device_type' },
      { header: 'brand', key: 'brand' },
      { header: 'problem_text', key: 'problem_text' },
      { header: 'status', key: 'status' },
      { header: 'ticket_created_at', key: 'ticket_created_at' }
    ];
    rows.forEach(r => sheet.addRow(r).commit());
    await sheet.commit();
    await workbook.commit();
  } catch (err) {
    next(err);
  }
});

router.get('/issues.zip', requireRole('admin', 'teknikal'), async (req, res, next) => {
  const db = req.app.get('db');
  const { from, to, ticket, jid, search, hasMedia } = req.query;
  try {
    const params = [];
    let sql = 'SELECT * FROM whatsapp_messages wm';
    if (search) {
      sql += ' JOIN whatsapp_messages_fts fts ON wm.id = fts.rowid';
    }
    sql += ' WHERE 1=1';
    if (from) { sql += ' AND wm.created_at >= ?'; params.push(from); }
    if (to) { sql += ' AND wm.created_at <= ?'; params.push(to); }
    if (ticket) { sql += ' AND wm.ticket_id = ?'; params.push(ticket); }
    if (jid) { sql += ' AND wm.remote_jid = ?'; params.push(jid); }
    if (search) { sql += ' AND fts.text MATCH ?'; params.push(search); }
    if (hasMedia === 'true') { sql += ' AND wm.media_path IS NOT NULL'; }

    const rows = await all(db, sql, params);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="issues.zip"');

    const archive = archiver('zip');
    archive.on('error', err => { throw err; });
    archive.pipe(res);

    const issues = {
      params: { from, to, ticket, jid, search, hasMedia },
      count: rows.length,
      messages: rows.map(r => ({ id: r.id, ticket_id: r.ticket_id, remote_jid: r.remote_jid, text: r.text, media_path: r.media_path, created_at: r.created_at }))
    };
    archive.append(JSON.stringify(issues, null, 2), { name: 'issues.json' });

    const groups = {};
    rows.forEach(m => {
      const key = m.ticket_id ? `ticket-${m.ticket_id}` : `jid-${m.remote_jid}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    Object.keys(groups).forEach(key => {
      const lines = groups[key].map(m => JSON.stringify(m)).join('\n');
      archive.append(lines + '\n', { name: `chats/${key}.ndjson` });
    });

    for (const m of rows) {
      if (m.media_path) {
        const key = m.ticket_id ? `ticket-${m.ticket_id}` : `jid-${m.remote_jid}`;
        const fileName = path.basename(m.media_path);
        if (fs.existsSync(m.media_path)) {
          archive.file(m.media_path, { name: `media/${key}/${fileName}` });
        }
      }
    }

    await archive.finalize();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
