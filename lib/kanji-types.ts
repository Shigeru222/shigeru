export type Kanji = {
  /** 漢字本体 */
  char: string;
  /** 音読み（カタカナ・複数可） */
  on: string[];
  /** 訓読み（ひらがな・複数可） */
  kun: string[];
  /** やさしい意味（小2向けのことば） */
  meaning: string;
  /** 例の言葉（小2向け、ふりがな付き） */
  examples: { word: string; reading: string }[];
  /** 画数 */
  strokes: number;
};

/** 1つの漢字に対する学習進捗 */
export type KanjiProgress = {
  /** 出題された回数 */
  seen: number;
  /** 正解した回数 */
  correct: number;
  /** 連続正解数 */
  streak: number;
  /** マスター済み（連続3回正解） */
  mastered: boolean;
  /** 最後に学習した時刻 */
  lastSeen: number;
};

/** 全体の学習進捗 */
export type AllProgress = Record<string, KanjiProgress>;

/** クイズの種類 */
export type QuizType = "yomi" | "imi";

/** クイズ問題 */
export type QuizQuestion = {
  type: QuizType;
  kanji: Kanji;
  /** 出題する語（よみクイズ時の「古い」など。意味クイズ時は単漢字） */
  prompt: string;
  /** 選択肢（正解を含む4つ） */
  choices: string[];
  /** 正解の選択肢index */
  answerIndex: number;
};
