"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** 表示する漢字 */
  char: string;
  /** ストロークパスの配列（d 属性） */
  paths: string[];
  /** 1画あたりのアニメーション時間(ms) */
  strokeDurationMs?: number;
  /** 自動再生 */
  autoPlay?: boolean;
  /** ストローク番号を表示 */
  showNumbers?: boolean;
};

/**
 * KanjiVG ベースの書き順表示。
 * 1画ずつ順番に「描かれる」アニメーションを再生する。
 */
export default function StrokeOrderViewer({
  char,
  paths,
  strokeDurationMs = 700,
  autoPlay = true,
  showNumbers = true,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeIndex, setActiveIndex] = useState(autoPlay ? 0 : paths.length);
  const [playing, setPlaying] = useState(autoPlay);
  const [lengths, setLengths] = useState<number[]>([]);

  // パスの長さを計測（stroke-dasharray のため）
  useEffect(() => {
    if (!svgRef.current) return;
    const els = svgRef.current.querySelectorAll<SVGPathElement>("[data-stroke]");
    const ls = Array.from(els).map((el) => el.getTotalLength());
    setLengths(ls);
  }, [paths]);

  // 自動再生
  useEffect(() => {
    if (!playing) return;
    if (activeIndex >= paths.length) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setActiveIndex((i) => i + 1), strokeDurationMs);
    return () => clearTimeout(t);
  }, [playing, activeIndex, paths.length, strokeDurationMs]);

  function replay() {
    setActiveIndex(0);
    setPlaying(true);
  }

  function showAll() {
    setPlaying(false);
    setActiveIndex(paths.length);
  }

  function next() {
    setPlaying(false);
    if (activeIndex < paths.length) setActiveIndex(activeIndex + 1);
  }

  function prev() {
    setPlaying(false);
    if (activeIndex > 0) setActiveIndex(activeIndex - 1);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="panel bg-white relative"
        style={{ width: 280, height: 280, padding: 0 }}
        aria-label={`${char} の 書き順`}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 109 109"
          width={280}
          height={280}
          className="absolute inset-0"
        >
          {/* マス目（十字ガイド） */}
          <g stroke="#d9c39a" strokeWidth="0.4" strokeDasharray="3 3" fill="none">
            <line x1="54.5" y1="4" x2="54.5" y2="105" />
            <line x1="4" y1="54.5" x2="105" y2="54.5" />
          </g>
          {/* ストローク */}
          <g
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          >
            {paths.map((d, i) => {
              const drawn = i < activeIndex;
              const active = i === activeIndex && playing;
              const len = lengths[i] ?? 200;
              const color = drawn
                ? "#3d2914"
                : active
                ? "#ff7aa2"
                : "rgba(61,41,20,0.08)";
              const dashArr = active ? len : undefined;
              const dashOff = active ? len : undefined;
              return (
                <path
                  key={i}
                  data-stroke={i}
                  d={d}
                  stroke={color}
                  style={
                    active && len
                      ? {
                          strokeDasharray: dashArr,
                          strokeDashoffset: dashOff,
                          animation: `strokeDraw ${strokeDurationMs}ms linear forwards`,
                        }
                      : undefined
                  }
                />
              );
            })}
          </g>
          {/* 各画の番号 */}
          {showNumbers && activeIndex >= paths.length && (
            <g fontSize="6" fill="#ff7aa2" fontWeight="900">
              {paths.map((d, i) => {
                const m = d.match(/^M\s*([\d.]+)[,\s]+([\d.]+)/);
                if (!m) return null;
                const x = parseFloat(m[1]);
                const y = parseFloat(m[2]);
                return (
                  <text key={i} x={x - 2} y={y - 2}>
                    {i + 1}
                  </text>
                );
              })}
            </g>
          )}
        </svg>
        <style>{`
          @keyframes strokeDraw {
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      </div>

      <p className="font-bold text-[var(--ink-soft)]">
        {activeIndex < paths.length
          ? `${Math.max(activeIndex, 0) + 1} / ${paths.length} かくめ`
          : `ぜんぶで ${paths.length}かく`}
      </p>

      <div className="flex gap-2 flex-wrap justify-center">
        <button
          onClick={prev}
          disabled={activeIndex <= 0}
          className="btn-pop btn-white text-sm px-3 py-2"
        >
          ← 1かく もどる
        </button>
        <button onClick={replay} className="btn-pop btn-orange text-sm px-3 py-2">
          ▶ さいせい
        </button>
        <button
          onClick={next}
          disabled={activeIndex >= paths.length}
          className="btn-pop btn-white text-sm px-3 py-2"
        >
          1かく すすむ →
        </button>
        <button
          onClick={showAll}
          className="btn-pop btn-yellow text-sm px-3 py-2"
        >
          ぜんぶ ひょうじ
        </button>
      </div>
    </div>
  );
}
