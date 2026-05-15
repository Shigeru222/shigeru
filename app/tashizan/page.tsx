"use client";

import { useState } from "react";
import type { MathLevel } from "@/lib/math-storage";
import LevelPicker from "../sansu/LevelPicker";
import ChallengeRunner, {
  makeNumberChoices,
  type ChallengeQuestion,
} from "../sansu/ChallengeRunner";

export default function TashizanPage() {
  const [level, setLevel] = useState<MathLevel | null>(null);

  if (level === null) {
    return (
      <LevelPicker
        mode="tashizan"
        title="たし算チャレンジ"
        emoji="➕"
        levelDescriptions={{
          easy: "1けた ＋ 1けた（くりあがり なし／あり）",
          normal: "2けた ＋ 1けた（くりあがり あり）",
          hard: "2けた ＋ 2けた（くりあがり あり）",
        }}
        onPick={setLevel}
      />
    );
  }

  return (
    <ChallengeRunner
      mode="tashizan"
      level={level}
      backHref="/tashizan"
      backLabel="← レベルにもどる"
      generate={() => makeTashizan(level)}
    />
  );
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeTashizan(level: MathLevel): ChallengeQuestion {
  let a: number;
  let b: number;
  if (level === "easy") {
    a = rand(1, 9);
    b = rand(1, 9);
  } else if (level === "normal") {
    // くりあがり ありを多めに
    a = rand(11, 99);
    b = rand(2, 9);
  } else {
    a = rand(11, 89);
    b = rand(11, 99 - a > 0 ? Math.min(99, 99) : 50);
    // 合計を 200 未満に
    if (a + b > 199) b = rand(11, 99 - a > 0 ? 99 - a : 11);
  }
  const answer = a + b;
  const { choices, answerIndex } = makeNumberChoices(answer, { min: 0, max: 200 });
  return {
    prompt: (
      <div>
        <p className="font-black text-base text-[var(--ink-soft)] mb-3">
          こたえは いくつ？
        </p>
        <div className="text-6xl md:text-7xl font-black tracking-wider">
          {a} ＋ {b}
        </div>
        <div className="text-4xl md:text-5xl font-black text-[var(--ink-soft)] mt-2">
          = ?
        </div>
      </div>
    ),
    choices,
    answerIndex,
    explanation: (
      <span>
        {a} ＋ {b} ={" "}
        <span className="text-base text-[var(--pop-green)] font-black">{answer}</span>
      </span>
    ),
  };
}
