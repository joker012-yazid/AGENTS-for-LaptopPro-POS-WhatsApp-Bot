const EventEmitter = require('events');
const { detectIntent } = require('../services/dialogflow');
const { handleIntent } = require('./handlers/intent');

function messageRouter(sock, db) {
  if (!sock.ev) sock.ev = new EventEmitter();
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      const text = msg.message?.conversation || '';
      const jid = msg.key.remoteJid;
      try {
        const lang = process.env.DIALOGFLOW_LANG || 'ms';
        const result = await detectIntent(text, jid, lang);
        const reply = await handleIntent(result, { db, remoteJid: jid });
        if (reply) {
          await sock.sendMessage(jid, { text: reply });
        }
      } catch (err) {
        console.error(err);
      }
    }
  });
  return sock.ev;
}
module.exports = messageRouter;
