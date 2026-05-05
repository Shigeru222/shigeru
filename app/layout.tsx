import type { Metadata, Viewport } from "next";
import "./globals.css";
import InstallHint from "./InstallHint";

export const metadata: Metadata = {
  title: "かんじチャレンジ｜小学2年生の漢字をたのしくおぼえよう",
  description:
    "小学2年生で習う160字の漢字を、クイズ・フラッシュカード・書き取りで楽しく学べる学習アプリ。",
  manifest: "/manifest.json",
  applicationName: "漢字チャレンジ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "漢字チャレンジ",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffd34d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <div className="sky-bg" />
        {children}
        <InstallHint />
      </body>
    </html>
  );
}
