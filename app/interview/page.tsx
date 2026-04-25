"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mic,
  BookOpen,
  Image,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Star,
  TrendingUp,
  Lightbulb,
} from "lucide-react";

interface InterviewQuestion {
  id: number;
  type: "passage" | "illustration" | "opinion";
  question: string;
  hint: string;
  sampleAnswer: string;
  situation?: string;
}

interface InterviewData {
  passage: { title: string; text: string };
  questions: InterviewQuestion[];
}

interface QuestionFeedback {
  questionId: number;
  score: number;
  maxScore: number;
  evaluation: string;
  goodPoints: string;
  improvements: string;
  betterAnswer: string;
}

interface EvaluationResult {
  questionFeedback: QuestionFeedback[];
  totalScore: number;
  maxTotalScore: number;
  grade: string;
  overallComment: string;
  strongPoints: string[];
  weakPoints: string[];
  studyAdvice: string;
}

type Phase = "loading" | "intro" | "reading" | "questions" | "submitting" | "results" | "error";

export default function InterviewPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSample, setShowSample] = useState<Record<number, boolean>>({});

  useEffect(() => {
    generateInterview();
  }, []);

  async function generateInterview() {
    setPhase("loading");
    try {
      const res = await fetch("/api/generate-interview", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      const data: InterviewData = await res.json();
      setInterviewData(data);
      setPhase("intro");
    } catch {
      setErrorMsg("面接問題の生成に失敗しました。");
      setPhase("error");
    }
  }

  async function handleSubmit() {
    if (!interviewData) return;
    setPhase("submitting");
    try {
      const res = await fetch("/api/evaluate-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: interviewData.questions,
          answers,
          passage: interviewData.passage,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data: EvaluationResult = await res.json();
      setEvaluation(data);
      setPhase("results");
    } catch {
      setErrorMsg("評価に失敗しました。もう一度お試しください。");
      setPhase("error");
    }
  }

  if (phase === "loading") return <LoadingScreen message="面接問題を生成中..." />;
  if (phase === "submitting") return <LoadingScreen message="AIが採点中..." />;
  if (phase === "error") return <ErrorScreen message={errorMsg} onRetry={generateInterview} />;
  if (!interviewData) return null;

  return (
    <main className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          トップへ戻る
        </button>

        {phase === "intro" && (
          <IntroScreen
            data={interviewData}
            onStart={() => setPhase("reading")}
          />
        )}

        {phase === "reading" && (
          <ReadingPhase
            passage={interviewData.passage}
            onNext={() => setPhase("questions")}
          />
        )}

        {phase === "questions" && (
          <QuestionsPhase
            questions={interviewData.questions}
            passage={interviewData.passage}
            currentIndex={currentQuestion}
            answers={answers}
            showSample={showSample}
            onAnswer={(id, val) => setAnswers((prev) => ({ ...prev, [id]: val }))}
            onToggleSample={(id) => setShowSample((prev) => ({ ...prev, [id]: !prev[id] }))}
            onNext={() => {
              if (currentQuestion < interviewData.questions.length - 1) {
                setCurrentQuestion((i) => i + 1);
              } else {
                handleSubmit();
              }
            }}
            onPrev={() => setCurrentQuestion((i) => Math.max(0, i - 1))}
          />
        )}

        {phase === "results" && evaluation && (
          <ResultsPhase
            evaluation={evaluation}
            questions={interviewData.questions}
            answers={answers}
            onRetry={() => {
              setAnswers({});
              setCurrentQuestion(0);
              setShowSample({});
              setEvaluation(null);
              generateInterview();
            }}
            onHome={() => router.push("/")}
          />
        )}
      </div>
    </main>
  );
}

function IntroScreen({ data, onStart }: { data: InterviewData; onStart: () => void }) {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 rounded-2xl bg-purple-400/10 mb-4">
          <Mic className="w-10 h-10 text-purple-400" />
        </div>
        <h1 className="text-3xl font-black mb-3 gradient-text">英検2級 面接練習</h1>
        <p className="text-slate-400">本番形式でAIが面接官を担当します</p>
      </div>

      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="font-bold mb-4">面接の流れ</h2>
        <div className="space-y-3">
          {[
            { icon: <BookOpen className="w-4 h-4" />, step: "①", label: "パッセージの音読", desc: "問題カードの英文を声に出して読む" },
            { icon: <MessageSquare className="w-4 h-4" />, step: "②", label: "パッセージについての質問", desc: "英文の内容について質問に答える" },
            { icon: <Image className="w-4 h-4" />, step: "③", label: "イラストの描写", desc: "状況を英語で説明する" },
            { icon: <MessageSquare className="w-4 h-4" />, step: "④⑤", label: "受験者への質問", desc: "社会的なテーマについて意見を述べる" },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-400/10 text-purple-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                {item.step}
              </div>
              <div>
                <div className="font-medium text-sm">{item.label}</div>
                <div className="text-xs text-slate-400">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-4 mb-6 border border-yellow-400/20 bg-yellow-400/5">
        <p className="text-sm text-yellow-300">
          <span className="font-bold">ヒント：</span>実際の面接では声に出して話しますが、このアプリではテキストで入力します。実際に声に出しながら入力すると効果的です。
        </p>
      </div>

      <button onClick={onStart} className="btn-primary w-full text-lg flex items-center justify-center gap-2">
        <Mic className="w-5 h-5" />
        面接を開始する
      </button>
    </div>
  );
}

function ReadingPhase({
  passage,
  onNext,
}: {
  passage: InterviewData["passage"];
  onNext: () => void;
}) {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-blue-400/10 text-blue-400 flex items-center justify-center text-sm font-bold">①</div>
        <h2 className="text-lg font-bold">パッセージの音読</h2>
      </div>

      <div className="glass rounded-2xl p-6 mb-4">
        <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">問題カード</div>
        <h3 className="text-lg font-bold text-blue-400 mb-4">{passage.title}</h3>
        <p className="text-lg leading-relaxed">{passage.text}</p>
      </div>

      <div className="glass rounded-xl p-4 mb-6 border border-blue-400/20 bg-blue-400/5">
        <p className="text-sm text-blue-300">
          <span className="font-bold">指示：</span>このパッセージを声に出して読んでください。読み終わったら「次へ」を押してください。
        </p>
      </div>

      <button onClick={onNext} className="btn-primary w-full flex items-center justify-center gap-2">
        音読完了 — 質問へ進む
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function QuestionsPhase({
  questions,
  passage,
  currentIndex,
  answers,
  showSample,
  onAnswer,
  onToggleSample,
  onNext,
  onPrev,
}: {
  questions: InterviewQuestion[];
  passage: InterviewData["passage"];
  currentIndex: number;
  answers: Record<number, string>;
  showSample: Record<number, boolean>;
  onAnswer: (id: number, val: string) => void;
  onToggleSample: (id: number) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const q = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const stepNumber = currentIndex + 2;

  const typeLabel = {
    passage: "パッセージについての質問",
    illustration: "イラストの描写",
    opinion: "意見を述べる",
  }[q.type];

  const typeColor = {
    passage: "text-blue-400 bg-blue-400/10",
    illustration: "text-green-400 bg-green-400/10",
    opinion: "text-purple-400 bg-purple-400/10",
  }[q.type];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-purple-400/10 text-purple-400 flex items-center justify-center text-sm font-bold">
          {stepNumber === 2 ? "②" : stepNumber === 3 ? "③" : stepNumber === 4 ? "④" : "⑤"}
        </div>
        <h2 className="text-lg font-bold">{typeLabel}</h2>
        <span className="text-xs text-slate-400">({currentIndex + 1}/{questions.length})</span>
      </div>

      {/* Show passage for passage question */}
      {q.type === "passage" && (
        <div className="glass rounded-xl p-4 mb-4 border border-blue-400/20">
          <p className="text-sm text-slate-300 leading-relaxed">{passage.text}</p>
        </div>
      )}

      {/* Illustration situation */}
      {q.type === "illustration" && (
        <div className="glass rounded-xl p-5 mb-4 border border-green-400/20 bg-green-400/5">
          <div className="text-xs text-green-400 font-semibold mb-2 uppercase tracking-wide">イラストの状況</div>
          <p className="text-slate-300 leading-relaxed text-sm">{q.situation}</p>
        </div>
      )}

      {/* Question */}
      <div className="glass rounded-2xl p-6 mb-4">
        <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full mb-3 ${typeColor}`}>
          <Mic className="w-3 h-3" />
          面接官の質問
        </div>
        <p className="text-lg font-medium leading-relaxed">{q.question}</p>
      </div>

      {/* Hint */}
      <div className="glass rounded-xl p-3 mb-4 border border-yellow-400/20 bg-yellow-400/5">
        <p className="text-xs text-yellow-300">
          <span className="font-bold">ヒント：</span>{q.hint}
        </p>
      </div>

      {/* Answer input */}
      <div className="glass rounded-2xl p-5 mb-4">
        <label className="text-sm text-slate-400 mb-2 block">あなたの回答（英語で入力）</label>
        <textarea
          value={answers[q.id] || ""}
          onChange={(e) => onAnswer(q.id, e.target.value)}
          placeholder="Enter your answer in English..."
          className="w-full h-32 bg-transparent text-white placeholder-slate-600 resize-none outline-none leading-relaxed text-sm"
        />
      </div>

      {/* Sample answer toggle */}
      <button
        onClick={() => onToggleSample(q.id)}
        className="w-full text-sm text-slate-400 hover:text-white transition-colors mb-6 flex items-center justify-center gap-1"
      >
        <Lightbulb className="w-4 h-4" />
        {showSample[q.id] ? "模範回答を隠す" : "模範回答を見る（練習後に確認推奨）"}
      </button>

      {showSample[q.id] && (
        <div className="glass rounded-xl p-4 mb-6 border border-slate-400/20 animate-fade-in">
          <div className="text-xs text-slate-400 mb-2">模範回答例</div>
          <p className="text-sm text-slate-300 leading-relaxed italic">{q.sampleAnswer}</p>
        </div>
      )}

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
          {isLast ? "採点する" : "次の質問"}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function ResultsPhase({
  evaluation,
  questions,
  answers,
  onRetry,
  onHome,
}: {
  evaluation: EvaluationResult;
  questions: InterviewQuestion[];
  answers: Record<number, string>;
  onRetry: () => void;
  onHome: () => void;
}) {
  const percentage = Math.round((evaluation.totalScore / evaluation.maxTotalScore) * 100);
  const passed = percentage >= 60;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Score */}
      <div className="text-center">
        <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="50" fill="none"
              stroke={passed ? "#10b981" : "#f43f5e"}
              strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - percentage / 100)}`}
              style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black">{percentage}%</span>
            <span className="text-xs text-slate-400">得点率</span>
          </div>
        </div>
        <h1 className={`text-3xl font-black mb-1 ${passed ? "gradient-text-gold" : "text-red-400"}`}>
          {evaluation.grade}
        </h1>
        <p className="text-xl font-bold">
          {evaluation.totalScore} <span className="text-slate-400 text-base">/ {evaluation.maxTotalScore}点</span>
        </p>
      </div>

      {/* Overall comment */}
      <div className="glass-strong rounded-2xl p-6 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-5 h-5 text-purple-400" />
          <h2 className="font-bold text-purple-400">総合評価</h2>
        </div>
        <p className="text-slate-300 leading-relaxed">{evaluation.overallComment}</p>
      </div>

      {/* Strong/Weak points */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4 border border-green-400/20">
          <div className="text-xs text-green-400 font-semibold mb-2">強み</div>
          {evaluation.strongPoints.map((p, i) => (
            <div key={i} className="flex items-start gap-1 text-sm text-slate-300 mb-1">
              <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
              {p}
            </div>
          ))}
        </div>
        <div className="glass rounded-xl p-4 border border-red-400/20">
          <div className="text-xs text-red-400 font-semibold mb-2">改善点</div>
          {evaluation.weakPoints.map((p, i) => (
            <div key={i} className="flex items-start gap-1 text-sm text-slate-300 mb-1">
              <TrendingUp className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
              {p}
            </div>
          ))}
        </div>
      </div>

      {/* Per question feedback */}
      <div className="space-y-4">
        <h2 className="font-bold text-lg">質問別フィードバック</h2>
        {evaluation.questionFeedback.map((fb, i) => {
          const q = questions[i];
          return (
            <div key={fb.questionId} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-300">
                  質問 {fb.questionId}
                </span>
                <span className={`font-bold ${fb.score >= 3 ? "text-green-400" : fb.score >= 2 ? "text-yellow-400" : "text-red-400"}`}>
                  {fb.score} / {fb.maxScore}点
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="text-slate-400 bg-white/5 rounded-lg p-3 italic">
                  "{answers[fb.questionId] || "（未回答）"}"
                </div>
                <p className="text-slate-300">{fb.evaluation}</p>
                {fb.goodPoints && (
                  <p className="text-green-300 text-xs">✓ {fb.goodPoints}</p>
                )}
                {fb.improvements && (
                  <p className="text-yellow-300 text-xs">△ {fb.improvements}</p>
                )}
                <div className="border-t border-white/10 pt-2">
                  <div className="text-xs text-slate-500 mb-1">より良い回答例：</div>
                  <p className="text-slate-300 italic text-xs">{fb.betterAnswer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Study advice */}
      <div className="glass rounded-2xl p-6 border border-cyan-400/20 bg-cyan-400/5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-cyan-400" />
          <h2 className="font-bold text-cyan-400">学習アドバイス</h2>
        </div>
        <p className="text-slate-300 leading-relaxed text-sm">{evaluation.studyAdvice}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={onRetry} className="btn-primary flex-1 flex items-center justify-center gap-2">
          <Mic className="w-5 h-5" />
          もう一度面接練習する
        </button>
        <button onClick={onHome} className="btn-secondary flex-1 flex items-center justify-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          ホームへ戻る
        </button>
      </div>
    </div>
  );
}

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
        <p className="text-lg font-semibold gradient-text">{message}</p>
        <p className="text-sm text-slate-500 mt-2">少々お待ちください</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center glass rounded-2xl p-8 max-w-md animate-fade-in">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-3">エラーが発生しました</h2>
        <p className="text-slate-400 mb-6">{message}</p>
        <button onClick={onRetry} className="btn-primary">もう一度試す</button>
      </div>
    </div>
  );
}
