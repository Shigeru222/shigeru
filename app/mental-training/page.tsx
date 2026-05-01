"use client";

import { useState } from "react";
import { CheckCircle, ChevronRight, ArrowRight } from "lucide-react";

type Grade = "中学1年" | "中学2年" | "中学3年";

interface WordPair {
  negative: string;
  positive: string;
}

const HINTS = [
  { negative: "例：こんなの出来るわけない", positive: "例：できるから任せてもらえてる！" },
  { negative: "例：どうせ自分には無理", positive: "例：まだできていない、次でいい" },
  { negative: "例：また失敗した", positive: "例：次につながる経験をした" },
  { negative: "", positive: "" },
  { negative: "", positive: "" },
];

const GRADES: Grade[] = ["中学1年", "中学2年", "中学3年"];

const today = () => new Date().toISOString().slice(0, 10);

export default function MentalTrainingPage() {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<Grade>("中学1年");
  const [date, setDate] = useState(today());
  const [wordPairs, setWordPairs] = useState<WordPair[]>(
    Array.from({ length: 5 }, () => ({ negative: "", positive: "" }))
  );
  const [reflection, setReflection] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function updatePair(index: number, field: keyof WordPair, value: string) {
    setWordPairs(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("名前を入力してください");
      return;
    }
    const hasAnyWord = wordPairs.some(p => p.negative.trim() || p.positive.trim());
    if (!hasAnyWord) {
      setError("言葉を1つ以上入力してください");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/mental-training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), grade, date, wordPairs, reflection }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "送信に失敗しました");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "送信に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setName("");
    setGrade("中学1年");
    setDate(today());
    setWordPairs(Array.from({ length: 5 }, () => ({ negative: "", positive: "" })));
    setReflection("");
    setSubmitted(false);
    setError("");
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full glass rounded-3xl p-10 text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-20 h-20 text-green-400" />
          </div>
          <h1 className="text-2xl font-black mb-3">送信完了！</h1>
          <p className="text-slate-400 mb-2">ワークシートを提出しました。</p>
          <p className="text-slate-400 mb-8">お疲れ様でした！</p>
          <button onClick={handleReset} className="btn-primary w-full">
            もう一度記入する
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-black mb-2 leading-tight">
            メンタルトレーニング
            <br />
            <span className="gradient-text">セルフトークワークシート</span>
          </h1>
          <p className="text-slate-400 text-sm">ネガティブな言葉をポジティブに変換しよう</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name / Grade / Date */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">名前 <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="山田 太郎"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">学年 <span className="text-red-400">*</span></label>
                <select
                  value={grade}
                  onChange={e => setGrade(e.target.value as Grade)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  {GRADES.map(g => (
                    <option key={g} value={g} style={{ background: "#0f0f2e" }}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">日付</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                style={{ colorScheme: "dark" }}
              />
            </div>
          </div>

          {/* Purpose */}
          <div className="glass rounded-2xl p-5 border border-blue-500/20">
            <h2 className="font-bold text-sm mb-2 text-blue-400">■ このワークの目的</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              普段、無意識に使ってしまっているネガティブな言葉を書き出し、自分が自信を持てる・気持ちを切り替えられるポジティブな言葉に置き換える練習をします。
            </p>
          </div>

          {/* Word Pairs */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bold mb-5">記入欄</h2>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 mb-3">
              <div className="text-center text-xs font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg py-2">
                ネガティブな言葉
              </div>
              <div className="w-8" />
              <div className="text-center text-xs font-bold text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg py-2">
                ポジティブな言葉
              </div>
            </div>

            <div className="space-y-3">
              {wordPairs.map((pair, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                  <div className="relative">
                    <span className="absolute top-1 left-2 text-xs text-slate-600 select-none">{i + 1}</span>
                    <textarea
                      value={pair.negative}
                      onChange={e => updatePair(i, "negative", e.target.value)}
                      placeholder={HINTS[i].negative}
                      rows={2}
                      className="w-full bg-red-500/5 border border-red-500/20 rounded-xl px-3 pt-5 pb-2 text-sm focus:outline-none focus:border-red-400 transition-colors resize-none placeholder:text-slate-600"
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="relative">
                    <span className="absolute top-1 left-2 text-xs text-slate-600 select-none">{i + 1}</span>
                    <textarea
                      value={pair.positive}
                      onChange={e => updatePair(i, "positive", e.target.value)}
                      placeholder={HINTS[i].positive}
                      rows={2}
                      className="w-full bg-green-500/5 border border-green-500/20 rounded-xl px-3 pt-5 pb-2 text-sm focus:outline-none focus:border-green-400 transition-colors resize-none placeholder:text-slate-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hints */}
          <div className="glass rounded-2xl p-5 border border-purple-500/20">
            <h2 className="font-bold text-sm mb-3 text-purple-400">■ ポジティブ変換のヒント</h2>
            <ul className="text-slate-400 text-sm space-y-2 leading-relaxed">
              <li>・他の人がどう思うかは気にしない。自分が「しっくりくる」言葉でOK！</li>
              <li>・「できない」→「まだできていない」「次でいい」など、小さな一歩を大事に。</li>
              <li>・脳は口にした瞬間、その言葉を信じて実現しようとする。言葉を選ぼう！</li>
            </ul>
          </div>

          {/* Reflection */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bold mb-3">振り返り</h2>
            <p className="text-slate-400 text-sm mb-3">
              このワークを通じて気づいたこと・これからやろうと思うアクションは？
            </p>
            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder="自由に記入してください"
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="glass rounded-xl p-4 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="animate-pulse">送信中...</span>
            ) : (
              <>
                ワークシートを送信する
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Coach link */}
        <p className="text-center text-slate-600 text-xs mt-8">
          <a href="/mental-training/coach" className="hover:text-slate-400 transition-colors">
            監督・コーチの方はこちら
          </a>
        </p>
      </div>
    </main>
  );
}
