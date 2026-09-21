import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dealer Smart",
  description: "Fundação técnica do Dealer Smart.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
