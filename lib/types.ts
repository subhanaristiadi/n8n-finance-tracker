export const TRANSACTION_TYPES = ["pemasukan", "pengeluaran"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const CATEGORIES = [
  "Makanan",
  "Transport",
  "Belanja",
  "Tagihan",
  "Gaji",
  "Lainnya"
] as const;
export type TransactionCategory = (typeof CATEGORIES)[number];

export type Transaction = {
  id: string;
  user_id: string;
  tanggal: string;
  tipe: TransactionType;
  jumlah: number;
  deskripsi: string;
  kategori: TransactionCategory;
  created_at: string;
};

export type TransactionDraft = {
  tanggal: string;
  tipe: TransactionType;
  jumlah: number;
  deskripsi: string;
  kategori: TransactionCategory;
};
