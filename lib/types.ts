export interface VocabQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ReadingQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ReadingPassage {
  title: string;
  passage: string;
  questions: ReadingQuestion[];
}

export interface WritingPrompt {
  topic: string;
  instructions: string;
  wordLimit: number;
}

export interface ExamData {
  vocabQuestions: VocabQuestion[];
  readingPassage: ReadingPassage;
  writingPrompt: WritingPrompt;
}

export interface VocabAnswer {
  questionId: number;
  selectedIndex: number;
}

export interface ReadingAnswer {
  questionId: number;
  selectedIndex: number;
}

export interface WritingEvaluation {
  score: number;
  maxScore: number;
  content: string;
  organization: string;
  vocabulary: string;
  grammar: string;
  feedback: string;
}

export interface SectionScore {
  vocab: number;
  reading: number;
  writing: number;
  total: number;
  maxVocab: number;
  maxReading: number;
  maxWriting: number;
  maxTotal: number;
}

export interface WeakArea {
  category: string;
  description: string;
  severity: "high" | "medium" | "low";
}

export interface ImprovementAction {
  title: string;
  description: string;
  duration: string;
  priority: "high" | "medium" | "low";
}

export interface Analysis {
  overallComment: string;
  weakAreas: WeakArea[];
  improvementActions: ImprovementAction[];
  studyPlan: string;
  encouragement: string;
}

export interface ExamResult {
  id: string;
  date: string;
  examData: ExamData;
  vocabAnswers: VocabAnswer[];
  readingAnswers: ReadingAnswer[];
  writingAnswer: string;
  scores: SectionScore;
  writingEvaluation: WritingEvaluation;
  analysis: Analysis | null;
  passed: boolean;
}
