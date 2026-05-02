"use client";

import { useEffect, useRef, useState, Suspense, useCallback } from "react";
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
  Lightbulb,
  Star,
  TrendingUp,
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
const AUTO_ADVANCE_MS = 1400;

type Phase = "playing" | "answer" | "result" | "levelup";

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
  level: number;
  hintUsed: boolean;
  shakeLives: boolean;
}

function initState(): GameState {
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
    level: 1,
    hintUsed: false,
    shakeLives: false,
  };
}

function GameContent() {
  const router = useRouter();
  const params = useSearchParams();
  const topicsParam = params.get("topics") ?? "expansion";
  const modeParam = (params.get("mode") ?? "quiz") as GameMode;
  const topics = topicsParam.split(",") as Topic[];

  const [state, setState] = useState<GameState>(initState);
  const [animClass, setAnimClass] = useState("");
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQ = state.questions[state.current] ?? null;

  const doNextQuestion = useCallback((base: GameState) => {
    const idx = base.questions.length % topics.length;
    const topic = topics[idx];
    // Survival: difficulty based on level; others: based on question count
    const diffByLevel = (level: number): "easy" | "medium" | "hard" =>
      level <= 2 ? "easy" : level <= 4 ? "medium" : "hard";
    const diffByCount = (n: number): "easy" | "medium" | "hard" => {
      const map: ("easy" | "medium" | "hard")[] = ["easy", "easy", "medium", "medium", "medium", "hard", "hard"];
      return map[Math.min(Math.floor(n / 2), map.length - 1)];
    };
    const difficulty =
      modeParam === "survival" ? diffByLevel(base.level) : diffByCount(base.questions.length);

    const q = generateQuestion(topic, difficulty);
    const newQuestions = [...base.questions, q];
    const newCurrent = base.questions.length === 0 ? 0 : newQuestions.length - 1;

    setState({
      ...base,
      questions: newQuestions,
      current: newCurrent,
      selectedIndex: null,
      phase: "playing",
      hintUsed: false,
    });
    setShowHint(false);
    setAnimClass("animate-fade-in-up");
    setTimeout(() => setAnimClass(""), 400);
  }, [modeParam, topics]);

  // Init
  useEffect(() => {
    doNextQuestion(initState());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer (time-attack)
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

  function handleAnswer(idx: number) {
    if (state.phase !== "playing" || !currentQ) return;
    clearInterval(timerRef.current!);
    clearTimeout(autoAdvanceRef.current!);

    const isCorrect = idx === currentQ.correctIndex;
    const streakBonus = isCorrect ? Math.min(state.streak, 4) : 0;
    const hintPenalty = state.hintUsed ? 0.5 : 1;
    const points = isCorrect ? Math.round((100 + streakBonus * 20) * hintPenalty) : 0;
    const newStreak = isCorrect ? state.streak + 1 : 0;
    const lostLife = !isCorrect && modeParam === "survival";
    const newLives = lostLife ? state.lives - 1 : state.lives;
    const newCorrect = state.correct + (isCorrect ? 1 : 0);
    const newWrong = state.wrong + (!isCorrect ? 1 : 0);

    // Survival: level up every 5 correct answers
    const newLevel =
      modeParam === "survival" && isCorrect && newCorrect % 5 === 0
        ? state.level + 1
        : state.level;
    const isLevelUp = newLevel > state.level;

    const newHistory = [...state.history, { question: currentQ, chosen: idx, correct: isCorrect }];

    const survivorDead = modeParam === "survival" && newLives <= 0;
    const quizDone = modeParam === "quiz" && newCorrect + newWrong >= QUIZ_TOTAL;

    const nextPhase: Phase =
      survivorDead || quizDone
        ? "answer"
        : isLevelUp
        ? "answer"
        : "answer";

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
      level: newLevel,
      shakeLives: lostLife,
    }));

    // Remove shake after animation
    if (lostLife) {
      setTimeout(() => setState((p: GameState) => ({ ...p, shakeLives: false })), 600);
    }

    // Time attack: auto-advance
    if (modeParam === "time-attack") {
      autoAdvanceRef.current = setTimeout(() => {
        setState((prev: GameState) => {
          if (prev.timeLeft <= 0) return { ...prev, phase: "result" };
          return prev;
        });
        doNextQuestion({
          ...state,
          selectedIndex: idx,
          phase: "answer",
          score: state.score + points,
          correct: newCorrect,
          wrong: newWrong,
          streak: newStreak,
          maxStreak: Math.max(state.maxStreak, newStreak),
          lives: newLives,
          history: newHistory,
          level: newLevel,
          shakeLives: false,
          hintUsed: false,
        });
      }, AUTO_ADVANCE_MS);
    }
  }

  function handleNext() {
    const survivorDead = modeParam === "survival" && state.lives <= 0;
    const quizDone = modeParam === "quiz" && state.correct + state.wrong >= QUIZ_TOTAL;
    const timeDone = modeParam === "time-attack" && state.timeLeft <= 0;

    if (survivorDead || quizDone || timeDone) {
      setState((prev: GameState) => ({ ...prev, phase: "result" }));
    } else if (modeParam === "survival" && state.level > (state.questions.length > 0 ? Math.ceil(state.correct / 5) : 0)) {
      setState((prev: GameState) => ({ ...prev, phase: "levelup" }));
      setTimeout(() => doNextQuestion({ ...state, phase: "playing" }), 1800);
    } else {
      doNextQuestion({ ...state, phase: "playing" });
    }
  }

  if (state.phase === "result") {
    return (
      <ResultScreen
        state={state}
        mode={modeParam}
        topics={topics}
        onRestart={() => doNextQuestion(initState())}
      />
    );
  }

  // Level up overlay (survival)
  if (state.phase === "levelup") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center animate-fade-in-up">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-4xl font-black gradient-text mb-2">レベルアップ！</h2>
          <p className="text-xl text-slate-300">レベル {state.level} に突入！</p>
          <p className="text-slate-500 mt-2 text-sm">問題がむずかしくなります…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 safe-bottom" style={{ paddingTop: "1rem", paddingBottom: "1.5rem" }}>
      <div className="max-w-2xl mx-auto">

        {/* ===== QUIZ MODE header ===== */}
        {modeParam === "quiz" && (
          <QuizHeader state={state} onBack={() => router.push("/")} />
        )}

        {/* ===== TIME ATTACK header ===== */}
        {modeParam === "time-attack" && (
          <TimeAttackHeader state={state} onBack={() => router.push("/")} />
        )}

        {/* ===== SURVIVAL header ===== */}
        {modeParam === "survival" && (
          <SurvivalHeader state={state} onBack={() => router.push("/")} />
        )}

        {/* Streak banner */}
        {state.streak >= 2 && state.phase === "playing" && (
          <div className="flex items-center justify-center gap-1.5 mb-3 text-orange-400 animate-fade-in">
            <Flame className="w-4 h-4" />
            <span className="font-bold text-sm">{state.streak}連続正解！</span>
            {state.streak >= 3 && (
              <span className="text-xs bg-orange-400/10 border border-orange-400/30 rounded-full px-2 py-0.5">
                +{Math.min(state.streak, 4) * 20}pt ボーナス
              </span>
            )}
          </div>
        )}

        {/* Question card */}
        {currentQ && (
          <div className={`glass rounded-2xl p-4 md:p-6 mb-4 ${animClass}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
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

              {/* Hint button (quiz only) */}
              {modeParam === "quiz" && currentQ.hint && !showHint && state.phase === "playing" && (
                <button
                  onClick={() => { setShowHint(true); setState((p: GameState) => ({ ...p, hintUsed: true })); }}
                  className="flex items-center gap-1 text-xs text-yellow-400 border border-yellow-400/30 bg-yellow-400/10 rounded-lg px-2.5 py-1 hover:bg-yellow-400/20 transition-colors"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  ヒント
                  {!state.hintUsed && <span className="text-yellow-600 ml-1">(-50%)</span>}
                </button>
              )}
            </div>

            <p
              className="text-base md:text-lg font-medium leading-relaxed"
              dangerouslySetInnerHTML={{ __html: currentQ.questionHtml }}
            />

            {showHint && currentQ.hint && (
              <div className="mt-3 flex items-start gap-2 bg-yellow-400/5 border border-yellow-400/20 rounded-lg px-3 py-2 animate-fade-in">
                <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-300">{currentQ.hint}</p>
              </div>
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
          <div className={`glass rounded-xl p-3 mb-3 animate-fade-in border ${
            state.selectedIndex === currentQ.correctIndex ? "border-green-400/30" : "border-red-400/30"
          }`}>
            <div className={`flex items-center gap-2 font-bold mb-1.5 ${
              state.selectedIndex === currentQ.correctIndex ? "text-green-400" : "text-red-400"
            }`}>
              {state.selectedIndex === currentQ.correctIndex ? (
                <><CheckCircle className="w-4 h-4" />
                  正解！{state.hintUsed && <span className="text-xs font-normal text-yellow-400 ml-1">（ヒント使用：×0.5）</span>}
                </>
              ) : (
                <><XCircle className="w-4 h-4" /> 不正解</>
              )}
            </div>
            <p className="text-sm text-slate-300">
              <span className="text-slate-500">解説：</span>{currentQ.explanation}
            </p>
          </div>
        )}

        {/* Next button (not shown in time-attack — auto-advances) */}
        {state.phase === "answer" && modeParam !== "time-attack" && (
          <button onClick={handleNext} className="btn-primary w-full flex items-center justify-center gap-2">
            {(() => {
              const done =
                (modeParam === "quiz" && state.correct + state.wrong >= QUIZ_TOTAL) ||
                (modeParam === "survival" && state.lives <= 0);
              return done ? (
                <><Trophy className="w-5 h-5" /> 結果を見る</>
              ) : (
                <>次の問題へ <ChevronRight className="w-5 h-5" /></>
              );
            })()}
          </button>
        )}

        {/* Time attack: auto-advance indicator */}
        {state.phase === "answer" && modeParam === "time-attack" && (
          <div className="text-center text-sm text-slate-500 animate-fade-in">
            自動で次の問題へ…
          </div>
        )}
      </div>
    </div>
  );
}

// ===== MODE-SPECIFIC HEADERS =====

function QuizHeader({ state, onBack }: { state: GameState; onBack: () => void }) {
  const done = state.correct + state.wrong;
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onBack} className="p-2 rounded-lg glass hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs glass px-3 py-1 rounded-full text-slate-300 font-medium">
            問 {done + (state.phase === "playing" ? 1 : 0)} / {QUIZ_TOTAL}
          </span>
          <div className="flex items-center gap-1 glass px-2.5 py-1 rounded-full text-yellow-400 text-sm">
            <Trophy className="w-3.5 h-3.5" />
            <span className="font-bold">{state.score}</span>
          </div>
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(done / QUIZ_TOTAL) * 100}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span className="text-green-400">{state.correct} 正解</span>
        <span className="text-red-400">{state.wrong} 不正解</span>
      </div>
    </div>
  );
}

function TimeAttackHeader({ state, onBack }: { state: GameState; onBack: () => void }) {
  const pct = (state.timeLeft / TIME_ATTACK_SECONDS) * 100;
  const urgent = state.timeLeft <= 10;
  const warning = state.timeLeft <= 20;
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onBack} className="p-2 rounded-lg glass hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-black text-2xl transition-colors ${
          urgent ? "bg-red-400/20 text-red-400" : warning ? "bg-yellow-400/20 text-yellow-400" : "glass text-cyan-400"
        }`}>
          <Clock className={`w-5 h-5 ${urgent ? "animate-spin-slow" : ""}`} />
          {state.timeLeft}
        </div>
        <div className="flex items-center gap-1 glass px-3 py-2 rounded-xl text-yellow-400">
          <Zap className="w-4 h-4" />
          <span className="font-bold">{state.correct + state.wrong}問</span>
        </div>
      </div>
      {/* Timer bar */}
      <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: urgent
              ? "linear-gradient(90deg, #f43f5e, #fb923c)"
              : warning
              ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
              : "linear-gradient(90deg, #22d3ee, #4f8ef7)",
          }}
        />
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span className="text-slate-500">スコア</span>
        <span className="text-yellow-400 font-bold">{state.score} pt</span>
      </div>
    </div>
  );
}

function SurvivalHeader({ state, onBack }: { state: GameState; onBack: () => void }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onBack} className="p-2 rounded-lg glass hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Level badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="font-bold text-sm">Lv.{state.level}</span>
          <span className="text-slate-500 text-xs">({state.correct}問正解)</span>
        </div>

        <div className="flex items-center gap-1 glass px-2.5 py-1.5 rounded-xl text-yellow-400 text-sm">
          <Trophy className="w-3.5 h-3.5" />
          <span className="font-bold">{state.score}</span>
        </div>
      </div>

      {/* Lives */}
      <div className={`flex items-center justify-center gap-3 p-3 rounded-xl glass ${state.shakeLives ? "animate-bounce" : ""}`}>
        <span className="text-xs text-slate-400">ライフ</span>
        <div className="flex gap-2">
          {Array.from({ length: SURVIVAL_LIVES }).map((_, i) => (
            <Heart
              key={i}
              className={`w-7 h-7 transition-all duration-300 ${
                i < state.lives
                  ? "text-red-400 fill-red-400 drop-shadow-lg"
                  : "text-slate-700"
              }`}
            />
          ))}
        </div>
        {/* Level progress */}
        <span className="text-xs text-slate-400 ml-2">
          次LV: {5 - (state.correct % 5)}/5
        </span>
      </div>
    </div>
  );
}

// ===== RESULT SCREEN =====

function ResultScreen({
  state, mode, topics, onRestart,
}: {
  state: GameState; mode: GameMode; topics: Topic[]; onRestart: () => void;
}) {
  const router = useRouter();
  const total = state.correct + state.wrong;
  const pct = total > 0 ? Math.round((state.correct / total) * 100) : 0;
  const message = getEncouragementMessage(state.correct, Math.max(total, 1));

  const topicStats = topics
    .map((t) => {
      const qs = state.history.filter((h) => h.question.topic === t);
      return { topic: t, correct: qs.filter((h) => h.correct).length, total: qs.length };
    })
    .filter((s) => s.total > 0);

  return (
    <div className="min-h-screen px-4 py-8 safe-bottom">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4"
            style={{ background: pct >= 70 ? "radial-gradient(circle, rgba(16,185,129,0.3), transparent)" : "radial-gradient(circle, rgba(79,142,247,0.3), transparent)" }}>
            <Trophy className={`w-12 h-12 ${pct >= 70 ? "text-green-400" : "text-blue-400"}`} />
          </div>
          <h1 className="text-4xl font-black mb-2">
            {mode === "time-attack" ? `${total}問クリア！` : mode === "survival" ? `Lv.${state.level} 到達！` : `${pct}点！`}
          </h1>
          <p className="text-xl text-slate-300">{message}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="正解" value={`${state.correct}`} color="green" />
          <StatCard label="不正解" value={`${state.wrong}`} color="red" />
          <StatCard label="最高連続" value={`${state.maxStreak}`} color="orange" />
          <StatCard label="スコア" value={`${state.score}`} color="blue" />
        </div>

        {mode === "survival" && (
          <div className="glass rounded-2xl p-4 mb-6 flex items-center gap-4">
            <Star className="w-8 h-8 text-yellow-400 flex-shrink-0" />
            <div>
              <div className="font-bold">最高レベル: <span className="text-yellow-400">Lv.{state.level}</span></div>
              <div className="text-sm text-slate-400">次回はもっと上を目指そう！</div>
            </div>
          </div>
        )}

        {topicStats.length > 0 && (
          <div className="glass rounded-2xl p-5 mb-6">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
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
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${p}%`, background: p >= 70 ? "#10b981" : p >= 40 ? "#f59e0b" : "#f43f5e" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {state.history.some((h) => !h.correct) && (
          <div className="glass rounded-2xl p-5 mb-6">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-red-400" />
              間違えた問題の解説
            </h2>
            <div className="space-y-3">
              {state.history.filter((h) => !h.correct).map((h, i) => (
                <div key={i} className="border border-white/8 rounded-xl p-4">
                  <p className="text-sm font-medium mb-1 text-slate-300"
                    dangerouslySetInnerHTML={{ __html: h.question.questionHtml }} />
                  <p className="text-xs text-red-400 mb-1">あなたの答え：{h.question.options[h.chosen]}</p>
                  <p className="text-xs text-green-400 mb-2">正解：{h.question.options[h.question.correctIndex]}</p>
                  <p className="text-xs text-slate-400">{h.question.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={onRestart} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <RotateCcw className="w-5 h-5" /> もう一度
          </button>
          <button onClick={() => router.push("/")} className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <Home className="w-5 h-5" /> 単元を変える
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: "green" | "red" | "orange" | "blue" }) {
  const c = { green: "text-green-400", red: "text-red-400", orange: "text-orange-400", blue: "text-blue-400" };
  return (
    <div className="glass rounded-xl p-4 text-center">
      <div className={`text-2xl font-black mb-1 ${c[color]}`}>{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

export default function MathGamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">読み込み中...</div>
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}
