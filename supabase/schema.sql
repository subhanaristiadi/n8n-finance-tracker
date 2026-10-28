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

-- Ringkasan dihitung di database agar tidak terpengaruh batas jumlah transaksi yang ditampilkan UI.
-- SECURITY INVOKER mempertahankan hak akses pemanggil dan kebijakan RLS.
create or replace function public.get_monthly_transaction_summary(p_month date)
returns table (
  total_pemasukan numeric,
  total_pengeluaran numeric,
  jumlah_transaksi bigint
)
language sql
stable
security invoker
set search_path = public
as $
  select
    coalesce(sum(t.jumlah) filter (where t.tipe = 'pemasukan'), 0) as total_pemasukan,
    coalesce(sum(t.jumlah) filter (where t.tipe = 'pengeluaran'), 0) as total_pengeluaran,
    count(*) as jumlah_transaksi
  from public.transactions as t
  where t.user_id = (select auth.uid())
    and t.tanggal >= date_trunc('month', p_month)::date
    and t.tanggal < (date_trunc('month', p_month) + interval '1 month')::date;
$;

revoke all on function public.get_monthly_transaction_summary(date) from public;
revoke all on function public.get_monthly_transaction_summary(date) from anon;
grant execute on function public.get_monthly_transaction_summary(date) to authenticated;

-- Jangan menonaktifkan RLS dan jangan menaruh service_role key di frontend.
