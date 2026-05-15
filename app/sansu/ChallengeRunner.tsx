"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  loadMathProgress,
  recordRound,
  saveMathProgress,
  type MathLevel,
  type MathMode,
} from "@/lib/math-storage";

export type ChallengeQuestion = {
  /** 出題本文（テキスト or React要素） */
  prompt: ReactNode;
  /** 4択の選択肢（テキスト） */
  choices: string[];
  /** 正解index */
  answerIndex: number;
  /** 正解時の補足説明（任意） */
  explanation?: ReactNode;
};

export type ChallengeConfig = {
  mode: MathMode;
  level: MathLevel;
  /** 問題ジェネレータ（10回呼ばれる） */
  generate: () => ChallengeQuestion;
  /** 戻る先 */
  backHref: string;
  /** バックリンクのラベル */
  backLabel?: string;
  /** 1ラウンドの問題数 */
  roundLength?: number;
};

const DEFAULT_LEN = 10;

export default function ChallengeRunner({
  mode,
  level,
  generate,
  backHref,
  backLabel = "← もどる",
  roundLength = DEFAULT_LEN,
}: ChallengeConfig) {
  const questions = useMemo(() => {
    const list: ChallengeQuestion[] = [];
    const seenChoices = new Set<string>();
    while (list.length < roundLength) {
      const q = generate();
      // 同じ選択肢の組み合わせの完全重複だけ避ける（必須ではない）
      const sig =
        typeof q.prompt === "string" ? `${q.prompt}|${q.choices.join(",")}` : Math.random().toString();
      if (seenChoices.has(sig)) continue;
      seenChoices.add(sig);
      list.push(q);
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, level, roundLength]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[index];
  const correct = selected !== null && selected === q.answerIndex;

  function pick(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.answerIndex) setScore((s) => s + 1);
  }

  function next() {
    if (index + 1 >= questions.length) {
      const all = recordRound(loadMathProgress(), mode, level, score, roundLength);
      saveMathProgress(all);
      setDone(true);
      return;
    }
    setIndex(index + 1);
    setSelected(null);
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const isPerfect = score === questions.length;
    const msg = isPerfect
      ? "パーフェクト！⭐ ゲットだよ！"
      : pct >= 80
      ? "とってもよくできました！🎉"
      : pct >= 50
      ? "よくがんばったね！💪"
      : "もういちど ちょうせん しよう！🌱";
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="panel p-8 max-w-md w-full text-center anim-pop">
          <div className="text-6xl mb-3">
            {isPerfect ? "🏆" : pct >= 50 ? "🌟" : "🌱"}
          </div>
          <h2 className="text-2xl font-black mb-3">けっか はっぴょう！</h2>
          <div className="text-5xl font-black mb-2">
            {score} / {questions.length}
          </div>
          <p className="text-lg font-bold mb-6">{msg}</p>
          {isPerfect && (
            <p className="text-base font-bold text-[var(--pop-orange)] mb-4">
              ⭐ スターを 1つ ゲット！
            </p>
          )}
          <div className="flex flex-col gap-3">
            <Link href={backHref} className="btn-pop btn-pink">
              べつの れんしゅうを する
            </Link>
            <Link href="/" className="btn-pop btn-white">
              ホームに もどる
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <Link href={backHref} className="btn-pop btn-white text-base">
            {backLabel}
          </Link>
          <span className="chip badge-new">
            {index + 1} / {questions.length}
          </span>
          <span className="chip badge-mastered">⭐ {score}</span>
        </header>

        <div className="progress-track mb-6">
          <div
            className="progress-fill"
            style={{
              width: `${((index + (selected !== null ? 1 : 0)) / questions.length) * 100}%`,
            }}
          />
        </div>

        {/* 問題 */}
        <div className="panel p-7 mb-5 text-center anim-pop">{q.prompt}</div>

        {/* 選択肢 */}
        <div className="grid grid-cols-2 gap-3">
          {q.choices.map((c, i) => {
            const isThis = selected === i;
            const isAnswer = i === q.answerIndex;
            const cls =
              selected === null
                ? ""
                : isAnswer
                ? "is-correct"
                : isThis
                ? "is-wrong"
                : "is-disabled";
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                className={`answer-card ${cls} text-center text-2xl`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* フィードバック */}
        {selected !== null && (
          <div className="mt-5 panel-soft p-5 anim-pop">
            <p className="font-black text-xl mb-2">
              {correct ? "🎉 せいかい！" : "🤔 ざんねん！"}
            </p>
            <p className="text-base font-bold">
              ただしい こたえ：
              <span className="text-2xl text-[var(--pop-orange)] ml-2">
                {q.choices[q.answerIndex]}
              </span>
            </p>
            {q.explanation && (
              <div className="mt-2 text-sm font-bold text-[var(--ink-soft)]">
                {q.explanation}
              </div>
            )}
            <button onClick={next} className="btn-pop btn-orange mt-4 w-full">
              {index + 1 >= questions.length ? "けっかを みる →" : "つぎの もんだい →"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

/** 共通：選択肢シャッフル */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 整数の正解＋誤答3つを4択にする共通ヘルパー */
export function makeNumberChoices(
  answer: number,
  options: { min?: number; max?: number; near?: boolean } = {},
): { choices: string[]; answerIndex: number } {
  const { min = 0, max = 9999, near = true } = options;
  const set = new Set<number>([answer]);
  const offsets = near ? [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 10, -10] : [];
  for (const d of shuffle(offsets)) {
    const v = answer + d;
    if (v >= min && v <= max && !set.has(v)) {
      set.add(v);
      if (set.size >= 4) break;
    }
  }
  while (set.size < 4) {
    const v = Math.max(min, answer + Math.floor(Math.random() * 21) - 10);
    if (v <= max) set.add(v);
  }
  const arr = shuffle([...set]).map(String);
  return { choices: arr, answerIndex: arr.indexOf(String(answer)) };
}
