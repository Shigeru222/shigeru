export interface WordPair {
  negative: string;
  positive: string;
}

export type Grade = '中学1年' | '中学2年' | '中学3年';

export interface MentalTrainingSubmission {
  id: string;
  name: string;
  grade: Grade;
  date: string;
  submittedAt: string;
  wordPairs: WordPair[];
  reflection: string;
  identity: string;
}
