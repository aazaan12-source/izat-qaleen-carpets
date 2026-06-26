import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RegisterPwa } from "@/components/pwa/register-pwa";

export const metadata: Metadata = {
  title: "IZAT QALEEN & CARPETS | Luxury Persian and Handmade Rugs",
  description: "A premium qaleen storefront for Persian, Irani, Bokhara, and handmade rugs with owner-managed product imagery.",
  applicationName: "IZAT QALEEN & CARPETS",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "IZAT QALEEN"
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: "/icons/apple-touch-icon.png"
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#D0B8A8",
  colorScheme: "light"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <RegisterPwa />
      </body>
    </html>
  );
}
