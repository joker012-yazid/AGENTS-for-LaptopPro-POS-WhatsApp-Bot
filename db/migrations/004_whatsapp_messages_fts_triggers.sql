CREATE TRIGGER IF NOT EXISTS whatsapp_messages_ai
AFTER INSERT ON whatsapp_messages
BEGIN
  INSERT INTO whatsapp_messages_fts(rowid, text)
  VALUES (new.id, COALESCE(new.text, ''));
END;

CREATE TRIGGER IF NOT EXISTS whatsapp_messages_ad
AFTER DELETE ON whatsapp_messages
BEGIN
  DELETE FROM whatsapp_messages_fts WHERE rowid = old.id;
END;

CREATE TRIGGER IF NOT EXISTS whatsapp_messages_au
AFTER UPDATE ON whatsapp_messages
BEGIN
  DELETE FROM whatsapp_messages_fts WHERE rowid = old.id;
  INSERT INTO whatsapp_messages_fts(rowid, text)
  VALUES (new.id, COALESCE(new.text, ''));
END;

INSERT INTO whatsapp_messages_fts(whatsapp_messages_fts) VALUES('rebuild');
