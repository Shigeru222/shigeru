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

/** 送り仮名クイズの1問分の情報 */
export type OkuriganaPrompt = {
  /** 漢字本体（例: 古） */
  kanji: string;
  /** 漢字の訓読み（例: ふる） */
  kanjiReading: string;
  /** 送り仮名（例: い） */
  okurigana: string;
  /** 正解の語（例: 古い） */
  word: string;
  /** 語の読み（例: ふるい） */
  reading: string;
};

/**
 * 送り仮名を含む語の問題情報を返す。
 * 漢字＋送り仮名（少なくとも1文字）の例語が無ければ null。
 *
 * 例: 古 → { kanji:"古", kanjiReading:"ふる", okurigana:"い", word:"古い", reading:"ふるい" }
 *     食 → { kanji:"食", kanjiReading:"た",  okurigana:"べる", word:"食べる", reading:"たべる" }
 */
export function getOkuriganaPrompt(k: Kanji): OkuriganaPrompt | null {
  if (k.kun.length === 0) return null;
  for (const ex of k.examples) {
    if (!ex.word.startsWith(k.char)) continue;
    if (ex.word.length <= 1) continue;
    for (const kun of k.kun) {
      if (!ex.reading.startsWith(kun)) continue;
      const okurigana = ex.word.slice(k.char.length);
      if (okurigana.length === 0) continue;
      return {
        kanji: k.char,
        kanjiReading: kun,
        okurigana,
        word: ex.word,
        reading: ex.reading,
      };
    }
  }
  return null;
}
