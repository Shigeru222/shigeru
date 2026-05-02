"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Zap,
  Shield,
  ChevronRight,
  Calculator,
  Star,
  ArrowLeft,
  BarChart2,
  Triangle,
  Percent,
  Sigma,
  Hash,
} from "lucide-react";
import {
  TOPIC_LABELS,
  TOPIC_DESCRIPTIONS,
  GAME_MODES,
  Topic,
  GameMode,
} from "@/lib/math-problems";

const TOPICS: { id: Topic; icon: React.ReactNode; color: string }[] = [
  { id: "expansion", icon: <Sigma className="w-6 h-6" />, color: "blue" },
  { id: "factoring", icon: <Hash className="w-6 h-6" />, color: "purple" },
  { id: "quadratic-eq", icon: <BarChart2 className="w-6 h-6" />, color: "cyan" },
  { id: "quadratic-fn", icon: <BarChart2 className="w-6 h-6" />, color: "green" },
  { id: "trigonometry", icon: <Triangle className="w-6 h-6" />, color: "orange" },
  { id: "probability", icon: <Percent className="w-6 h-6" />, color: "pink" },
];

const COLOR_MAP: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  blue: {
    text: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/40",
    glow: "shadow-blue-400/30",
  },
  purple: {
    text: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/40",
    glow: "shadow-purple-400/30",
  },
  cyan: {
    text: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/40",
    glow: "shadow-cyan-400/30",
  },
  green: {
    text: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/40",
    glow: "shadow-green-400/30",
  },
  orange: {
    text: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/40",
    glow: "shadow-orange-400/30",
  },
  pink: {
    text: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/40",
    glow: "shadow-pink-400/30",
  },
};

const MODE_ICONS: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Shield: <Shield className="w-6 h-6" />,
};

export default function MathHomePage() {
  const router = useRouter();
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
  const [selectedMode, setSelectedMode] = useState<GameMode>("quiz");
  const [step, setStep] = useState<"topics" | "mode">("topics");

  const toggleTopic = (id: Topic) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedTopics(TOPICS.map((t) => t.id));

  const handleStart = () => {
    if (selectedTopics.length === 0) return;
    const params = new URLSearchParams({
      topics: selectedTopics.join(","),
      mode: selectedMode,
    });
    router.push(`/math/game?${params}`);
  };

  return (
    <main className="min-h-screen px-4 py-6 md:py-12 safe-bottom">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-slate-300">高校1年生 数学</span>
          </div>
        </div>

        <div className="mb-10 mt-4">
          <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight">
            数学<span className="gradient-text">チャレンジ</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg">
            展開・因数分解・二次方程式・三角比など高1数学を楽しく攻略！
          </p>
        </div>

        {step === "topics" ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-400" />
                単元を選ぼう
              </h2>
              <button
                onClick={selectedTopics.length === TOPICS.length ? () => setSelectedTopics([]) : selectAll}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {selectedTopics.length === TOPICS.length ? "すべて解除" : "すべて選択"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {TOPICS.map(({ id, icon, color }) => {
                const c = COLOR_MAP[color];
                const selected = selectedTopics.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggleTopic(id)}
                    className={`relative text-left p-5 rounded-2xl border transition-all duration-200 ${
                      selected
                        ? `${c.bg} ${c.border} shadow-lg ${c.glow}`
                        : "glass border-white/8 hover:border-white/20"
                    }`}
                  >
                    {selected && (
                      <div className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center ${c.bg} ${c.text}`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className={`inline-flex p-2.5 rounded-xl mb-3 ${c.bg} ${c.text}`}>
                      {icon}
                    </div>
                    <div className={`font-bold text-lg mb-1 ${selected ? c.text : "text-white"}`}>
                      {TOPIC_LABELS[id]}
                    </div>
                    <div className="text-sm text-slate-400">{TOPIC_DESCRIPTIONS[id]}</div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => selectedTopics.length > 0 && setStep("mode")}
              disabled={selectedTopics.length === 0}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              次へ：ゲームモードを選ぶ
              <ChevronRight className="w-5 h-5" />
            </button>
            {selectedTopics.length === 0 && (
              <p className="text-center text-slate-500 text-sm mt-3">
                1つ以上の単元を選んでください
              </p>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => setStep("topics")}
              className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> 単元選択に戻る
            </button>

            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {selectedTopics.map((t) => {
                  const topic = TOPICS.find((x) => x.id === t)!;
                  const c = COLOR_MAP[topic.color];
                  return (
                    <span key={t} className={`text-xs px-3 py-1 rounded-full ${c.bg} ${c.text} border ${c.border}`}>
                      {TOPIC_LABELS[t]}
                    </span>
                  );
                })}
              </div>
            </div>

            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              ゲームモードを選ぼう
            </h2>

            <div className="space-y-4 mb-8">
              {GAME_MODES.map((mode) => {
                const c = COLOR_MAP[mode.color];
                const selected = selectedMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-center gap-4 ${
                      selected
                        ? `${c.bg} ${c.border} shadow-lg ${c.glow}`
                        : "glass border-white/8 hover:border-white/20"
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${c.bg} ${c.text} flex-shrink-0`}>
                      {MODE_ICONS[mode.icon]}
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold text-lg ${selected ? c.text : "text-white"}`}>
                        {mode.label}
                      </div>
                      <div className="text-sm text-slate-400">{mode.description}</div>
                    </div>
                    {selected && (
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${c.bg} ${c.text}`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleStart}
              className="btn-primary w-full flex items-center justify-center gap-2 text-lg"
            >
              <Zap className="w-5 h-5" />
              ゲームスタート！
            </button>
          </>
        )}
      </div>
    </main>
  );
}
