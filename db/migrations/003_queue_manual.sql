CREATE TABLE IF NOT EXISTS queue_manual (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  remote_jid TEXT NOT NULL,
  last_text TEXT,
  reason TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  handled_by TEXT,
  handled_at TEXT,
  status TEXT DEFAULT 'pending'
);
