import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingContact from "@/components/layout/FloatingContact";
import { siteConfig } from "@/config/site.config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  // Autohospedada por next/font → no hace requests a Google Fonts en runtime (privacidad)
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "es_GT",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ea580c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
        {/* Saltar al contenido principal para navegación por teclado */}
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>

        <Navbar />

        <main id="main-content" tabIndex={-1}>
          {children}
        </main>

        <Footer />
        <FloatingContact />
      </body>
    </html>
  );
}
