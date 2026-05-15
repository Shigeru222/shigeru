import type { KukuAllProgress, KukuProblem, KukuProgress } from "./kuku-types";

const KEY = "kuku-progress-v1";

/** 1×1 〜 9×9 で合計81問 */
export const KUKU_TOTAL = 81;

export function problemKey(a: number, b: number): string {
  return `${a}x${b}`;
}

export function allProblems(): KukuProblem[] {
  const out: KukuProblem[] = [];
  for (let a = 1; a <= 9; a++) {
    for (let b = 1; b <= 9; b++) {
      out.push({ a, b });
    }
  }
  return out;
}

const empty = (): KukuProgress => ({
  seen: 0,
  correct: 0,
  streak: 0,
  mastered: false,
  lastSeen: 0,
});

export function loadKukuProgress(): KukuAllProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as KukuAllProgress) : {};
  } catch {
    return {};
  }
}

export function saveKukuProgress(p: KukuAllProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // ignore quota errors
  }
}

export function getKukuProgress(
  p: KukuAllProgress,
  a: number,
  b: number,
): KukuProgress {
  return p[problemKey(a, b)] ?? empty();
}

export function recordKukuAnswer(
  p: KukuAllProgress,
  a: number,
  b: number,
  correct: boolean,
): KukuAllProgress {
  const key = problemKey(a, b);
  const prev = p[key] ?? empty();
  const streak = correct ? prev.streak + 1 : 0;
  const next: KukuProgress = {
    seen: prev.seen + 1,
    correct: prev.correct + (correct ? 1 : 0),
    streak,
    mastered: prev.mastered || streak >= 3,
    lastSeen: Date.now(),
  };
  return { ...p, [key]: next };
}

export function resetKukuProgress(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function kukuMasteredCount(p: KukuAllProgress): number {
  return Object.values(p).filter((x) => x.mastered).length;
}

export function kukuLearningCount(p: KukuAllProgress): number {
  return Object.values(p).filter((x) => x.seen > 0 && !x.mastered).length;
}
