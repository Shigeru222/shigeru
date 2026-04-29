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
  /** 表示サイズ(px)。正方形。 */
  size?: number;
  /** 線の太さ */
  lineWidth?: number;
  /** 半透明でうっすら表示するヒント漢字（書き順の練習用、任意） */
  guideKanji?: string;
};

const DrawingCanvas = forwardRef<DrawingCanvasHandle, Props>(function DrawingCanvas(
  { size = 320, lineWidth = 8, guideKanji },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const hasInk = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#3d2914";
    ctx.lineWidth = lineWidth;
  }, [size, lineWidth]);

  useImperativeHandle(ref, () => ({
    clear() {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
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
    // ドット 1 つでも見えるよう短い線を描く
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
      style={{ width: size, height: size, padding: 0 }}
    >
      {/* ガイド：十字線 */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={size}
        height={size}
      >
        <line
          x1={size / 2}
          y1={6}
          x2={size / 2}
          y2={size - 6}
          stroke="#d9c39a"
          strokeDasharray="6 6"
          strokeWidth={1.5}
        />
        <line
          x1={6}
          y1={size / 2}
          x2={size - 6}
          y2={size / 2}
          stroke="#d9c39a"
          strokeDasharray="6 6"
          strokeWidth={1.5}
        />
      </svg>
      {/* ガイド：薄い漢字 */}
      {guideKanji && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center select-none"
          style={{
            color: "rgba(61, 41, 20, 0.10)",
            fontWeight: 900,
            fontSize: size * 0.7,
            lineHeight: 1,
          }}
        >
          {guideKanji}
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
