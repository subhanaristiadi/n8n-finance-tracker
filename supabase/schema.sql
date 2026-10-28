-- Jalankan di Supabase SQL Editor pada project baru.
-- RLS membatasi semua transaksi ke pemilik data yang sedang login.

create extension if not exists pgcrypto;

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tanggal date not null default (now() at time zone 'Asia/Makassar')::date,
  tipe text not null check (tipe in ('pemasukan', 'pengeluaran')),
  jumlah numeric(14,2) not null check (jumlah > 0),
  deskripsi text not null check (char_length(trim(deskripsi)) between 1 and 500),
  kategori text not null check (kategori in ('Makanan', 'Transport', 'Belanja', 'Tagihan', 'Gaji', 'Lainnya')),
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, tanggal desc, created_at desc);

alter table public.transactions enable row level security;

drop policy if exists "Users can read their own transactions" on public.transactions;
create policy "Users can read their own transactions"
  on public.transactions for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own transactions" on public.transactions;
create policy "Users can insert their own transactions"
  on public.transactions for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own transactions" on public.transactions;
create policy "Users can update their own transactions"
  on public.transactions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own transactions" on public.transactions;
create policy "Users can delete their own transactions"
  on public.transactions for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Jangan menonaktifkan RLS dan jangan menaruh service_role key di frontend.
