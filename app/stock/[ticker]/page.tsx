'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BarChart3,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { PolicyAnalysis, HistoricalPrice } from '@/lib/stock/types'

// ── Types ──────────────────────────────────────────────────────────────────────
interface QuoteData {
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  per?: number
  pbr?: number
  roe?: number
  dividendYield?: number
  sector?: string
  industry?: string
  country?: string
  website?: string
  description?: string
  currency?: string
  fiftyTwoWeekHigh?: number
  fiftyTwoWeekLow?: number
  averageVolume?: number
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(n: number | undefined, digits = 2): string {
  if (n == null || isNaN(n)) return '—'
  return n.toLocaleString('ja-JP', { maximumFractionDigits: digits })
}

function fmtBig(n: number | undefined): string {
  if (n == null) return '—'
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}兆円`
  if (n >= 1e8) return `${(n / 1e8).toFixed(0)}億円`
  return `${(n / 1e4).toFixed(0)}万円`
}

function fmtVol(n: number | undefined): string {
  if (n == null) return '—'
  if (n >= 1e8) return `${(n / 1e8).toFixed(1)}億`
  if (n >= 1e4) return `${(n / 1e4).toFixed(0)}万`
  return n.toLocaleString('ja-JP')
}

const PERIODS = [
  { label: '1ヶ月', value: '1m' },
  { label: '3ヶ月', value: '3m' },
  { label: '6ヶ月', value: '6m' },
  { label: '1年', value: '1y' },
  { label: '3年', value: '3y' },
]

const RECOMMENDATION_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  strong_buy: { label: '強い買い',  color: 'text-emerald-300', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' },
  buy:        { label: '買い',      color: 'text-green-300',   bg: 'bg-green-500/20',   border: 'border-green-500/40' },
  neutral:    { label: '中立',      color: 'text-yellow-300',  bg: 'bg-yellow-500/20',  border: 'border-yellow-500/40' },
  caution:    { label: '要注意',    color: 'text-orange-300',  bg: 'bg-orange-500/20',  border: 'border-orange-500/40' },
  avoid:      { label: '回避',      color: 'text-red-300',     bg: 'bg-red-500/20',     border: 'border-red-500/40' },
}

// ── SVG Price Chart ────────────────────────────────────────────────────────────
function PriceChart({ data, isUp }: { data: HistoricalPrice[]; isUp: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; price: number; date: string } | null>(null)

  if (!data.length) return null

  const W = 800
  const H = 200
  const PAD = { top: 16, right: 16, bottom: 28, left: 60 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const prices = data.map(d => d.close)
  const minP = Math.min(...prices)
  const maxP = Math.max(...prices)
  const range = maxP - minP || 1

  const px = (i: number) => PAD.left + (i / (data.length - 1)) * chartW
  const py = (p: number) => PAD.top + chartH - ((p - minP) / range) * chartH

  const points = data.map((d, i) => ({ x: px(i), y: py(d.close) }))
  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')
  const area = `M ${points[0].x},${PAD.top + chartH} ` +
    points.map(p => `L ${p.x},${p.y}`).join(' ') +
    ` L ${points[points.length - 1].x},${PAD.top + chartH} Z`

  const strokeColor = isUp ? '#10b981' : '#f43f5e'
  const fillId = isUp ? 'fillUp' : 'fillDown'
  const fillStart = isUp ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'
  const fillEnd = 'rgba(0,0,0,0)'

  // Y axis ticks
  const yTicks = 4
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    minP + (range * i) / yTicks,
  )

  // X axis ticks (show ~5 dates)
  const xTickCount = Math.min(5, data.length)
  const xTickIndices = Array.from({ length: xTickCount }, (_, i) =>
    Math.round((i / (xTickCount - 1)) * (data.length - 1)),
  )

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const svgX = ((e.clientX - rect.left) / rect.width) * W
    const relX = svgX - PAD.left
    const idx = Math.round((relX / chartW) * (data.length - 1))
    const clamped = Math.max(0, Math.min(data.length - 1, idx))
    setTooltip({
      x: points[clamped].x,
      y: points[clamped].y,
      price: data[clamped].close,
      date: data[clamped].date,
    })
  }

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
        style={{ cursor: 'crosshair' }}
      >
        <defs>
          <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={fillStart} />
            <stop offset="100%" stopColor={fillEnd} />
          </linearGradient>
          <clipPath id="chartClip">
            <rect x={PAD.left} y={PAD.top} width={chartW} height={chartH} />
          </clipPath>
        </defs>

        {/* Y grid lines */}
        {yTickValues.map((v, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              y1={py(v)}
              x2={PAD.left + chartW}
              y2={py(v)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 6}
              y={py(v) + 4}
              textAnchor="end"
              fontSize={10}
              fill="rgba(148,163,184,0.8)"
            >
              {v >= 1000 ? (v / 1000).toFixed(1) + 'k' : Math.round(v)}
            </text>
          </g>
        ))}

        {/* X axis labels */}
        {xTickIndices.map(idx => (
          <text
            key={idx}
            x={px(idx)}
            y={H - 4}
            textAnchor="middle"
            fontSize={9}
            fill="rgba(148,163,184,0.7)"
          >
            {data[idx].date.slice(5)}
          </text>
        ))}

        {/* Area fill */}
        <path d={area} fill={`url(#${fillId})`} clipPath="url(#chartClip)" />

        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          clipPath="url(#chartClip)"
        />

        {/* Tooltip crosshair */}
        {tooltip && (
          <g>
            <line
              x1={tooltip.x}
              y1={PAD.top}
              x2={tooltip.x}
              y2={PAD.top + chartH}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
            <circle cx={tooltip.x} cy={tooltip.y} r={4} fill={strokeColor} stroke="white" strokeWidth={1.5} />
            {/* Tooltip box */}
            <g transform={`translate(${Math.min(tooltip.x + 8, W - 110)}, ${Math.max(tooltip.y - 28, PAD.top)})`}>
              <rect width={100} height={38} rx={5} fill="rgba(15,15,40,0.92)" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
              <text x={8} y={15} fontSize={9} fill="rgba(148,163,184,0.9)">{tooltip.date}</text>
              <text x={8} y={29} fontSize={12} fontWeight="bold" fill="white">
                ¥{Math.round(tooltip.price).toLocaleString('ja-JP')}
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  )
}

// ── Score Bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ score, color = 'blue' }: { score: number; color?: string }) {
  const colorMap: Record<string, string> = {
    blue:   'from-blue-500 to-cyan-400',
    green:  'from-green-500 to-emerald-400',
    orange: 'from-orange-500 to-yellow-400',
    red:    'from-red-500 to-pink-400',
    purple: 'from-purple-500 to-pink-400',
  }
  const grad = colorMap[color] || colorMap.blue
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-white font-bold text-sm w-8 text-right">{score}</span>
    </div>
  )
}

// ── Metric Card ───────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-1">
      <p className="text-slate-400 text-xs font-medium">{label}</p>
      <p className="text-white font-bold text-xl">{value}</p>
      {sub && <p className="text-slate-500 text-xs">{sub}</p>}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StockDetailPage() {
  const params = useParams<{ ticker: string }>()
  const router = useRouter()
  const ticker = decodeURIComponent(params.ticker)

  const [quote, setQuote] = useState<QuoteData | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(true)
  const [quoteError, setQuoteError] = useState<string | null>(null)

  const [history, setHistory] = useState<HistoricalPrice[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [period, setPeriod] = useState('3m')

  const [analysis, setAnalysis] = useState<PolicyAnalysis | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  // Fetch quote
  useEffect(() => {
    async function fetchQuote() {
      setQuoteLoading(true)
      setQuoteError(null)
      try {
        const res = await fetch(`/api/stock/quote?ticker=${encodeURIComponent(ticker)}`)
        if (!res.ok) throw new Error('取得に失敗しました')
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setQuote(data)
      } catch (e) {
        setQuoteError(e instanceof Error ? e.message : '不明なエラー')
      } finally {
        setQuoteLoading(false)
      }
    }
    fetchQuote()
  }, [ticker])

  // Fetch history
  const fetchHistory = useCallback(async (p: string) => {
    setHistoryLoading(true)
    try {
      const res = await fetch(`/api/stock/history?ticker=${encodeURIComponent(ticker)}&period=${p}`)
      const data = await res.json()
      setHistory(data.history || [])
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }, [ticker])

  useEffect(() => {
    fetchHistory(period)
  }, [ticker, period, fetchHistory])

  // Analyze
  async function handleAnalyze() {
    if (!quote) return
    setAnalysisLoading(true)
    setAnalysisError(null)
    setAnalysis(null)
    try {
      const res = await fetch('/api/stock/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: quote.ticker,
          companyName: quote.name,
          sector: quote.sector,
          industry: quote.industry,
          description: quote.description,
          per: quote.per,
          pbr: quote.pbr,
          roe: quote.roe,
          marketCap: quote.marketCap,
        }),
      })
      if (!res.ok) throw new Error('分析に失敗しました')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAnalysis(data)
    } catch (e) {
      setAnalysisError(e instanceof Error ? e.message : '分析エラー')
    } finally {
      setAnalysisLoading(false)
    }
  }

  // Derived
  const isUp = history.length >= 2 ? history[history.length - 1].close >= history[0].close : (quote?.change ?? 0) >= 0
  const changePositive = (quote?.changePercent ?? 0) >= 0

  return (
    <main className="min-h-screen relative">
      <div className="mesh-bg" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() => router.push('/stock')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">銘柄一覧に戻る</span>
        </button>

        {/* Loading state */}
        {quoteLoading && (
          <div className="glass rounded-2xl p-16 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
            <p className="text-slate-400">株価データを取得中...</p>
          </div>
        )}

        {/* Error state */}
        {quoteError && !quoteLoading && (
          <div className="glass rounded-2xl p-12 flex flex-col items-center gap-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-white font-bold">データ取得エラー</p>
            <p className="text-slate-400 text-sm">{quoteError}</p>
            <button
              onClick={() => router.push('/stock')}
              className="btn-secondary px-6 py-2 text-sm"
            >
              一覧に戻る
            </button>
          </div>
        )}

        {/* Main content */}
        {quote && !quoteLoading && (
          <div className="space-y-6">
            {/* Stock header */}
            <div className="glass rounded-2xl p-6">
              <div className="flex flex-wrap items-start gap-4 justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-slate-400 text-sm font-mono">{quote.ticker}</span>
                    {quote.sector && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-300">
                        {quote.sector}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{quote.name}</h1>
                  {quote.industry && (
                    <p className="text-slate-500 text-xs mt-1">{quote.industry}</p>
                  )}
                </div>

                {/* Price */}
                <div className="text-right">
                  <p className="text-3xl sm:text-4xl font-black text-white">
                    ¥{Math.round(quote.price).toLocaleString('ja-JP')}
                  </p>
                  <div className={`flex items-center gap-1 justify-end mt-1 ${changePositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {changePositive
                      ? <TrendingUp className="w-4 h-4" />
                      : <TrendingDown className="w-4 h-4" />}
                    <span className="font-bold text-lg">
                      {changePositive ? '▲' : '▼'}
                      {Math.abs(quote.changePercent).toFixed(2)}%
                    </span>
                    <span className="text-sm opacity-80">
                      ({changePositive ? '+' : ''}{fmt(quote.change, 0)})
                    </span>
                  </div>
                </div>
              </div>

              {/* 52-week range */}
              {quote.fiftyTwoWeekHigh != null && quote.fiftyTwoWeekLow != null && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-xs w-20 shrink-0">52週レンジ</span>
                    <span className="text-red-400 text-xs font-mono">¥{Math.round(quote.fiftyTwoWeekLow).toLocaleString()}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 relative overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-red-500 to-emerald-500"
                        style={{
                          width: `${((quote.price - quote.fiftyTwoWeekLow) / (quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-emerald-400 text-xs font-mono">¥{Math.round(quote.fiftyTwoWeekHigh).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard label="PER" value={quote.per != null ? `${fmt(quote.per, 1)}倍` : '—'} sub="株価収益率" />
              <MetricCard label="PBR" value={quote.pbr != null ? `${fmt(quote.pbr, 2)}倍` : '—'} sub="株価純資産倍率" />
              <MetricCard label="ROE" value={quote.roe != null ? `${fmt(quote.roe, 1)}%` : '—'} sub="自己資本利益率" />
              <MetricCard label="配当利回り" value={quote.dividendYield != null ? `${fmt(quote.dividendYield, 2)}%` : '—'} sub="年間配当" />
            </div>

            {/* Additional metrics row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MetricCard label="時価総額" value={fmtBig(quote.marketCap)} />
              <MetricCard label="出来高" value={fmtVol(quote.volume)} sub={quote.averageVolume ? `平均 ${fmtVol(quote.averageVolume)}` : undefined} />
              {quote.website && (
                <a
                  href={quote.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass rounded-xl p-4 flex items-center gap-2 hover:bg-white/5 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-sm truncate">公式サイト</span>
                </a>
              )}
            </div>

            {/* Price chart */}
            <div className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  <h2 className="text-white font-bold">株価チャート</h2>
                </div>
                <div className="flex gap-1.5">
                  {PERIODS.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setPeriod(p.value)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        period === p.value
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                          : 'glass text-slate-400 hover:text-white border border-white/10'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {historyLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
              ) : history.length > 0 ? (
                <PriceChart data={history} isUp={isUp} />
              ) : (
                <div className="flex items-center justify-center h-40 text-slate-500">
                  チャートデータがありません
                </div>
              )}
            </div>

            {/* Business description */}
            {quote.description && (
              <div className="glass rounded-2xl p-5">
                <h2 className="text-white font-bold mb-3">事業内容</h2>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-5">
                  {quote.description}
                </p>
              </div>
            )}

            {/* AI Analysis section */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h2 className="text-white font-bold">AI 国策銘柄分析</h2>
                </div>
                {!analysis && !analysisLoading && (
                  <button
                    onClick={handleAnalyze}
                    className="btn-primary px-5 py-2 text-sm flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    分析する
                  </button>
                )}
                {analysis && (
                  <button
                    onClick={handleAnalyze}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    再分析
                  </button>
                )}
              </div>

              {/* Loading */}
              {analysisLoading && (
                <div className="flex flex-col items-center gap-4 py-12">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                    <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <p className="text-slate-400 text-sm">Claude AI が分析中...</p>
                  <p className="text-slate-600 text-xs">骨太の方針との関連性を評価しています</p>
                </div>
              )}

              {/* Error */}
              {analysisError && !analysisLoading && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <p className="text-red-300 text-sm">{analysisError}</p>
                </div>
              )}

              {/* Prompt to analyze */}
              {!analysis && !analysisLoading && !analysisError && (
                <div className="text-center py-10">
                  <Sparkles className="w-12 h-12 text-purple-400/40 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">
                    「分析する」ボタンで AI が国策銘柄としての可能性を評価します
                  </p>
                </div>
              )}

              {/* Analysis result */}
              {analysis && !analysisLoading && (
                <div className="space-y-6">
                  {/* Scores */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="glass-strong rounded-xl p-4 space-y-3">
                      <p className="text-slate-400 text-xs font-medium">総合評価スコア</p>
                      <div className="flex items-end gap-3">
                        <span className="text-4xl font-black text-white">{analysis.overallScore}</span>
                        <span className="text-slate-500 text-sm mb-1">/ 100</span>
                      </div>
                      <ScoreBar score={analysis.overallScore} color={analysis.overallScore >= 70 ? 'green' : analysis.overallScore >= 50 ? 'blue' : 'orange'} />
                    </div>
                    <div className="glass-strong rounded-xl p-4 space-y-3">
                      <p className="text-slate-400 text-xs font-medium">将来性スコア</p>
                      <div className="flex items-end gap-3">
                        <span className="text-4xl font-black text-white">{analysis.futureScore}</span>
                        <span className="text-slate-500 text-sm mb-1">/ 100</span>
                      </div>
                      <ScoreBar score={analysis.futureScore} color="purple" />
                    </div>
                  </div>

                  {/* Recommendation badge */}
                  {(() => {
                    const cfg = RECOMMENDATION_CONFIG[analysis.recommendation] || RECOMMENDATION_CONFIG.neutral
                    return (
                      <div className={`flex items-start gap-3 p-4 rounded-xl ${cfg.bg} border ${cfg.border}`}>
                        <span className={`font-black text-lg ${cfg.color}`}>{cfg.label}</span>
                        <p className={`text-sm ${cfg.color} opacity-90 leading-relaxed`}>{analysis.recommendationReason}</p>
                      </div>
                    )
                  })()}

                  {/* Summary */}
                  <div className="glass-strong rounded-xl p-4">
                    <p className="text-slate-400 text-xs font-medium mb-2">総合評価</p>
                    <p className="text-slate-200 text-sm leading-relaxed">{analysis.summary}</p>
                  </div>

                  {/* Policy relevance */}
                  {analysis.policyRelevance?.length > 0 && (
                    <div>
                      <p className="text-slate-400 text-xs font-medium mb-3">政策テーマとの関連性</p>
                      <div className="space-y-3">
                        {analysis.policyRelevance
                          .sort((a, b) => b.relevanceScore - a.relevanceScore)
                          .map(rel => (
                            <div key={rel.themeId} className="glass-strong rounded-xl p-3 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-white text-sm font-medium">{rel.themeTitle}</span>
                                <span className="text-blue-300 font-bold text-sm w-8 text-right">{rel.relevanceScore}</span>
                              </div>
                              <ScoreBar score={rel.relevanceScore} color="blue" />
                              <p className="text-slate-400 text-xs">{rel.explanation}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths */}
                  {analysis.strengths?.length > 0 && (
                    <div>
                      <p className="text-slate-400 text-xs font-medium mb-3">強み</p>
                      <div className="space-y-2">
                        {analysis.strengths.map((s, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <p className="text-slate-200 text-sm">{s}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risks */}
                  {analysis.risks?.length > 0 && (
                    <div>
                      <p className="text-slate-400 text-xs font-medium mb-3">リスク</p>
                      <div className="space-y-2">
                        {analysis.risks.map((r, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                            <p className="text-slate-200 text-sm">{r}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <p className="text-center text-slate-600 text-xs pb-4">
              ※ 本アプリの情報は投資判断の参考であり、投資を推奨するものではありません。投資は自己責任でお願いします。
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
