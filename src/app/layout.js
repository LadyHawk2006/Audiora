import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout"; // ✅ Import client-side wrapper

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
  <title>Audiora</title>
  <meta name="description" content="Next.JS 15+ and Python" />  
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
  <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
  <link rel="icon" href="/icons/icon-192x192.png" />  
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="index, follow" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Audiora" />
  <meta property="og:description" content="Next.JS 15+ and Python" />
  <meta property="og:image" content="/icons/icon-512x512.png" />
  <meta property="og:url" content="https://audiora.com" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Audiora" />
  <meta name="twitter:description" content="Next.JS 15+ and Python" />
  <meta name="twitter:image" content="/icons/icon-512x512.png" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="application-name" content="Audiora" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Audiora" />  
  <link rel="preconnect" href="https://fonts.gstatic.com" />
</head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
