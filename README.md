# AGENTS-for-LaptopPro-POS-WhatsApp-Bot

[![Node CI](https://github.com/joker012-yazid/AGENTS-for-LaptopPro-POS-WhatsApp-Bot/actions/workflows/node-ci.yml/badge.svg)](../../actions/workflows/node-ci.yml)

Aplikasi POS + WhatsApp Bot untuk kedai servis komputer & CCTV. Bot guna **Baileys** + **Dialogflow**, backend **Node.js/Express**, DB **SQLite**, frontend **HTML/CSS/JS**. Di-deploy dalam **LXC Debian (Proxmox)**, web di port **3000** (LAN).

> **Fokus:** Terima & balas mesej WhatsApp, simpan pelanggan/tiket/mesyuarat, POS & invois PDF, dashboard, backup Excel/ZIP, dan integrasi Dialogflow.

---

## 👀 Kandungan
- [Ciri Utama](#-ciri-utama)
- [Struktur Projek](#-struktur-projek)
- [Keperluan](#-keperluan)
- [Persediaan Cepat](#-persediaan-cepat)
- [Konfigurasi (.env)](#-konfigurasi-env)
- [Skrip NPM](#-skrip-npm)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Endpoint Penting](#-endpoint-penting)
- [Nota WhatsApp Bot](#-nota-whatsapp-bot)
- [Guna Codex Web](#-guna-codex-web)
- [Backup & Restore](#-backup--restore)
- [Pembangunan & Ujian](#-pembangunan--ujian)
- [Sumbangan (Contributing)](#-sumbangan-contributing)
- [Lesen](#-lesen)

---

## ✅ Ciri Utama
- Bot WhatsApp (Baileys) dengan auto–reconnect, logging mesej & media → SQLite.
- POS: pelanggan, produk/kategori, transaksi, invois PDF (templat hbs), butang **Hantar ke WhatsApp**.
- Dashboard graf & kad statistik, laporan bulanan.
- Borang intake pelanggan + QR akses, **Form Settings** (edit tajuk/label/logo/terms).
- **Backup**:
  - `customers.xlsx` (ExcelJS, streaming)
  - `issues.zip` (archiver: chats NDJSON + issues.json + media)

## 🗂️ Struktur Projek
bot/ # Baileys + router intent Dialogflow
db/ # SQLite DB, migrations/, seeds/
routes/ # API (backup, invoices, settings, auth, dsb.)
public/ # CSS/JS statik
views/ # Templat (jika guna HBS)
scripts/ # run-migrations, seed, setup-dev
storage/wa-media/ # media WhatsApp (ignored)
logs/ # log aplikasi
server.js # app utama (port 3000)
AGENTS.md # panduan ejen Codex

## 🧰 Keperluan
- Node.js 18/20+, npm
- SQLite
- (CI/Build) kebergantungan native untuk `better-sqlite3` (python3, make, g++)  
- (WhatsApp) telefon untuk imbas QR

## 🖼️ Screenshots

| Dashboard | Backup | Form Settings |
| --- | --- | --- |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Backup](docs/screenshots/backup.png) | ![Form Settings](docs/screenshots/form-settings.png) |

## ⚡ Persediaan cepat

```bash
npm ci
node scripts/run-migrations.js
node scripts/seed.js   # pilihan (data demo)
cp .env.example .env   # edit nilai ikut persekitaran
```

🔧 Konfigurasi (.env)
```
PORT=3000
SQLITE_PATH=./db/app.sqlite

# WhatsApp
WA_MEDIA_DIR=./storage/wa-media
WA_AUTH_DIR=./auth

# Dialogflow
DIALOGFLOW_PROJECT_ID=
DIALOGFLOW_LANG=ms
GOOGLE_APPLICATION_CREDENTIALS=./google-sa.json
```

🏃 Skrip NPM
```
"scripts": {
  "dev": "node server.js",
  "bot": "node bot/start.js",
  "db:migrate": "node scripts/run-migrations.js",
  "db:seed": "node scripts/seed.js",
  "lint": "eslint .",
  "test": "jest --runInBand"
}
```

▶️ Menjalankan Aplikasi
```
npm run dev      # web UI di http://localhost:3000
npm run bot      # terminal akan papar QR → imbas dengan WhatsApp
```

🔗 Endpoint Penting
- Backup
  - `GET /api/backup/customers.xlsx?from=YYYY-MM-DD&to=YYYY-MM-DD`
  - `GET /api/backup/issues.zip?from&to&ticket&jid&search&hasMedia`
- Form Settings
  - `GET /api/form-settings / POST /api/form-settings`
- Invois
  - `GET /api/invoices/:id/pdf` (preview sebelum “Hantar ke WhatsApp”)

Fail besar (XLSX/ZIP) dihantar secara streaming dan di-download dengan header yang sesuai (status badge di atas memantau CI untuk elak pecah). 

💬 Nota WhatsApp Bot
- Event utama: `messages.upsert` → simpan mesej ke `whatsapp_messages` (FTS5 untuk carian).
- `downloadMediaMessage()` digunakan untuk media; simpan ke `storage/wa-media/<tahun>/`.
- Regex tiket: `LP-YYMMDD-XXXX` (tautkan mesej ↔ tiket).
- Out-of-scope intent → masuk Queue “Perlu Balasan Manusia”.

🤖 Guna Codex Web
- Repo ini mengandungi `AGENTS.md` sebagai panduan ejen (tugas, SOP, guardrails).
- Di Codex Web, jalankan Setup script (npm ci → migrasi → test) dan gunakan task prompts yang disediakan dalam `AGENTS.md`.
- Tambah status badge di README untuk pantau CI (Actions → pilih workflow → Create status badge). 
  GitHub Docs

🧩 Backup & Restore
- Excel pelanggan: view `v_customer_latest_ticket` → ExcelJS `.xlsx`
- ZIP perbualan WA: `issues.json` + `chats/*.ndjson` + `media/*` (archiver)
- Media & `auth/` jangan commit (ada dalam `.gitignore`)

🧪 Pembangunan & Ujian
- Ujian API dengan Jest + Supertest.
- CI: `.github/workflows/node-ci.yml` (Node 18/20, migrasi, lint, test).
  Status ditunjuk oleh badge di atas. 

🤝 Sumbangan (Contributing)
- Buka branch → PR ke `main`. PR mesti lulus Node CI.
- Ikut garis panduan di `CONTRIBUTING.md` (jika wujud). Seksyen Contributing dalam README ialah amalan disyorkan. 

📜 Lesen
Tentukan lesen (contoh: MIT/Apache-2.0). Tambah fail `LICENSE`.
MIT License

Copyright (c) 2025 joker012-yazid

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

### Kenapa ini cukup?
- GitHub mengesyorkan README menerangkan kegunaan & cara guna projek—termasuk cara pasang dan jalankan. Rujuk “About the repository README file”.  
  Lihat: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes
- Meletakkan **status badge** GitHub Actions di README ialah amalan lazim untuk memantau CI.  
  Lihat: https://docs.github.com/actions/managing-workflow-runs/adding-a-workflow-status-badge
- Struktur/sekysen adalah seiring panduan umum seperti **Standard Readme** dan **Make a README**.  
  Lihat: https://github.com/RichardLitt/standard-readme , https://www.makeareadme.com/
- GitHub juga **jana TOC automatik** bila ada ≥2 heading (ikon “list” di atas README).  
  Lihat: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes
