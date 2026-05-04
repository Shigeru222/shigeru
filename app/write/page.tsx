"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { KANJI_LIST } from "@/lib/kanji-data";
import type { Kanji } from "@/lib/kanji-types";
import { getYomiPrompt, shuffle, type YomiPrompt } from "@/lib/kanji-quiz";
import { loadProgress, recordAnswer, saveProgress } from "@/lib/kanji-storage";
import DrawingCanvas, { type DrawingCanvasHandle } from "./DrawingCanvas";

const ROUND_LENGTH = 10;

type WriteQuestion = { kanji: Kanji; prompt: YomiPrompt };

export default function WritePage() {
  const questions = useMemo<WriteQuestion[]>(() => {
    const pool = KANJI_LIST.flatMap((k) => {
      const p = getYomiPrompt(k);
      return p ? [{ kanji: k, prompt: p }] : [];
    });
    return shuffle(pool).slice(0, ROUND_LENGTH);
  }, []);

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [done, setDone] = useState(false);
  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const [traceMode, setTraceMode] = useState(false);

  if (questions.length === 0) {
    return <div className="p-10 text-center">もんだいを じゅんびできませんでした。</div>;
  }

  const q = questions[index];

  function reveal() {
    setRevealed(true);
  }

  function rate(known: boolean) {
    if (known) setKnownCount((c) => c + 1);
    saveProgress(recordAnswer(loadProgress(), q.kanji.char, known));
    if (index + 1 >= questions.length) {
      setDone(true);
      return;
    }
    setIndex(index + 1);
    setRevealed(false);
    setShowHint(false);
    setTraceMode(false);
    canvasRef.current?.clear();
  }

  function clearCanvas() {
    canvasRef.current?.clear();
  }

  if (done) {
    const pct = Math.round((knownCount / questions.length) * 100);
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="panel p-8 max-w-md w-full text-center anim-pop">
          <div className="text-6xl mb-3">{pct >= 80 ? "🏆" : pct >= 50 ? "🌟" : "🌱"}</div>
          <h2 className="text-2xl font-black mb-3">かきとり おわり！</h2>
          <p className="text-lg font-bold mb-1">{questions.length}もん やったよ！</p>
          <div className="text-4xl font-black my-3">
            かけた：{knownCount} / {questions.length}（{pct}%）
          </div>
          <div className="flex flex-col gap-3 mt-6">
            <Link href="/write" className="btn-pop btn-orange">
              もういちど ちょうせん
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
        <header className="flex items-center justify-between mb-4">
          <Link href="/" className="btn-pop btn-white text-base">← やめる</Link>
          <span className="chip badge-new">
            {index + 1} / {questions.length}
          </span>
          <span className="chip badge-mastered">⭐ {knownCount}</span>
        </header>

        <div className="progress-track mb-5">
          <div
            className="progress-fill"
            style={{ width: `${((index + (revealed ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>

        {/* 問題 */}
        <div className="panel p-5 mb-4 text-center anim-pop">
          <p className="font-black text-base text-[var(--ink-soft)] mb-2">
            この ことばを かんじで かこう
          </p>
          <div className="text-5xl md:text-6xl font-black leading-none">
            {q.prompt.reading}
          </div>
          {showHint && (
            <p className="mt-3 text-base font-bold">
              いみ：<span className="text-[var(--pop-orange)]">{q.kanji.meaning}</span>
            </p>
          )}
        </div>

        {/* キャンバス */}
        <div className="flex flex-col items-center mb-4">
          <DrawingCanvas
            ref={canvasRef}
            size={320}
            lineWidth={10}
            guideText={traceMode ? q.kanji.char : undefined}
            cells={1}
          />
          <p className="mt-2 text-sm font-bold text-[var(--ink-soft)]">
            👆 ペンや ゆびで かいてね
          </p>
        </div>

        {/* 操作 */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button onClick={clearCanvas} className="btn-pop btn-white text-sm py-2">
            🔄 クリア
          </button>
          <button
            onClick={() => setShowHint((v) => !v)}
            className="btn-pop btn-yellow text-sm py-2"
            disabled={revealed}
          >
            💡 {showHint ? "ヒントOFF" : "ヒント"}
          </button>
          <button
            onClick={() => setTraceMode((v) => !v)}
            className="btn-pop btn-white text-sm py-2"
            disabled={revealed}
          >
            ✏️ {traceMode ? "なぞりOFF" : "なぞる"}
          </button>
        </div>

        {!revealed ? (
          <button onClick={reveal} className="btn-pop btn-blue w-full">
            こたえを みる
          </button>
        ) : (
          <div className="panel-soft p-5 anim-pop">
            <div className="flex items-center justify-between mb-3">
              <p className="font-black text-lg">こたえ</p>
              <span className="text-sm font-bold text-[var(--ink-soft)]">
                {q.kanji.strokes}かく
              </span>
            </div>
            <div className="flex items-baseline gap-4 mb-3">
              <span className="text-7xl font-black leading-none">{q.prompt.word}</span>
              <span className="text-base font-bold text-[var(--ink-soft)]">
                {q.prompt.reading}
              </span>
            </div>
            <p className="text-sm font-bold text-[var(--ink-soft)] mb-4">
              いみ：{q.kanji.meaning}
            </p>
            <p className="font-black mb-2">じぶんの じで くらべてみよう！</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => rate(false)} className="btn-pop btn-pink">
                😅 だめだった
              </button>
              <button onClick={() => rate(true)} className="btn-pop btn-green">
                😊 かけた！
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
