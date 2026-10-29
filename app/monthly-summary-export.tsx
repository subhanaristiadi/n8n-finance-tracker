"use client";

import { Download } from "lucide-react";

type MonthlySummaryExportProps = {
  month: string;
  income: number;
  expense: number;
  balance: number;
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
}: MonthlySummaryExportProps) {
  function downloadCsv() {
    const [year, monthNumber] = month.split("-").map(Number);
    const monthDate = new Date(Date.UTC(year, monthNumber - 1, 1));
    const monthLabel = monthFormatter.format(monthDate);
    const rows = [
      ["Laporan Keuangan Bulanan"],
      ["Bulan", monthLabel],
      [],
      ["Ringkasan", "Jumlah (Rp)"],
      ["Total pemasukan", income],
      ["Total pengeluaran", expense],
      ["Saldo bersih", balance],
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
    <button className="export-button" type="button" onClick={downloadCsv}>
      <Download size={16} />
      Unduh ringkasan CSV
    </button>
  );
}
