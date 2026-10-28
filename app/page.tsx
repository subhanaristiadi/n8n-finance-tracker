"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, CalendarDays, Check, CircleDollarSign, LogOut, Plus, RefreshCw, Trash2, Wallet } from "lucide-react";
import { CATEGORIES, Transaction, TransactionCategory, TransactionType } from "@/lib/types";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
});
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export default function Home() {
  const [session, setSession] = useState<Awaited<ReturnType<NonNullable<typeof supabase>["auth"]["getSession"]>>["data"]["session"]>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [month, setMonth] = useState(today().slice(0, 7));
  const [typeFilter, setTypeFilter] = useState<"semua" | TransactionType>("semua");
  const [draft, setDraft] = useState({
    tanggal: today(),
    tipe: "pengeluaran" as TransactionType,
    jumlah: "",
    deskripsi: "",
    kategori: "Makanan" as TransactionCategory
  });

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) {
        setSession(data.session);
        setAuthReady(true);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setMessage("");
      setError("");
    });
    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const loadTransactions = useCallback(async () => {
    if (!supabase || !session?.user.id) return;
    setLoading(true);
    setError("");
    const { data, error: queryError } = await supabase
      .from("transactions")
      .select("id,user_id,tanggal,tipe,jumlah,deskripsi,kategori,created_at")
      .eq("user_id", session.user.id)
      .order("tanggal", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(500);
    if (queryError) setError(queryError.message);
    else setTransactions((data ?? []) as Transaction[]);
    setLoading(false);
  }, [session?.user.id]);

  useEffect(() => {
    if (session) void loadTransactions();
    else setTransactions([]);
  }, [session, loadTransactions]);

  const monthly = useMemo(
    () => transactions.filter((item) => item.tanggal.slice(0, 7) === month),
    [transactions, month]
  );
  const income = monthly.reduce((sum, item) => sum + (item.tipe === "pemasukan" ? Number(item.jumlah) : 0), 0);
  const expense = monthly.reduce((sum, item) => sum + (item.tipe === "pengeluaran" ? Number(item.jumlah) : 0), 0);
  const balance = income - expense;
  const visibleTransactions = monthly.filter((item) => typeFilter === "semua" || item.tipe === typeFilter);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError("");
    setMessage("");
    const result = authMode === "signup"
      ? await supabase.auth.signUp({ email: email.trim(), password })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (result.error) setError(result.error.message);
    else if (authMode === "signup" && !result.data.session) {
      setMessage("Akun dibuat. Periksa email untuk konfirmasi jika konfirmasi email diaktifkan di Supabase.");
    } else setMessage("Berhasil masuk.");
    setLoading(false);
  }

  async function handleLogout() {
    if (!supabase) return;
    const { error: logoutError } = await supabase.auth.signOut();
    if (logoutError) setError(logoutError.message);
  }

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !session?.user.id) return;
    const amount = Number(draft.jumlah);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Jumlah harus lebih besar dari 0.");
      return;
    }
    if (!draft.deskripsi.trim()) {
      setError("Deskripsi wajib diisi.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    const { error: insertError } = await supabase.from("transactions").insert({
      user_id: session.user.id,
      tanggal: draft.tanggal,
      tipe: draft.tipe,
      jumlah: amount,
      deskripsi: draft.deskripsi.trim(),
      kategori: draft.kategori
    });
    if (insertError) setError(insertError.message);
    else {
      setMessage("Transaksi berhasil disimpan.");
      setDraft({ tanggal: today(), tipe: "pengeluaran", jumlah: "", deskripsi: "", kategori: "Makanan" });
      await loadTransactions();
    }
    setSaving(false);
  }

  async function handleDelete(item: Transaction) {
    if (!supabase || !session?.user.id) return;
    if (!window.confirm(`Hapus transaksi "${item.deskripsi}"?`)) return;
    setError("");
    setMessage("");
    const { error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("id", item.id)
      .eq("user_id", session.user.id);
    if (deleteError) setError(deleteError.message);
    else {
      setMessage("Transaksi dihapus.");
      await loadTransactions();
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Catatan Keuangan">
          <span className="brand-mark"><Wallet size={21} /></span>
          <span><strong>Catatan Keuangan</strong><small>Keuangan lebih teratur</small></span>
        </a>
        {session && (
          <div className="account">
            <span className="user-email">{session.user.email}</span>
            <button className="icon-button" onClick={handleLogout} title="Keluar" aria-label="Keluar"><LogOut size={18} /></button>
          </div>
        )}
      </header>

      {!isSupabaseConfigured ? (
        <section className="setup-card">
          <span className="setup-icon"><CircleDollarSign size={27} /></span>
          <p className="eyebrow">PENGATURAN AWAL</p>
          <h1>Hubungkan aplikasi ke Supabase</h1>
          <p>Frontend sudah disiapkan, tetapi kredensial project belum dikonfigurasi.</p>
          <ol>
            <li>Buat project di Supabase.</li>
            <li>Jalankan SQL dari file <code>supabase/schema.sql</code> melalui SQL Editor.</li>
            <li>Salin <code>.env.example</code> menjadi <code>.env.local</code> lalu isi URL dan publishable/anon key dari project.</li>
            <li>Restart server development.</li>
          </ol>
          <p className="security-note">Gunakan hanya publishable/anon key di frontend. Jangan pernah memasukkan service_role key.</p>
        </section>
      ) : !authReady ? (
        <div className="center-state"><span className="spinner" /> Memuat sesi…</div>
      ) : !session ? (
        <section className="auth-layout">
          <div className="intro-panel">
            <p className="eyebrow">CATAT • PANTAU • EVALUASI</p>
            <h1>Kenali ke mana uang Anda pergi.</h1>
            <p>Catat pemasukan dan pengeluaran dalam satu tempat. Ringkasan bulanan diperbarui dari transaksi yang tersimpan.</p>
            <div className="intro-stat"><span><Check size={17} /></span> Data tersimpan di database pribadi Anda</div>
            <div className="intro-stat"><span><Check size={17} /></span> Kategori transaksi yang konsisten</div>
          </div>
          <div className="auth-card">
            <div className="auth-heading">
              <h2>{authMode === "login" ? "Selamat datang" : "Buat akun"}</h2>
              <p>{authMode === "login" ? "Masuk untuk melihat catatan keuangan Anda." : "Daftar menggunakan email dan kata sandi."}</p>
            </div>
            <form onSubmit={handleAuth} className="stack-form">
              <label>Email<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" /></label>
              <label>Kata sandi<input type="password" autoComplete={authMode === "login" ? "current-password" : "new-password"} minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" /></label>
              {error && <p className="notice error">{error}</p>}
              {message && <p className="notice success">{message}</p>}
              <button className="primary-button" type="submit" disabled={loading}>{loading ? "Memproses…" : authMode === "login" ? "Masuk" : "Buat akun"}</button>
            </form>
            <p className="auth-switch">{authMode === "login" ? "Belum punya akun?" : "Sudah punya akun?"} <button onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setError(""); setMessage(""); }}>{authMode === "login" ? "Daftar" : "Masuk"}</button></p>
          </div>
        </section>
      ) : (
        <>
          <section className="page-heading">
            <div><p className="eyebrow">RINGKASAN KEUANGAN</p><h1>Dashboard</h1><p>Ringkasan pemasukan dan pengeluaran Anda.</p></div>
            <label className="month-picker"><CalendarDays size={17} /><input type="month" value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Pilih bulan" /></label>
          </section>

          <section className="summary-grid">
            <article className="summary-card">
              <div className="summary-label">Total pemasukan <span className="metric-icon income"><ArrowDownLeft size={18} /></span></div>
              <strong>{currency.format(income)}</strong><small>Bulan terpilih</small>
            </article>
            <article className="summary-card">
              <div className="summary-label">Total pengeluaran <span className="metric-icon expense"><ArrowUpRight size={18} /></span></div>
              <strong>{currency.format(expense)}</strong><small>Bulan terpilih</small>
            </article>
            <article className="summary-card balance-card">
              <div className="summary-label">Selisih bersih <span className="metric-icon net"><Wallet size={18} /></span></div>
              <strong>{currency.format(balance)}</strong><small>Pemasukan dikurangi pengeluaran</small>
            </article>
          </section>

          <section className="content-grid">
            <article className="panel form-panel">
              <div className="panel-heading"><div><h2>Tambah transaksi</h2><p>Isi detail transaksi baru.</p></div><span className="heading-icon"><Plus size={19} /></span></div>
              <form className="stack-form" onSubmit={handleAdd}>
                <div className="segmented">
                  <button type="button" className={draft.tipe === "pengeluaran" ? "selected expense-choice" : ""} onClick={() => setDraft({ ...draft, tipe: "pengeluaran", kategori: draft.kategori === "Gaji" ? "Lainnya" : draft.kategori })}>Pengeluaran</button>
                  <button type="button" className={draft.tipe === "pemasukan" ? "selected income-choice" : ""} onClick={() => setDraft({ ...draft, tipe: "pemasukan" })}>Pemasukan</button>
                </div>
                <label>Tanggal<input type="date" required value={draft.tanggal} onChange={(e) => setDraft({ ...draft, tanggal: e.target.value })} /></label>
                <label>Jumlah (Rp)<input type="number" inputMode="numeric" min="1" step="1" required value={draft.jumlah} onChange={(e) => setDraft({ ...draft, jumlah: e.target.value })} placeholder="Contoh: 50000" /></label>
                <label>Deskripsi<input maxLength={500} required value={draft.deskripsi} onChange={(e) => setDraft({ ...draft, deskripsi: e.target.value })} placeholder="Contoh: Makan siang" /></label>
                <label>Kategori<select value={draft.kategori} onChange={(e) => setDraft({ ...draft, kategori: e.target.value as TransactionCategory })}>{CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
                {error && <p className="notice error">{error}</p>}
                {message && <p className="notice success">{message}</p>}
                <button className="primary-button" type="submit" disabled={saving}>{saving ? "Menyimpan…" : <><Plus size={17} /> Simpan transaksi</>}</button>
              </form>
            </article>

            <article className="panel transactions-panel">
              <div className="panel-heading transaction-heading">
                <div><h2>Riwayat transaksi</h2><p>{visibleTransactions.length} transaksi pada periode terpilih</p></div>
                <button className="icon-button refresh-button" onClick={() => void loadTransactions()} disabled={loading} title="Muat ulang" aria-label="Muat ulang"><RefreshCw size={17} className={loading ? "spin" : ""} /></button>
              </div>
              <div className="filters">
                {(["semua", "pemasukan", "pengeluaran"] as const).map((filter) => <button key={filter} className={typeFilter === filter ? "active-filter" : ""} onClick={() => setTypeFilter(filter)}>{filter === "semua" ? "Semua" : filter === "pemasukan" ? "Pemasukan" : "Pengeluaran"}</button>)}
              </div>
              {loading && transactions.length === 0 ? <div className="empty-state"><span className="spinner" /> Memuat transaksi…</div> : visibleTransactions.length === 0 ? (
                <div className="empty-state"><span className="empty-icon"><Wallet size={23} /></span><strong>Belum ada transaksi</strong><p>Transaksi untuk bulan dan filter ini akan muncul di sini.</p></div>
              ) : (
                <div className="transaction-list">
                  {visibleTransactions.map((item) => (
                    <div className="transaction-row" key={item.id}>
                      <span className={`transaction-icon ${item.tipe}`}>{item.tipe === "pemasukan" ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}</span>
                      <div className="transaction-description"><strong>{item.deskripsi}</strong><span>{new Date(`${item.tanggal}T00:00:00`).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })} · {item.kategori}</span></div>
                      <div className="transaction-amount"><strong className={item.tipe === "pemasukan" ? "amount-income" : "amount-expense"}>{item.tipe === "pemasukan" ? "+" : "−"}{currency.format(Number(item.jumlah))}</strong><button className="delete-button" onClick={() => void handleDelete(item)} title="Hapus transaksi" aria-label={`Hapus ${item.deskripsi}`}><Trash2 size={15} /></button></div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
          <footer className="app-footer">Catatan Keuangan <span>·</span> Data Anda disimpan di Supabase</footer>
        </>
      )}
    </main>
  );
}
