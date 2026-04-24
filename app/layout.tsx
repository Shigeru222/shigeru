import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "英検2級 AI模擬試験",
  description: "AIを活用した英検2級対策アプリ。模擬試験・採点・弱点分析まで。",
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
