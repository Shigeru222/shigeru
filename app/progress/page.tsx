"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { KANJI_LIST } from "@/lib/kanji-data";
import type { AllProgress } from "@/lib/kanji-types";
import {
  loadProgress,
  resetProgress,
  masteredCount,
  learningCount,
  getKanjiProgress,
} from "@/lib/kanji-storage";

export default function ProgressPage() {
  const [progress, setProgress] = useState<AllProgress>({});

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const total = KANJI_LIST.length;
  const mastered = masteredCount(progress);
  const learning = learningCount(progress);
  const remaining = total - mastered - learning;
  const pct = Math.round((mastered / total) * 100);

  const totalSeen = Object.values(progress).reduce((s, p) => s + p.seen, 0);
  const totalCorrect = Object.values(progress).reduce((s, p) => s + p.correct, 0);
  const accuracy = totalSeen ? Math.round((totalCorrect / totalSeen) * 100) : 0;

  const masteredKanji = KANJI_LIST.filter((k) => getKanjiProgress(progress, k.char).mastered);

  function handleReset() {
    if (window.confirm("ほんとうに がくしゅうきろくを けしますか？")) {
      resetProgress();
      setProgress({});
    }
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <Link href="/" className="btn-pop btn-white text-base">← もどる</Link>
          <h1 className="text-2xl md:text-3xl font-black">🏆 がくしゅうきろく</h1>
          <span className="w-20" />
        </header>

        {/* 全体進捗 */}
        <section className="panel p-6 mb-6 text-center anim-pop">
          <p className="text-sm font-bold text-[var(--ink-soft)] mb-1">マスターした かんじ</p>
          <div className="text-6xl font-black">
            {mastered}
            <span className="text-2xl font-black text-[var(--ink-soft)]">/{total}</span>
          </div>
          <div className="my-4 progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-xl font-black">{pct}%</div>
          <p className="mt-3 text-base font-bold">{message(pct)}</p>
        </section>

        {/* 内訳 */}
        <section className="grid grid-cols-3 gap-3 mb-6">
          <Box label="マスター" value={mastered} cls="bg-yellow-300" emoji="⭐" />
          <Box label="れんしゅう中" value={learning} cls="bg-sky-300 text-white" emoji="📚" />
          <Box label="まだ" value={remaining} cls="bg-white" emoji="🌱" />
        </section>

        {/* 統計 */}
        <section className="panel p-6 mb-6">
          <h2 className="text-xl font-black mb-3">📊 こたえた かいすう</h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-3xl font-black">{totalSeen}</div>
              <div className="text-sm font-bold text-[var(--ink-soft)]">といた もんだい</div>
            </div>
            <div>
              <div className="text-3xl font-black text-[var(--pop-green)]">{accuracy}%</div>
              <div className="text-sm font-bold text-[var(--ink-soft)]">せいかいりつ</div>
            </div>
          </div>
        </section>

        {/* マスター済み一覧 */}
        {masteredKanji.length > 0 && (
          <section className="panel p-6 mb-6">
            <h2 className="text-xl font-black mb-4">⭐ マスターした かんじ</h2>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {masteredKanji.map((k) => (
                <div
                  key={k.char}
                  className="aspect-square flex items-center justify-center text-2xl font-black bg-yellow-100 border-2 border-[var(--ink)] rounded-lg"
                >
                  {k.char}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="text-center mt-8">
          <button onClick={handleReset} className="btn-pop btn-white text-sm py-2 px-4">
            🔄 きろくを けす
          </button>
        </div>
      </div>
    </main>
  );
}

function Box({
  label,
  value,
  cls,
  emoji,
}: {
  label: string;
  value: number;
  cls: string;
  emoji: string;
}) {
  return (
    <div
      className={`rounded-2xl border-[3px] border-[var(--ink)] p-4 text-center ${cls}`}
      style={{ boxShadow: "4px 4px 0 var(--ink)" }}
    >
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-3xl font-black">{value}</div>
      <div className="text-xs font-bold">{label}</div>
    </div>
  );
}

function message(pct: number): string {
  if (pct === 0) return "まずは クイズに ちょうせん！🚀";
  if (pct < 25) return "いい スタート！この ちょうしで！🌱";
  if (pct < 50) return "じゅんちょうに すすんでるね！👏";
  if (pct < 75) return "もう はんぶん いじょう！すごい！💪";
  if (pct < 100) return "あと すこし！がんばれ！🔥";
  return "ぜんぶ マスター！ほんとうに すごい！🏆";
}
