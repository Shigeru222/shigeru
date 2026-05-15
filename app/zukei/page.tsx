"use client";

import { useState } from "react";
import type { MathLevel } from "@/lib/math-storage";
import LevelPicker from "../sansu/LevelPicker";
import ChallengeRunner, {
  shuffle,
  type ChallengeQuestion,
} from "../sansu/ChallengeRunner";

export default function ZukeiPage() {
  const [level, setLevel] = useState<MathLevel | null>(null);

  if (level === null) {
    return (
      <LevelPicker
        mode="zukei"
        title="ずけい チャレンジ"
        emoji="🔺"
        levelDescriptions={{
          easy: "三角形・四角形・長方形・正方形 の 名まえ",
          normal: "へん（線）の 数を かぞえよう",
          hard: "ちょう点（かど）の 数 と 直角の数を こたえよう",
        }}
        onPick={setLevel}
      />
    );
  }

  return (
    <ChallengeRunner
      mode="zukei"
      level={level}
      backHref="/zukei"
      backLabel="← レベルにもどる"
      generate={() => makeZukei(level)}
    />
  );
}

type ShapeKind = "triangle" | "rectangle" | "square" | "pentagon" | "hexagon";

type Shape = {
  kind: ShapeKind;
  /** 名前（やさしい） */
  name: string;
  /** 辺の数 */
  edges: number;
  /** 頂点（かど） の数 */
  vertices: number;
  /** 直角の数（小2の範囲では 三角形=0/長方形=4/正方形=4/ふつうの三角形=0） */
  rightAngles: number;
  /** SVGポリゴン頂点（viewBox 0 0 100 100） */
  points: [number, number][];
};

const SHAPES: Shape[] = [
  {
    kind: "triangle",
    name: "三角形",
    edges: 3,
    vertices: 3,
    rightAngles: 0,
    points: [
      [50, 12],
      [88, 82],
      [12, 82],
    ],
  },
  {
    kind: "rectangle",
    name: "長方形",
    edges: 4,
    vertices: 4,
    rightAngles: 4,
    points: [
      [12, 25],
      [88, 25],
      [88, 75],
      [12, 75],
    ],
  },
  {
    kind: "square",
    name: "正方形",
    edges: 4,
    vertices: 4,
    rightAngles: 4,
    points: [
      [22, 22],
      [78, 22],
      [78, 78],
      [22, 78],
    ],
  },
  {
    kind: "pentagon",
    name: "五角形",
    edges: 5,
    vertices: 5,
    rightAngles: 0,
    points: regularPolygon(5, 50, 52, 38),
  },
  {
    kind: "hexagon",
    name: "六角形",
    edges: 6,
    vertices: 6,
    rightAngles: 0,
    points: regularPolygon(6, 50, 50, 38),
  },
];

function regularPolygon(
  n: number,
  cx: number,
  cy: number,
  r: number,
): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

function ShapeSVG({ shape, size = 200 }: { shape: Shape; size?: number }) {
  const d = shape.points.map(([x, y]) => `${x},${y}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <polygon
        points={d}
        fill="#ffd34d"
        stroke="#3d2914"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function makeZukei(level: MathLevel): ChallengeQuestion {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  if (level === "easy") {
    // 形の名前を当てる
    const distractors = shuffle(
      SHAPES.filter((s) => s.kind !== shape.kind).map((s) => s.name),
    ).slice(0, 3);
    const choices = shuffle([shape.name, ...distractors]);
    return {
      prompt: (
        <div className="flex flex-col items-center">
          <p className="font-black text-base text-[var(--ink-soft)] mb-3">
            この かたちの 名まえは？
          </p>
          <ShapeSVG shape={shape} />
        </div>
      ),
      choices,
      answerIndex: choices.indexOf(shape.name),
    };
  }

  if (level === "normal") {
    // 辺の数
    const correct = String(shape.edges);
    const distractors = shuffle([3, 4, 5, 6, 7, 8].filter((n) => n !== shape.edges))
      .slice(0, 3)
      .map(String);
    const choices = shuffle([correct, ...distractors]);
    return {
      prompt: (
        <div className="flex flex-col items-center">
          <p className="font-black text-base text-[var(--ink-soft)] mb-3">
            この かたちの「へん（せん）」は いくつ？
          </p>
          <ShapeSVG shape={shape} />
        </div>
      ),
      choices,
      answerIndex: choices.indexOf(correct),
      explanation: (
        <span>
          {shape.name} の へんは <b>{shape.edges}</b> つ
        </span>
      ),
    };
  }

  // hard: 直角の数 or 頂点
  const askRightAngle = Math.random() < 0.5;
  if (askRightAngle) {
    const correct = String(shape.rightAngles);
    const distractors = shuffle([0, 1, 2, 3, 4, 5, 6].filter((n) => n !== shape.rightAngles))
      .slice(0, 3)
      .map(String);
    const choices = shuffle([correct, ...distractors]);
    return {
      prompt: (
        <div className="flex flex-col items-center">
          <p className="font-black text-base text-[var(--ink-soft)] mb-3">
            「直角（ちょっかく）」は いくつ ある？
          </p>
          <ShapeSVG shape={shape} />
        </div>
      ),
      choices,
      answerIndex: choices.indexOf(correct),
      explanation: (
        <span>
          {shape.name} の 直角は <b>{shape.rightAngles}</b> つ
        </span>
      ),
    };
  }
  const correct = String(shape.vertices);
  const distractors = shuffle([3, 4, 5, 6, 7, 8].filter((n) => n !== shape.vertices))
    .slice(0, 3)
    .map(String);
  const choices = shuffle([correct, ...distractors]);
  return {
    prompt: (
      <div className="flex flex-col items-center">
        <p className="font-black text-base text-[var(--ink-soft)] mb-3">
          「ちょう点（かど）」は いくつ？
        </p>
        <ShapeSVG shape={shape} />
      </div>
    ),
    choices,
    answerIndex: choices.indexOf(correct),
    explanation: (
      <span>
        {shape.name} の かどは <b>{shape.vertices}</b> つ
      </span>
    ),
  };
}
