import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://promptory-ai.vercel.app";
const siteName = "Promptory AI";
const ogImage = "/og.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  // ✅ Cambiamos el enfoque: resultado > catálogo
  title: {
    default: "Promptory AI — Resultados claros desde el primer intento",
    template: "%s | Promptory AI",
  },

  description:
    "Deja de iterar con la IA. Promptory convierte prompts vagos en instrucciones ejecutables (objetivo, inputs, restricciones y formato) para obtener salida utilizable más rápido.",

  applicationName: siteName,
  category: "technology",
  alternates: { canonical: "/" },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Promptory AI — Resultados claros desde el primer intento",
    description:
      "Convierte prompts vagos en instrucciones ejecutables para dejar el ensayo-error y obtener salida utilizable más rápido.",
    siteName,
    locale: "es_MX",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Promptory AI" }],
  },

  twitter: {
    card: "summary_large_image",
    title: "Promptory AI — Resultados claros desde el primer intento",
    description:
      "Menos respuestas genéricas. Más salida utilizable. Optimiza prompts con objetivo, inputs, restricciones y formato.",
    images: [ogImage],
  },

  icons: {
    icon: "/logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
