"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { KANJI_LIST } from "@/lib/kanji-data";
import { loadProgress, masteredCount, learningCount } from "@/lib/kanji-storage";

export default function HomePage() {
  const [mastered, setMastered] = useState(0);
  const [learning, setLearning] = useState(0);

  useEffect(() => {
    const p = loadProgress();
    setMastered(masteredCount(p));
    setLearning(learningCount(p));
  }, []);

  const total = KANJI_LIST.length;
  const pct = Math.round((mastered / total) * 100);

  return (
    <main className="min-h-screen px-5 py-10">
      <div className="max-w-3xl mx-auto">
        {/* タイトル */}
        <header className="text-center mb-8">
          <div className="inline-block anim-bob mb-3">
            <span className="text-6xl md:text-7xl">📚</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-wide leading-tight">
            <span className="inline-block px-3 py-1 bg-yellow-300 rounded-2xl border-[3px] border-[var(--ink)] shadow-[4px_4px_0_var(--ink)] anim-wiggle">
              かんじ
            </span>
            <span className="mx-2">チャレンジ</span>
            <span className="inline-block">!</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl font-bold text-[var(--ink-soft)]">
            小学2年生の かんじ <strong className="text-[var(--ink)]">160もじ</strong> を たのしく おぼえよう！
          </p>
        </header>

        {/* 進捗カード */}
        <section className="panel p-6 mb-8 anim-pop">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-black flex items-center gap-2">
              <span>⭐</span>きみの がくしゅうきろく
            </h2>
            <span className="chip badge-mastered">{pct}%</span>
          </div>
          <div className="progress-track mb-4">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="マスター" value={mastered} color="bg-yellow-300" />
            <Stat label="れんしゅう中" value={learning} color="bg-sky-300" />
            <Stat label="のこり" value={total - mastered - learning} color="bg-white" />
          </div>
        </section>

        {/* モード選択 */}
        <section className="grid sm:grid-cols-2 gap-5 mb-8">
          <ModeCard
            href="/quiz?type=yomi"
            emoji="🔤"
            title="よみクイズ"
            sub="かんじの よみかたを あてよう"
            cls="btn-pink"
          />
          <ModeCard
            href="/quiz?type=imi"
            emoji="💡"
            title="いみクイズ"
            sub="かんじの いみを あてよう"
            cls="btn-blue"
          />
          <ModeCard
            href="/write"
            emoji="✏️"
            title="かきクイズ"
            sub="ペンで かんじを かいてみよう"
            cls="btn-orange"
          />
          <ModeCard
            href="/flashcard"
            emoji="🃏"
            title="フラッシュカード"
            sub="めくって おぼえよう"
            cls="btn-green"
          />
          <ModeCard
            href="/list"
            emoji="📖"
            title="かんじ いちらん"
            sub="160もじを ぜんぶ みる"
            cls="btn-yellow"
          />
          <ModeCard
            href="/progress"
            emoji="🏆"
            title="がくしゅうきろく"
            sub="きみの せいせきを みる"
            cls="btn-purple"
          />
        </section>

        <footer className="mt-12 text-center text-sm text-[var(--ink-soft)] font-bold space-y-2">
          <p>まいにち すこしずつ がんばろう！</p>
          <p>
            <a
              href="/REQUIREMENTS.md"
              download
              className="underline hover:text-[var(--pop-orange)]"
            >
              📄 要件定義書をダウンロード
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className={`rounded-xl border-[3px] border-[var(--ink)] py-3 ${color}`}
      style={{ boxShadow: "3px 3px 0 var(--ink)" }}
    >
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs font-bold">{label}</div>
    </div>
  );
}

function ModeCard({
  href,
  emoji,
  title,
  sub,
  cls,
}: {
  href: string;
  emoji: string;
  title: string;
  sub: string;
  cls: string;
}) {
  return (
    <Link href={href} className={`btn-pop ${cls} flex-col py-6 text-center`}>
      <div className="text-5xl mb-2">{emoji}</div>
      <div className="text-2xl font-black">{title}</div>
      <div className="text-sm font-bold opacity-90 mt-1">{sub}</div>
    </Link>
  );
}
