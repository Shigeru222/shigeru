"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";

export type DrawingCanvasHandle = {
  clear: () => void;
  isEmpty: () => boolean;
};

type Props = {
  /** 表示サイズ(px)。正方形時に使用。width/height 指定で上書きされる。 */
  size?: number;
  /** 横幅(px) */
  width?: number;
  /** 高さ(px) */
  height?: number;
  /** 線の太さ */
  lineWidth?: number;
  /** 半透明でうっすら表示するヒント文字列（例: "送る"）。マスごとに 1 文字ずつ表示。 */
  guideText?: string;
  /** ガイド用のマス数（指定時はマスを描画。例: 2 で2マス） */
  cells?: number;
};

const DrawingCanvas = forwardRef<DrawingCanvasHandle, Props>(function DrawingCanvas(
  { size = 320, width, height, lineWidth = 8, guideText, cells },
  ref,
) {
  const w = width ?? size;
  const h = height ?? size;
  const cellCount = cells ?? (guideText ? guideText.length : 1);
  const cellWidth = w / cellCount;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const hasInk = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#3d2914";
    ctx.lineWidth = lineWidth;
  }, [w, h, lineWidth]);

  useImperativeHandle(ref, () => ({
    clear() {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasInk.current = false;
    },
    isEmpty() {
      return !hasInk.current;
    },
  }));

  function getPoint(e: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function start(e: ReactPointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = getPoint(e);
    lastPoint.current = p;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.01, p.y + 0.01);
    ctx.stroke();
    hasInk.current = true;
  }

  function move(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !lastPoint.current) return;
    const p = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPoint.current = p;
    hasInk.current = true;
  }

  function end(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (canvasRef.current?.hasPointerCapture(e.pointerId)) {
      canvasRef.current.releasePointerCapture(e.pointerId);
    }
    drawing.current = false;
    lastPoint.current = null;
  }

  return (
    <div
      className="relative inline-block panel bg-white"
      style={{ width: w, height: h, padding: 0 }}
    >
      {/* ガイド：マスごとの十字線 */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={w}
        height={h}
      >
        {Array.from({ length: cellCount }).map((_, i) => {
          const cx = cellWidth * (i + 0.5);
          const left = cellWidth * i;
          const right = cellWidth * (i + 1);
          return (
            <g key={i}>
              {/* セル境界線（最後を除く） */}
              {i < cellCount - 1 && (
                <line
                  x1={right}
                  y1={6}
                  x2={right}
                  y2={h - 6}
                  stroke="#e5cfa3"
                  strokeWidth={1}
                />
              )}
              {/* 縦のガイド */}
              <line
                x1={cx}
                y1={6}
                x2={cx}
                y2={h - 6}
                stroke="#d9c39a"
                strokeDasharray="6 6"
                strokeWidth={1.5}
              />
              {/* 横のガイド */}
              <line
                x1={left + 6}
                y1={h / 2}
                x2={right - 6}
                y2={h / 2}
                stroke="#d9c39a"
                strokeDasharray="6 6"
                strokeWidth={1.5}
              />
            </g>
          );
        })}
      </svg>
      {/* ガイド：薄い文字 */}
      {guideText && (
        <div className="absolute inset-0 pointer-events-none flex select-none">
          {Array.from(guideText).map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-center"
              style={{
                width: cellWidth,
                height: h,
                color: "rgba(61, 41, 20, 0.10)",
                fontWeight: 900,
                fontSize: Math.min(cellWidth, h) * 0.7,
                lineHeight: 1,
              }}
            >
              {c}
            </div>
          ))}
        </div>
      )}
      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onPointerLeave={end}
        className="absolute inset-0 cursor-crosshair"
        style={{ touchAction: "none" }}
      />
    </div>
  );
});

export default DrawingCanvas;
