import type { Metadata, Viewport } from "next";
import "./globals.css";
import InstallHint from "./InstallHint";

export const metadata: Metadata = {
  title: "小2 おべんきょうチャレンジ｜漢字＋九九をたのしくおぼえよう",
  description:
    "小学2年生で習う漢字160字と九九81問を、クイズ・書き取り・フラッシュカードで楽しく学べる学習アプリ。",
  manifest: "/manifest.json",
  applicationName: "小2 おべんきょう",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "小2 おべんきょう",
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
