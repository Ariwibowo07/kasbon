import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kasbon - Catat Utang Piutang",
  description: "Web app sederhana buat track utang piutang pribadi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
