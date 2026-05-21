'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Filter, Search, TrendingUp, ChevronRight,
  Loader2, AlertCircle, Star, BarChart3, Zap, RefreshCw,
} from 'lucide-react'
import { POLICY_THEMES } from '@/lib/stock/policies'
import { StockScore } from '@/lib/stock/scoring'

// ── Constants ─────────────────────────────────────────────────────────────────

const BENEFIT_TYPE_CONFIG = {
  primary:   { label: '直接受益',   desc: '政府調達・補助金の直接対象', color: 'text-emerald-300', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  secondary: { label: '間接受益',   desc: '需要増・市場拡大の恩恵',     color: 'text-blue-300',    bg: 'bg-blue-500/15 border-blue-500/30' },
  enabler:   { label: 'インフラ提供', desc: '政策実現を技術・SaaSで支える', color: 'text-purple-300',  bg: 'bg-purple-500/15 border-purple-500/30' },
}

const MARKET_CAP_CONFIG = {
  large: { label: '大型株', desc: '時価総額 1兆円超' },
  mid:   { label: '中型株', desc: '1000億〜1兆円' },
  small: { label: '小型株', desc: '1000億円未満' },
}

const THEME_COLOR: Record<string, string> = {
  'ai-semiconductor': 'border-blue-500/50 bg-blue-500/10',
  'gx':               'border-green-500/50 bg-green-500/10',
  'defense':          'border-red-500/50 bg-red-500/10',
  'digital-gov':      'border-purple-500/50 bg-purple-500/10',
  'healthcare':       'border-cyan-500/50 bg-cyan-500/10',
  'childcare':        'border-pink-500/50 bg-pink-500/10',
  'tourism':          'border-orange-500/50 bg-orange-500/10',
  'economic-security':'border-yellow-500/50 bg-yellow-500/10',
}

const SCORE_COLOR = (score: number) =>
  score >= 80 ? 'text-emerald-400' :
  score >= 65 ? 'text-blue-400' :
  score >= 50 ? 'text-yellow-400' : 'text-slate-400'

function fmt(n: number | undefined, digits = 1): string {
  if (n == null || isNaN(n)) return '—'
  return n.toLocaleString('ja-JP', { maximumFractionDigits: digits })
}
function fmtBig(n: number | undefined): string {
  if (n == null) return '—'
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}兆`
  if (n >= 1e8)  return `${(n / 1e8).toFixed(0)}億`
  return `${(n / 1e4).toFixed(0)}万`
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreMini({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className={`font-bold ${color}`}>{value}/{max}</span>
      </div>
      <div className="h-1 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
          style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  )
}

function StockResultCard({ score, onNavigate }: { score: StockScore; onNavigate: (ticker: string) => void }) {
  const primaryTheme = POLICY_THEMES.find(t => t.id === score.primaryThemeId)
  const themeColors = THEME_COLOR[score.primaryThemeId] || ''
  const bCfg = BENEFIT_TYPE_CONFIG[score.themes[0]?.benefitType as keyof typeof BENEFIT_TYPE_CONFIG]
  const changePos = (score.financials?.changePercent ?? 0) >= 0

  return (
    <button
      onClick={() => onNavigate(score.ticker)}
      className="glass rounded-xl p-4 text-left card-hover border border-white/5 hover:border-white/15 w-full transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* Left: stock info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-blue-400 font-mono text-xs font-bold">{score.ticker}</span>
            {primaryTheme && (
              <span className={`text-xs px-1.5 py-0.5 rounded border ${themeColors}`}>
                {primaryTheme.icon} {primaryTheme.title.split('（')[0].split('・')[0].substring(0, 8)}
              </span>
            )}
            {bCfg && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full border ${bCfg.bg} ${bCfg.color}`}>
                {bCfg.label}
              </span>
            )}
          </div>
          <p className="text-white font-bold text-sm truncate">{score.name}</p>
          <p className="text-slate-500 text-xs truncate">{score.sector}</p>
        </div>

        {/* Right: score + price */}
        <div className="text-right shrink-0">
          <div className={`text-2xl font-black ${SCORE_COLOR(score.scores.total)}`}>
            {score.scores.total}
          </div>
          <div className="text-slate-500 text-xs">/ 100点</div>
          {score.financials?.price != null && (
            <div className="mt-1">
              <div className="text-white text-sm font-bold">¥{Math.round(score.financials.price).toLocaleString('ja-JP')}</div>
              <div className={`text-xs font-medium ${changePos ? 'text-emerald-400' : 'text-red-400'}`}>
                {changePos ? '▲' : '▼'}{Math.abs(score.financials.changePercent ?? 0).toFixed(2)}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Benefit reason */}
      <p className="text-slate-400 text-xs mb-3 line-clamp-1">{score.topBenefit}</p>

      {/* Score breakdown */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
        <ScoreMini label="政策直接性" value={score.scores.policyDirectness} max={35} color="text-blue-400" />
        <ScoreMini label="政策継続性" value={score.scores.policyContinuity} max={25} color="text-purple-400" />
        <ScoreMini label="財務健全性" value={score.scores.financialHealth}   max={25} color="text-green-400" />
        <ScoreMini label="市場成長性" value={score.scores.marketGrowth}      max={15} color="text-orange-400" />
      </div>

      {/* Financial metrics */}
      {score.financialDataAvailable && (
        <div className="flex gap-4 pt-2 border-t border-white/5 text-xs">
          <span className="text-slate-500">PER <span className="text-slate-300">{fmt(score.financials?.per)}倍</span></span>
          <span className="text-slate-500">PBR <span className="text-slate-300">{fmt(score.financials?.pbr, 2)}倍</span></span>
          <span className="text-slate-500">ROE <span className="text-slate-300">{fmt(score.financials?.roe)}%</span></span>
          <span className="text-slate-500 ml-auto">時価総額 <span className="text-slate-300">{fmtBig(score.financials?.marketCap)}円</span></span>
        </div>
      )}

      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-hover:text-slate-400" />
    </button>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ScreenerPage() {
  const router = useRouter()

  // Filter state
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([])
  const [selectedCaps, setSelectedCaps] = useState<string[]>([])
  const [minRoe, setMinRoe]   = useState('')
  const [maxPer, setMaxPer]   = useState('')
  const [maxPbr, setMaxPbr]   = useState('')
  const [minScore, setMinScore] = useState('50')
  const [fetchLive, setFetchLive] = useState(true)

  // Results
  const [results, setResults]   = useState<StockScore[]>([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [ran, setRan]           = useState(false)

  const toggleItem = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
  }

  const handleScreener = useCallback(async () => {
    setLoading(true)
    setError(null)
    setRan(false)
    try {
      const res = await fetch('/api/stock/screener', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          themeIds: selectedThemes,
          benefitTypes: selectedBenefits,
          marketCapTiers: selectedCaps,
          minRoe: minRoe ? Number(minRoe) : undefined,
          maxPer: maxPer ? Number(maxPer) : undefined,
          maxPbr: maxPbr ? Number(maxPbr) : undefined,
          minScore: minScore ? Number(minScore) : undefined,
          fetchLive,
        }),
      })
      if (!res.ok) throw new Error('スクリーニングに失敗しました')
      const data = await res.json()
      setResults(data.results)
      setTotal(data.total)
      setRan(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }, [selectedThemes, selectedBenefits, selectedCaps, minRoe, maxPer, maxPbr, minScore, fetchLive])

  return (
    <main className="min-h-screen relative">
      <div className="mesh-bg" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <button
          onClick={() => router.push('/stock')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">ダッシュボードに戻る</span>
        </button>

        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-400/10 rounded-xl">
              <Filter className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-2xl font-black gradient-text">国策銘柄スクリーナー</h1>
          </div>
          <p className="text-slate-400 text-sm">
            113銘柄の候補から政策直接性・継続性・財務・市場成長の4軸でスコアリング。
            条件を設定して「抽出実行」を押すとリアルタイムで財務データを取得・ランキングします。
          </p>
        </div>

        <div className="grid lg:grid-cols-[340px_1fr] gap-6">

          {/* ── Filter Panel ─────────────────────────────────────────── */}
          <aside className="space-y-5">

            {/* Theme filter */}
            <div className="glass rounded-xl p-4">
              <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                政策テーマ
                <span className="text-slate-500 font-normal text-xs">（空欄=全テーマ）</span>
              </h2>
              <div className="space-y-2">
                {POLICY_THEMES.map(t => {
                  const selected = selectedThemes.includes(t.id)
                  const tc = THEME_COLOR[t.id] || ''
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleItem(selectedThemes, setSelectedThemes, t.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
                        selected ? tc + ' text-white' : 'border-white/5 text-slate-400 hover:border-white/15 hover:text-white'
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span className="truncate">{t.title.split('（')[0]}</span>
                      {selected && <span className="ml-auto text-xs opacity-70">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Benefit type */}
            <div className="glass rounded-xl p-4">
              <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                受益タイプ
              </h2>
              <div className="space-y-2">
                {(Object.entries(BENEFIT_TYPE_CONFIG) as [string, typeof BENEFIT_TYPE_CONFIG[keyof typeof BENEFIT_TYPE_CONFIG]][]).map(([key, cfg]) => {
                  const selected = selectedBenefits.includes(key)
                  return (
                    <button
                      key={key}
                      onClick={() => toggleItem(selectedBenefits, setSelectedBenefits, key)}
                      className={`w-full flex items-start gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
                        selected ? `${cfg.bg} ${cfg.color}` : 'border-white/5 text-slate-400 hover:border-white/15'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-medium">{cfg.label}</div>
                        <div className="text-xs opacity-70">{cfg.desc}</div>
                      </div>
                      {selected && <span className="ml-auto text-xs opacity-70 mt-0.5">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Market cap */}
            <div className="glass rounded-xl p-4">
              <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                時価総額規模
              </h2>
              <div className="flex gap-2">
                {(Object.entries(MARKET_CAP_CONFIG) as [string, { label: string; desc: string }][]).map(([key, cfg]) => {
                  const selected = selectedCaps.includes(key)
                  return (
                    <button
                      key={key}
                      onClick={() => toggleItem(selectedCaps, setSelectedCaps, key)}
                      className={`flex-1 px-2 py-2 rounded-lg text-xs text-center transition-all border ${
                        selected
                          ? 'border-purple-500/50 bg-purple-500/15 text-purple-300'
                          : 'border-white/5 text-slate-400 hover:border-white/15'
                      }`}
                    >
                      <div className="font-bold">{cfg.label}</div>
                      <div className="text-xs opacity-60 mt-0.5">{cfg.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Financial filters */}
            <div className="glass rounded-xl p-4">
              <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                財務条件
                <span className="text-slate-500 font-normal text-xs">（空欄=制限なし）</span>
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'ROE 下限 (%)', placeholder: '例: 10', val: minRoe, set: setMinRoe },
                  { label: 'PER 上限 (倍)', placeholder: '例: 30', val: maxPer, set: setMaxPer },
                  { label: 'PBR 上限 (倍)', placeholder: '例: 5',  val: maxPbr, set: setMaxPbr },
                  { label: '最低スコア',    placeholder: '例: 50', val: minScore, set: setMinScore },
                ].map(({ label, placeholder, val, set }) => (
                  <div key={label}>
                    <label className="text-slate-500 text-xs mb-1 block">{label}</label>
                    <input
                      type="number"
                      value={val}
                      onChange={e => set(e.target.value)}
                      placeholder={placeholder}
                      className="w-full glass rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 border border-white/8 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Live data toggle */}
            <div className="glass rounded-xl p-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-white text-sm font-medium">リアルタイム財務取得</p>
                  <p className="text-slate-500 text-xs mt-0.5">OFFにすると高速（スコアのみ）</p>
                </div>
                <button
                  onClick={() => setFetchLive(v => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${fetchLive ? 'bg-blue-500' : 'bg-slate-600'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${fetchLive ? 'left-6' : 'left-1'}`} />
                </button>
              </label>
            </div>

            {/* Run button */}
            <button
              onClick={handleScreener}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" />抽出中...</>
                : <><Search className="w-5 h-5" />銘柄を抽出する</>
              }
            </button>
          </aside>

          {/* ── Results Panel ─────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Score legend */}
            <div className="glass rounded-xl px-4 py-3 flex flex-wrap gap-4 text-xs text-slate-400 items-center">
              <span className="font-medium text-white">スコア内訳 (100点満点):</span>
              <span>政策直接性 <strong className="text-blue-400">35</strong></span>
              <span>政策継続性 <strong className="text-purple-400">25</strong></span>
              <span>財務健全性 <strong className="text-green-400">25</strong></span>
              <span>市場成長性 <strong className="text-orange-400">15</strong></span>
            </div>

            {/* Loading */}
            {loading && (
              <div className="glass rounded-xl p-16 flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                <p className="text-slate-300 font-medium">銘柄を抽出中...</p>
                <p className="text-slate-500 text-sm text-center">
                  {fetchLive
                    ? 'Yahoo Financeからリアルタイムで財務データを取得しています\n（候補数によって20〜40秒かかる場合があります）'
                    : 'ベーススコアで高速フィルタリング中...'}
                </p>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="glass rounded-xl p-6 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
                <div>
                  <p className="text-white font-bold">エラーが発生しました</p>
                  <p className="text-slate-400 text-sm">{error}</p>
                </div>
                <button onClick={handleScreener} className="ml-auto btn-secondary px-4 py-2 text-sm flex items-center gap-1">
                  <RefreshCw className="w-4 h-4" />再試行
                </button>
              </div>
            )}

            {/* Initial state */}
            {!ran && !loading && !error && (
              <div className="glass rounded-xl p-16 text-center">
                <Filter className="w-14 h-14 text-blue-400/30 mx-auto mb-4" />
                <p className="text-white font-bold mb-2">条件を設定して抽出を実行</p>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">
                  政策テーマ・受益タイプ・財務条件を組み合わせて、
                  113銘柄から国策銘柄候補をスコアリング順に抽出します。
                </p>
              </div>
            )}

            {/* Results */}
            {ran && !loading && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-bold">{total}銘柄が該当</p>
                    {fetchLive && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/25">リアルタイム財務反映済み</span>}
                  </div>
                  <button onClick={handleScreener} className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />再抽出
                  </button>
                </div>

                {results.length === 0 ? (
                  <div className="glass rounded-xl p-12 text-center">
                    <p className="text-slate-400">条件に一致する銘柄がありませんでした。</p>
                    <p className="text-slate-500 text-sm mt-1">条件を緩めて再度お試しください。</p>
                  </div>
                ) : (
                  <div className="space-y-3 relative">
                    {results.map((score, i) => (
                      <div key={score.ticker} className="relative">
                        {i < 3 && (
                          <div className="absolute -left-3 top-4 z-10">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                              i === 0 ? 'bg-yellow-400 text-black' :
                              i === 1 ? 'bg-slate-300 text-black' : 'bg-amber-600 text-white'
                            }`}>
                              {i + 1}
                            </div>
                          </div>
                        )}
                        <StockResultCard
                          score={score}
                          onNavigate={ticker => router.push(`/stock/${encodeURIComponent(ticker)}`)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-10">
          ※ スコアは独自の評価モデルによるものであり、投資推奨ではありません。投資は自己責任でお願いします。
        </p>
      </div>
    </main>
  )
}
