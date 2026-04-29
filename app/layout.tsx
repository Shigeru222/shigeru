import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "かんじチャレンジ｜小学2年生の漢字をたのしくおぼえよう",
  description:
    "小学2年生で習う160字の漢字を、クイズ・フラッシュカードで楽しく学べる学習アプリ。",
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
      </body>
    </html>
  );
}
