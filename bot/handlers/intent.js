const { get, run } = require('../../db');

const TICKET_REGEX = /^LP-\d{6}-(\d{4})$/;

async function handleIntent(result, { db, remoteJid }) {
  const intent = result.intent && result.intent.displayName;
  switch (intent) {
    case 'Semak Status': {
      const ticketId = result.parameters?.fields?.ticket_id?.stringValue;
      const match = ticketId && ticketId.match(TICKET_REGEX);
      if (!match) {
        return 'Sila berikan ID tiket (format LP-YYMMDD-XXXX).';
      }
      const id = parseInt(match[1], 10);
      const row = await get(db, 'SELECT status FROM tickets WHERE id = ?', [id]);
      if (!row) {
        return `Tiket ${ticketId} tidak ditemui.`;
      }
      return `Status tiket ${ticketId}: ${row.status}`;
    }
    case 'Minta Invois': {
      const row = await get(db, 'SELECT t.id FROM tickets t JOIN customers c ON c.id=t.customer_id WHERE c.wa_jid=? ORDER BY t.created_at DESC LIMIT 1', [remoteJid]);
      if (!row) return 'Tiada invois dijumpai untuk anda.';
      return `Invois untuk tiket #${row.id} akan dihantar ke WhatsApp anda.`;
    }
    case 'Waktu Operasi':
      return 'Waktu operasi kami 10:00–17:00.';
    case 'Alamat Kedai':
      return 'Alamat kami: No.1 Jalan Kedai. https://maps.google.com/?q=No.1+Jalan+Kedai';
    default:
      await run(
        db,
        'INSERT INTO queue_manual (remote_jid, last_text, reason) VALUES (?,?,?)',
        [remoteJid, result.queryText, intent || 'unknown']
      );
      return null;
  }
}
module.exports = { handleIntent };
