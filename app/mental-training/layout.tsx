import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "セルフトークワークシート",
  description: "メンタルトレーニング セルフトークワークシート",
};

export default function MentalTrainingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
