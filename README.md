# RESIK - Platform Pengelolaan Sampah Terpadu

Sistem pengelolaan layanan persampahan untuk desa Sukoanyar, Kidangbang, dan Sukolilo — absensi petugas dengan verifikasi wajah, penarikan iuran, notifikasi WhatsApp otomatis, dan rekapitulasi keuangan.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **PostgreSQL** via Prisma ORM
- **Auth.js** (NextAuth v5) — 3 role: Admin, Petugas Penarik Iuran, Petugas Pengambil Sampah
- **face-api.js** — verifikasi wajah saat absensi (client-side, deskriptor dicocokkan di server)
- **whatsapp-web.js** — dijalankan sebagai proses terpisah di `whatsapp-service/`, lihat README di folder tersebut

## Setup lokal

```bash
npm install
cp .env.example .env   # isi DATABASE_URL, AUTH_SECRET, CRON_SECRET
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Akun seed: `admin@resik.local`, `penarik@resik.local`, `sampah@resik.local` (password `admin123`).

## Struktur

- `src/app/(admin|petugas-penarik|petugas-sampah)` — halaman per role
- `src/lib/actions` — Server Actions (mutasi data)
- `src/lib/queries` — query read-only
- `whatsapp-service/` — service Node.js terpisah untuk kirim WhatsApp (butuh setup manual di VPS, lihat README di dalamnya)

## Deploy

Nginx reverse proxy + PM2 di VPS. App berjalan di port lokal (lihat `.env` produksi), diekspos lewat subdomain via Nginx — port app sendiri tidak dibuka langsung ke publik.
