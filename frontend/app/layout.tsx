import type { Metadata, Viewport } from "next"; // Viewport eklendi
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QR Menü", // Başlığı güncelledik
  description: "Hızlı ve Kolay Sipariş",
};

// --- MOBİL İÇİN KRİTİK AYAR (YENİ EKLENDİ) ---
// Bu ayar, uygulamanın telefonda "Native App" gibi davranmasını sağlar.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Zoom yapmayı engeller (Layout bozulmaz)
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        // bg-gray-50 ekledim: Mobilde bembeyaz ekran gözü yorar, hafif gri daha profesyonel durur.
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        {children}
      </body>
    </html>
  );
}