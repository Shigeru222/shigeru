import type { Kanji } from "./kanji-types";

export type YomiPrompt = { word: string; reading: string };

/**
 * 各漢字の代表的な「漢字＋送り仮名」の形を返す。
 * 無ければ単漢字＋代表訓読み。訓読みが無い漢字は null。
 *
 * 例: 古 → { word: "古い", reading: "ふるい" }
 *     雲 → { word: "雲", reading: "くも" }
 *     科 → null
 */
export function getYomiPrompt(k: Kanji): YomiPrompt | null {
  if (k.kun.length === 0) return null;
  for (const ex of k.examples) {
    if (!ex.word.startsWith(k.char)) continue;
    for (const kun of k.kun) {
      if (ex.reading.startsWith(kun)) return ex;
    }
  }
  return { word: k.char, reading: k.kun[0] };
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
