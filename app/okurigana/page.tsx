"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { KANJI_LIST } from "@/lib/kanji-data";
import type { Kanji } from "@/lib/kanji-types";
import {
  getOkuriganaPrompt,
  shuffle,
  type OkuriganaPrompt,
} from "@/lib/kanji-quiz";
import { loadProgress, recordAnswer, saveProgress } from "@/lib/kanji-storage";

const ROUND_LENGTH = 10;

type Question = { kanji: Kanji; prompt: OkuriganaPrompt };

export default function OkuriganaPage() {
  const questions = useMemo<Question[]>(() => {
    const pool = KANJI_LIST.flatMap((k) => {
      const p = getOkuriganaPrompt(k);
      return p ? [{ kanji: k, prompt: p }] : [];
    });
    return shuffle(pool).slice(0, ROUND_LENGTH);
  }, []);

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [index]);

  if (questions.length === 0) {
    return <div className="p-10 text-center">もんだいを じゅんびできませんでした。</div>;
  }

  const q = questions[index];
  const correct = normalize(answer) === q.prompt.okurigana;

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (submitted) return;
    if (!answer.trim()) return;
    setSubmitted(true);
    if (correct) setScore((s) => s + 1);
    saveProgress(recordAnswer(loadProgress(), q.kanji.char, correct));
  }

  function next() {
    if (index + 1 >= questions.length) {
      setDone(true);
      return;
    }
    setIndex(index + 1);
    setAnswer("");
    setSubmitted(false);
    setShowHint(false);
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const msg =
      pct === 100
        ? "パーフェクト！🏆"
        : pct >= 80
        ? "とってもよくできました！🎉"
        : pct >= 50
        ? "よくがんばったね！💪"
        : "もういちど ちょうせん しよう！🌱";
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
            <Link href="/okurigana" className="btn-pop btn-purple">
              もういちど
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
        <header className="flex items-center justify-between mb-5">
          <Link href="/" className="btn-pop btn-white text-base">← やめる</Link>
          <span className="chip badge-new">
            {index + 1} / {questions.length}
          </span>
          <span className="chip badge-mastered">⭐ {score}</span>
        </header>

        <div className="progress-track mb-6">
          <div
            className="progress-fill"
            style={{ width: `${((index + (submitted ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>

        {/* 問題 */}
        <div className="panel p-6 mb-5 text-center anim-pop">
          <p className="font-black text-base mb-2 text-[var(--ink-soft)]">
            おくりがなを かきいれよう！
          </p>
          <p className="text-2xl font-black mb-4">よみ：{q.prompt.reading}</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-7xl md:text-8xl font-black leading-none">
              {q.prompt.kanji}
            </span>
            <span
              className={`text-7xl md:text-8xl font-black leading-none border-b-[6px] border-dashed pb-1 px-3 min-w-[1.2em] ${
                submitted
                  ? correct
                    ? "border-[var(--pop-green)] text-[var(--pop-green)]"
                    : "border-[var(--pop-pink)] text-[var(--pop-pink)]"
                  : "border-[var(--ink)] text-[var(--ink-soft)]"
              }`}
            >
              {submitted ? answer || "?" : "?"}
            </span>
          </div>
          {showHint && (
            <p className="mt-4 text-base font-bold">
              ヒント：いみは「<span className="text-[var(--pop-orange)]">{q.kanji.meaning}</span>」
            </p>
          )}
        </div>

        {/* 入力 */}
        {!submitted ? (
          <form onSubmit={submit} className="space-y-3">
            <input
              ref={inputRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="ひらがなで かいてね"
              inputMode="text"
              lang="ja"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full text-center text-3xl font-black bg-white border-[3px] border-[var(--ink)] rounded-2xl py-4 px-4 outline-none focus:ring-4 focus:ring-[var(--pop-purple)]"
              style={{ boxShadow: "4px 4px 0 var(--ink)" }}
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowHint((v) => !v)}
                className="btn-pop btn-yellow"
              >
                💡 {showHint ? "ヒントOFF" : "ヒント"}
              </button>
              <button
                type="submit"
                disabled={!answer.trim()}
                className="btn-pop btn-purple"
              >
                こたえる →
              </button>
            </div>
          </form>
        ) : (
          <div className="panel-soft p-5 anim-pop">
            <p className="font-black text-2xl mb-2">
              {correct ? "🎉 せいかい！" : "🤔 ざんねん！"}
            </p>
            <p className="text-lg font-bold mb-1">
              ただしい こたえ：
              <span className="text-3xl ml-2">{q.prompt.word}</span>
              <span className="ml-2 text-sm text-[var(--ink-soft)]">
                （{q.prompt.reading}）
              </span>
            </p>
            <p className="text-sm font-bold text-[var(--ink-soft)] mb-1">
              おくりがな：
              <span className="text-base text-[var(--ink)]">「{q.prompt.okurigana}」</span>
            </p>
            <p className="text-sm font-bold text-[var(--ink-soft)] mb-4">
              いみ：{q.kanji.meaning}
            </p>
            <button onClick={next} className="btn-pop btn-orange w-full">
              {index + 1 >= questions.length ? "けっかを みる →" : "つぎの もんだい →"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function normalize(s: string): string {
  return s.replace(/\s+/g, "").trim();
}
