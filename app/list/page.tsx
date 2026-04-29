"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { KANJI_LIST } from "@/lib/kanji-data";
import type { Kanji, AllProgress } from "@/lib/kanji-types";
import { loadProgress, getKanjiProgress } from "@/lib/kanji-storage";

type Filter = "all" | "mastered" | "learning" | "new";

export default function ListPage() {
  const [progress, setProgress] = useState<AllProgress>({});
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Kanji | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const filtered = useMemo(() => {
    return KANJI_LIST.filter((k) => {
      const p = getKanjiProgress(progress, k.char);
      if (filter === "mastered") return p.mastered;
      if (filter === "learning") return p.seen > 0 && !p.mastered;
      if (filter === "new") return p.seen === 0;
      return true;
    });
  }, [progress, filter]);

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <Header />

        {/* フィルタ */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <FilterBtn active={filter === "all"} onClick={() => setFilter("all")} label="ぜんぶ" cls="btn-white" />
          <FilterBtn active={filter === "mastered"} onClick={() => setFilter("mastered")} label="⭐ マスター" cls="btn-yellow" />
          <FilterBtn active={filter === "learning"} onClick={() => setFilter("learning")} label="れんしゅう中" cls="btn-blue" />
          <FilterBtn active={filter === "new"} onClick={() => setFilter("new")} label="まだ" cls="btn-pink" />
        </div>

        <p className="text-center font-bold mb-4 text-[var(--ink-soft)]">
          {filtered.length} もじ
        </p>

        {/* グリッド */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {filtered.map((k) => {
            const p = getKanjiProgress(progress, k.char);
            return (
              <button
                key={k.char}
                onClick={() => setSelected(k)}
                className={`kanji-tile ${p.mastered ? "is-mastered" : ""}`}
              >
                <span className="text-3xl md:text-4xl font-black">{k.char}</span>
                {p.mastered && <span className="absolute top-1 right-1 text-yellow-500">⭐</span>}
              </button>
            );
          })}
        </div>

        {selected && <DetailModal kanji={selected} onClose={() => setSelected(null)} />}
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between mb-6">
      <Link href="/" className="btn-pop btn-white text-base">← もどる</Link>
      <h1 className="text-2xl md:text-3xl font-black">📖 かんじいちらん</h1>
      <span className="w-20" />
    </header>
  );
}

function FilterBtn({
  active,
  onClick,
  label,
  cls,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  cls: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`btn-pop ${cls} text-base px-4 py-2 ${active ? "ring-4 ring-[var(--ink)] ring-offset-2" : "opacity-80"}`}
    >
      {label}
    </button>
  );
}

function DetailModal({ kanji, onClose }: { kanji: Kanji; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="panel p-6 max-w-md w-full anim-pop bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="text-7xl md:text-8xl font-black leading-none">{kanji.char}</div>
          <button onClick={onClose} className="btn-pop btn-white text-base px-3 py-1">×</button>
        </div>

        <div className="space-y-3">
          <Row label="いみ" value={kanji.meaning} />
          <Row label="かくすう" value={`${kanji.strokes}かく`} />
          {kanji.on.length > 0 && (
            <Row label="おんよみ" value={kanji.on.join("・")} />
          )}
          {kanji.kun.length > 0 && (
            <Row label="くんよみ" value={kanji.kun.join("・")} />
          )}
          <div>
            <div className="font-black text-[var(--ink-soft)] mb-1 text-sm">ことばの れい</div>
            <ul className="space-y-1">
              {kanji.examples.map((ex) => (
                <li key={ex.word} className="font-bold">
                  <span className="text-lg">{ex.word}</span>
                  <span className="ml-2 text-sm text-[var(--ink-soft)]">（{ex.reading}）</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="font-black text-[var(--ink-soft)] text-sm w-20 shrink-0">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
