"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Clock,
  Zap,
  CheckCircle,
  XCircle,
  ChevronRight,
  RotateCcw,
  Home,
  Trophy,
  Flame,
  BookOpen,
} from "lucide-react";
import {
  MathQuestion,
  Topic,
  GameMode,
  TOPIC_LABELS,
  generateQuestion,
  getEncouragementMessage,
} from "@/lib/math-problems";

const QUIZ_TOTAL = 10;
const TIME_ATTACK_SECONDS = 60;
const SURVIVAL_LIVES = 3;

type Phase = "playing" | "answer" | "result";

interface GameState {
  questions: MathQuestion[];
  current: number;
  score: number;
  correct: number;
  wrong: number;
  streak: number;
  maxStreak: number;
  lives: number;
  timeLeft: number;
  selectedIndex: number | null;
  phase: Phase;
  history: { question: MathQuestion; chosen: number; correct: boolean }[];
}

function initState(mode: GameMode): GameState {
  return {
    questions: [],
    current: 0,
    score: 0,
    correct: 0,
    wrong: 0,
    streak: 0,
    maxStreak: 0,
    lives: SURVIVAL_LIVES,
    timeLeft: TIME_ATTACK_SECONDS,
    selectedIndex: null,
    phase: "playing",
    history: [],
  };
}

function GameContent() {
  const router = useRouter();
  const params = useSearchParams();
  const topicsParam = params.get("topics") ?? "expansion";
  const modeParam = (params.get("mode") ?? "quiz") as GameMode;

  const topics = topicsParam.split(",") as Topic[];

  const [state, setState] = useState<GameState>(() => initState(modeParam));
  const [animClass, setAnimClass] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQ = state.questions[state.current] ?? null;

  useEffect(() => {
    nextQuestion({ ...initState(modeParam) }, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (modeParam !== "time-attack" || state.phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setState((prev: GameState) => {
        if (prev.phase !== "playing") return prev;
        const newTime = prev.timeLeft - 1;
        if (newTime <= 0) {
          clearInterval(timerRef.current!);
          return { ...prev, timeLeft: 0, phase: "result" };
        }
        return { ...prev, timeLeft: newTime };
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [modeParam, state.phase, state.current]);

  function nextQuestion(base: GameState, fresh = false) {
    const idx = base.questions.length % topics.length;
    const topic = topics[idx];
    const diffMap: ("easy" | "medium" | "hard")[] = ["easy", "easy", "medium", "medium", "medium", "hard", "hard"];
    const diffIdx = Math.min(Math.floor(base.questions.length / 2), diffMap.length - 1);
    const difficulty = diffMap[diffIdx];

    const q = generateQuestion(topic, difficulty);
    const newQuestions = [...base.questions, q];
    const newCurrent = fresh ? 0 : newQuestions.length - 1;

    setState({
      ...base,
      questions: newQuestions,
      current: newCurrent,
      selectedIndex: null,
      phase: "playing",
    });
    setAnimClass("animate-fade-in-up");
    setTimeout(() => setAnimClass(""), 400);
  }

  function handleAnswer(idx: number) {
    if (state.phase !== "playing" || !currentQ) return;
    clearInterval(timerRef.current!);

    const isCorrect = idx === currentQ.correctIndex;
    const streakBonus = isCorrect ? Math.min(state.streak, 4) : 0;
    const points = isCorrect ? 100 + streakBonus * 20 : 0;
    const newStreak = isCorrect ? state.streak + 1 : 0;
    const newLives = !isCorrect && modeParam === "survival" ? state.lives - 1 : state.lives;

    const newHistory = [
      ...state.history,
      { question: currentQ, chosen: idx, correct: isCorrect },
    ];

    const newCorrect = state.correct + (isCorrect ? 1 : 0);
    const newWrong = state.wrong + (!isCorrect ? 1 : 0);
    const total = newCorrect + newWrong;

    let nextPhase: Phase = "answer";
    if (modeParam === "survival" && newLives <= 0) nextPhase = "answer";

    setState((prev: GameState) => ({
      ...prev,
      selectedIndex: idx,
      phase: nextPhase,
      score: prev.score + points,
      correct: newCorrect,
      wrong: newWrong,
      streak: newStreak,
      maxStreak: Math.max(prev.maxStreak, newStreak),
      lives: newLives,
      history: newHistory,
    }));
  }

  function handleNext() {
    const total = state.correct + state.wrong;
    const shouldEnd =
      (modeParam === "quiz" && total >= QUIZ_TOTAL) ||
      (modeParam === "survival" && state.lives <= 0) ||
      (modeParam === "time-attack" && state.timeLeft <= 0);

    if (shouldEnd) {
      setState((prev: GameState) => ({ ...prev, phase: "result" }));
    } else {
      nextQuestion({ ...state, phase: "playing" });
    }
  }

  if (state.phase === "result") {
    return (
      <ResultScreen
        state={state}
        mode={modeParam}
        topics={topics}
        onRestart={() => {
          const fresh = initState(modeParam);
          nextQuestion(fresh, true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen px-4 py-4 md:py-8 safe-bottom">
      <div className="max-w-2xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-lg glass hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {modeParam === "survival" && (
              <div className="flex gap-0.5">
                {Array.from({ length: SURVIVAL_LIVES }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-5 h-5 transition-colors ${i < state.lives ? "text-red-400 fill-red-400" : "text-slate-600"}`}
                  />
                ))}
              </div>
            )}

            {modeParam === "time-attack" && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass text-sm ${state.timeLeft <= 10 ? "text-red-400" : "text-cyan-400"}`}>
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono font-bold">{state.timeLeft}s</span>
              </div>
            )}

            {modeParam === "quiz" && (
              <div className="text-xs text-slate-400 glass px-2.5 py-1 rounded-lg">
                {state.correct + state.wrong} / {QUIZ_TOTAL}
              </div>
            )}

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg glass text-yellow-400 text-sm">
              <Trophy className="w-3.5 h-3.5" />
              <span className="font-bold">{state.score}</span>
            </div>
          </div>
        </div>

        {/* Streak */}
        {state.streak >= 2 && (
          <div className="flex items-center justify-center gap-1 mb-4 text-orange-400 animate-fade-in">
            <Flame className="w-5 h-5" />
            <span className="font-bold">{state.streak}連続正解！</span>
            {state.streak >= 3 && (
              <span className="text-sm">スコア+{Math.min(state.streak, 4) * 20}ボーナス</span>
            )}
          </div>
        )}

        {/* Progress bar (quiz mode) */}
        {modeParam === "quiz" && (
          <div className="progress-bar mb-4">
            <div
              className="progress-fill"
              style={{ width: `${((state.correct + state.wrong) / QUIZ_TOTAL) * 100}%` }}
            />
          </div>
        )}

        {/* Question card */}
        {currentQ && (
          <div className={`glass rounded-2xl p-4 md:p-6 mb-4 ${animClass}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400 border border-blue-400/20">
                {TOPIC_LABELS[currentQ.topic]}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                currentQ.difficulty === "easy"
                  ? "bg-green-400/10 text-green-400 border border-green-400/20"
                  : currentQ.difficulty === "medium"
                  ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                  : "bg-red-400/10 text-red-400 border border-red-400/20"
              }`}>
                {currentQ.difficulty === "easy" ? "やさしい" : currentQ.difficulty === "medium" ? "ふつう" : "むずかしい"}
              </span>
            </div>

            <p
              className="text-base md:text-lg font-medium leading-relaxed mb-2"
              dangerouslySetInnerHTML={{ __html: currentQ.questionHtml }}
            />

            {currentQ.hint && state.phase === "playing" && (
              <p className="text-xs text-slate-500 mt-2">ヒント：{currentQ.hint}</p>
            )}
          </div>
        )}

        {/* Options */}
        {currentQ && (
          <div className="space-y-2.5 mb-4">
            {currentQ.options.map((opt, i) => {
              let cls = "option-btn";
              if (state.phase === "answer") {
                if (i === currentQ.correctIndex) cls += " correct";
                else if (i === state.selectedIndex && i !== currentQ.correctIndex) cls += " incorrect";
              } else if (state.selectedIndex === i) {
                cls += " selected";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={state.phase === "answer"}
                  className={`${cls} flex items-center gap-3`}
                >
                  <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                    state.phase === "answer" && i === currentQ.correctIndex
                      ? "bg-green-400/20 border-green-400/60 text-green-400"
                      : state.phase === "answer" && i === state.selectedIndex
                      ? "bg-red-400/20 border-red-400/60 text-red-400"
                      : "bg-white/5 border-white/10"
                  }`}>
                    {["A", "B", "C", "D"][i]}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {state.phase === "answer" && i === currentQ.correctIndex && (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  )}
                  {state.phase === "answer" && i === state.selectedIndex && i !== currentQ.correctIndex && (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Answer feedback */}
        {state.phase === "answer" && currentQ && (
          <div className={`glass rounded-xl p-3 md:p-4 mb-3 animate-fade-in border ${
            state.selectedIndex === currentQ.correctIndex
              ? "border-green-400/30"
              : "border-red-400/30"
          }`}>
            <div className={`flex items-center gap-2 font-bold mb-2 ${
              state.selectedIndex === currentQ.correctIndex ? "text-green-400" : "text-red-400"
            }`}>
              {state.selectedIndex === currentQ.correctIndex ? (
                <><CheckCircle className="w-5 h-5" /> 正解！{state.streak >= 2 ? ` ${state.streak}連続！` : ""}</>
              ) : (
                <><XCircle className="w-5 h-5" /> 不正解</>
              )}
            </div>
            <p className="text-sm text-slate-300">
              <span className="text-slate-400">解説：</span>{currentQ.explanation}
            </p>
          </div>
        )}

        {state.phase === "answer" && (
          <button onClick={handleNext} className="btn-primary w-full flex items-center justify-center gap-2">
            {(() => {
              const total = state.correct + state.wrong;
              const shouldEnd =
                (modeParam === "quiz" && total >= QUIZ_TOTAL) ||
                (modeParam === "survival" && state.lives <= 0) ||
                (modeParam === "time-attack" && state.timeLeft <= 0);
              return shouldEnd ? (
                <><Trophy className="w-5 h-5" /> 結果を見る</>
              ) : (
                <>次の問題へ <ChevronRight className="w-5 h-5" /></>
              );
            })()}
          </button>
        )}
      </div>
    </div>
  );
}

function ResultScreen({
  state,
  mode,
  topics,
  onRestart,
}: {
  state: GameState;
  mode: GameMode;
  topics: Topic[];
  onRestart: () => void;
}) {
  const router = useRouter();
  const total = state.correct + state.wrong;
  const pct = total > 0 ? Math.round((state.correct / total) * 100) : 0;
  const message = getEncouragementMessage(state.correct, Math.max(total, 1));

  const topicStats = topics
    .map((t) => {
      const qs = state.history.filter((h) => h.question.topic === t);
      const c = qs.filter((h) => h.correct).length;
      return { topic: t, correct: c, total: qs.length };
    })
    .filter((s) => s.total > 0);

  return (
    <div className="min-h-screen px-4 py-8 safe-bottom">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4"
            style={{
              background:
                pct >= 70
                  ? "radial-gradient(circle, rgba(16,185,129,0.3), rgba(16,185,129,0.05))"
                  : "radial-gradient(circle, rgba(79,142,247,0.3), rgba(79,142,247,0.05))",
            }}
          >
            <Trophy className={`w-12 h-12 ${pct >= 70 ? "text-green-400" : "text-blue-400"}`} />
          </div>

          <h1 className="text-4xl font-black mb-2">
            {mode === "time-attack" ? `${total}問クリア！` : `${pct}点！`}
          </h1>
          <p className="text-xl text-slate-300 mb-1">{message}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="正解" value={`${state.correct}`} color="green" />
          <StatCard label="不正解" value={`${state.wrong}`} color="red" />
          <StatCard label="最高連続" value={`${state.maxStreak}`} color="orange" />
          <StatCard label="スコア" value={`${state.score}`} color="blue" />
        </div>

        {/* Topic breakdown */}
        {topicStats.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              単元別の結果
            </h2>
            <div className="space-y-3">
              {topicStats.map(({ topic, correct, total: t }) => {
                const p = t > 0 ? Math.round((correct / t) * 100) : 0;
                return (
                  <div key={topic}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{TOPIC_LABELS[topic]}</span>
                      <span className={p >= 70 ? "text-green-400" : p >= 40 ? "text-yellow-400" : "text-red-400"}>
                        {correct}/{t} ({p}%)
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${p}%`,
                          background: p >= 70 ? "#10b981" : p >= 40 ? "#f59e0b" : "#f43f5e",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Review wrong answers */}
        {state.history.some((h) => !h.correct) && (
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              間違えた問題の解説
            </h2>
            <div className="space-y-4">
              {state.history
                .filter((h) => !h.correct)
                .map((h, i) => (
                  <div key={i} className="border border-white/8 rounded-xl p-4">
                    <p
                      className="text-sm font-medium mb-1 text-slate-300"
                      dangerouslySetInnerHTML={{ __html: h.question.questionHtml }}
                    />
                    <p className="text-xs text-red-400 mb-1">
                      あなたの答え：{h.question.options[h.chosen]}
                    </p>
                    <p className="text-xs text-green-400 mb-2">
                      正解：{h.question.options[h.question.correctIndex]}
                    </p>
                    <p className="text-xs text-slate-400">{h.question.explanation}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onRestart}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            もう一度チャレンジ
          </button>
          <button
            onClick={() => router.push("/")}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            単元を変える
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "green" | "red" | "orange" | "blue";
}) {
  const colorMap = {
    green: "text-green-400",
    red: "text-red-400",
    orange: "text-orange-400",
    blue: "text-blue-400",
  };
  return (
    <div className="glass rounded-xl p-4 text-center">
      <div className={`text-2xl font-black mb-1 ${colorMap[color]}`}>{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

export default function MathGamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-slate-400">読み込み中...</div>
        </div>
      }
    >
      <GameContent />
    </Suspense>
  );
}
