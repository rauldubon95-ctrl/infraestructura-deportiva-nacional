import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- Aquí conectamos la pintura

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Centro de Monitoreo Deportivo",
  description: "Sistema Nacional de Deporte SV",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
