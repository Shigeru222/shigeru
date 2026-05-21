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
  Users,
  Building2,
  Target,
  Lightbulb,
  Globe,
  Zap,
} from 'lucide-react'
import { PolicyAnalysis, HistoricalPrice, CompanyDetail, BusinessAnalysis } from '@/lib/stock/types'

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

  const [detail, setDetail] = useState<CompanyDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [bizAnalysis, setBizAnalysis] = useState<BusinessAnalysis | null>(null)
  const [bizLoading, setBizLoading] = useState(false)
  const [bizError, setBizError] = useState<string | null>(null)

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

  // Fetch company detail (shareholder, 5-year performance)
  useEffect(() => {
    async function fetchDetail() {
      setDetailLoading(true)
      try {
        const res = await fetch(`/api/stock/company-detail?ticker=${encodeURIComponent(ticker)}`)
        if (res.ok) {
          const data = await res.json()
          if (!data.error) setDetail(data)
        }
      } catch { /* ignore */ } finally {
        setDetailLoading(false)
      }
    }
    fetchDetail()
  }, [ticker])

  // Business analysis
  async function handleBizAnalyze() {
    if (!quote) return
    setBizLoading(true)
    setBizError(null)
    setBizAnalysis(null)
    try {
      const res = await fetch('/api/stock/business-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: quote.ticker,
          companyName: quote.name,
          sector: quote.sector,
          industry: quote.industry,
          description: quote.description,
          employees: detail?.companyProfile.employees,
          marketCap: quote.marketCap,
          revenueGrowth: detail?.additionalMetrics.revenueGrowth,
          operatingMargins: detail?.additionalMetrics.operatingMargins,
          website: quote.website,
        }),
      })
      if (!res.ok) throw new Error('分析に失敗しました')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setBizAnalysis(data)
    } catch (e) {
      setBizError(e instanceof Error ? e.message : '分析エラー')
    } finally {
      setBizLoading(false)
    }
  }

  // Policy analyze
  async function handleAnalyze() {
    if (!quote) return
    setAnalysisLoading(true)
    setAnalysisError(null)
    setAnalysis(null)
    try {
      // Build 5-year revenue trend string for AI context
      const revTrend = detail?.fiveYearPerformance
        .filter(p => p.revenue != null)
        .map(p => `${p.date}: ${p.revenue! >= 1e9 ? (p.revenue! / 1e9).toFixed(0) + '十億' : (p.revenue! / 1e8).toFixed(0) + '億'}円`)
        .join(' → ') || null

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
          employees: detail?.companyProfile.employees,
          revenueGrowth: detail?.additionalMetrics.revenueGrowth,
          operatingMargins: detail?.additionalMetrics.operatingMargins,
          fiveYearRevenueTrend: revTrend,
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

            {/* Business deep-dive analysis */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-white font-bold">事業詳細分析</h2>
                  <span className="text-xs text-slate-500">社会課題・価値提供・競争優位</span>
                </div>
                {!bizAnalysis && !bizLoading && (
                  <button onClick={handleBizAnalyze} className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4" />
                    分析する
                  </button>
                )}
                {bizAnalysis && (
                  <button onClick={handleBizAnalyze} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />
                    再分析
                  </button>
                )}
              </div>

              {bizLoading && (
                <div className="flex flex-col items-center gap-4 py-10">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
                    <Lightbulb className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <p className="text-slate-400 text-sm">事業の本質を分析中...</p>
                </div>
              )}

              {bizError && !bizLoading && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <p className="text-red-300 text-sm">{bizError}</p>
                </div>
              )}

              {!bizAnalysis && !bizLoading && !bizError && (
                <div className="text-center py-8">
                  <Lightbulb className="w-10 h-10 text-yellow-400/30 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">
                    「分析する」で社会課題・価値提供・競争優位を AI が深掘りします
                  </p>
                </div>
              )}

              {bizAnalysis && !bizLoading && (
                <div className="space-y-6">
                  {/* One-liner & type */}
                  <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4">
                    <p className="text-xs text-yellow-400/70 mb-1">{bizAnalysis.businessType}</p>
                    <p className="text-white font-bold text-base leading-relaxed">
                      &ldquo;{bizAnalysis.oneLiner}&rdquo;
                    </p>
                  </div>

                  {/* Social challenges */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="w-4 h-4 text-red-400" />
                      <p className="text-slate-300 text-sm font-bold">解決する社会課題</p>
                    </div>
                    <div className="space-y-2">
                      {bizAnalysis.socialChallenges?.map((sc, i) => {
                        const severityCfg = {
                          critical: { label: '深刻',   bg: 'bg-red-500/10',    border: 'border-red-500/25',    text: 'text-red-300' },
                          high:     { label: '重要',   bg: 'bg-orange-500/10', border: 'border-orange-500/25', text: 'text-orange-300' },
                          medium:   { label: '中程度', bg: 'bg-blue-500/10',   border: 'border-blue-500/25',   text: 'text-blue-300' },
                        }
                        const cfg = severityCfg[sc.severity] || severityCfg.medium
                        return (
                          <div key={i} className={`rounded-xl p-4 border ${cfg.bg} ${cfg.border}`}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-white font-bold text-sm">{sc.challenge}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                                {cfg.label}
                              </span>
                            </div>
                            <p className="text-slate-300 text-xs leading-relaxed">{sc.description}</p>
                            {sc.scale && (
                              <p className="text-slate-500 text-xs mt-1">📊 {sc.scale}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Solution approach */}
                  <div className="rounded-xl glass-strong p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <p className="text-slate-300 text-sm font-bold">解決アプローチ</p>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{bizAnalysis.solutionApproach}</p>
                  </div>

                  {/* Value propositions */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-green-400" />
                      <p className="text-slate-300 text-sm font-bold">提供価値</p>
                    </div>
                    <div className="space-y-3">
                      {bizAnalysis.valuePropositions?.map((vp, i) => {
                        const bmColor: Record<string, string> = {
                          BtoC:   'bg-green-500/15 text-green-300 border-green-500/25',
                          BtoB:   'bg-blue-500/15 text-blue-300 border-blue-500/25',
                          BtoB2C: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
                          BtoG:   'bg-orange-500/15 text-orange-300 border-orange-500/25',
                          'その他': 'bg-slate-500/15 text-slate-300 border-slate-500/25',
                        }
                        const bmCls = bmColor[vp.businessModel] || bmColor['その他']
                        return (
                          <div key={i} className="glass-strong rounded-xl p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${bmCls} mr-2`}>
                                  {vp.businessModel}
                                </span>
                                <span className="text-white font-bold text-sm">{vp.target}</span>
                              </div>
                            </div>
                            <p className="text-cyan-300 text-sm font-medium mb-2">{vp.coreValue}</p>
                            <ul className="space-y-1 mb-3">
                              {vp.specificBenefits?.map((b, j) => (
                                <li key={j} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                                  <span className="text-slate-300 text-xs">{b}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="pt-2 border-t border-white/5">
                              <span className="text-xs text-slate-500">差別化: </span>
                              <span className="text-xs text-slate-300">{vp.differentiator}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Moat */}
                  <div className="rounded-xl glass-strong p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      <p className="text-slate-300 text-sm font-bold">競争優位（経済的堀）</p>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{bizAnalysis.moat}</p>
                  </div>

                  {/* Growth catalysts */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <p className="text-slate-300 text-sm font-bold">今後の成長トリガー</p>
                    </div>
                    <div className="space-y-2">
                      {bizAnalysis.growthCatalysts?.map((cat, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="text-emerald-400 font-bold text-sm shrink-0">{i + 1}.</span>
                          <p className="text-slate-200 text-sm">{cat}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ESG */}
                  {bizAnalysis.esgHighlights && (
                    <div className="rounded-xl bg-teal-500/10 border border-teal-500/20 p-3">
                      <span className="text-xs text-teal-400 font-medium">ESG・サステナビリティ: </span>
                      <span className="text-xs text-slate-300">{bizAnalysis.esgHighlights}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shareholder composition */}
            {detailLoading ? (
              <div className="glass rounded-2xl p-5 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin shrink-0" />
                <span className="text-slate-400 text-sm">株主・業績データを取得中...</span>
              </div>
            ) : detail && (
              <>
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-white font-bold">株主構成</h2>
                    {detail.companyProfile.employees && (
                      <span className="text-slate-500 text-xs ml-auto">
                        従業員数: {detail.companyProfile.employees.toLocaleString('ja-JP')}人
                      </span>
                    )}
                  </div>

                  {/* Ownership breakdown */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="glass-strong rounded-xl p-3 text-center">
                      <p className="text-slate-500 text-xs mb-1">内部者持株</p>
                      <p className="text-white font-bold text-lg">
                        {detail.shareholderComposition.insidersPercent != null
                          ? `${detail.shareholderComposition.insidersPercent}%`
                          : '—'}
                      </p>
                    </div>
                    <div className="glass-strong rounded-xl p-3 text-center">
                      <p className="text-slate-500 text-xs mb-1">機関投資家</p>
                      <p className="text-white font-bold text-lg">
                        {detail.shareholderComposition.institutionsPercent != null
                          ? `${detail.shareholderComposition.institutionsPercent}%`
                          : '—'}
                      </p>
                    </div>
                    <div className="glass-strong rounded-xl p-3 text-center">
                      <p className="text-slate-500 text-xs mb-1">浮動株</p>
                      <p className="text-white font-bold text-lg">
                        {detail.shareholderComposition.floatPercent != null
                          ? `${detail.shareholderComposition.floatPercent}%`
                          : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Visual bar */}
                  {detail.shareholderComposition.insidersPercent != null && detail.shareholderComposition.institutionsPercent != null && (
                    <div className="h-3 rounded-full overflow-hidden flex mb-3">
                      <div
                        className="bg-blue-500 h-full"
                        style={{ width: `${detail.shareholderComposition.insidersPercent}%` }}
                        title={`内部者 ${detail.shareholderComposition.insidersPercent}%`}
                      />
                      <div
                        className="bg-purple-500 h-full"
                        style={{ width: `${detail.shareholderComposition.institutionsPercent}%` }}
                        title={`機関投資家 ${detail.shareholderComposition.institutionsPercent}%`}
                      />
                      <div className="bg-slate-600 h-full flex-1" title="その他" />
                    </div>
                  )}
                  <div className="flex gap-4 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />内部者</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />機関投資家</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-600 inline-block" />その他</span>
                  </div>

                  {/* Top institutions */}
                  {detail.shareholderComposition.topInstitutions.length > 0 && (
                    <div>
                      <p className="text-slate-500 text-xs font-medium mb-2">主要機関投資家</p>
                      <div className="space-y-1.5">
                        {detail.shareholderComposition.topInstitutions.map((inst, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-slate-400 text-xs font-mono w-4 shrink-0">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <span className="text-slate-200 text-xs truncate">{inst.name}</span>
                                <span className="text-cyan-400 text-xs font-bold shrink-0">{inst.percent}%</span>
                              </div>
                              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                  style={{ width: `${Math.min(inst.percent * 5, 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 5-year performance */}
                {detail.fiveYearPerformance.length > 0 && (
                  <div className="glass rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="w-5 h-5 text-green-400" />
                      <h2 className="text-white font-bold">過去5年の業績</h2>
                      {detail.additionalMetrics.operatingMargins != null && (
                        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/25 text-green-300">
                          営業利益率 {detail.additionalMetrics.operatingMargins}%
                        </span>
                      )}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs min-w-[500px]">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left text-slate-500 font-normal pb-2">期末</th>
                            <th className="text-right text-slate-500 font-normal pb-2">売上高</th>
                            <th className="text-right text-slate-500 font-normal pb-2">営業利益</th>
                            <th className="text-right text-slate-500 font-normal pb-2">純利益</th>
                            <th className="text-right text-slate-500 font-normal pb-2">EPS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.fiveYearPerformance.map((p, i) => {
                            const prevRevenue = i > 0 ? detail.fiveYearPerformance[i - 1].revenue : null
                            const revGrowth = prevRevenue && p.revenue
                              ? ((p.revenue - prevRevenue) / Math.abs(prevRevenue)) * 100
                              : null
                            return (
                              <tr key={i} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                                <td className="py-2 text-slate-300">{p.date}</td>
                                <td className="py-2 text-right text-white font-medium">
                                  {p.revenue != null ? fmtBig(p.revenue) : '—'}
                                  {revGrowth != null && (
                                    <span className={`ml-1 text-xs ${revGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {revGrowth >= 0 ? '▲' : '▼'}{Math.abs(revGrowth).toFixed(1)}%
                                    </span>
                                  )}
                                </td>
                                <td className={`py-2 text-right font-medium ${p.operatingIncome != null && p.operatingIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {p.operatingIncome != null ? fmtBig(p.operatingIncome) : '—'}
                                </td>
                                <td className={`py-2 text-right font-medium ${p.netIncome != null && p.netIncome >= 0 ? 'text-blue-300' : 'text-red-400'}`}>
                                  {p.netIncome != null ? fmtBig(p.netIncome) : '—'}
                                </td>
                                <td className="py-2 text-right text-slate-300">
                                  {p.eps != null ? `¥${fmt(p.eps, 1)}` : '—'}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mini revenue bar chart */}
                    {detail.fiveYearPerformance.some(p => p.revenue != null) && (
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <p className="text-slate-500 text-xs mb-2">売上高推移</p>
                        <div className="flex items-end gap-1.5 h-16">
                          {(() => {
                            const revenues = detail.fiveYearPerformance.map(p => p.revenue ?? 0)
                            const maxRev = Math.max(...revenues)
                            return detail.fiveYearPerformance.map((p, i) => {
                              const pct = maxRev > 0 ? ((p.revenue ?? 0) / maxRev) * 100 : 0
                              return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                  <div
                                    className="w-full rounded-t bg-gradient-to-t from-blue-600 to-blue-400 transition-all"
                                    style={{ height: `${pct}%` }}
                                    title={p.revenue != null ? fmtBig(p.revenue) : '—'}
                                  />
                                  <span className="text-slate-600 text-xs">{p.date.slice(2, 7)}</span>
                                </div>
                              )
                            })
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
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

                  {/* Management challenges */}
                  {analysis.managementChallenges && analysis.managementChallenges.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-yellow-400" />
                        <p className="text-slate-400 text-xs font-medium">株価高騰のための経営課題</p>
                      </div>
                      <div className="space-y-3">
                        {analysis.managementChallenges.map((ch, i) => {
                          const priorityConfig = {
                            high:   { label: '最重要', color: 'text-red-300',    bg: 'bg-red-500/10',    border: 'border-red-500/25' },
                            medium: { label: '重要',   color: 'text-orange-300', bg: 'bg-orange-500/10', border: 'border-orange-500/25' },
                            low:    { label: '中長期', color: 'text-blue-300',   bg: 'bg-blue-500/10',   border: 'border-blue-500/25' },
                          }
                          const cfg = priorityConfig[ch.priority] || priorityConfig.medium
                          return (
                            <div key={i} className={`rounded-xl p-4 border ${cfg.bg} ${cfg.border}`}>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-bold text-sm">
                                    {i + 1}. {ch.title}
                                  </span>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${cfg.color} ${cfg.bg} border ${cfg.border}`}>
                                  {cfg.label}
                                </span>
                              </div>
                              <p className="text-slate-300 text-xs leading-relaxed mb-2">{ch.description}</p>
                              <div className="flex items-start gap-1.5">
                                <TrendingUp className="w-3 h-3 text-yellow-400 shrink-0 mt-0.5" />
                                <p className="text-yellow-300/80 text-xs">{ch.impact}</p>
                              </div>
                            </div>
                          )
                        })}
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
