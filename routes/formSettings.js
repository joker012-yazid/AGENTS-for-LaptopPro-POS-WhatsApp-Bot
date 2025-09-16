const express = require('express');
const { get, run } = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireRole('admin'), async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const row = await get(db, 'SELECT data FROM form_settings WHERE id = 1');
    const data = row ? JSON.parse(row.data) : {};
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/', requireRole('admin'), async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const payload = JSON.stringify(req.body || {});
    await run(db, 'INSERT INTO form_settings (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data=excluded.data', [payload]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
