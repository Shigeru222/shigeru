"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { KANJI_LIST } from "@/lib/kanji-data";
import type { AllProgress } from "@/lib/kanji-types";
import {
  loadProgress,
  resetProgress,
  masteredCount as kanjiMasteredCount,
  learningCount as kanjiLearningCount,
  getKanjiProgress,
} from "@/lib/kanji-storage";
import type { KukuAllProgress } from "@/lib/kuku-types";
import {
  KUKU_TOTAL,
  getKukuProgress,
  kukuLearningCount,
  kukuMasteredCount,
  loadKukuProgress,
  resetKukuProgress,
} from "@/lib/kuku-storage";
import {
  loadMathProgress,
  resetMathProgress,
  totalMathStars,
  modeStars,
  MAX_TOTAL_STARS,
  MAX_STARS_PER_MODE,
  MATH_MODES,
  MODE_LABEL,
  type AllMathProgress,
} from "@/lib/math-storage";

const KANJI_TOTAL = KANJI_LIST.length;

export default function ProgressPage() {
  const [progress, setProgress] = useState<AllProgress>({});
  const [kuku, setKuku] = useState<KukuAllProgress>({});
  const [math, setMath] = useState<AllMathProgress>({});

  useEffect(() => {
    setProgress(loadProgress());
    setKuku(loadKukuProgress());
    setMath(loadMathProgress());
  }, []);

  // 全体集計
  const kMastered = kanjiMasteredCount(progress);
  const kLearning = kanjiLearningCount(progress);
  const mMastered = kukuMasteredCount(kuku);
  const mLearning = kukuLearningCount(kuku);
  const mathStars = totalMathStars(math);

  const totalMastered = kMastered + mMastered + mathStars;
  const totalCount = KANJI_TOTAL + KUKU_TOTAL + MAX_TOTAL_STARS;
  const totalLearning = kLearning + mLearning;
  const totalRemaining = Math.max(
    0,
    totalCount - totalMastered - totalLearning,
  );
  const overallPct = Math.round((totalMastered / totalCount) * 100);

  // 問題数・正答率
  const totalSeen =
    Object.values(progress).reduce((s, p) => s + p.seen, 0) +
    Object.values(kuku).reduce((s, p) => s + p.seen, 0) +
    Object.values(math).reduce((s, p) => s + p.seen, 0);
  const totalCorrect =
    Object.values(progress).reduce((s, p) => s + p.correct, 0) +
    Object.values(kuku).reduce((s, p) => s + p.correct, 0) +
    Object.values(math).reduce((s, p) => s + p.correct, 0);
  const accuracy = totalSeen ? Math.round((totalCorrect / totalSeen) * 100) : 0;

  const masteredKanji = KANJI_LIST.filter(
    (k) => getKanjiProgress(progress, k.char).mastered,
  );

  function handleReset() {
    if (
      window.confirm(
        "ほんとうに がくしゅうきろくを けしますか？\n（漢字・九九・算数チャレンジ ぜんぶ けしますよ）",
      )
    ) {
      resetProgress();
      resetKukuProgress();
      resetMathProgress();
      setProgress({});
      setKuku({});
      setMath({});
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
          <p className="text-sm font-bold text-[var(--ink-soft)] mb-1">
            ぜんぶで マスターした もんだい
          </p>
          <div className="text-6xl font-black">
            {totalMastered}
            <span className="text-2xl font-black text-[var(--ink-soft)]">
              /{totalCount}
            </span>
          </div>
          <div className="my-4 progress-track">
            <div className="progress-fill" style={{ width: `${overallPct}%` }} />
          </div>
          <div className="text-xl font-black">{overallPct}%</div>
          <p className="mt-3 text-base font-bold">{message(overallPct)}</p>
        </section>

        {/* 全体内訳 */}
        <section className="grid grid-cols-3 gap-3 mb-6">
          <Box label="マスター" value={totalMastered} cls="bg-yellow-300" emoji="⭐" />
          <Box label="れんしゅう中" value={totalLearning} cls="bg-sky-300 text-white" emoji="📚" />
          <Box label="まだ" value={totalRemaining} cls="bg-white" emoji="🌱" />
        </section>

        {/* 統計 */}
        <section className="panel p-6 mb-6">
          <h2 className="text-xl font-black mb-3">📊 こたえた かいすう（ぜんぶ）</h2>
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

        {/* 漢字セクション */}
        <SubjectCard
          emoji="📖"
          title="漢字"
          mastered={kMastered}
          learning={kLearning}
          total={KANJI_TOTAL}
        >
          {masteredKanji.length > 0 && (
            <>
              <p className="text-sm font-bold text-[var(--ink-soft)] mb-2">
                ⭐ マスターした 漢字
              </p>
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
            </>
          )}
        </SubjectCard>

        {/* 算数：九九 */}
        <SubjectCard
          emoji="🔢"
          title="九九"
          mastered={mMastered}
          learning={mLearning}
          total={KUKU_TOTAL}
        >
          <p className="text-sm font-bold text-[var(--ink-soft)] mb-2">
            ⭐ マスターした 九九（黄色の マス）
          </p>
          <KukuMiniGrid kuku={kuku} />
        </SubjectCard>

        {/* 算数：チャレンジ系 */}
        <section className="panel p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-black flex items-center gap-2">
              <span>🧠</span>算数チャレンジ
            </h2>
            <span className="chip badge-mastered">
              {mathStars} / {MAX_TOTAL_STARS} ⭐
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {MATH_MODES.map((m) => {
              const stars = modeStars(math, m);
              const lbl = MODE_LABEL[m];
              return (
                <div
                  key={m}
                  className="rounded-2xl border-[3px] border-[var(--ink)] p-3 text-center bg-white"
                  style={{ boxShadow: "3px 3px 0 var(--ink)" }}
                >
                  <div className="text-2xl">{lbl.emoji}</div>
                  <div className="text-sm font-black mt-1">{lbl.ja}</div>
                  <div className="text-base mt-1">
                    {Array.from({ length: MAX_STARS_PER_MODE }).map((_, i) => (
                      <span key={i} className={i < stars ? "star-on" : "star-off"}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <div className="text-xs font-bold text-[var(--ink-soft)] mt-1">
                    {stars} / {MAX_STARS_PER_MODE}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="text-center mt-8">
          <button onClick={handleReset} className="btn-pop btn-white text-sm py-2 px-4">
            🔄 きろくを ぜんぶ けす
          </button>
        </div>
      </div>
    </main>
  );
}

function SubjectCard({
  emoji,
  title,
  mastered,
  learning,
  total,
  children,
}: {
  emoji: string;
  title: string;
  mastered: number;
  learning: number;
  total: number;
  children?: React.ReactNode;
}) {
  const pct = Math.round((mastered / total) * 100);
  return (
    <section className="panel p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-black flex items-center gap-2">
          <span>{emoji}</span>
          {title}
        </h2>
        <span className="chip badge-mastered">{pct}%</span>
      </div>
      <div className="progress-track mb-3">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs font-bold text-[var(--ink-soft)] mb-4">
        マスター {mastered} ／ れんしゅう中 {learning} ／ ぜんぶ {total}
      </p>
      {children}
    </section>
  );
}

function KukuMiniGrid({ kuku }: { kuku: KukuAllProgress }) {
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto border-collapse">
        <thead>
          <tr>
            <th className="p-1 text-xs font-bold text-[var(--ink-soft)]">×</th>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((b) => (
              <th key={b} className="p-1 text-xs font-bold text-[var(--ink-soft)]">
                {b}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((a) => (
            <tr key={a}>
              <th className="p-1 text-xs font-bold text-[var(--ink-soft)]">{a}</th>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((b) => {
                const cell = getKukuProgress(kuku, a, b);
                return (
                  <td
                    key={b}
                    className={`w-8 h-8 sm:w-9 sm:h-9 text-center border-2 border-[var(--ink)] text-xs font-black ${
                      cell.mastered
                        ? "bg-yellow-300"
                        : cell.seen > 0
                        ? "bg-sky-100"
                        : "bg-white"
                    }`}
                  >
                    {a * b}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
