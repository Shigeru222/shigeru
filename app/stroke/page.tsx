"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { KANJI_LIST } from "@/lib/kanji-data";
import STROKES from "@/lib/kanji-strokes.json";
import DrawingCanvas, {
  type DrawingCanvasHandle,
} from "../write/DrawingCanvas";
import StrokeOrderViewer from "./StrokeOrderViewer";

const STROKE_MAP = STROKES as Record<string, string[]>;

export default function StrokePage() {
  const initial = KANJI_LIST[0].char;
  const [char, setChar] = useState<string>(initial);
  const [filter, setFilter] = useState("");
  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const [showGuide, setShowGuide] = useState(true);

  const kanji = useMemo(
    () => KANJI_LIST.find((k) => k.char === char) ?? KANJI_LIST[0],
    [char],
  );
  const paths = STROKE_MAP[char] ?? [];

  const filtered = useMemo(() => {
    if (!filter.trim()) return KANJI_LIST;
    return KANJI_LIST.filter(
      (k) =>
        k.char.includes(filter) ||
        k.meaning.includes(filter) ||
        k.on.some((r) => r.includes(filter)) ||
        k.kun.some((r) => r.includes(filter)),
    );
  }, [filter]);

  function pick(c: string) {
    setChar(c);
    canvasRef.current?.clear();
  }

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-5">
          <Link href="/" className="btn-pop btn-white text-base">
            ← もどる
          </Link>
          <h1 className="text-2xl md:text-3xl font-black">✍️ かきじゅん れんしゅう</h1>
          <span className="w-20" />
        </header>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-6 mb-6">
          {/* 書き順表示 */}
          <section className="panel p-5 flex flex-col items-center">
            <div className="text-center mb-3">
              <p className="text-sm font-bold text-[var(--ink-soft)]">
                いま えらんでいる かんじ
              </p>
              <p className="text-xs font-bold text-[var(--ink-soft)] mt-1">
                {kanji.meaning}
                {kanji.kun.length > 0 && ` ／ くん：${kanji.kun.join("・")}`}
                {kanji.on.length > 0 && ` ／ おん：${kanji.on.join("・")}`}
              </p>
            </div>
            {paths.length > 0 ? (
              <StrokeOrderViewer
                key={char}
                char={char}
                paths={paths}
                strokeDurationMs={800}
              />
            ) : (
              <p className="text-sm font-bold text-[var(--ink-soft)]">
                データが ありません
              </p>
            )}
          </section>

          {/* なぞり練習 */}
          <section className="panel p-5 flex flex-col items-center">
            <p className="font-black text-base mb-1">
              ✏️ ペンで なぞって みよう
            </p>
            <p className="text-sm font-bold text-[var(--ink-soft)] mb-3">
              うすい かんじを なぞって かいて みよう
            </p>
            <DrawingCanvas
              ref={canvasRef}
              size={280}
              lineWidth={8}
              guideText={showGuide ? char : undefined}
              cells={1}
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => canvasRef.current?.clear()}
                className="btn-pop btn-white text-sm px-3 py-2"
              >
                🔄 クリア
              </button>
              <button
                onClick={() => setShowGuide((v) => !v)}
                className="btn-pop btn-yellow text-sm px-3 py-2"
              >
                {showGuide ? "ガイドOFF" : "ガイドON"}
              </button>
            </div>
          </section>
        </div>

        {/* 漢字ピッカー */}
        <section className="panel p-5">
          <div className="flex flex-wrap items-center justify-between mb-3 gap-3">
            <h2 className="text-lg font-black">かんじを えらぶ</h2>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="けんさく（よみ／いみ／かんじ）"
              className="flex-1 min-w-[180px] max-w-xs text-sm font-bold bg-white border-[3px] border-[var(--ink)] rounded-xl px-3 py-2 outline-none"
              style={{ boxShadow: "3px 3px 0 var(--ink)" }}
            />
          </div>
          <p className="text-xs font-bold text-[var(--ink-soft)] mb-2">
            {filtered.length} もじ
          </p>
          <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-2">
            {filtered.map((k) => (
              <button
                key={k.char}
                onClick={() => pick(k.char)}
                className={`aspect-square text-2xl font-black border-2 border-[var(--ink)] rounded-lg ${
                  char === k.char
                    ? "bg-[var(--pop-orange)] text-white"
                    : "bg-white"
                }`}
              >
                {k.char}
              </button>
            ))}
          </div>
        </section>

        <p className="mt-6 text-xs text-center font-bold text-[var(--ink-soft)]">
          書き順データ:{" "}
          <a
            href="https://kanjivg.tagaini.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            KanjiVG
          </a>{" "}
          ©︎ Ulrich Apel /{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/3.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            CC BY-SA 3.0
          </a>
        </p>
      </div>
    </main>
  );
}
