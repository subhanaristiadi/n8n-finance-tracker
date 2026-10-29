"use client";

import { Download } from "lucide-react";
import { Transaction } from "@/lib/types";

type MonthlySummaryExportProps = {
  month: string;
  income: number;
  expense: number;
  balance: number;
  loadTransactions: () => Promise<Transaction[] | null>;
  exporting: boolean;
};

const monthFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function csvCell(value: string | number): string {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export default function MonthlySummaryExport({
  month,
  income,
  expense,
  balance,
  loadTransactions,
  exporting,
}: MonthlySummaryExportProps) {
  async function downloadCsv() {
    const transactions = await loadTransactions();
    if (!transactions) return;

    const [year, monthNumber] = month.split("-").map(Number);
    const monthDate = new Date(Date.UTC(year, monthNumber - 1, 1));
    const monthLabel = monthFormatter.format(monthDate);
    const rows: (string | number)[][] = [
      ["Laporan Keuangan Bulanan"],
      ["Bulan", monthLabel],
      [],
      ["RINGKASAN", "Jumlah (Rp)"],
      ["Total pemasukan", income],
      ["Total pengeluaran", expense],
      ["Saldo bersih", balance],
      [],
      ["DAFTAR TRANSAKSI"],
      ["Tanggal", "Tipe", "Jumlah (Rp)", "Deskripsi", "Kategori"],
      ...transactions.map((item) => [
        item.tanggal,
        item.tipe,
        Number(item.jumlah),
        item.deskripsi,
        item.kategori,
      ]),
    ];

    const csv = "\uFEFF" + rows
      .map((row) => row.map((cell) => csvCell(cell ?? "")).join(","))
      .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-keuangan-${month}.csv`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      className="export-button"
      type="button"
      onClick={() => void downloadCsv()}
      disabled={exporting}
    >
      <Download size={16} />
      {exporting ? "Menyiapkan laporan…" : "Unduh laporan CSV"}
    </button>
  );
}
