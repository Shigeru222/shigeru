import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "数学チャレンジ - 高校1年生",
  description: "展開・因数分解・二次方程式・三角比・確率を楽しく攻略！高校1年生向け数学学習ゲーム。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
        <div className="mesh-bg" />
        {children}
      </body>
    </html>
  );
}
