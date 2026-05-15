/**
 * 算数の各チャレンジ（たし算・ひき算・時こく・たんい・ずけい）共通の
 * 進捗管理。九九と違って「アイテム数」が多い／無限なので、
 * モード×難易度ごとに「パーフェクト達成回数」をスター数として記録する。
 */

export type MathMode =
  | "tashizan"
  | "hikizan"
  | "jikoku"
  | "tani"
  | "zukei";

export type MathLevel = "easy" | "normal" | "hard";

export type ChallengeStats = {
  /** ラウンド完了回数 */
  rounds: number;
  /** パーフェクト（10/10）達成回数 */
  perfect: number;
  /** これまでの累計出題数 */
  seen: number;
  /** これまでの累計正解数 */
  correct: number;
  /** ベストスコア（10問中） */
  bestScore: number;
  /** 最終プレイ時刻 */
  lastPlayed: number;
};

export type AllMathProgress = Record<string, ChallengeStats>;

const KEY = "math-progress-v1";

export const MATH_MODES: MathMode[] = [
  "tashizan",
  "hikizan",
  "jikoku",
  "tani",
  "zukei",
];
export const MATH_LEVELS: MathLevel[] = ["easy", "normal", "hard"];

export const MAX_STARS_PER_LEVEL = 3;
export const MAX_STARS_PER_MODE = MAX_STARS_PER_LEVEL * MATH_LEVELS.length; // 9
export const MAX_TOTAL_STARS = MAX_STARS_PER_MODE * MATH_MODES.length; // 45

const empty = (): ChallengeStats => ({
  rounds: 0,
  perfect: 0,
  seen: 0,
  correct: 0,
  bestScore: 0,
  lastPlayed: 0,
});

function statsKey(mode: MathMode, level: MathLevel): string {
  return `${mode}:${level}`;
}

export function loadMathProgress(): AllMathProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AllMathProgress) : {};
  } catch {
    return {};
  }
}

export function saveMathProgress(p: AllMathProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // ignore quota
  }
}

export function getStats(
  p: AllMathProgress,
  mode: MathMode,
  level: MathLevel,
): ChallengeStats {
  return p[statsKey(mode, level)] ?? empty();
}

/**
 * 1ラウンド終了時に進捗を更新する。
 * @param score 正解数（0〜roundLength）
 * @param roundLength 出題数
 */
export function recordRound(
  p: AllMathProgress,
  mode: MathMode,
  level: MathLevel,
  score: number,
  roundLength: number,
): AllMathProgress {
  const k = statsKey(mode, level);
  const prev = p[k] ?? empty();
  const isPerfect = score === roundLength;
  const next: ChallengeStats = {
    rounds: prev.rounds + 1,
    perfect: prev.perfect + (isPerfect ? 1 : 0),
    seen: prev.seen + roundLength,
    correct: prev.correct + score,
    bestScore: Math.max(prev.bestScore, score),
    lastPlayed: Date.now(),
  };
  return { ...p, [k]: next };
}

export function resetMathProgress(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

/** モード×難易度ごとのスター数（0〜MAX_STARS_PER_LEVEL） */
export function starsFor(stats: ChallengeStats): number {
  return Math.min(stats.perfect, MAX_STARS_PER_LEVEL);
}

/** モード合計スター数 */
export function modeStars(p: AllMathProgress, mode: MathMode): number {
  return MATH_LEVELS.reduce(
    (sum, lv) => sum + starsFor(getStats(p, mode, lv)),
    0,
  );
}

/** 全モード合計スター数 */
export function totalMathStars(p: AllMathProgress): number {
  return MATH_MODES.reduce((sum, m) => sum + modeStars(p, m), 0);
}

/** モードラベル */
export const MODE_LABEL: Record<MathMode, { emoji: string; ja: string }> = {
  tashizan: { emoji: "➕", ja: "たし算" },
  hikizan: { emoji: "➖", ja: "ひき算" },
  jikoku: { emoji: "🕐", ja: "時こく" },
  tani: { emoji: "📏", ja: "たんい" },
  zukei: { emoji: "🔺", ja: "ずけい" },
};

export const LEVEL_LABEL: Record<MathLevel, string> = {
  easy: "やさしい",
  normal: "ふつう",
  hard: "むずかしい",
};
