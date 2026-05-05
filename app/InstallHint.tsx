"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "install-hint-dismissed-v1";

/**
 * iOS Safariで開いている時だけ「ホーム画面に追加」のヒントを表示する。
 * 既にスタンドアロン起動なら表示しない。一度閉じたら次回以降出さない。
 */
export default function InstallHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(DISMISS_KEY) === "1") return;

    const ua = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari の独自プロパティ
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isIOS && isSafari && !isStandalone) {
      setShow(true);
    }
  }, []);

  function dismiss() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_KEY, "1");
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto panel p-4 anim-pop bg-white">
      <button
        onClick={dismiss}
        aria-label="とじる"
        className="absolute top-2 right-2 w-8 h-8 rounded-full border-2 border-[var(--ink)] bg-white font-black"
      >
        ×
      </button>
      <p className="font-black text-base mb-1 pr-8">
        📲 ホームがめんに ついかして アプリのように つかおう！
      </p>
      <p className="text-sm font-bold text-[var(--ink-soft)]">
        Safariの <span className="inline-block px-1 border border-[var(--ink-soft)] rounded">⬆️</span>{" "}
        ボタン →「ホームがめんに ついか」を タップ
      </p>
    </div>
  );
}
