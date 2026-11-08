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
- [ ] Ringkasan bulanan menjumlahkan pemasukan dan pengeluaran dengan benar, termasuk saat jumlah transaksi lebih dari 500.
- [ ] RPC `get_monthly_transaction_summary` berhasil dipanggil oleh akun authenticated dan tidak mengembalikan transaksi akun lain.
- [ ] Mengubah bulan memperbarui ringkasan, riwayat, dan saldo awal bulan tersebut.
- [ ] Saldo awal dapat diisi manual dan disimpan, lalu tetap tersedia setelah refresh/login ulang.
- [ ] Tombol ambil saldo bulan lalu menghitung saldo akhir bulan sebelumnya (saldo awal + pemasukan - pengeluaran) dan menyimpannya sebagai saldo awal bulan aktif.
- [ ] Saldo akhir sama dengan saldo awal + total pemasukan - total pengeluaran.
- [ ] Bulan pertama tanpa saldo awal tersimpan menggunakan saldo awal Rp0 sampai pengguna mengisinya.
- [ ] Saldo awal dan saldo akhir tercantum pada ekspor Excel (`.xlsx`).
- [ ] Filter pemasukan/pengeluaran bekerja.
- [ ] Pengguna dapat mengedit tanggal, jumlah, deskripsi, dan kategori transaksinya sendiri.
- [ ] Simpan edit menjalankan `UPDATE` ke `public.transactions` dengan filter `id` transaksi dan `user_id` pengguna aktif.
- [ ] Setelah edit berhasil, riwayat dan ringkasan bulanan dimuat ulang dari Supabase.
- [ ] Setelah browser di-refresh atau pengguna login ulang, nilai transaksi hasil edit tetap tersimpan.
- [ ] Jika tanggal transaksi dipindahkan ke bulan lain, transaksi tidak lagi muncul pada daftar bulan asal dan muncul pada daftar bulan tujuan.
- [ ] Akun A tidak dapat mengedit transaksi milik akun B melalui API Supabase.
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

- Riwayat menampilkan maksimal 500 transaksi terbaru untuk bulan yang dipilih. Total pemasukan, pengeluaran, dan jumlah transaksi dihitung melalui RPC `get_monthly_transaction_summary(date)` di PostgreSQL, sehingga total bulanan tidak dibatasi jumlah baris yang ditampilkan. Fungsi memakai `SECURITY INVOKER` dan tetap mengikuti RLS. Jalankan ulang seluruh `supabase/schema.sql` pada project yang sudah memiliki skema lama agar fungsi RPC tersedia.
- Tabel `monthly_balances` menyimpan `opening_balance` per `user_id` dan bulan (tanggal hari pertama bulan). Terapkan perubahan `supabase/schema.sql` pada project Supabase yang sudah ada sebelum menguji fitur saldo.
- Saldo akhir dihitung di aplikasi dari saldo awal + total pemasukan - total pengeluaran; tidak disimpan sebagai angka terpisah. Tombol ambil bulan sebelumnya menghitung saldo akhir bulan kalender sebelumnya lalu menyimpannya sebagai saldo awal bulan aktif.
- Tanggal ditampilkan menggunakan tanggal kalender dari database; aplikasi belum memiliki dukungan multi-currency.
- Input jumlah saat ini berupa bilangan bulat rupiah di UI, walaupun kolom database mendukung dua angka desimal.
- Belum ada ekspor CSV, pencarian deskripsi, atau pengaturan anggaran.
- Fitur edit transaksi hanya mengubah `tanggal`, `jumlah`, `deskripsi`, dan `kategori`; field `tipe`, `id`, `user_id`, dan `created_at` tidak diubah melalui form edit.
- Update transaksi dilakukan dari browser menggunakan Supabase client yang memakai sesi pengguna. Keberhasilan update bergantung pada autentikasi, privilege tabel, dan RLS `UPDATE` yang benar pada project Supabase aktif.
- Verifikasi pengguna bahwa sinkronisasi hasil edit sudah berjalan baik di Supabase; checklist tetap perlu dijalankan kembali setelah perubahan kode atau konfigurasi.
- Source sudah ditambahkan ke repository, tetapi build dan uji integrasi perlu dijalankan setelah clone pada environment yang memiliki Node.js dan project Supabase.
