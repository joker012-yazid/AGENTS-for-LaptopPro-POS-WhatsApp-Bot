CREATE TABLE IF NOT EXISTS form_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  data TEXT
);

INSERT OR IGNORE INTO form_settings (id, data) VALUES (1, '{}');
