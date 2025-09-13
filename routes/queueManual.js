const express = require('express');
const { all, run } = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireRole('admin', 'kaunter', 'teknikal'), async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const rows = await all(db, 'SELECT * FROM queue_manual WHERE status != "done" ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/resolve', requireRole('admin', 'kaunter', 'teknikal'), async (req, res, next) => {
  try {
    const db = req.app.get('db');
    const id = req.params.id;
    await run(
      db,
      'UPDATE queue_manual SET handled_by = ?, handled_at = datetime("now"), status = "done" WHERE id = ?',
      [req.user.roles[0] || null, id]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
