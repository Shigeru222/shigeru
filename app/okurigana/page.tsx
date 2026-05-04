"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { KANJI_LIST } from "@/lib/kanji-data";
import type { Kanji } from "@/lib/kanji-types";
import {
  getOkuriganaPrompt,
  shuffle,
  type OkuriganaPrompt,
} from "@/lib/kanji-quiz";
import { loadProgress, recordAnswer, saveProgress } from "@/lib/kanji-storage";
import { KANJI_HINTS } from "@/lib/kanji-hints";
import DrawingCanvas, {
  type DrawingCanvasHandle,
} from "../write/DrawingCanvas";

const ROUND_LENGTH = 10;

type Question = { kanji: Kanji; prompt: OkuriganaPrompt };

/** ヒント文に答えの読みが含まれていないか検査して返す */
function hintFor(char: string, answerReading: string): string | null {
  const hint = KANJI_HINTS[char];
  if (!hint) return null;
  if (hint.includes(answerReading)) return null;
  return hint;
}

export default function OkuriganaPage() {
  const questions = useMemo<Question[]>(() => {
    const pool = KANJI_LIST.flatMap((k) => {
      const p = getOkuriganaPrompt(k);
      return p ? [{ kanji: k, prompt: p }] : [];
    });
    return shuffle(pool).slice(0, ROUND_LENGTH);
  }, []);

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [traceMode, setTraceMode] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [done, setDone] = useState(false);
  const canvasRef = useRef<DrawingCanvasHandle>(null);

  if (questions.length === 0) {
    return <div className="p-10 text-center">もんだいを じゅんびできませんでした。</div>;
  }

  const q = questions[index];
  const cells = q.prompt.word.length; // 例: "送る"=2, "明るい"=3

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
            <Link href="/okurigana" className="btn-pop btn-purple">
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

  // キャンバスサイズ：1マス 200px、最大幅は画面に合わせて 600px
  const cellSize = 200;
  const canvasWidth = Math.min(cellSize * cells, 600);
  const canvasHeight = canvasWidth / cells;

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-5">
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
            この ことばを <span className="text-[var(--pop-purple)]">かんじ＋おくりがな</span> で かこう
          </p>
          <div className="text-5xl md:text-6xl font-black leading-none">
            {q.prompt.reading}
          </div>
          {showHint && (
            <p className="mt-3 text-base font-bold leading-relaxed">
              <span className="text-[var(--pop-orange)] mr-1">ヒント：</span>
              {hintFor(q.kanji.char, q.prompt.reading) ?? q.kanji.meaning}
            </p>
          )}
        </div>

        {/* キャンバス */}
        <div className="flex flex-col items-center mb-4">
          <DrawingCanvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            lineWidth={10}
            cells={cells}
            guideText={traceMode ? q.prompt.word : undefined}
          />
          <p className="mt-2 text-sm font-bold text-[var(--ink-soft)]">
            👆 マスに 1もじずつ かいてね
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
            <div className="flex items-center justify-between mb-2">
              <p className="font-black text-lg">こたえ</p>
              <span className="text-sm font-bold text-[var(--ink-soft)]">
                {q.kanji.strokes}かく（かんじ）
              </span>
            </div>
            <div className="flex items-baseline gap-3 mb-3 flex-wrap">
              <span className="text-6xl font-black leading-none">
                <span>{q.prompt.kanji}</span>
                <span className="text-[var(--pop-purple)]">{q.prompt.okurigana}</span>
              </span>
              <span className="text-base font-bold text-[var(--ink-soft)]">
                {q.prompt.reading}
              </span>
            </div>
            <p className="text-sm font-bold text-[var(--ink-soft)] mb-1">
              おくりがな：
              <span className="text-base text-[var(--pop-purple)]">「{q.prompt.okurigana}」</span>
            </p>
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
