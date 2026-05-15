"use client";

import { useState } from "react";
import type { MathLevel } from "@/lib/math-storage";
import LevelPicker from "../sansu/LevelPicker";
import ChallengeRunner, {
  shuffle,
  type ChallengeQuestion,
} from "../sansu/ChallengeRunner";
import AnalogClock from "./AnalogClock";

export default function JikokuPage() {
  const [level, setLevel] = useState<MathLevel | null>(null);

  if (level === null) {
    return (
      <LevelPicker
        mode="jikoku"
        title="時こく チャレンジ"
        emoji="🕐"
        levelDescriptions={{
          easy: "ちょうど の じこく（5時、6時 など）",
          normal: "30分・15分 きざみ（3時30分、4時15分 など）",
          hard: "5分きざみ（2時25分、9時55分 など）",
        }}
        onPick={setLevel}
      />
    );
  }

  return (
    <ChallengeRunner
      mode="jikoku"
      level={level}
      backHref="/jikoku"
      backLabel="← レベルにもどる"
      generate={() => makeJikoku(level)}
    />
  );
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeJikoku(level: MathLevel): ChallengeQuestion {
  const hour = rand(1, 12);
  let minute: number;
  if (level === "easy") {
    minute = 0;
  } else if (level === "normal") {
    minute = [0, 15, 30, 45][rand(0, 3)];
  } else {
    minute = rand(0, 11) * 5;
  }

  const correct = formatTime(hour, minute);
  const distractors = pickTimeDistractors(hour, minute, level, 3);
  const choices = shuffle([correct, ...distractors]);

  return {
    prompt: (
      <div className="flex flex-col items-center">
        <p className="font-black text-base text-[var(--ink-soft)] mb-4">
          いまは なんじ？
        </p>
        <AnalogClock hour={hour} minute={minute} size={220} />
      </div>
    ),
    choices,
    answerIndex: choices.indexOf(correct),
    explanation: (
      <span>
        みじかい はりが <b>{hour}</b> の あたり、ながい はりが{" "}
        <b>{minute === 0 ? "12" : minute / 5}</b> を さしている よ
      </span>
    ),
  };
}

function formatTime(h: number, m: number): string {
  return `${h}じ${m === 0 ? "" : `${m}ふん`}`;
}

function pickTimeDistractors(
  hour: number,
  minute: number,
  level: MathLevel,
  n: number,
): string[] {
  const set = new Set<string>();
  set.add(formatTime(hour, minute)); // 正解（除外用）
  let safety = 30;
  while (set.size - 1 < n && safety-- > 0) {
    const dh = rand(-2, 2);
    let h = hour + dh;
    if (h < 1) h += 12;
    if (h > 12) h -= 12;
    let m: number;
    if (level === "easy") {
      m = 0;
    } else if (level === "normal") {
      m = [0, 15, 30, 45][rand(0, 3)];
    } else {
      m = rand(0, 11) * 5;
    }
    set.add(formatTime(h, m));
  }
  set.delete(formatTime(hour, minute));
  return [...set].slice(0, n);
}
