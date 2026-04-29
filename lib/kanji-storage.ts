import type { AllProgress, KanjiProgress } from "./kanji-types";

const KEY = "kanji-progress-v1";

const empty = (): KanjiProgress => ({
  seen: 0,
  correct: 0,
  streak: 0,
  mastered: false,
  lastSeen: 0,
});

export function loadProgress(): AllProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AllProgress) : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress: AllProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // ignore quota errors
  }
}

export function getKanjiProgress(progress: AllProgress, char: string): KanjiProgress {
  return progress[char] ?? empty();
}

export function recordAnswer(progress: AllProgress, char: string, correct: boolean): AllProgress {
  const prev = getKanjiProgress(progress, char);
  const streak = correct ? prev.streak + 1 : 0;
  const next: KanjiProgress = {
    seen: prev.seen + 1,
    correct: prev.correct + (correct ? 1 : 0),
    streak,
    mastered: prev.mastered || streak >= 3,
    lastSeen: Date.now(),
  };
  return { ...progress, [char]: next };
}

export function resetProgress(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

/** マスター済みの数 */
export function masteredCount(progress: AllProgress): number {
  return Object.values(progress).filter((p) => p.mastered).length;
}

/** 学習中（出題されたが未マスター）の数 */
export function learningCount(progress: AllProgress): number {
  return Object.values(progress).filter((p) => p.seen > 0 && !p.mastered).length;
}
