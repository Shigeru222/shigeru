/** 九九1問分 */
export type KukuProblem = {
  /** かける数 1〜9 */
  a: number;
  /** かけられる数 1〜9 */
  b: number;
};

/** 1問あたりの学習進捗 */
export type KukuProgress = {
  seen: number;
  correct: number;
  streak: number;
  mastered: boolean;
  lastSeen: number;
};

/** "1x2" のようなキーで管理 */
export type KukuAllProgress = Record<string, KukuProgress>;

/** 九九1問のクイズ */
export type KukuQuestion = {
  problem: KukuProblem;
  /** 4択（正解を含む） */
  choices: number[];
  /** 正解の選択肢index */
  answerIndex: number;
};

/** 学習記録ページの教科サマリー */
export type SubjectSummary = {
  label: string;
  total: number;
  mastered: number;
  learning: number;
  remaining: number;
  seen: number;
  correct: number;
};
