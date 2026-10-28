import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Catatan Keuangan",
  description: "Catat pemasukan dan pengeluaran secara sederhana."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
