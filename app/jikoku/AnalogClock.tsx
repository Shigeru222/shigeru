"use client";

type Props = {
  /** 時 (1〜12) */
  hour: number;
  /** 分 (0〜59) */
  minute: number;
  size?: number;
};

/**
 * 子ども向けのシンプルなアナログ時計。
 * 文字盤の数字 1〜12、5分ごとの目盛り、時針（短）と分針（長）。
 */
export default function AnalogClock({ hour, minute, size = 200 }: Props) {
  const cx = 50;
  const cy = 50;
  const r = 46;

  // 角度は12時=0度、時計回り
  const minuteAngle = (minute / 60) * 360;
  // 時針は時間+分に応じて動く
  const hourAngle = ((hour % 12) / 12) * 360 + (minute / 60) * 30;

  // 数字の位置 (12時=0, 3時=90, 6時=180, 9時=270)
  const numbers = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    const a = (n / 12) * 360 - 90; // -90 で 12時を上に
    const rad = (a * Math.PI) / 180;
    const tr = r - 8;
    return {
      n,
      x: cx + tr * Math.cos(rad),
      y: cy + tr * Math.sin(rad) + 3, // テキスト中央寄せ補正
    };
  });

  // 5分ごとの目盛り
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i / 60) * 360 - 90;
    const rad = (a * Math.PI) / 180;
    const major = i % 5 === 0;
    const inner = major ? r - 4 : r - 2;
    const outer = r;
    return {
      x1: cx + inner * Math.cos(rad),
      y1: cy + inner * Math.sin(rad),
      x2: cx + outer * Math.cos(rad),
      y2: cy + outer * Math.sin(rad),
      major,
    };
  });

  // 針の終端
  const minHand = polarToXY(cx, cy, r - 12, minuteAngle - 90);
  const hourHand = polarToXY(cx, cy, r - 24, hourAngle - 90);

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-label="アナログ時計">
      {/* 文字盤 */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="#fff"
        stroke="#3d2914"
        strokeWidth="2.5"
      />
      {/* 目盛り */}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke="#3d2914"
          strokeWidth={t.major ? 1.2 : 0.4}
        />
      ))}
      {/* 数字 */}
      {numbers.map(({ n, x, y }) => (
        <text
          key={n}
          x={x}
          y={y}
          textAnchor="middle"
          fontSize="9"
          fontWeight="900"
          fill="#3d2914"
          fontFamily="Hiragino Maru Gothic ProN, sans-serif"
        >
          {n}
        </text>
      ))}
      {/* 5分ごとの分の数字（小さく内側に） */}
      {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => {
        const a = (m / 60) * 360 - 90;
        const rad = (a * Math.PI) / 180;
        const tr = r - 18;
        const x = cx + tr * Math.cos(rad);
        const y = cy + tr * Math.sin(rad) + 1.5;
        return (
          <text
            key={m}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize="3.5"
            fontWeight="700"
            fill="#ff7aa2"
          >
            {m}
          </text>
        );
      })}
      {/* 時針（太く短い） */}
      <line
        x1={cx}
        y1={cy}
        x2={hourHand.x}
        y2={hourHand.y}
        stroke="#3d2914"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* 分針（細く長い） */}
      <line
        x1={cx}
        y1={cy}
        x2={minHand.x}
        y2={minHand.y}
        stroke="#ff7aa2"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* 中心 */}
      <circle cx={cx} cy={cy} r="2.5" fill="#3d2914" />
    </svg>
  );
}

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
