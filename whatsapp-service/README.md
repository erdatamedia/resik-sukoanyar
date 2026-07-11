# RESIK WhatsApp Service

Proses Node.js terpisah dari app Next.js utama — menjalankan sesi WhatsApp Web (via `whatsapp-web.js`) dan mengekspos endpoint HTTP internal untuk mengirim pesan.

## Setup (VPS)

```bash
npm install          # akan mengunduh Chromium via Puppeteer (~120MB)
cp .env.example .env # isi PORT (pastikan belum dipakai proses lain) dan SERVICE_TOKEN acak
npm start
```

Saat pertama kali jalan, QR code akan muncul di terminal — scan dengan WhatsApp di nomor khusus (bukan nomor pribadi pengurus). Sesi tersimpan di `.wwebjs_auth/` dan persisten setelah itu (tidak perlu scan ulang kecuali logout/ganti device).

Setelah jalan, daftarkan sebagai proses PM2 supaya tetap hidup:

```bash
pm2 start "npm start" --name resik-whatsapp-service
pm2 save
```

## Endpoint

- `GET /health` — `{ ready: boolean }`
- `POST /send` — body `{ to, message }`, header `Authorization: Bearer <SERVICE_TOKEN>`

Di sisi app Next.js, set `WHATSAPP_SERVICE_URL` (mis. `http://localhost:4001`) dan `WHATSAPP_SERVICE_TOKEN` (harus sama dengan `SERVICE_TOKEN` di sini).
