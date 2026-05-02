"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  RotateCcw,
  Home,
  Trophy,
  Flame,
  Shield,
  Skull,
  Star,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import {
  MathQuestion,
  TOPIC_LABELS,
  generateEliteChallengeSet,
  getChallengeRank,
} from "@/lib/math-problems";

const QUESTION_SECONDS = 90;
const TOTAL_QUESTIONS = 10;

function ExplanationDetail({ question }: { question: MathQuestion }) {
  return (
    <div className="space-y-2.5">
      {question.keyPoint && (
        <div className="flex items-start gap-2 rounded-lg px-3 py-2 text-xs"
          style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)" }}>
          <span className="flex-shrink-0 font-bold" style={{ color: "#ffd700" }}>⚡ポイント</span>
          <span style={{ color: "#fbbf24" }}>{question.keyPoint}</span>
        </div>
      )}
      {question.steps && question.steps.length > 0 && (
        <ol className="space-y-1.5">
          {question.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                style={{ background: "rgba(96,165,250,0.15)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.3)" }}>
                {i + 1}
              </span>
              <span className="text-slate-300 leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      )}
      <p className="text-xs text-slate-500 leading-relaxed border-t border-white/5 pt-2">
        <span className="text-slate-600">まとめ：</span>{question.explanation}
      </p>
    </div>
  );
}

type Phase = "intro" | "playing" | "answer" | "result";

interface ChallengeState {
  questions: MathQuestion[];
  current: number;
  correct: number;
  wrong: number;
  timeLeft: number;
  selectedIndex: number | null;
  phase: Phase;
  history: { question: MathQuestion; chosen: number | null; correct: boolean }[];
  timedOut: boolean;
}

function initState(): ChallengeState {
  return {
    questions: [],
    current: 0,
    correct: 0,
    wrong: 0,
    timeLeft: QUESTION_SECONDS,
    selectedIndex: null,
    phase: "intro",
    history: [],
    timedOut: false,
  };
}

export default function ChallengePage() {
  const router = useRouter();
  const [state, setState] = useState<ChallengeState>(initState);
  const [animClass, setAnimClass] = useState("");
  const [pulse, setPulse] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQ = state.questions[state.current] ?? null;
  const isLastQuestion = state.current >= TOTAL_QUESTIONS - 1;

  // Per-question countdown
  useEffect(() => {
    if (state.phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setState((prev: ChallengeState) => {
        if (prev.phase !== "playing") return prev;
        const newTime = prev.timeLeft - 1;
        if (newTime <= 10 && newTime > 0) setPulse(true);
        if (newTime <= 0) {
          clearInterval(timerRef.current!);
          // Time's up — count as wrong
          const newHistory = [
            ...prev.history,
            { question: prev.questions[prev.current], chosen: null, correct: false },
          ];
          return {
            ...prev,
            timeLeft: 0,
            phase: "answer",
            wrong: prev.wrong + 1,
            timedOut: true,
            history: newHistory,
          };
        }
        return { ...prev, timeLeft: newTime };
      });
    }, 1000);
    return () => {
      clearInterval(timerRef.current!);
      setPulse(false);
    };
  }, [state.phase, state.current]);

  function startChallenge() {
    const questions = generateEliteChallengeSet().slice(0, TOTAL_QUESTIONS);
    setState({
      ...initState(),
      questions,
      phase: "playing",
    });
    setAnimClass("animate-fade-in-up");
    setTimeout(() => setAnimClass(""), 400);
  }

  function handleAnswer(idx: number) {
    if (state.phase !== "playing" || !currentQ) return;
    clearInterval(timerRef.current!);
    setPulse(false);

    const isCorrect = idx === currentQ.correctIndex;
    const newHistory = [
      ...state.history,
      { question: currentQ, chosen: idx, correct: isCorrect },
    ];

    setState((prev: ChallengeState) => ({
      ...prev,
      selectedIndex: idx,
      phase: "answer",
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
      history: newHistory,
      timedOut: false,
    }));
  }

  function handleNext() {
    if (isLastQuestion) {
      setState((prev: ChallengeState) => ({ ...prev, phase: "result" }));
      return;
    }
    const next = state.current + 1;
    setState((prev: ChallengeState) => ({
      ...prev,
      current: next,
      selectedIndex: null,
      phase: "playing",
      timeLeft: QUESTION_SECONDS,
      timedOut: false,
    }));
    setAnimClass("animate-fade-in-up");
    setTimeout(() => setAnimClass(""), 400);
  }

  // ===== INTRO =====
  if (state.phase === "intro") {
    return (
      <div className="min-h-screen px-4 py-12 safe-bottom">
        <div className="max-w-xl mx-auto">
          <button onClick={() => router.push("/")} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> ホームに戻る
          </button>

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 animate-float"
              style={{ background: "radial-gradient(circle, rgba(255,215,0,0.3), rgba(255,140,0,0.1))" }}>
              <Skull className="w-10 h-10" style={{ color: "#ffd700" }} />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-4"
              style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", color: "#ffd700" }}>
              <Star className="w-3 h-3" /> 最難関チャレンジ
            </div>
            <h1 className="text-4xl font-black mb-3" style={{ color: "#ffd700" }}>
              最難関問題
            </h1>
            <p className="text-slate-300 text-lg mb-2">高校1年生 全単元・最難問</p>
            <p className="text-slate-500 text-sm">S〜Dランク判定 · 全{TOTAL_QUESTIONS}問</p>
          </div>

          <div className="space-y-3 mb-8">
            {[
              { icon: <Shield className="w-5 h-5" />, label: "1問あたりの制限時間", value: `${QUESTION_SECONDS}秒`, color: "#60a5fa" },
              { icon: <AlertTriangle className="w-5 h-5" />, label: "時間切れ", value: "自動でミス扱い", color: "#fb923c" },
              { icon: <Skull className="w-5 h-5" />, label: "ヒント", value: "なし", color: "#f87171" },
              { icon: <Trophy className="w-5 h-5" />, label: "ランク判定", value: "S+ / S / A / B / C / D", color: "#ffd700" },
            ].map((item, i) => (
              <div key={i} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                <span style={{ color: item.color }}>{item.icon}</span>
                <span className="text-slate-400 text-sm flex-1">{item.label}</span>
                <span className="font-bold text-sm" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>

          <button
            onClick={startChallenge}
            className="w-full py-4 rounded-2xl font-black text-xl text-black flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-100"
            style={{ background: "linear-gradient(135deg, #ffd700, #ff8c00)", boxShadow: "0 0 40px rgba(255,215,0,0.4)" }}
          >
            <Flame className="w-6 h-6" />
            チャレンジ開始！
          </button>
        </div>
      </div>
    );
  }

  // ===== RESULT =====
  if (state.phase === "result") {
    const pct = Math.round((state.correct / TOTAL_QUESTIONS) * 100);
    const rank = getChallengeRank(pct);
    return (
      <div className="min-h-screen px-4 py-8 safe-bottom">
        <div className="max-w-2xl mx-auto">
          {/* Rank display */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-28 h-28 rounded-full mb-4 animate-count-up"
              style={{ background: `radial-gradient(circle, ${rank.color}40, ${rank.color}10)`, border: `2px solid ${rank.color}60` }}
            >
              <span className="text-5xl font-black" style={{ color: rank.color }}>{rank.rank}</span>
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: rank.color }}>
              {rank.title}
            </div>
            <p className="text-slate-300 text-lg">{rank.message}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-green-400 mb-1">{state.correct}</div>
              <div className="text-xs text-slate-400">正解</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-red-400 mb-1">{state.wrong}</div>
              <div className="text-xs text-slate-400">不正解</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl font-black mb-1" style={{ color: rank.color }}>{pct}%</div>
              <div className="text-xs text-slate-400">正答率</div>
            </div>
          </div>

          {/* Wrong answers review */}
          {state.history.some((h) => !h.correct) && (
            <div className="glass rounded-2xl p-5 mb-6">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-red-400" />
                解説
              </h2>
              <div className="space-y-4">
                {state.history.filter((h) => !h.correct).map((h, i) => (
                  <div key={i} className="border border-white/8 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400 border border-blue-400/20">
                        {TOPIC_LABELS[h.question.topic]}
                      </span>
                      {h.chosen === null && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-400/10 text-orange-400 border border-orange-400/20">
                          時間切れ
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium mb-2 text-slate-200"
                      dangerouslySetInnerHTML={{ __html: h.question.questionHtml }} />
                    {h.chosen !== null && (
                      <p className="text-xs text-red-400 mb-1">あなたの答え：{h.question.options[h.chosen]}</p>
                    )}
                    <p className="text-xs text-green-400 mb-3">
                      正解：{h.question.options[h.question.correctIndex]}
                    </p>
                    <ExplanationDetail question={h.question} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={startChallenge}
              className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #ffd700, #ff8c00)", color: "#000" }}>
              <RotateCcw className="w-5 h-5" /> 再挑戦
            </button>
            <button onClick={() => router.push("/")}
              className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <Home className="w-5 h-5" /> ホーム
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== PLAYING / ANSWER =====
  const progressPct = ((state.current) / TOTAL_QUESTIONS) * 100;
  const timerPct = (state.timeLeft / QUESTION_SECONDS) * 100;
  const timerUrgent = state.timeLeft <= 15;
  const timerWarning = state.timeLeft <= 30;

  return (
    <div className="min-h-screen px-4 py-4 safe-bottom">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.push("/")} className="p-2 rounded-lg glass hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.25)" }}>
            <Star className="w-4 h-4" style={{ color: "#ffd700" }} />
            <span className="font-bold text-sm" style={{ color: "#ffd700" }}>最難関</span>
          </div>

          <div className="text-sm glass px-3 py-1.5 rounded-lg text-slate-300">
            {state.current + 1} / {TOTAL_QUESTIONS}
          </div>
        </div>

        {/* Overall progress */}
        <div className="h-1.5 rounded-full mb-1 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #ffd700, #ff8c00)" }} />
        </div>

        {/* Per-question timer */}
        <div className="h-2 rounded-full mb-4 overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className={`h-full rounded-full transition-all duration-1000 ${pulse && timerUrgent ? "animate-pulse" : ""}`}
            style={{
              width: `${timerPct}%`,
              background: timerUrgent
                ? "linear-gradient(90deg, #f43f5e, #fb923c)"
                : timerWarning
                ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                : "linear-gradient(90deg, #ffd700, #ff8c00)",
            }}
          />
        </div>

        {/* Timer + score row */}
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono font-black text-lg ${
            timerUrgent ? "text-red-400 animate-pulse" : timerWarning ? "text-yellow-400" : ""
          }`} style={!timerUrgent && !timerWarning ? { color: "#ffd700" } : {}}>
            <Clock className="w-4 h-4" />
            {state.timeLeft}
          </div>
          <div className="flex gap-3 text-sm">
            <span className="text-green-400 font-bold">{state.correct} 正解</span>
            <span className="text-red-400 font-bold">{state.wrong} ミス</span>
          </div>
        </div>

        {/* Question card */}
        {currentQ && (
          <div className={`rounded-2xl p-4 md:p-6 mb-4 ${animClass}`}
            style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)" }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", color: "#ffd700" }}>
                {TOPIC_LABELS[currentQ.topic]}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-400/10 text-red-400 border border-red-400/20">
                最難関
              </span>
            </div>
            <p className="text-base md:text-lg font-medium leading-relaxed"
              dangerouslySetInnerHTML={{ __html: currentQ.questionHtml }} />
          </div>
        )}

        {/* Time's up banner */}
        {state.timedOut && state.phase === "answer" && (
          <div className="flex items-center gap-2 glass rounded-xl px-4 py-3 mb-3 border border-orange-400/30 text-orange-400 animate-fade-in">
            <Clock className="w-5 h-5 flex-shrink-0" />
            <span className="font-bold">時間切れ！</span>
            <span className="text-sm text-slate-400">— {QUESTION_SECONDS}秒を超えました</span>
          </div>
        )}

        {/* Options */}
        {currentQ && (
          <div className="space-y-2.5 mb-4">
            {currentQ.options.map((opt, i) => {
              let bgStyle: React.CSSProperties = {
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#e2e8f0",
              };
              if (state.phase === "answer") {
                if (i === currentQ.correctIndex) {
                  bgStyle = { background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.6)", color: "#6ee7b7" };
                } else if (i === state.selectedIndex) {
                  bgStyle = { background: "rgba(244,63,94,0.15)", border: "1px solid rgba(244,63,94,0.6)", color: "#fda4af" };
                }
              } else if (state.selectedIndex === i) {
                bgStyle = { background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.5)", color: "#ffd700" };
              }

              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={state.phase === "answer"}
                  className="w-full text-left rounded-xl p-4 flex items-center gap-3 transition-all duration-200 min-h-[56px]"
                  style={{ ...bgStyle, touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
                  <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border"
                    style={
                      state.phase === "answer" && i === currentQ.correctIndex
                        ? { background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.6)", color: "#6ee7b7" }
                        : state.phase === "answer" && i === state.selectedIndex
                        ? { background: "rgba(244,63,94,0.2)", border: "1px solid rgba(244,63,94,0.6)", color: "#fda4af" }
                        : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }
                    }>
                    {["A", "B", "C", "D"][i]}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {state.phase === "answer" && i === currentQ.correctIndex && <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />}
                  {state.phase === "answer" && i === state.selectedIndex && i !== currentQ.correctIndex && <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Feedback */}
        {state.phase === "answer" && currentQ && !state.timedOut && (
          <div className={`rounded-xl p-4 mb-4 animate-fade-in ${
            state.selectedIndex === currentQ.correctIndex
              ? "border border-green-400/30"
              : "border border-red-400/30"
          }`} style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className={`flex items-center gap-2 font-bold mb-3 ${
              state.selectedIndex === currentQ.correctIndex ? "text-green-400" : "text-red-400"
            }`}>
              {state.selectedIndex === currentQ.correctIndex
                ? <><CheckCircle className="w-4 h-4" /> 正解！</>
                : <><XCircle className="w-4 h-4" /> 不正解</>}
            </div>
            <ExplanationDetail question={currentQ} />
          </div>
        )}

        {/* Next button */}
        {state.phase === "answer" && (
          <button onClick={handleNext}
            className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #ffd700, #ff8c00)", color: "#000" }}>
            {isLastQuestion
              ? <><Trophy className="w-5 h-5" /> ランクを確認する</>
              : <>次の問題へ <ChevronRight className="w-5 h-5" /></>}
          </button>
        )}
      </div>
    </div>
  );
}
