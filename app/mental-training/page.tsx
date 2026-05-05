"use client";

import { useState } from "react";
import { CheckCircle, ChevronRight, ArrowDown, ArrowRight } from "lucide-react";

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
  const [identity, setIdentity] = useState("");
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
        body: JSON.stringify({ name: name.trim(), grade, date, wordPairs, reflection, identity }),
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
    setIdentity("");
    setSubmitted(false);
    setError("");
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full glass rounded-3xl p-8 text-center animate-fade-in">
          <div className="flex justify-center mb-5">
            <CheckCircle className="w-16 h-16 text-green-400" />
          </div>
          <h1 className="text-2xl font-black mb-3">送信完了！</h1>
          <p className="text-slate-400 mb-1">ワークシートを提出しました。</p>
          <p className="text-slate-400 mb-8">お疲れ様でした！</p>
          <button onClick={handleReset} className="btn-primary w-full">
            もう一度記入する
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-3 py-8 sm:px-4 sm:py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-3xl font-black mb-2 leading-tight">
            メンタルトレーニング
            <br />
            <span className="gradient-text">セルフトークワークシート</span>
          </h1>
          <p className="text-slate-400 text-sm">ネガティブな言葉をポジティブに変換しよう</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name / Grade / Date */}
          <div className="glass rounded-2xl p-4 sm:p-6 space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                名前 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="山田 太郎"
                autoComplete="name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                学年 <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {GRADES.map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGrade(g)}
                    className={`py-3 rounded-xl text-sm font-medium transition-all border ${
                      grade === g
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">日付</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-blue-500 transition-colors"
                style={{ colorScheme: "dark" }}
              />
            </div>
          </div>

          {/* Purpose */}
          <div className="glass rounded-2xl p-4 border border-blue-500/20">
            <h2 className="font-bold text-sm mb-2 text-blue-400">■ このワークの目的</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              普段、無意識に使ってしまっているネガティブな言葉を書き出し、自分が自信を持てる・気持ちを切り替えられるポジティブな言葉に置き換える練習をします。
            </p>
          </div>

          {/* Word Pairs */}
          <div className="glass rounded-2xl p-4 sm:p-6">
            <h2 className="font-bold mb-4">記入欄</h2>
            <div className="space-y-4">
              {wordPairs.map((pair, i) => (
                <div key={i} className="rounded-xl border border-white/8 overflow-hidden">
                  {/* Pair header */}
                  <div className="bg-white/5 px-3 py-2 text-xs text-slate-500 font-medium border-b border-white/8">
                    {i + 1} 組目
                  </div>

                  {/* Mobile: stacked / Desktop: side by side */}
                  <div className="p-3 flex flex-col sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-3 sm:items-start gap-2">
                    {/* Negative */}
                    <div>
                      <label className="block text-xs text-red-400 font-medium mb-1.5">
                        ネガティブな言葉
                      </label>
                      <textarea
                        value={pair.negative}
                        onChange={e => updatePair(i, "negative", e.target.value)}
                        placeholder={HINTS[i].negative}
                        rows={3}
                        className="w-full bg-red-500/5 border border-red-500/20 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:border-red-400 transition-colors resize-none placeholder:text-slate-600"
                      />
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-center py-1 sm:pt-7">
                      <ArrowDown className="w-5 h-5 text-slate-500 sm:hidden" />
                      <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block" />
                    </div>

                    {/* Positive */}
                    <div>
                      <label className="block text-xs text-green-400 font-medium mb-1.5">
                        ポジティブな言葉
                      </label>
                      <textarea
                        value={pair.positive}
                        onChange={e => updatePair(i, "positive", e.target.value)}
                        placeholder={HINTS[i].positive}
                        rows={3}
                        className="w-full bg-green-500/5 border border-green-500/20 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:border-green-400 transition-colors resize-none placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hints */}
          <div className="glass rounded-2xl p-4 border border-purple-500/20">
            <h2 className="font-bold text-sm mb-2 text-purple-400">■ ポジティブ変換のヒント</h2>
            <ul className="text-slate-400 text-sm space-y-1.5 leading-relaxed">
              <li>・他の人がどう思うかは気にしない。自分が「しっくりくる」言葉でOK！</li>
              <li>・「できない」→「まだできていない」「次でいい」など、小さな一歩を大事に。</li>
              <li>・脳は口にした瞬間、その言葉を信じて実現しようとする。言葉を選ぼう！</li>
            </ul>
          </div>

          {/* Identity */}
          <div className="glass rounded-2xl p-4 sm:p-6 border border-yellow-500/20">
            <h2 className="font-bold mb-2 text-yellow-400">アイデンティティ</h2>
            <p className="text-slate-400 text-sm mb-3">
              選手としての自分を言葉にしよう。「私は〇〇な選手だ」
            </p>
            <textarea
              value={identity}
              onChange={e => setIdentity(e.target.value)}
              placeholder="例：諦めずにチームを鼓舞し続ける選手"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-yellow-500 transition-colors resize-none"
            />
          </div>

          {/* Reflection */}
          <div className="glass rounded-2xl p-4 sm:p-6">
            <h2 className="font-bold mb-2">振り返り</h2>
            <p className="text-slate-400 text-sm mb-3">
              このワークを通じて気づいたこと・これからやろうと思うアクションは？
            </p>
            <textarea
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder="自由に記入してください"
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500 transition-colors resize-none"
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
            className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
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

        {/* Coach link removed intentionally */}
      </div>
    </main>
  );
}
