# AGENTS for LaptopPro POS + WhatsApp Bot (BM)

> **Tujuan ringkas**  
> Aplikasi POS + WhatsApp Bot untuk kedai servis komputer & CCTV. Bot guna **Baileys** + **Dialogflow**, backend **Node.js/Express**, DB **SQLite**, frontend **HTML/CSS/JS**. Aplikasi berada dalam LXC Debian (Proxmox), web di port **3000** (LAN).

---

## Struktur Repo
bot/ # Kod Baileys + integrasi Dialogflow
db/ # SQLite: fail .sqlite, migrations/, seeds/
routes/ # Express routes (POS, invoices, reports, backup, settings, public form)
public/ # CSS & JS statik
views/ # HBS/ejs/HTML jika ada
scripts/ # util skrip (seed/setup)
storage/wa-media/ # media WhatsApp (tahun/bulan) - diabaikan dari git
logs/ # log server/bot
install.sh # pemasangan automatik Debian
server.js # app utama Express
README.md
AGENTS.md # (fail ini) panduan khusus untuk ejen

## Cara Jalan (Dev)
- **Kebergantungan**: Node 18+ (atau 20+), `sqlite3`.  
- **Pasang**: `npm ci`  
- **Migrate**: `npm run db:migrate`  → jalankan semua `db/migrations/*.sql` (urut menaik)  
- **Seed demo**: `npm run db:seed`   → masukkan pelanggan & tiket contoh  
- **Mula dev**: `npm run dev` (port **3000**)  
- **Bot WA**: `npm run bot` → imbas QR di terminal  
- **Lint**: `npm run lint`  
- **Test**: `npm test`

> Jika guna **Codex Web**, ejen akan jalankan arahan di atas dalam *sandbox* atau VM projek; simpan semua perubahan sebagai PR/diff untuk semakan.

## Persekitaran (.env)
Letak `.env` (jangan commit):
PORT=3000
NODE_ENV=development

SQLite

SQLITE_PATH=./db/app.sqlite

WhatsApp / Baileys

WA_MEDIA_DIR=./storage/wa-media
WA_AUTH_DIR=./auth # folder multi-file creds (gitignore)

Dialogflow (ES/CX) – set salah satu

DIALOGFLOW_PROJECT_ID=your-gcp-project
DIALOGFLOW_LANG=ms
GOOGLE_APPLICATION_CREDENTIALS=./google-sa.json # service account key (gitignore)

Invois/PDF

PDF_THEME=laptoppro

## Konvensyen Kod
- **Express**: setiap modul route di `routes/` — *pure handlers* + validasi; logik berat di `services/`.  
- **DB access**: modul `db/index.js` sediakan `get('db')` pada `app`. Gunakan *prepared statements*.  
- **Migrations**: fail bernombor `001_*.sql`, `002_*.sql` … (idempotent).  
- **Logging**: **pino** (server & bot), keluaran ke `logs/`.  
- **I18N**: UI Bahasa Melayu penuh; label borang boleh ubah via `/api/form-settings`.  
- **WhatsApp**: simpan mesej di `whatsapp_messages` + FTS5 untuk carian teks. Media dimuat turun ke `storage/wa-media/<tahun>/`.

## Guardrails (SANGAT PENTING)
- **JANGAN** ubah skema tanpa tambah migration baharu.  
- **JANGAN** sentuh `auth/`, `google-sa.json`, `storage/wa-media/` dalam PR (kecuali tambah ke `.gitignore`).  
- **JANGAN** padam test sedia ada. Jika rosak, **tambah** test pembetulan.  
- **JANGAN** tulis kredensial ke kod.  
- **WAJIB** pastikan semua endpoint ada **validation & error handling** + status code yang betul.  
- **WAJIB** kekalkan gaya BM di UI (label, mesej, butang).  
- **WAJIB** semak `AGENTS.md` dan **README.md** sebelum menjalankan arahan.

## Tugas Utama (Prioriti)
1. **Backup**  
   - `GET /api/backup/customers.xlsx?from&to` → Excel pelanggan + tiket terkini (ExcelJS, *streaming*).  
   - `GET /api/backup/issues.zip?from&to&ticket&jid&search&hasMedia` → ZIP perbualan WhatsApp (archiver, FTS5, media).  
2. **Dialogflow** (ES/CX) – integrasi bot  
   - `services/dialogflow.js` – klien `detectIntent(text, session, lang)`  
   - `bot/handlers/intent.js` – pemetaan intent (Semak Status, Minta Invois, Waktu Operasi, Alamat).  
   - Jika intent tak padan/keluar domain → **letak dalam Queue “Perlu Balasan Manusia”**.  
3. **UI “Backup” & “Form Settings”** (sudah wujud di preview) – sambung ke API sebenar.  
4. **Role-based access** (admin/kaunter/teknikal) – middleware `requireRole`.

## Penerimaan (Acceptance)
- Semua endpoint baru **ada test** (Jest + Supertest), dan lulus CI.  
- Fail besar (Excel/ZIP) **stream** tanpa memori melonjak.  
- Fallback demo (CSV) dikeluarkan apabila API sudah siap.  
- Bot auto reconnect bila terputus (kecuali `loggedOut`).  
- “Perlu Balasan Manusia” muncul di Dashboard bila intent = `OUT_OF_SCOPE`.

## Perintah NPM Disyorkan
Tambahkan dalam `package.json`:
```json
{
  "scripts": {
    "dev": "node server.js",
    "bot": "node bot/start.js",
    "db:migrate": "node scripts/run-migrations.js",
    "db:seed": "node scripts/seed.js",
    "lint": "eslint .",
    "test": "jest --runInBand"
  }
}
Testing

Unit: servis util & DB.

API: Supertest untuk routes/backup & routes/invoices.

Bot: simulasi messages.upsert (mock Baileys) untuk pastikan logger tulis DB + fail media (boleh mock stream).

Fail Rujukan

db/migrations/005_whatsapp_messages.sql – jadual mesej WA + index + FTS5

db/migrations/006_views_and_seed.sql – view v_customer_ticket_lastmsg + seed demo

routes/backup.js – Excel & ZIP (stream)

bot/messageLogger.js, bot/start.js – listener Baileys + auto-reconnect

routes/settings.js, routes/public.js – tetapan & borang public

Nota untuk Codex

Rujuk AGENTS.md ini dulu bila buat keputusan struktur.

Jika jumpa konflik skema, cipta migration baru + migrasi ke hadapan.

Jangan ubah kandungan PDF templat (invois) — hanya logik render & data binding.

Pastikan semua label UI kekal BM, kecuali kata teknikal (ID, API, JSON).
