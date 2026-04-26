"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Web Speech API（webkitSpeechRecognition / SpeechRecognition）の薄いラッパ。
// Chrome / Edge / Safari が対応。Firefox は非対応のため supported=false を返す。

// SDK 型定義は lib.dom には含まれないので any で扱う。
type AnySpeechRecognition = any;

export interface UseSpeechRecognitionOptions {
  lang?: string;
}

export interface UseSpeechRecognitionResult {
  supported: boolean;
  listening: boolean;
  interim: string;
  error: string | null;
  start: (onFinal: (finalText: string) => void) => void;
  stop: () => void;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {},
): UseSpeechRecognitionResult {
  const { lang = "en-US" } = options;
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<AnySpeechRecognition | null>(null);
  const finalCallbackRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const W = window as unknown as {
      SpeechRecognition?: { new (): AnySpeechRecognition };
      webkitSpeechRecognition?: { new (): AnySpeechRecognition };
    };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const recognition: AnySpeechRecognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: AnySpeechRecognition) => {
      let interimText = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript as string;
        if (result.isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }
      setInterim(interimText);
      if (finalText) {
        finalCallbackRef.current?.(finalText);
      }
    };

    recognition.onerror = (event: AnySpeechRecognition) => {
      const errKind = (event && event.error) || "unknown";
      setError(formatError(errKind));
      setListening(false);
      setInterim("");
    };

    recognition.onend = () => {
      setListening(false);
      setInterim("");
    };

    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };
  }, [lang]);

  const start = useCallback((onFinal: (text: string) => void) => {
    setError(null);
    setInterim("");
    finalCallbackRef.current = onFinal;
    const r = recognitionRef.current;
    if (!r) return;
    try {
      r.start();
      setListening(true);
    } catch (e) {
      // start() may throw "already started" — その場合はそのまま
      setError(String(e));
    }
  }, []);

  const stop = useCallback(() => {
    const r = recognitionRef.current;
    if (!r) return;
    try {
      r.stop();
    } catch {
      // ignore
    }
  }, []);

  return { supported, listening, interim, error, start, stop };
}

function formatError(kind: string): string {
  switch (kind) {
    case "not-allowed":
    case "service-not-allowed":
      return "マイクの利用許可が必要です。ブラウザのアドレスバー横の権限設定を確認してください。";
    case "no-speech":
      return "音声が検出されませんでした。もう一度お試しください。";
    case "audio-capture":
      return "マイクが見つかりません。デバイスを確認してください。";
    case "network":
      return "音声認識サーバーに接続できませんでした。";
    case "aborted":
      return "認識が中断されました。";
    default:
      return `音声認識エラー: ${kind}`;
  }
}
