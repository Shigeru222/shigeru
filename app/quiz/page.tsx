"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KANJI_LIST } from "@/lib/kanji-data";
import type { Kanji, QuizQuestion, QuizType } from "@/lib/kanji-types";
import { loadProgress, recordAnswer, saveProgress } from "@/lib/kanji-storage";
import { getYomiPrompt, shuffle, type YomiPrompt } from "@/lib/kanji-quiz";

const QUIZ_LENGTH = 10;

export default function QuizPageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold">よみこみちゅう…</div>}>
      <QuizPage />
    </Suspense>
  );
}

function QuizPage() {
  const search = useSearchParams();
  const router = useRouter();
  const type: QuizType = search.get("type") === "imi" ? "imi" : "yomi";

  const questions = useMemo(() => buildQuiz(type, QUIZ_LENGTH), [type]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (questions.length === 0) {
    return <div className="p-10 text-center">もんだいを じゅんびできませんでした。</div>;
  }

  const q = questions[index];
  const correct = selected !== null && selected === q.answerIndex;
  const wrong = selected !== null && selected !== q.answerIndex;

  function pick(i: number) {
    if (selected !== null) return;
    setSelected(i);
    const isRight = i === q.answerIndex;
    if (isRight) setScore((s) => s + 1);
    const next = recordAnswer(loadProgress(), q.kanji.char, isRight);
    saveProgress(next);
  }

  function next() {
    if (index + 1 >= questions.length) {
      setDone(true);
    } else {
      setIndex(index + 1);
      setSelected(null);
    }
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const msg =
      pct === 100
        ? "パーフェクト！すごいぞ！🏆"
        : pct >= 80
        ? "とってもよくできました！🎉"
        : pct >= 50
        ? "よくがんばったね！もういっかい！💪"
        : "だいじょうぶ！れんしゅうしよう！🌱";
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="panel p-8 max-w-md w-full text-center anim-pop">
          <div className="text-6xl mb-3">{pct >= 80 ? "🏆" : pct >= 50 ? "🌟" : "🌱"}</div>
          <h2 className="text-2xl font-black mb-3">けっか はっぴょう！</h2>
          <div className="text-5xl font-black mb-2">
            {score} / {questions.length}
          </div>
          <p className="text-lg font-bold mb-6">{msg}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.refresh()}
              className="btn-pop btn-pink"
            >
              もういちど
            </button>
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
          <Link href="/" className="btn-pop btn-white text-base">← やめる</Link>
          <span className="chip badge-new">
            {index + 1} / {questions.length}
          </span>
          <span className="chip badge-mastered">⭐ {score}</span>
        </header>

        {/* 進捗バー */}
        <div className="progress-track mb-6">
          <div
            className="progress-fill"
            style={{ width: `${((index + (selected !== null ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>

        {/* 問題 */}
        <div className="panel p-8 mb-5 text-center anim-pop">
          <p className="font-black text-lg mb-3 text-[var(--ink-soft)]">
            {type === "yomi" ? "この かんじの よみかたは？" : "この かんじの いみは？"}
          </p>
          <div
            className={`font-black leading-none ${
              q.type === "yomi" && q.prompt.length > 1
                ? "text-6xl md:text-7xl"
                : "text-8xl md:text-9xl"
            }`}
          >
            {q.prompt}
          </div>
        </div>

        {/* 選択肢 */}
        <div className="grid sm:grid-cols-2 gap-3">
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
                className={`answer-card ${cls}`}
              >
                <span className="mr-2 font-black">{["A", "B", "C", "D"][i]}.</span>
                {c}
              </button>
            );
          })}
        </div>

        {/* フィードバック */}
        {selected !== null && (
          <div className="mt-5 panel-soft p-5 anim-pop">
            <p className="font-black text-xl mb-1">
              {correct ? "🎉 せいかい！" : "🤔 ざんねん！"}
            </p>
            <p className="text-base font-bold">
              <span className="text-2xl mr-2">{q.kanji.char}</span>
              いみ：{q.kanji.meaning}
            </p>
            {q.kanji.examples[0] && (
              <p className="text-sm text-[var(--ink-soft)] font-bold mt-1">
                れい：{q.kanji.examples[0].word}（{q.kanji.examples[0].reading}）
              </p>
            )}
            <button onClick={next} className="btn-pop btn-orange mt-4 w-full">
              {index + 1 >= questions.length ? "けっかを みる →" : "つぎの もんだい →"}
            </button>
          </div>
        )}

        {wrong && <span className="sr-only">incorrect</span>}
      </div>
    </main>
  );
}

function buildQuiz(type: QuizType, length: number): QuizQuestion[] {
  if (type === "yomi") {
    const prompted = KANJI_LIST.flatMap((k) => {
      const p = getYomiPrompt(k);
      return p ? [{ k, p }] : [];
    });
    return shuffle(prompted)
      .slice(0, length)
      .map(({ k, p }) => makeYomiQuestion(k, p));
  }
  return shuffle(KANJI_LIST)
    .slice(0, length)
    .map((k) => makeImiQuestion(k));
}

function makeYomiQuestion(kanji: Kanji, p: YomiPrompt): QuizQuestion {
  const distractors = pickDistractorYomi(kanji, p.reading, 3);
  const choices = shuffle([p.reading, ...distractors]);
  return {
    type: "yomi",
    kanji,
    prompt: p.word,
    choices,
    answerIndex: choices.indexOf(p.reading),
  };
}

function makeImiQuestion(kanji: Kanji): QuizQuestion {
  const distractors = pickDistractorMeanings(kanji, 3);
  const choices = shuffle([kanji.meaning, ...distractors]);
  return {
    type: "imi",
    kanji,
    prompt: kanji.char,
    choices,
    answerIndex: choices.indexOf(kanji.meaning),
  };
}

function pickDistractorYomi(target: Kanji, correct: string, n: number): string[] {
  const pool: string[] = [];
  for (const k of shuffle(KANJI_LIST)) {
    if (k.char === target.char) continue;
    const p = getYomiPrompt(k);
    if (!p) continue;
    if (p.reading === correct) continue;
    if (pool.includes(p.reading)) continue;
    pool.push(p.reading);
    if (pool.length >= n) return pool;
  }
  return pool;
}

function pickDistractorMeanings(target: Kanji, n: number): string[] {
  const pool: string[] = [];
  for (const k of shuffle(KANJI_LIST)) {
    if (k.char === target.char) continue;
    if (k.meaning === target.meaning) continue;
    if (pool.includes(k.meaning)) continue;
    pool.push(k.meaning);
    if (pool.length >= n) break;
  }
  return pool;
}

