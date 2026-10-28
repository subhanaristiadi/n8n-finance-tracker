# Setup dan pengujian aplikasi web

## 1. Supabase

1. Buat project Supabase.
2. Jalankan seluruh SQL pada `supabase/schema.sql` di SQL Editor.
3. Pastikan tabel `public.transactions` muncul di Table Editor dan RLS aktif.
4. Ambil Project URL dan publishable key dari pengaturan API project. Untuk project lama, anon key dapat digunakan.
5. Jangan pernah menggunakan `service_role` key pada aplikasi browser.

### Authentication

Pada Supabase Authentication, pilih metode Email sesuai kebutuhan. Jika **Confirm email** aktif, pendaftaran dapat memerlukan klik tautan konfirmasi sebelum sesi login tersedia. Untuk deployment, atur Site URL dan Redirect URLs agar sesuai dengan domain produksi dan lokal yang digunakan.

## 2. Environment lokal

Buat file `.env.local` berdasarkan `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

Kemudian:

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Jika variabel environment diubah ketika server berjalan, restart server.

## 3. Checklist pengujian

Lakukan menggunakan dua akun uji yang berbeda. Jangan memakai data keuangan sensitif untuk pengujian awal.

- [ ] Halaman menampilkan panduan setup jika environment Supabase belum diisi.
- [ ] Pengguna dapat mendaftar dan masuk.
- [ ] Pesan konfirmasi email ditampilkan jika Supabase belum langsung membuat sesi.
- [ ] Pengeluaran dapat disimpan dengan tanggal, jumlah, deskripsi, dan kategori yang valid.
- [ ] Pemasukan dapat disimpan.
- [ ] Jumlah nol atau negatif ditolak oleh UI dan database.
- [ ] Tipe dan kategori di luar closed list ditolak oleh database constraint.
- [ ] Ringkasan bulanan menjumlahkan pemasukan dan pengeluaran dengan benar.
- [ ] Mengubah bulan memperbarui ringkasan dan riwayat.
- [ ] Filter pemasukan/pengeluaran bekerja.
- [ ] Pengguna dapat menghapus transaksinya sendiri setelah konfirmasi.
- [ ] Akun A tidak dapat membaca, mengubah, atau menghapus data akun B melalui API Supabase.
- [ ] Setelah logout lalu login kembali, data akun yang benar dimuat.
- [ ] Aplikasi tetap usable pada ukuran layar ponsel.
- [ ] `npm run build` berhasil sebelum deployment.

## 4. Deployment Vercel

1. Import repository GitHub ke Vercel.
2. Tambahkan environment variables yang sama pada project Vercel.
3. Deploy dan periksa build log.
4. Atur URL auth di Supabase untuk domain Vercel yang digunakan.
5. Jalankan checklist pengujian pada domain deployment, bukan hanya di localhost.

## Catatan implementasi

- Dashboard mengambil maksimal 500 transaksi terbaru milik akun yang sedang login. Ringkasan bulanan dihitung dari hasil tersebut. Jika kebutuhan data tumbuh melampaui 500 transaksi, pindahkan agregasi ke query/view/RPC database atau paginasi agar total bulanan tetap akurat.
- Tanggal ditampilkan menggunakan tanggal kalender dari database; aplikasi belum memiliki dukungan multi-currency.
- Input jumlah saat ini berupa bilangan bulat rupiah di UI, walaupun kolom database mendukung dua angka desimal.
- Belum ada fitur edit transaksi, ekspor CSV, pencarian deskripsi, atau pengaturan anggaran.
- Source sudah ditambahkan ke repository, tetapi build dan uji integrasi perlu dijalankan setelah clone pada environment yang memiliki Node.js dan project Supabase.
