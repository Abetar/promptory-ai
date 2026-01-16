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

  // ✅ Core message: mejorar texto (resultado > prompts)
  title: {
    default: "Promptory AI — Arregla y profesionaliza tu texto en segundos",
    template: "%s | Promptory AI",
  },

  // ✅ Outcome-first: texto listo para enviar
  description:
    "Pega un mensaje, correo o post y obtén una versión clara, profesional y lista para enviar. Menos vueltas. Mejor primera impresión.",

  applicationName: siteName,
  category: "productivity",
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
    title: "Promptory AI — Arregla y profesionaliza tu texto en segundos",
    description:
      "Mejora textos de trabajo y contenido sin pensar en prompts. Pega tu texto y recibe una versión clara, profesional y lista para enviar.",
    siteName,
    locale: "es_MX",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Promptory AI" }],
  },

  twitter: {
    card: "summary_large_image",
    title: "Promptory AI — Arregla y profesionaliza tu texto en segundos",
    description:
      "Pega tu texto y obtén una versión clara, profesional y lista para enviar. Menos vueltas. Mejor primera impresión.",
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
