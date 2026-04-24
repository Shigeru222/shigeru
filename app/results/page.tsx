"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  XCircle,
  CheckCircle,
  Brain,
  BookOpen,
  FileText,
  PenLine,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Lightbulb,
  Target,
  Zap,
} from "lucide-react";
import { ExamResult, Analysis } from "@/lib/types";
import { getCurrentResult, saveExamResult } from "@/lib/storage";

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showVocabReview, setShowVocabReview] = useState(false);
  const [showReadingReview, setShowReadingReview] = useState(false);
  const [animateScore, setAnimateScore] = useState(false);

  useEffect(() => {
    const r = getCurrentResult();
    if (!r) {
      router.push("/");
      return;
    }
    setResult(r);
    if (r.analysis) {
      setAnalysis(r.analysis);
    }
    setTimeout(() => setAnimateScore(true), 300);
  }, [router]);

  async function runAnalysis() {
    if (!result) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });
      if (!res.ok) throw new Error("Failed");
      const data: Analysis = await res.json();
      setAnalysis(data);
      const updated = { ...result, analysis: data };
      setResult(updated);
      saveExamResult(updated);
    } catch {
      alert("分析に失敗しました。もう一度お試しください。");
    } finally {
      setAnalyzing(false);
    }
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const percentage = Math.round((result.scores.total / result.scores.maxTotal) * 100);

  return (
    <main className="min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 pt-8">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          トップへ戻る
        </button>

        {/* Score Hero */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="relative inline-flex items-center justify-center w-40 h-40 mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
              <circle cx="72" cy="72" r="60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
              <circle
                cx="72"
                cy="72"
                r="60"
                fill="none"
                stroke={result.passed ? "#10b981" : "#f43f5e"}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 60}`}
                strokeDashoffset={animateScore ? `${2 * Math.PI * 60 * (1 - percentage / 100)}` : `${2 * Math.PI * 60}`}
                style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-black ${animateScore ? "animate-count-up" : "opacity-0"}`}>
                {percentage}%
              </span>
              <span className="text-xs text-slate-400 mt-1">得点率</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-2">
            {result.passed ? (
              <Trophy className="w-8 h-8 text-yellow-400" />
            ) : (
              <XCircle className="w-8 h-8 text-red-400" />
            )}
            <h1 className={`text-4xl font-black ${result.passed ? "gradient-text-gold" : "text-red-400"}`}>
              {result.passed ? "合格圏！" : "もう少し！"}
            </h1>
          </div>
          <p className="text-3xl font-bold">
            {result.scores.total}{" "}
            <span className="text-slate-400 text-xl">/ {result.scores.maxTotal}点</span>
          </p>
          <p className={`text-sm mt-2 ${result.passed ? "text-green-400" : "text-slate-400"}`}>
            {result.passed ? "合格目安（65%）を超えました！" : "合格目安（65% = 27点以上）まであと少し"}
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-in-up">
          <h2 className="text-lg font-bold mb-4">セクション別スコア</h2>
          <div className="space-y-4">
            <ScoreBar
              icon={<BookOpen className="w-4 h-4" />}
              label="語彙・文法"
              score={result.scores.vocab}
              max={result.scores.maxVocab}
              color="blue"
            />
            <ScoreBar
              icon={<FileText className="w-4 h-4" />}
              label="読解"
              score={result.scores.reading}
              max={result.scores.maxReading}
              color="purple"
            />
            <ScoreBar
              icon={<PenLine className="w-4 h-4" />}
              label="英作文"
              score={result.scores.writing}
              max={result.scores.maxWriting}
              color="cyan"
            />
          </div>
        </div>

        {/* Writing Evaluation */}
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-in-up">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <PenLine className="w-5 h-5 text-cyan-400" />
            英作文評価
          </h2>
          <div className="bg-white/5 rounded-xl p-4 mb-4 text-sm text-slate-300 leading-relaxed italic">
            {result.writingAnswer || <span className="text-slate-500">回答なし</span>}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "内容", value: result.writingEvaluation.content },
              { label: "構成", value: result.writingEvaluation.organization },
              { label: "語彙", value: result.writingEvaluation.vocabulary },
              { label: "文法", value: result.writingEvaluation.grammar },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 rounded-xl p-3">
                <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                <div className="text-sm text-slate-300">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="text-sm text-slate-300 bg-cyan-400/10 border border-cyan-400/20 rounded-xl p-4">
            <span className="text-cyan-400 font-semibold">総合フィードバック：</span>
            <span className="ml-1">{result.writingEvaluation.feedback}</span>
          </div>
        </div>

        {/* Answer Review Toggle - Vocab */}
        <ReviewSection
          title={`語彙・文法 解答解説 (${result.scores.vocab}/${result.scores.maxVocab}問正解)`}
          isOpen={showVocabReview}
          onToggle={() => setShowVocabReview((v) => !v)}
        >
          <div className="space-y-4">
            {result.examData.vocabQuestions.map((q, i) => {
              const userAnswer = result.vocabAnswers[i];
              const isCorrect = userAnswer?.selectedIndex === q.correctIndex;
              return (
                <div
                  key={q.id}
                  className={`rounded-xl p-4 border ${
                    isCorrect
                      ? "bg-green-400/10 border-green-400/30"
                      : "bg-red-400/10 border-red-400/30"
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm font-medium">{q.question}</p>
                  </div>
                  {!isCorrect && (
                    <div className="ml-6 space-y-1 text-xs">
                      <p className="text-red-300">
                        あなたの回答:{" "}
                        {userAnswer?.selectedIndex >= 0 ? q.options[userAnswer.selectedIndex] : "未回答"}
                      </p>
                      <p className="text-green-300">正解: {q.options[q.correctIndex]}</p>
                    </div>
                  )}
                  <p className="ml-6 text-xs text-slate-400 mt-2">{q.explanation}</p>
                </div>
              );
            })}
          </div>
        </ReviewSection>

        {/* Answer Review Toggle - Reading */}
        <ReviewSection
          title={`読解 解答解説 (${result.scores.reading}/${result.scores.maxReading}問正解)`}
          isOpen={showReadingReview}
          onToggle={() => setShowReadingReview((v) => !v)}
        >
          <div className="space-y-4">
            {result.examData.readingPassage.questions.map((q, i) => {
              const userAnswer = result.readingAnswers[i];
              const isCorrect = userAnswer?.selectedIndex === q.correctIndex;
              return (
                <div
                  key={q.id}
                  className={`rounded-xl p-4 border ${
                    isCorrect
                      ? "bg-green-400/10 border-green-400/30"
                      : "bg-red-400/10 border-red-400/30"
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm font-medium">{q.question}</p>
                  </div>
                  {!isCorrect && (
                    <div className="ml-6 space-y-1 text-xs">
                      <p className="text-red-300">
                        あなたの回答:{" "}
                        {userAnswer?.selectedIndex >= 0 ? q.options[userAnswer.selectedIndex] : "未回答"}
                      </p>
                      <p className="text-green-300">正解: {q.options[q.correctIndex]}</p>
                    </div>
                  )}
                  <p className="ml-6 text-xs text-slate-400 mt-2">{q.explanation}</p>
                </div>
              );
            })}
          </div>
        </ReviewSection>

        {/* AI Analysis */}
        <div className="mt-6 animate-fade-in-up">
          {!analysis && !analyzing && (
            <button
              onClick={runAnalysis}
              className="btn-primary w-full flex items-center justify-center gap-2 text-lg"
            >
              <Brain className="w-5 h-5" />
              AIによる弱点分析・改善提案を見る
            </button>
          )}

          {analyzing && (
            <div className="glass rounded-2xl p-8 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-purple-400 mx-auto mb-4" />
              <p className="text-lg font-semibold gradient-text mb-1">AIが分析中...</p>
              <p className="text-slate-400 text-sm">間違いのパターンを解析しています</p>
            </div>
          )}

          {analysis && <AnalysisSection analysis={analysis} />}
        </div>

        {/* New Exam */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/exam")}
            className="btn-secondary flex items-center gap-2 mx-auto"
          >
            <Zap className="w-5 h-5" />
            もう一度受験する
          </button>
        </div>
      </div>
    </main>
  );
}

function ScoreBar({
  icon,
  label,
  score,
  max,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  score: number;
  max: number;
  color: "blue" | "purple" | "cyan";
}) {
  const colorMap = {
    blue: { text: "text-blue-400", bg: "bg-blue-400" },
    purple: { text: "text-purple-400", bg: "bg-purple-400" },
    cyan: { text: "text-cyan-400", bg: "bg-cyan-400" },
  };
  const pct = (score / max) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className={`flex items-center gap-2 ${colorMap[color].text}`}>
          {icon}
          <span className="text-sm font-medium text-white">{label}</span>
        </div>
        <span className="font-bold">
          {score} <span className="text-slate-400 font-normal text-sm">/ {max}</span>
        </span>
      </div>
      <div className="progress-bar">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${colorMap[color].bg}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ReviewSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl mb-4 overflow-hidden animate-fade-in-up">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-semibold">{title}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      {isOpen && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

function AnalysisSection({ analysis }: { analysis: Analysis }) {
  const severityColor = (s: string) => {
    if (s === "high") return "text-red-400 bg-red-400/10 border-red-400/30";
    if (s === "medium") return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
    return "text-green-400 bg-green-400/10 border-green-400/30";
  };
  const priorityColor = (p: string) => {
    if (p === "high") return "text-red-400";
    if (p === "medium") return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overall Comment */}
      <div className="glass-strong rounded-2xl p-6 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-purple-400" />
          <h2 className="font-bold text-purple-400">AI分析レポート</h2>
        </div>
        <p className="text-slate-300 leading-relaxed">{analysis.overallComment}</p>
      </div>

      {/* Weak Areas */}
      {analysis.weakAreas.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h2 className="font-bold">弱点エリア</h2>
          </div>
          <div className="space-y-3">
            {analysis.weakAreas.map((area, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 border ${severityColor(area.severity)}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{area.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${severityColor(area.severity)}`}>
                    {area.severity === "high" ? "重要" : area.severity === "medium" ? "中程度" : "軽微"}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Actions */}
      {analysis.improvementActions.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold">改善アクション</h2>
          </div>
          <div className="space-y-4">
            {analysis.improvementActions.map((action, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-semibold text-sm">{action.title}</span>
                  <span className={`text-xs font-bold flex-shrink-0 ${priorityColor(action.priority)}`}>
                    {action.priority === "high" ? "優先度高" : action.priority === "medium" ? "優先度中" : "優先度低"}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-2">{action.description}</p>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Target className="w-3 h-3" />
                  {action.duration}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Study Plan */}
      {analysis.studyPlan && (
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            2週間学習プラン
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {analysis.studyPlan}
          </p>
        </div>
      )}

      {/* Encouragement */}
      {analysis.encouragement && (
        <div className="glass rounded-2xl p-6 border border-green-400/20 bg-green-400/5 text-center">
          <p className="text-lg font-medium text-green-300 leading-relaxed">
            {analysis.encouragement}
          </p>
        </div>
      )}
    </div>
  );
}
