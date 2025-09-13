## Ringkasan
<!-- Terangkan tujuan PR ini secara ringkas (BM). -->

## Perubahan Utama
- [ ] Backend (routes/services/db)
- [ ] Bot WhatsApp (Baileys/Dialogflow)
- [ ] UI (Dashboard/Form Settings/Backup)
- [ ] Migration DB baharu
- [ ] Lain-lain: ________

## Cara Uji
1. `npm ci`
2. `node scripts/run-migrations.js`
3. (Jika perlu) `node scripts/seed.js`
4. `npm test`
5. Manual:
   - `GET /api/backup/customers.xlsx?from=YYYY-MM-DD&to=YYYY-MM-DD`
   - `GET /api/backup/issues.zip?search=test&hasMedia=1`

## Checklist Kualiti
- [ ] Lulus **lint** & **test** (CI hijau)
- [ ] Migration **idempotent** & tidak memadam data
- [ ] Endpoint baharu ada **error handling** & **status code** betul
- [ ] UI Bahasa Melayu (label/teks butang)
- [ ] Tiada kredensial / data sensitif dalam kod/commit
- [ ] Dikemaskini `AGENTS.md` / `README.md` jika perlu

## Risiko & Pelan Rollback
- Risiko: __________
- Rollback: revert PR / `down` migration (jika ada)

## Tangkapan Skrin / Artefak (jika relevan)
<!-- Letak screenshot/loom/zip contoh export -->
