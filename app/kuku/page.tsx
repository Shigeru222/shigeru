"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  KukuAllProgress,
  KukuProblem,
  KukuQuestion,
} from "@/lib/kuku-types";
import {
  KUKU_TOTAL,
  allProblems,
  getKukuProgress,
  kukuMasteredCount,
  loadKukuProgress,
  recordKukuAnswer,
  saveKukuProgress,
} from "@/lib/kuku-storage";

const ROUND_LENGTH = 10;

type Selection = "all" | number; // 1〜9 で段、"all" で全部

export default function KukuPage() {
  const [progress, setProgress] = useState<KukuAllProgress>({});
  const [selection, setSelection] = useState<Selection | null>(null);

  useEffect(() => {
    setProgress(loadKukuProgress());
  }, []);

  if (selection !== null) {
    return (
      <KukuRound
        selection={selection}
        onFinish={() => {
          setProgress(loadKukuProgress());
          setSelection(null);
        }}
      />
    );
  }

  const mastered = kukuMasteredCount(progress);
  const pct = Math.round((mastered / KUKU_TOTAL) * 100);

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-5">
          <Link href="/" className="btn-pop btn-white text-base">← もどる</Link>
          <h1 className="text-2xl md:text-3xl font-black">🔢 九九チャレンジ</h1>
          <span className="w-20" />
        </header>

        {/* 進捗 */}
        <section className="panel p-5 mb-6 text-center">
          <p className="text-sm font-bold text-[var(--ink-soft)] mb-1">
            マスターした 九九
          </p>
          <div className="text-5xl font-black mb-2">
            {mastered}
            <span className="text-2xl text-[var(--ink-soft)]">/{KUKU_TOTAL}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </section>

        {/* 段別 */}
        <section className="panel p-5 mb-6">
          <h2 className="text-lg font-black mb-3">📚 段を えらぶ</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((dan) => {
              const danMastered = countDanMastered(progress, dan);
              const done = danMastered === 9;
              return (
                <button
                  key={dan}
                  onClick={() => setSelection(dan)}
                  className={`btn-pop ${done ? "btn-yellow" : "btn-white"} flex-col py-4`}
                >
                  <span className="text-2xl font-black">{dan}の段</span>
                  <span className="text-xs font-bold text-[var(--ink-soft)] mt-1">
                    {done ? "⭐ クリア！" : `${danMastered} / 9`}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ぜんぶ */}
        <section className="text-center">
          <button
            onClick={() => setSelection("all")}
            className="btn-pop btn-pink text-lg px-8 py-4"
          >
            🎲 ぜんぶの だんから ランダム
          </button>
        </section>

        {/* 九九表 */}
        <section className="panel p-5 mt-8">
          <h2 className="text-lg font-black mb-3">📊 きみの 九九ひょう</h2>
          <p className="text-xs font-bold text-[var(--ink-soft)] mb-3">
            ⭐ マスター（3かい れんぞく せいかい）
          </p>
          <div className="overflow-x-auto">
            <KukuGrid progress={progress} />
          </div>
        </section>
      </div>
    </main>
  );
}

/** 段別マスター数 */
function countDanMastered(p: KukuAllProgress, dan: number): number {
  let n = 0;
  for (let b = 1; b <= 9; b++) {
    if (getKukuProgress(p, dan, b).mastered) n++;
  }
  return n;
}

function KukuGrid({ progress }: { progress: KukuAllProgress }) {
  return (
    <table className="mx-auto border-collapse">
      <thead>
        <tr>
          <th className="p-1 text-xs font-bold text-[var(--ink-soft)]">×</th>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((b) => (
            <th key={b} className="p-1 text-xs font-bold text-[var(--ink-soft)]">
              {b}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((a) => (
          <tr key={a}>
            <th className="p-1 text-xs font-bold text-[var(--ink-soft)]">{a}</th>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((b) => {
              const cell = getKukuProgress(progress, a, b);
              return (
                <td
                  key={b}
                  className={`w-9 h-9 sm:w-10 sm:h-10 text-center border-2 border-[var(--ink)] font-black ${
                    cell.mastered
                      ? "bg-yellow-300"
                      : cell.seen > 0
                      ? "bg-sky-100"
                      : "bg-white"
                  }`}
                >
                  {a * b}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ============================================================
// 出題ラウンド
// ============================================================

function KukuRound({
  selection,
  onFinish,
}: {
  selection: Selection;
  onFinish: () => void;
}) {
  const questions = useMemo(
    () => buildKukuRound(selection, ROUND_LENGTH),
    [selection],
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (questions.length === 0) {
    return <div className="p-10 text-center">もんだいを じゅんびできませんでした。</div>;
  }

  const q = questions[index];
  const correct = selected !== null && selected === q.answerIndex;

  function pick(i: number) {
    if (selected !== null) return;
    setSelected(i);
    const isRight = i === q.answerIndex;
    if (isRight) setScore((s) => s + 1);
    const next = recordKukuAnswer(
      loadKukuProgress(),
      q.problem.a,
      q.problem.b,
      isRight,
    );
    saveKukuProgress(next);
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
            <button onClick={onFinish} className="btn-pop btn-pink">
              つぎの だんを えらぶ
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
          <button onClick={onFinish} className="btn-pop btn-white text-base">
            ← やめる
          </button>
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
        <div className="panel p-8 mb-5 text-center anim-pop">
          <p className="font-black text-base text-[var(--ink-soft)] mb-3">
            こたえは いくつ？
          </p>
          <div className="text-7xl md:text-8xl font-black leading-none tracking-wider">
            {q.problem.a} × {q.problem.b}
          </div>
          <div className="text-5xl font-black text-[var(--ink-soft)] mt-2">
            = ?
          </div>
        </div>

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
                className={`answer-card ${cls} text-center text-3xl`}
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
            <p className="text-2xl font-black">
              {q.problem.a} × {q.problem.b} ={" "}
              <span className="text-[var(--pop-orange)]">
                {q.problem.a * q.problem.b}
              </span>
            </p>
            <p className="text-sm font-bold text-[var(--ink-soft)] mt-1">
              {numToHiragana(q.problem.a)}・{numToHiragana(q.problem.b)} が{" "}
              {numToHiragana(q.problem.a * q.problem.b)}
            </p>
            <button onClick={next} className="btn-pop btn-orange mt-4 w-full">
              {index + 1 >= questions.length ? "けっかを みる →" : "つぎの もんだい →"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

// ============================================================
// 出題生成
// ============================================================

function buildKukuRound(selection: Selection, length: number): KukuQuestion[] {
  let pool: KukuProblem[];
  if (selection === "all") {
    pool = allProblems();
  } else {
    pool = [];
    for (let b = 1; b <= 9; b++) pool.push({ a: selection, b });
  }
  // shuffle と必要数を出すため、足りない場合は再シャッフルして補充
  const out: KukuQuestion[] = [];
  const shuffled = shuffle(pool);
  for (const p of shuffled) {
    out.push(makeQuestion(p));
    if (out.length >= length) break;
  }
  while (out.length < length) {
    out.push(makeQuestion(shuffled[Math.floor(Math.random() * shuffled.length)]));
  }
  return out;
}

function makeQuestion(problem: KukuProblem): KukuQuestion {
  const answer = problem.a * problem.b;
  const distractors = pickDistractors(answer, 3);
  const choices = shuffle([answer, ...distractors]);
  return {
    problem,
    choices,
    answerIndex: choices.indexOf(answer),
  };
}

/** 正解の前後・近隣 から ±不規則 にダミー選択肢を3つ生成 */
function pickDistractors(answer: number, n: number): number[] {
  const candidates = new Set<number>();
  // 前後 ±1〜±3
  for (const d of [1, -1, 2, -2, 3, -3, 4, -4]) {
    const v = answer + d;
    if (v > 0 && v !== answer) candidates.add(v);
  }
  // 隣接する積（同じ段の前後等）
  // 例: 6（=2×3）なら 4(=2×2) や 8(=2×4) を入れたい
  // 単純実装: ランダムに 1〜81 から少し追加
  const arr = shuffle([...candidates]);
  return arr.slice(0, n);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 数字を「に」「さん」など九九読み風に */
function numToHiragana(n: number): string {
  const map: Record<number, string> = {
    1: "いち",
    2: "に",
    3: "さん",
    4: "し",
    5: "ご",
    6: "ろく",
    7: "しち",
    8: "はち",
    9: "く",
    10: "じゅう",
    12: "じゅうに",
    14: "じゅうし",
    15: "じゅうご",
    16: "じゅうろく",
    18: "じゅうはち",
    20: "にじゅう",
    21: "にじゅういち",
    24: "にじゅうし",
    25: "にじゅうご",
    27: "にじゅうしち",
    28: "にじゅうはち",
    30: "さんじゅう",
    32: "さんじゅうに",
    35: "さんじゅうご",
    36: "さんじゅうろく",
    40: "しじゅう",
    42: "しじゅうに",
    45: "しじゅうご",
    48: "しじゅうはち",
    49: "しじゅうく",
    54: "ごじゅうし",
    56: "ごじゅうろく",
    63: "ろくじゅうさん",
    64: "ろくじゅうし",
    72: "しちじゅうに",
    81: "はちじゅういち",
  };
  return map[n] ?? String(n);
}
