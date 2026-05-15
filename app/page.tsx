"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { KANJI_LIST } from "@/lib/kanji-data";
import {
  loadProgress,
  masteredCount as kanjiMasteredCount,
  learningCount as kanjiLearningCount,
} from "@/lib/kanji-storage";
import {
  KUKU_TOTAL,
  loadKukuProgress,
  kukuMasteredCount,
} from "@/lib/kuku-storage";

const KANJI_TOTAL = KANJI_LIST.length;

export default function HomePage() {
  const [kanjiMastered, setKanjiMastered] = useState(0);
  const [kanjiLearning, setKanjiLearning] = useState(0);
  const [kukuMastered, setKukuMastered] = useState(0);

  useEffect(() => {
    const k = loadProgress();
    setKanjiMastered(kanjiMasteredCount(k));
    setKanjiLearning(kanjiLearningCount(k));
    const m = loadKukuProgress();
    setKukuMastered(kukuMasteredCount(m));
  }, []);

  const totalMastered = kanjiMastered + kukuMastered;
  const totalCount = KANJI_TOTAL + KUKU_TOTAL;
  const overallPct = Math.round((totalMastered / totalCount) * 100);

  return (
    <main className="min-h-screen px-5 py-8">
      <div className="max-w-3xl mx-auto">
        {/* タイトル */}
        <header className="text-center mb-7">
          <div className="inline-block anim-bob mb-2">
            <span className="text-5xl md:text-6xl">📚</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-wide leading-tight">
            <span className="inline-block px-3 py-1 bg-yellow-300 rounded-2xl border-[3px] border-[var(--ink)] shadow-[4px_4px_0_var(--ink)]">
              小2
            </span>
            <span className="mx-2">おべんきょう</span>
            <span className="inline-block">!</span>
          </h1>
          <p className="mt-3 text-base md:text-lg font-bold text-[var(--ink-soft)]">
            漢字160もじ ＋ 九九81もんを たのしく おぼえよう！
          </p>
        </header>

        {/* 全体進捗 */}
        <section className="panel p-5 mb-7 anim-pop">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-black flex items-center gap-2">
              <span>⭐</span>きみの がくしゅう
            </h2>
            <span className="chip badge-mastered">{overallPct}%</span>
          </div>
          <div className="progress-track mb-3">
            <div className="progress-fill" style={{ width: `${overallPct}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="マスター" value={totalMastered} color="bg-yellow-300" />
            <Stat label="れんしゅう中" value={kanjiLearning} color="bg-sky-300" />
            <Stat
              label="のこり"
              value={Math.max(0, totalCount - totalMastered - kanjiLearning)}
              color="bg-white"
            />
          </div>
          <div className="mt-4 text-center">
            <Link href="/progress" className="btn-pop btn-purple text-sm px-4 py-2 inline-block">
              🏆 がくしゅうきろくを みる
            </Link>
          </div>
        </section>

        {/* 漢字セクション */}
        <Section
          emoji="📖"
          title="漢字"
          mastered={kanjiMastered}
          total={KANJI_TOTAL}
        >
          <ModeCard
            href="/quiz?type=yomi"
            emoji="🔤"
            title="よみクイズ"
            sub="よみかたを あてよう"
            cls="btn-pink"
          />
          <ModeCard
            href="/quiz?type=imi"
            emoji="💡"
            title="いみクイズ"
            sub="いみを あてよう"
            cls="btn-blue"
          />
          <ModeCard
            href="/write"
            emoji="✏️"
            title="かきクイズ"
            sub="ペンで かこう"
            cls="btn-orange"
          />
          <ModeCard
            href="/stroke"
            emoji="✍️"
            title="かきじゅん"
            sub="じゅんばんを みよう"
            cls="btn-blue"
          />
          <ModeCard
            href="/okurigana"
            emoji="🖊️"
            title="おくりがな"
            sub="おくりがなを かこう"
            cls="btn-purple"
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
            emoji="📚"
            title="いちらん"
            sub="160もじを みる"
            cls="btn-yellow"
          />
        </Section>

        {/* 算数セクション */}
        <Section
          emoji="🔢"
          title="算数"
          mastered={kukuMastered}
          total={KUKU_TOTAL}
        >
          <ModeCard
            href="/kuku"
            emoji="🧮"
            title="九九チャレンジ"
            sub="2×3=？ を こたえよう"
            cls="btn-pink"
            wide
          />
        </Section>

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
      className={`rounded-xl border-[3px] border-[var(--ink)] py-2 ${color}`}
      style={{ boxShadow: "3px 3px 0 var(--ink)" }}
    >
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs font-bold">{label}</div>
    </div>
  );
}

function Section({
  emoji,
  title,
  mastered,
  total,
  children,
}: {
  emoji: string;
  title: string;
  mastered: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-7">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-2xl font-black flex items-center gap-2">
          <span>{emoji}</span>
          {title}
        </h2>
        <span className="chip badge-new text-sm">
          {mastered} / {total} ⭐
        </span>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

function ModeCard({
  href,
  emoji,
  title,
  sub,
  cls,
  wide,
}: {
  href: string;
  emoji: string;
  title: string;
  sub: string;
  cls: string;
  wide?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`btn-pop ${cls} flex-col py-5 text-center ${wide ? "sm:col-span-2" : ""}`}
    >
      <div className="text-4xl mb-1">{emoji}</div>
      <div className="text-xl font-black">{title}</div>
      <div className="text-xs font-bold opacity-90 mt-1">{sub}</div>
    </Link>
  );
}
