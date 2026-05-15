"use client";

import { useState } from "react";
import type { MathLevel } from "@/lib/math-storage";
import LevelPicker from "../sansu/LevelPicker";
import ChallengeRunner, {
  shuffle,
  type ChallengeQuestion,
} from "../sansu/ChallengeRunner";

export default function TaniPage() {
  const [level, setLevel] = useState<MathLevel | null>(null);

  if (level === null) {
    return (
      <LevelPicker
        mode="tani"
        title="たんい チャレンジ"
        emoji="📏"
        levelDescriptions={{
          easy: "1m＝100cm／1L＝10dL／1dL＝100mL の きほん",
          normal: "230cm は なんm なんcm？ など",
          hard: "1m25cm ＋ 80cm は？ など、たし算・ひき算もまじる",
        }}
        onPick={setLevel}
      />
    );
  }

  return (
    <ChallengeRunner
      mode="tani"
      level={level}
      backHref="/tani"
      backLabel="← レベルにもどる"
      generate={() => makeTani(level)}
    />
  );
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type Family = "length" | "volume";

function pickFamily(): Family {
  return Math.random() < 0.55 ? "length" : "volume";
}

function makeTani(level: MathLevel): ChallengeQuestion {
  if (level === "easy") return makeEasy();
  if (level === "normal") return makeNormal();
  return makeHard();
}

// ============================================================
// やさしい：基本換算
// ============================================================
function makeEasy(): ChallengeQuestion {
  const family = pickFamily();
  // length: 1m = 100cm
  // volume: 1L = 10dL, 1dL = 100mL
  type Pair = { q: string; a: string; alts: string[] };
  const lengthPairs: Pair[] = [
    { q: "1m は なんcm？", a: "100cm", alts: ["10cm", "1000cm", "50cm"] },
    { q: "100cm は なんm？", a: "1m", alts: ["10m", "100m", "0m"] },
    { q: "200cm は なんm？", a: "2m", alts: ["20m", "200m", "0m"] },
    { q: "3m は なんcm？", a: "300cm", alts: ["30cm", "3000cm", "33cm"] },
  ];
  const volumePairs: Pair[] = [
    { q: "1L は なんdL？", a: "10dL", alts: ["1dL", "100dL", "20dL"] },
    { q: "1dL は なんmL？", a: "100mL", alts: ["10mL", "1000mL", "50mL"] },
    { q: "5dL は なんL？", a: "0.5L", alts: ["5L", "50L", "0.05L"] },
    { q: "2L は なんdL？", a: "20dL", alts: ["2dL", "200dL", "10dL"] },
  ];
  const pool = family === "length" ? lengthPairs : volumePairs;
  const p = pool[rand(0, pool.length - 1)];
  const choices = shuffle([p.a, ...p.alts]);
  return {
    prompt: (
      <p className="text-3xl md:text-4xl font-black leading-snug">{p.q}</p>
    ),
    choices,
    answerIndex: choices.indexOf(p.a),
    explanation: <span>{p.q.replace("なんcm", "は").replace("なんdL", "は").replace("なんmL", "は").replace("なんm", "は").replace("なんL", "は")} {p.a}</span>,
  };
}

// ============================================================
// ふつう：複合表記
// ============================================================
function makeNormal(): ChallengeQuestion {
  const family = pickFamily();
  if (family === "length") {
    // ?cm → ?m?cm （例: 230cm → 2m30cm）
    const total = rand(101, 599);
    const m = Math.floor(total / 100);
    const cm = total % 100;
    const correct = `${m}m${cm}cm`;
    const distractors = shuffle([
      `${m}m${cm * 10}cm`,
      `${m + 1}m${cm}cm`,
      `${total}m`,
      `${cm}m${m}cm`,
    ]).slice(0, 3);
    const choices = shuffle([correct, ...distractors]);
    return {
      prompt: (
        <p className="text-3xl md:text-4xl font-black leading-snug">
          {total}cm は なん m なん cm？
        </p>
      ),
      choices,
      answerIndex: choices.indexOf(correct),
      explanation: (
        <span>
          100cm が {m}つで {m}m、のこり {cm}cm
        </span>
      ),
    };
  }
  // volume: ?dL → ?L?dL
  const total = rand(11, 49);
  const l = Math.floor(total / 10);
  const dl = total % 10;
  const correct = dl === 0 ? `${l}L` : `${l}L${dl}dL`;
  const distractors = shuffle([
    dl === 0 ? `${l}dL` : `${l}dL${dl}L`,
    `${total}L`,
    `${l + 1}L${dl}dL`,
    `${l}L${dl * 10}dL`,
  ]).slice(0, 3);
  const choices = shuffle([correct, ...distractors]);
  return {
    prompt: (
      <p className="text-3xl md:text-4xl font-black leading-snug">
        {total}dL は なん L なん dL？
      </p>
    ),
    choices,
    answerIndex: choices.indexOf(correct),
    explanation: (
      <span>
        10dL が {l}つで {l}L、のこり {dl}dL
      </span>
    ),
  };
}

// ============================================================
// むずかしい：単位 の たし算・ひき算
// ============================================================
function makeHard(): ChallengeQuestion {
  // length のみ（理解しやすい）
  // 例: 1m20cm + 50cm = 1m70cm
  //     2m30cm - 80cm = 1m50cm
  const op = Math.random() < 0.5 ? "add" : "sub";
  const m1 = rand(1, 4);
  const cm1 = rand(0, 99);
  const total1 = m1 * 100 + cm1;
  const cm2 = rand(10, 90);
  const total2 = op === "add" ? cm2 : Math.min(cm2, total1 - 1);

  const result = op === "add" ? total1 + total2 : total1 - total2;
  const rm = Math.floor(result / 100);
  const rcm = result % 100;
  const correct = rm > 0 ? `${rm}m${rcm}cm` : `${rcm}cm`;

  const wrong1 = `${rm + 1}m${rcm}cm`;
  const wrong2 = `${rm}m${(rcm + 10) % 100}cm`;
  const wrong3 = `${result}m`;
  const choices = shuffle([correct, wrong1, wrong2, wrong3]);
  return {
    prompt: (
      <p className="text-3xl md:text-4xl font-black leading-snug">
        {m1}m{cm1}cm {op === "add" ? "＋" : "－"} {total2}cm = ?
      </p>
    ),
    choices,
    answerIndex: choices.indexOf(correct),
    explanation: (
      <span>
        {total1}cm {op === "add" ? "＋" : "－"} {total2}cm = {result}cm
        ＝ {correct}
      </span>
    ),
  };
}
