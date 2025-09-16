CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT,
  phone TEXT,
  wa_jid TEXT
);

CREATE TABLE tickets (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  device_type TEXT,
  brand TEXT,
  problem_text TEXT,
  status TEXT,
  created_at TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE whatsapp_messages (
  id INTEGER PRIMARY KEY,
  ticket_id INTEGER,
  remote_jid TEXT,
  text TEXT,
  media_path TEXT,
  created_at TEXT
);

CREATE VIRTUAL TABLE whatsapp_messages_fts USING fts5(text, content='whatsapp_messages', content_rowid='id');

CREATE VIEW v_customer_latest_ticket AS
  SELECT c.id AS customer_id, c.name, c.phone, c.wa_jid,
         t.id AS latest_ticket, t.device_type, t.brand,
         t.problem_text, t.status, t.created_at AS ticket_created_at
  FROM customers c
  LEFT JOIN tickets t ON t.id = (
    SELECT id FROM tickets t2 WHERE t2.customer_id = c.id ORDER BY t2.created_at DESC LIMIT 1
  );
