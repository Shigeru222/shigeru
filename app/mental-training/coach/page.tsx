"use client";

import { useState } from "react";
import { Download, Lock, LogOut, ChevronDown, User, Calendar, ArrowRight, ArrowDown } from "lucide-react";
import { MentalTrainingSubmission, Grade } from "@/lib/mental-training-types";

const GRADES: (Grade | "all")[] = ["all", "中学1年", "中学2年", "中学3年"];
const GRADE_LABELS: Record<string, string> = {
  all: "全学年",
  中学1年: "中学1年",
  中学2年: "中学2年",
  中学3年: "中学3年",
};

export default function CoachPage() {
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authenticating, setAuthenticating] = useState(false);

  const [submissions, setSubmissions] = useState<MentalTrainingSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [gradeFilter, setGradeFilter] = useState<Grade | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [storedPin, setStoredPin] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthenticating(true);
    try {
      const res = await fetch(`/api/mental-training?pin=${encodeURIComponent(pin)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "認証に失敗しました");
      }
      const data: MentalTrainingSubmission[] = await res.json();
      setSubmissions(data);
      setStoredPin(pin);
      setAuthenticated(true);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "認証に失敗しました");
    } finally {
      setAuthenticating(false);
    }
  }

  async function fetchSubmissions(grade: Grade | "all", currentPin: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ pin: currentPin });
      if (grade !== "all") params.set("grade", grade);
      const res = await fetch(`/api/mental-training?${params}`);
      if (!res.ok) throw new Error("取得に失敗しました");
      const data: MentalTrainingSubmission[] = await res.json();
      setSubmissions(data);
    } catch {
      // keep existing data
    } finally {
      setLoading(false);
    }
  }

  function handleGradeChange(grade: Grade | "all") {
    setGradeFilter(grade);
    fetchSubmissions(grade, storedPin);
  }

  function handleLogout() {
    setAuthenticated(false);
    setPin("");
    setStoredPin("");
    setSubmissions([]);
    setGradeFilter("all");
    setExpandedId(null);
  }

  function handleDownload() {
    const params = new URLSearchParams({ pin: storedPin });
    if (gradeFilter !== "all") params.set("grade", gradeFilter);
    window.location.href = `/api/mental-training/export?${params}`;
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("ja-JP", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full glass rounded-3xl p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-2xl bg-purple-400/10 mb-4">
              <Lock className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-xl font-black mb-1">監督・コーチ専用</h1>
            <p className="text-slate-400 text-sm">PINを入力してください</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="PIN番号"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-xl tracking-widest focus:outline-none focus:border-purple-500 transition-colors"
              autoFocus
            />

            {authError && (
              <p className="text-red-400 text-sm text-center">{authError}</p>
            )}

            <button
              type="submit"
              disabled={authenticating || !pin}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {authenticating ? "確認中..." : "ログイン"}
            </button>
          </form>

          <p className="text-center mt-6">
            <a href="/mental-training" className="text-slate-600 text-xs hover:text-slate-400 transition-colors">
              ← 選手用フォームへ
            </a>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-3 py-6 sm:px-4 sm:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg sm:text-xl font-black">
              <span className="gradient-text">ワークシート一覧</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              {submissions.length}件の回答
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center gap-1.5 px-3 py-2.5 text-sm"
            >
              <Download className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Excelダウンロード</span>
              <span className="sm:hidden">DL</span>
            </button>
            <button
              onClick={handleLogout}
              className="btn-secondary flex items-center gap-1.5 px-3 py-2.5 text-sm"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">ログアウト</span>
            </button>
          </div>
        </div>

        {/* Grade filter */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {GRADES.map(g => (
            <button
              key={g}
              onClick={() => handleGradeChange(g)}
              className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                gradeFilter === g
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                  : "glass text-slate-400"
              }`}
            >
              {GRADE_LABELS[g]}
            </button>
          ))}
        </div>

        {/* Submissions list */}
        {loading ? (
          <div className="text-center py-16 text-slate-400 animate-pulse">読み込み中...</div>
        ) : submissions.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-slate-500">
            <p className="text-lg mb-2">まだ回答がありません</p>
            <p className="text-sm">選手がワークシートを送信すると、ここに表示されます</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map(s => {
              const isExpanded = expandedId === s.id;
              const filledPairs = s.wordPairs.filter(p => p.negative.trim() || p.positive.trim());

              return (
                <div key={s.id} className="glass rounded-2xl overflow-hidden">
                  {/* Summary row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : s.id)}
                    className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold">{s.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-400/15 text-purple-400 border border-purple-400/20">
                          {s.grade}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {s.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        提出: {formatDate(s.submittedAt)}　言葉: {filledPairs.length}組
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-2">
                      {s.wordPairs.map((pair, i) => {
                        if (!pair.negative.trim() && !pair.positive.trim()) return null;
                        return (
                          <div key={i} className="rounded-xl border border-white/8 overflow-hidden">
                            <div className="bg-white/5 px-3 py-1.5 text-xs text-slate-500 border-b border-white/8">
                              {i + 1} 組目
                            </div>
                            <div className="p-3 flex flex-col sm:grid sm:grid-cols-[1fr_auto_1fr] gap-2 sm:gap-3 sm:items-start">
                              <div>
                                <p className="text-xs text-red-400 font-medium mb-1">ネガティブな言葉</p>
                                <div className="bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2 text-sm">
                                  {pair.negative || <span className="text-slate-600">—</span>}
                                </div>
                              </div>
                              <div className="flex items-center justify-center sm:pt-6">
                                <ArrowDown className="w-4 h-4 text-slate-600 sm:hidden" />
                                <ArrowRight className="w-3 h-3 text-slate-600 hidden sm:block" />
                              </div>
                              <div>
                                <p className="text-xs text-green-400 font-medium mb-1">ポジティブな言葉</p>
                                <div className="bg-green-500/5 border border-green-500/15 rounded-lg px-3 py-2 text-sm">
                                  {pair.positive || <span className="text-slate-600">—</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Reflection */}
                      {s.reflection && (
                        <div className="bg-white/5 rounded-xl p-3">
                          <p className="text-xs text-slate-400 mb-1 font-medium">振り返り</p>
                          <p className="text-sm text-slate-300 whitespace-pre-wrap">{s.reflection}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
