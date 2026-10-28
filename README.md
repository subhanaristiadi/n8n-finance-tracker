# Catatan Keuangan

Aplikasi web pencatatan pemasukan dan pengeluaran pribadi menggunakan **Next.js, Supabase Auth, dan Supabase PostgreSQL**. Data disimpan online dan dapat diakses dari perangkat berbeda setelah masuk menggunakan akun yang sama.

## Fitur aplikasi

- Daftar akun dan login dengan email/password melalui Supabase Auth.
- Tambah transaksi pemasukan atau pengeluaran.
- Kategori tertutup: `Makanan`, `Transport`, `Belanja`, `Tagihan`, `Gaji`, `Lainnya`.
- Ringkasan pemasukan, pengeluaran, dan selisih bersih per bulan.
- Riwayat transaksi dengan filter tipe, serta penghapusan transaksi.
- Row Level Security (RLS) agar pengguna hanya dapat membaca dan mengelola transaksinya sendiri.
- Layout responsif untuk desktop dan ponsel.

## Teknologi

- Next.js 15 + React 19 + TypeScript
- Supabase Auth
- Supabase PostgreSQL dengan Row Level Security
- Vercel (opsi deployment)

## Jalankan secara lokal

Persyaratan: Node.js versi LTS yang kompatibel dengan Next.js dan akun Supabase.

1. Clone repository dan masuk ke folder project:

   ```bash
   git clone https://github.com/subhanaristiadi/n8n-finance-tracker.git
   cd n8n-finance-tracker
   npm install
   ```

2. Buat project Supabase di dashboard Supabase.
3. Buka **SQL Editor** pada project Supabase, lalu jalankan isi file [`supabase/schema.sql`](supabase/schema.sql).
4. Di pengaturan API project Supabase, salin Project URL dan publishable key (atau anon key lama yang masih didukung).
5. Salin `.env.example` menjadi `.env.local`, kemudian isi:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
   ```

6. Jalankan aplikasi:

   ```bash
   npm run dev
   ```

7. Buka http://localhost:3000 dan buat akun. Jika konfirmasi email aktif di Supabase, ikuti email konfirmasi sebelum login.

## Deploy ke Vercel

1. Import repository ini ke Vercel.
2. Tambahkan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` pada Environment Variables Vercel untuk environment yang digunakan.
3. Deploy. Setelah perubahan environment variables, lakukan redeploy.
4. Pada Supabase Auth URL Configuration, atur Site URL ke domain deployment dan tambahkan URL callback/redirect yang sesuai bila diperlukan.
5. Uji daftar akun, login, simpan transaksi, filter bulan, hapus transaksi, dan akses dari perangkat/browser lain.

## Skema database

Tabel `public.transactions` memiliki kolom:

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | UUID | Primary key otomatis |
| `user_id` | UUID | Pemilik transaksi; referensi ke `auth.users` |
| `tanggal` | DATE | Tanggal transaksi |
| `tipe` | TEXT | `pemasukan` atau `pengeluaran` |
| `jumlah` | NUMERIC(14,2) | Harus lebih besar dari 0 |
| `deskripsi` | TEXT | Wajib diisi, maksimal 500 karakter |
| `kategori` | TEXT | Salah satu kategori resmi |
| `created_at` | TIMESTAMPTZ | Waktu pembuatan otomatis |

Database menerapkan constraint untuk tipe, kategori, jumlah, dan deskripsi. RLS membatasi operasi berdasarkan `auth.uid() = user_id`.

## Keamanan penting

- **Jangan pernah** menaruh Supabase `service_role` key di `.env.local` frontend atau variabel yang diawali `NEXT_PUBLIC_`.
- Publishable/anon key memang digunakan di browser; keamanan data bergantung pada kebijakan RLS yang benar.
- Jangan commit file `.env.local` atau data transaksi nyata.
- Untuk produksi, pertimbangkan verifikasi email dan kebijakan kata sandi yang sesuai.

## Struktur repository

```text
app/                 UI dashboard, autentikasi, transaksi
lib/                 Supabase client dan tipe data
supabase/schema.sql  Skema tabel, constraints, index, RLS
docs/                Dokumentasi workflow dan testing
workflows/            Export n8n lama yang disanitasi (referensi)
```

Folder `workflows/` dan dokumentasi n8n lama dipertahankan sebagai referensi proyek sebelumnya. Aplikasi web ini tidak memerlukan Telegram atau n8n untuk pencatatan transaksi sehari-hari.

## Status verifikasi

Kode sumber sudah ditambahkan ke repository, tetapi belum dapat dianggap production-ready sebelum dependency install/build, konfigurasi Supabase, dan uji end-to-end dilakukan pada environment yang memiliki akses ke project Supabase. Lihat [panduan setup dan testing](docs/web-app-setup.md).
