"use client";

import { useState } from "react";
import type { MathLevel } from "@/lib/math-storage";
import LevelPicker from "../sansu/LevelPicker";
import ChallengeRunner, {
  makeNumberChoices,
  type ChallengeQuestion,
} from "../sansu/ChallengeRunner";

export default function HikizanPage() {
  const [level, setLevel] = useState<MathLevel | null>(null);

  if (level === null) {
    return (
      <LevelPicker
        mode="hikizan"
        title="ひき算チャレンジ"
        emoji="➖"
        levelDescriptions={{
          easy: "1けた － 1けた（こたえは 0いじょう）",
          normal: "2けた － 1けた（くりさがり あり）",
          hard: "2けた － 2けた（くりさがり あり）",
        }}
        onPick={setLevel}
      />
    );
  }

  return (
    <ChallengeRunner
      mode="hikizan"
      level={level}
      backHref="/hikizan"
      backLabel="← レベルにもどる"
      generate={() => makeHikizan(level)}
    />
  );
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeHikizan(level: MathLevel): ChallengeQuestion {
  let a: number;
  let b: number;
  if (level === "easy") {
    a = rand(1, 9);
    b = rand(1, a);
  } else if (level === "normal") {
    a = rand(11, 99);
    b = rand(2, Math.min(9, a));
  } else {
    a = rand(20, 99);
    b = rand(11, a - 1);
  }
  const answer = a - b;
  const { choices, answerIndex } = makeNumberChoices(answer, { min: 0, max: 100 });
  return {
    prompt: (
      <div>
        <p className="font-black text-base text-[var(--ink-soft)] mb-3">
          こたえは いくつ？
        </p>
        <div className="text-6xl md:text-7xl font-black tracking-wider">
          {a} － {b}
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
        {a} － {b} ={" "}
        <span className="text-base text-[var(--pop-green)] font-black">{answer}</span>
      </span>
    ),
  };
}
