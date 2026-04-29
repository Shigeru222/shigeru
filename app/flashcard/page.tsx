"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { KANJI_LIST } from "@/lib/kanji-data";
import type { Kanji } from "@/lib/kanji-types";
import { loadProgress, recordAnswer, saveProgress } from "@/lib/kanji-storage";

const DECK_SIZE = 20;

export default function FlashcardPage() {
  const deck = useMemo(() => shuffle(KANJI_LIST).slice(0, DECK_SIZE), []);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [done, setDone] = useState(false);

  const card = deck[index];

  function rate(known: boolean) {
    if (known) setKnownCount((c) => c + 1);
    saveProgress(recordAnswer(loadProgress(), card.char, known));
    if (index + 1 >= deck.length) {
      setDone(true);
    } else {
      setIndex(index + 1);
      setFlipped(false);
    }
  }

  if (done) {
    const pct = Math.round((knownCount / deck.length) * 100);
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="panel p-8 max-w-md w-full text-center anim-pop">
          <div className="text-6xl mb-3">🎴</div>
          <h2 className="text-2xl font-black mb-3">おつかれさま！</h2>
          <p className="text-lg font-bold mb-1">{deck.length}まいの カードを みたよ！</p>
          <div className="text-4xl font-black my-3">
            おぼえた：{knownCount} / {deck.length}（{pct}%）
          </div>
          <div className="flex flex-col gap-3 mt-6">
            <Link href="/flashcard" className="btn-pop btn-green">
              つぎの カードを みる
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
          <Link href="/" className="btn-pop btn-white text-base">← やめる</Link>
          <span className="chip badge-new">
            {index + 1} / {deck.length}
          </span>
          <span className="chip badge-mastered">⭐ {knownCount}</span>
        </header>

        <div className="progress-track mb-6">
          <div className="progress-fill" style={{ width: `${(index / deck.length) * 100}%` }} />
        </div>

        {/* カード */}
        <button
          onClick={() => setFlipped(!flipped)}
          className="panel w-full p-10 mb-5 cursor-pointer min-h-[320px] flex items-center justify-center anim-pop"
          aria-label="カードをめくる"
        >
          {flipped ? <CardBack kanji={card} /> : <CardFront kanji={card} />}
        </button>

        <p className="text-center font-bold text-[var(--ink-soft)] mb-4">
          {flipped ? "おぼえていた？" : "👆 タップして こたえを みる"}
        </p>

        {flipped ? (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => rate(false)} className="btn-pop btn-pink">
              😅 わからなかった
            </button>
            <button onClick={() => rate(true)} className="btn-pop btn-green">
              😊 おぼえてた！
            </button>
          </div>
        ) : (
          <button
            onClick={() => setFlipped(true)}
            className="btn-pop btn-yellow w-full"
          >
            こたえを みる
          </button>
        )}
      </div>
    </main>
  );
}

function CardFront({ kanji }: { kanji: Kanji }) {
  return (
    <div className="text-center">
      <div className="text-9xl font-black leading-none">{kanji.char}</div>
      <p className="mt-4 text-sm font-bold text-[var(--ink-soft)]">
        この かんじの よみと いみは？
      </p>
    </div>
  );
}

function CardBack({ kanji }: { kanji: Kanji }) {
  return (
    <div className="w-full">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-6xl font-black">{kanji.char}</span>
        <span className="text-sm font-bold text-[var(--ink-soft)]">
          {kanji.strokes}かく
        </span>
      </div>
      <div className="space-y-2 text-base font-bold">
        <p>
          <span className="text-[var(--ink-soft)] mr-2">いみ</span>
          {kanji.meaning}
        </p>
        {kanji.on.length > 0 && (
          <p>
            <span className="text-[var(--ink-soft)] mr-2">おん</span>
            {kanji.on.join("・")}
          </p>
        )}
        {kanji.kun.length > 0 && (
          <p>
            <span className="text-[var(--ink-soft)] mr-2">くん</span>
            {kanji.kun.join("・")}
          </p>
        )}
        {kanji.examples[0] && (
          <p>
            <span className="text-[var(--ink-soft)] mr-2">れい</span>
            {kanji.examples[0].word}（{kanji.examples[0].reading}）
          </p>
        )}
      </div>
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
