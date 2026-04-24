"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  FileText,
  PenLine,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ExamData, VocabAnswer, ReadingAnswer, ExamResult, WritingEvaluation } from "@/lib/types";
import { setCurrentResult, saveExamResult } from "@/lib/storage";

type Phase = "loading" | "vocab" | "reading" | "writing" | "submitting" | "error";

export default function ExamPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [elapsed, setElapsed] = useState(0);

  // Answers
  const [vocabAnswers, setVocabAnswers] = useState<Record<number, number>>({});
  const [readingAnswers, setReadingAnswers] = useState<Record<number, number>>({});
  const [writingAnswer, setWritingAnswer] = useState("");

  // Current question index
  const [currentVocab, setCurrentVocab] = useState(0);
  const [currentReading, setCurrentReading] = useState(0);

  useEffect(() => {
    generateExam();
  }, []);

  useEffect(() => {
    if (phase === "vocab" || phase === "reading" || phase === "writing") {
      const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  async function generateExam() {
    setPhase("loading");
    try {
      const res = await fetch("/api/generate-exam", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      const data: ExamData = await res.json();
      setExamData(data);
      setPhase("vocab");
    } catch {
      setErrorMsg("試験の生成に失敗しました。インターネット接続を確認してください。");
      setPhase("error");
    }
  }

  const handleSubmit = useCallback(async () => {
    if (!examData) return;
    setPhase("submitting");

    const vocabAnswerList: VocabAnswer[] = examData.vocabQuestions.map((q) => ({
      questionId: q.id,
      selectedIndex: vocabAnswers[q.id] ?? -1,
    }));

    const readingAnswerList: ReadingAnswer[] = examData.readingPassage.questions.map((q) => ({
      questionId: q.id,
      selectedIndex: readingAnswers[q.id] ?? -1,
    }));

    const vocabScore = vocabAnswerList.filter(
      (a) => a.selectedIndex === examData.vocabQuestions[a.questionId - 1]?.correctIndex
    ).length;

    const readingScore = readingAnswerList.filter(
      (a) => a.selectedIndex === examData.readingPassage.questions[a.questionId - 1]?.correctIndex
    ).length;

    // Evaluate writing via Claude
    let writingEval: WritingEvaluation;
    try {
      const evalRes = await fetch("/api/evaluate-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: examData.writingPrompt.topic,
          instructions: examData.writingPrompt.instructions,
          essay: writingAnswer,
        }),
      });
      if (!evalRes.ok) throw new Error("eval failed");
      writingEval = await evalRes.json();
    } catch {
      // Fallback writing evaluation
      const wordCount = writingAnswer.trim().split(/\s+/).filter(Boolean).length;
      const baseScore = Math.min(Math.max(Math.floor(wordCount / 10), 0), 8);
      writingEval = {
        score: baseScore,
        maxScore: 16,
        content: "評価できませんでした",
        organization: "評価できませんでした",
        vocabulary: "評価できませんでした",
        grammar: "評価できませんでした",
        feedback: "英作文の自動評価に失敗しました。",
      };
    }

    const total = vocabScore + readingScore + writingEval.score;
    const maxTotal = 20 + 6 + 16;

    const result: ExamResult = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      examData,
      vocabAnswers: vocabAnswerList,
      readingAnswers: readingAnswerList,
      writingAnswer,
      scores: {
        vocab: vocabScore,
        reading: readingScore,
        writing: writingEval.score,
        total,
        maxVocab: 20,
        maxReading: 6,
        maxWriting: 16,
        maxTotal,
      },
      writingEvaluation: writingEval,
      analysis: null,
      passed: total / maxTotal >= 0.65,
    };

    saveExamResult(result);
    setCurrentResult(result);
    router.push("/results");
  }, [examData, vocabAnswers, readingAnswers, writingAnswer, router]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (phase === "loading") return <LoadingScreen />;
  if (phase === "error") return <ErrorScreen message={errorMsg} onRetry={generateExam} />;
  if (phase === "submitting") return <SubmittingScreen />;
  if (!examData) return null;

  return (
    <main className="min-h-screen pb-24">
      {/* Top bar */}
      <div className="sticky top-0 z-50 glass-strong border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PhaseIndicator phase={phase} />
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatTime(elapsed)}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="max-w-3xl mx-auto px-4 pb-3">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${getProgress(phase, currentVocab, currentReading, examData)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8">
        {phase === "vocab" && (
          <VocabSection
            questions={examData.vocabQuestions}
            currentIndex={currentVocab}
            answers={vocabAnswers}
            onAnswer={(id, idx) => setVocabAnswers((prev) => ({ ...prev, [id]: idx }))}
            onNext={() => {
              if (currentVocab < examData.vocabQuestions.length - 1) {
                setCurrentVocab((i) => i + 1);
              } else {
                setPhase("reading");
              }
            }}
            onPrev={() => setCurrentVocab((i) => Math.max(0, i - 1))}
          />
        )}

        {phase === "reading" && (
          <ReadingSection
            passage={examData.readingPassage}
            currentIndex={currentReading}
            answers={readingAnswers}
            onAnswer={(id, idx) => setReadingAnswers((prev) => ({ ...prev, [id]: idx }))}
            onNext={() => {
              if (currentReading < examData.readingPassage.questions.length - 1) {
                setCurrentReading((i) => i + 1);
              } else {
                setPhase("writing");
              }
            }}
            onPrev={() => setCurrentReading((i) => Math.max(0, i - 1))}
          />
        )}

        {phase === "writing" && (
          <WritingSection
            prompt={examData.writingPrompt}
            answer={writingAnswer}
            onChange={setWritingAnswer}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </main>
  );
}

function getProgress(phase: Phase, currentVocab: number, currentReading: number, examData: ExamData): number {
  if (phase === "vocab") return ((currentVocab + 1) / (examData.vocabQuestions.length + examData.readingPassage.questions.length + 1)) * 100;
  if (phase === "reading") return ((examData.vocabQuestions.length + currentReading + 1) / (examData.vocabQuestions.length + examData.readingPassage.questions.length + 1)) * 100;
  if (phase === "writing") return 95;
  return 100;
}

function PhaseIndicator({ phase }: { phase: Phase }) {
  const phases = [
    { key: "vocab", label: "語彙", icon: <BookOpen className="w-4 h-4" /> },
    { key: "reading", label: "読解", icon: <FileText className="w-4 h-4" /> },
    { key: "writing", label: "英作文", icon: <PenLine className="w-4 h-4" /> },
  ];

  return (
    <div className="flex items-center gap-2">
      {phases.map((p, i) => (
        <div key={p.key} className="flex items-center gap-1">
          <div
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all ${
              phase === p.key
                ? "bg-blue-500/20 text-blue-400 font-semibold"
                : "text-slate-500"
            }`}
          >
            {p.icon}
            <span className="hidden sm:inline">{p.label}</span>
          </div>
          {i < phases.length - 1 && <ChevronRight className="w-3 h-3 text-slate-600" />}
        </div>
      ))}
    </div>
  );
}

function VocabSection({
  questions,
  currentIndex,
  answers,
  onAnswer,
  onNext,
  onPrev,
}: {
  questions: ExamData["vocabQuestions"];
  currentIndex: number;
  answers: Record<number, number>;
  onAnswer: (id: number, idx: number) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const q = questions[currentIndex];
  const selected = answers[q.id];
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-300">
          語彙・文法 <span className="text-blue-400">{currentIndex + 1}</span>/{questions.length}
        </h2>
      </div>

      <div className="glass rounded-2xl p-6 md:p-8 mb-6">
        <p className="text-xl md:text-2xl leading-relaxed font-medium">{q.question}</p>
      </div>

      <div className="space-y-3 mb-8">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onAnswer(q.id, i)}
            className={`option-btn ${selected === i ? "selected" : ""}`}
          >
            <span className="font-semibold text-slate-400 mr-3">
              {["A", "B", "C", "D"][i]}.
            </span>
            {opt}
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
          前へ
        </button>
        <button
          onClick={onNext}
          className="btn-primary flex items-center gap-2"
        >
          {isLast ? "読解へ進む" : "次へ"}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function ReadingSection({
  passage,
  currentIndex,
  answers,
  onAnswer,
  onNext,
  onPrev,
}: {
  passage: ExamData["readingPassage"];
  currentIndex: number;
  answers: Record<number, number>;
  onAnswer: (id: number, idx: number) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const q = passage.questions[currentIndex];
  const selected = answers[q.id];
  const isLast = currentIndex === passage.questions.length - 1;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-300">
          読解 <span className="text-purple-400">{currentIndex + 1}</span>/{passage.questions.length}
        </h2>
      </div>

      <div className="glass rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-bold mb-3 text-purple-400">{passage.title}</h3>
        <p className="text-slate-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
          {passage.passage}
        </p>
      </div>

      <div className="glass rounded-2xl p-6 mb-6">
        <p className="text-lg font-medium mb-4">{q.question}</p>
        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onAnswer(q.id, i)}
              className={`option-btn ${selected === i ? "selected" : ""}`}
            >
              <span className="font-semibold text-slate-400 mr-3">
                {["A", "B", "C", "D"][i]}.
              </span>
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
          前へ
        </button>
        <button onClick={onNext} className="btn-primary flex items-center gap-2">
          {isLast ? "英作文へ進む" : "次へ"}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function WritingSection({
  prompt,
  answer,
  onChange,
  onSubmit,
}: {
  prompt: ExamData["writingPrompt"];
  answer: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
}) {
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="animate-fade-in">
      <h2 className="text-lg font-bold text-slate-300 mb-6">英作文</h2>

      <div className="glass rounded-2xl p-6 mb-6">
        <h3 className="text-base font-semibold text-cyan-400 mb-2">トピック</h3>
        <p className="text-xl font-medium mb-4">{prompt.topic}</p>
        <div className="border-t border-white/10 pt-4">
          <p className="text-sm text-slate-400 leading-relaxed">{prompt.instructions}</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 mb-6">
        <textarea
          value={answer}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ここに英語で回答を書いてください..."
          className="w-full h-48 bg-transparent text-white placeholder-slate-600 resize-none outline-none leading-relaxed"
        />
        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <span className={`text-sm font-medium ${
            wordCount < 80 ? "text-slate-400" :
            wordCount <= 100 ? "text-green-400" :
            "text-red-400"
          }`}>
            {wordCount} / {prompt.wordLimit} words
          </span>
          <span className="text-xs text-slate-500">
            目標: 80〜{prompt.wordLimit}語
          </span>
        </div>
      </div>

      <button
        onClick={onSubmit}
        className="btn-primary w-full text-lg flex items-center justify-center gap-2"
      >
        試験を提出する
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function LoadingScreen() {
  const messages = [
    "AIが問題を生成中...",
    "語彙問題を作成中...",
    "読解パッセージを準備中...",
    "英作文テーマを考案中...",
  ];
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setMsgIdx((i) => (i + 1) % messages.length), 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/30" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin-slow" />
          <BookOpen className="absolute inset-0 m-auto w-8 h-8 text-white animate-float" />
        </div>
        <h2 className="text-2xl font-bold mb-3 gradient-text">模擬試験を生成中</h2>
        <p className="text-slate-400 animate-fade-in" key={msgIdx}>{messages[msgIdx]}</p>
        <p className="text-sm text-slate-600 mt-4">少々お待ちください（30秒〜1分程度）</p>
      </div>
    </div>
  );
}

function SubmittingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-2 gradient-text">採点中...</h2>
        <p className="text-slate-400">英作文をAIが評価しています</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center glass rounded-2xl p-8 max-w-md animate-fade-in">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-3">エラーが発生しました</h2>
        <p className="text-slate-400 mb-6">{message}</p>
        <button onClick={onRetry} className="btn-primary">
          もう一度試す
        </button>
      </div>
    </div>
  );
}
