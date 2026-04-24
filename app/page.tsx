"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Brain, TrendingUp, Zap, Clock, Award, ChevronRight, Star } from "lucide-react";
import { getExamResults } from "@/lib/storage";
import { ExamResult } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [recentResults, setRecentResults] = useState<ExamResult[]>([]);

  useEffect(() => {
    setRecentResults(getExamResults().slice(0, 3));
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 animate-fade-in">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-slate-300">AI搭載 英検対策アプリ</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 animate-fade-in-up leading-tight">
            英検2級を
            <br />
            <span className="gradient-text">AIで突破</span>
          </h1>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto animate-fade-in-up leading-relaxed">
            本番さながらの模擬試験を生成し、即座に採点。
            <br />
            AIが弱点を分析して、あなただけの改善プランを提案します。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
            <button
              onClick={() => router.push("/exam")}
              className="btn-primary text-lg flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              模擬試験を開始する
            </button>
            {recentResults.length > 0 && (
              <button
                onClick={() => {
                  import("@/lib/storage").then(({ setCurrentResult }) => {
                    setCurrentResult(recentResults[0]);
                    router.push("/results");
                  });
                }}
                className="btn-secondary text-lg flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-5 h-5" />
                前回の結果を見る
              </button>
            )}
          </div>
        </div>

        {/* Floating orbs */}
        <div
          className="absolute top-20 left-1/4 w-64 h-64 rounded-full opacity-10 animate-float pointer-events-none"
          style={{ background: "radial-gradient(circle, #4f8ef7, transparent)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10 animate-float pointer-events-none"
          style={{ background: "radial-gradient(circle, #a855f7, transparent)", animationDelay: "2s" }}
        />
      </section>

      {/* Features */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<BookOpen className="w-8 h-8" />}
              title="AI模擬試験"
              description="語彙・読解・英作文を含む本番形式の問題をAIがリアルタイムで生成"
              color="blue"
              delay="0s"
            />
            <FeatureCard
              icon={<Award className="w-8 h-8" />}
              title="即座に採点"
              description="選択問題は自動採点。英作文はAIが内容・文法・語彙を総合評価"
              color="purple"
              delay="0.1s"
            />
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="弱点分析 & 改善提案"
              description="間違えたパターンをAIが深く分析し、優先度付きの学習アクションを提案"
              color="cyan"
              delay="0.2s"
            />
          </div>
        </div>
      </section>

      {/* Exam Format Info */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-400" />
              試験構成
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <ExamSection
                label="語彙・文法"
                count="20問"
                points="20点"
                color="blue"
              />
              <ExamSection
                label="読解"
                count="6問"
                points="6点"
                color="purple"
              />
              <ExamSection
                label="英作文"
                count="1問"
                points="16点"
                color="cyan"
              />
            </div>
            <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-4 justify-between items-center">
              <div className="text-slate-400">
                合計 <span className="text-white font-bold text-xl">42点</span>
              </div>
              <div className="glass rounded-lg px-4 py-2 text-sm text-slate-300">
                合格目安: <span className="text-green-400 font-bold">65%以上 (約27点)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Results */}
      {recentResults.length > 0 && (
        <section className="px-4 pb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">最近の受験結果</h2>
            <div className="space-y-4">
              {recentResults.map((result) => (
                <ResultRow key={result.id} result={result} router={router} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "blue" | "purple" | "cyan";
  delay: string;
}) {
  const colorMap = {
    blue: "text-blue-400 bg-blue-400/10",
    purple: "text-purple-400 bg-purple-400/10",
    cyan: "text-cyan-400 bg-cyan-400/10",
  };

  return (
    <div
      className="glass rounded-2xl p-6 card-hover animate-fade-in-up"
      style={{ animationDelay: delay }}
    >
      <div className={`inline-flex p-3 rounded-xl mb-4 ${colorMap[color]}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function ExamSection({
  label,
  count,
  points,
  color,
}: {
  label: string;
  count: string;
  points: string;
  color: "blue" | "purple" | "cyan";
}) {
  const colorMap = {
    blue: "text-blue-400",
    purple: "text-purple-400",
    cyan: "text-cyan-400",
  };

  return (
    <div className="text-center">
      <div className={`text-3xl font-black mb-1 ${colorMap[color]}`}>{count}</div>
      <div className="font-semibold mb-1">{label}</div>
      <div className="text-slate-400 text-sm">{points}</div>
    </div>
  );
}

function ResultRow({
  result,
  router,
}: {
  result: ExamResult;
  router: ReturnType<typeof useRouter>;
}) {
  const percentage = Math.round((result.scores.total / result.scores.maxTotal) * 100);
  const date = new Date(result.date).toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <button
      onClick={() => {
        import("@/lib/storage").then(({ setCurrentResult }) => {
          setCurrentResult(result);
          router.push("/results");
        });
      }}
      className="w-full glass rounded-xl p-4 flex items-center gap-4 card-hover text-left"
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
          result.passed
            ? "bg-green-400/20 text-green-400"
            : "bg-red-400/20 text-red-400"
        }`}
      >
        {percentage}%
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold">
            {result.scores.total} / {result.scores.maxTotal}点
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              result.passed
                ? "bg-green-400/20 text-green-400"
                : "bg-red-400/20 text-red-400"
            }`}
          >
            {result.passed ? "合格圏" : "不合格圏"}
          </span>
        </div>
        <div className="text-sm text-slate-400">{date}</div>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
    </button>
  );
}
