"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getStats,
  loadMathProgress,
  modeStars,
  starsFor,
  LEVEL_LABEL,
  MAX_STARS_PER_LEVEL,
  MAX_STARS_PER_MODE,
  MATH_LEVELS,
  type AllMathProgress,
  type MathLevel,
  type MathMode,
} from "@/lib/math-storage";

type Props = {
  mode: MathMode;
  title: string;
  emoji: string;
  /** 各レベルの説明（やさしい/ふつう/むずかしい） */
  levelDescriptions: Record<MathLevel, string>;
  /** レベル選択時のコールバック（クライアント遷移） */
  onPick: (level: MathLevel) => void;
};

export default function LevelPicker({
  mode,
  title,
  emoji,
  levelDescriptions,
  onPick,
}: Props) {
  const [progress, setProgress] = useState<AllMathProgress>({});

  useEffect(() => {
    setProgress(loadMathProgress());
  }, []);

  const stars = modeStars(progress, mode);

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-5">
          <Link href="/" className="btn-pop btn-white text-base">← もどる</Link>
          <h1 className="text-2xl md:text-3xl font-black">
            {emoji} {title}
          </h1>
          <span className="w-20" />
        </header>

        {/* スター数 */}
        <section className="panel p-5 mb-6 text-center">
          <p className="text-sm font-bold text-[var(--ink-soft)] mb-1">
            集めた スター
          </p>
          <div className="text-4xl font-black mb-1">
            {Array.from({ length: MAX_STARS_PER_MODE }).map((_, i) => (
              <span key={i} className={i < stars ? "star-on" : "star-off"}>
                ⭐
              </span>
            ))}
          </div>
          <p className="text-xs font-bold text-[var(--ink-soft)]">
            {stars} / {MAX_STARS_PER_MODE} スター
          </p>
        </section>

        {/* レベル選択 */}
        <section className="space-y-4">
          {MATH_LEVELS.map((level) => {
            const stats = getStats(progress, mode, level);
            const lvStars = starsFor(stats);
            return (
              <button
                key={level}
                onClick={() => onPick(level)}
                className="panel w-full p-5 text-left card-hover bg-white"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl font-black">
                    {LEVEL_LABEL[level]}
                  </span>
                  <span className="text-xl">
                    {Array.from({ length: MAX_STARS_PER_LEVEL }).map((_, i) => (
                      <span key={i} className={i < lvStars ? "star-on" : "star-off"}>
                        ⭐
                      </span>
                    ))}
                  </span>
                </div>
                <p className="text-sm font-bold text-[var(--ink-soft)]">
                  {levelDescriptions[level]}
                </p>
                {stats.rounds > 0 && (
                  <p className="text-xs font-bold text-[var(--ink-soft)] mt-2">
                    プレイ {stats.rounds} かい ／ ベスト {stats.bestScore}/10 ／
                    パーフェクト {stats.perfect} かい
                  </p>
                )}
              </button>
            );
          })}
        </section>

        <p className="mt-6 text-xs text-center font-bold text-[var(--ink-soft)]">
          10問中 ぜんぶ せいかいで ⭐ を 1つ ゲット！
        </p>
      </div>
    </main>
  );
}
