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

  title: {
    default: "Promptory AI — Prompts curados, Packs y Prompt Optimizer",
    template: "%s | Promptory AI",
  },

  description:
    "Repositorio de prompts curados y packs (gratis y premium) para distintas herramientas de IA. Encuentra plantillas por caso de uso y mejora tus prompts en segundos con Prompt Optimizer.",

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
    title: "Promptory AI — Prompts curados, Packs y Prompt Optimizer",
    description:
      "Explora prompts curados por caso de uso, compra packs premium y optimiza tus prompts en segundos.",
    siteName,
    locale: "es_MX",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Promptory AI" }],
  },

  twitter: {
    card: "summary_large_image",
    title: "Promptory AI — Prompts curados, Packs y Prompt Optimizer",
    description:
      "Repositorio de prompts + packs (gratis/premium) + herramienta para optimizarlos en segundos.",
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
