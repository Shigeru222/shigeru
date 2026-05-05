import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "組織マップ | 部門進捗管理",
  description: "部門進捗ヒートマップ",
};

export default function HeatmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
