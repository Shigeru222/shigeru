'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  TrendingUp,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Star,
  Calendar,
} from 'lucide-react'
import { POLICY_THEMES } from '@/lib/stock/policies'
import { MARKET_RESEARCH } from '@/lib/stock/market-research'
import { PolicyTheme } from '@/lib/stock/types'
import { MarketResearch } from '@/lib/stock/market-research'

interface SearchResult {
  ticker: string
  name: string
  exchange: string
  type: string
}

const colorMap: Record<string, { border: string; bg: string; badge: string; icon: string }> = {
  blue:   { border: 'border-blue-500/40',   bg: 'from-blue-900/20 to-blue-800/10',   badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',   icon: 'text-blue-400' },
  green:  { border: 'border-green-500/40',  bg: 'from-green-900/20 to-green-800/10', badge: 'bg-green-500/20 text-green-300 border-green-500/30',  icon: 'text-green-400' },
  purple: { border: 'border-purple-500/40', bg: 'from-purple-900/20 to-purple-800/10',badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',icon: 'text-purple-400' },
  cyan:   { border: 'border-cyan-500/40',   bg: 'from-cyan-900/20 to-cyan-800/10',   badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',     icon: 'text-cyan-400' },
  orange: { border: 'border-orange-500/40', bg: 'from-orange-900/20 to-orange-800/10',badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',icon: 'text-orange-400' },
  red:    { border: 'border-red-500/40',    bg: 'from-red-900/20 to-red-800/10',     badge: 'bg-red-500/20 text-red-300 border-red-500/30',         icon: 'text-red-400' },
  pink:   { border: 'border-pink-500/40',   bg: 'from-pink-900/20 to-pink-800/10',   badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30',      icon: 'text-pink-400' },
  yellow: { border: 'border-yellow-500/40', bg: 'from-yellow-900/20 to-yellow-800/10',badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',icon: 'text-yellow-400' },
}

function ThemeCard({
  theme,
  market,
  onStockClick,
}: {
  theme: PolicyTheme
  market?: MarketResearch
  onStockClick: (ticker: string) => void
}) {
  const colors = colorMap[theme.color]
  return (
    <div
      className={`glass rounded-2xl p-5 border ${colors.border} bg-gradient-to-br ${colors.bg} card-hover flex flex-col gap-4`}
    >
      {/* Card header */}
      <div className="flex items-start gap-3">
        <span className="text-3xl leading-none">{theme.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-base leading-tight">{theme.title}</h3>
          <p className={`text-xs font-medium mt-0.5 ${colors.icon}`}>{theme.subtitle}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-300 text-xs leading-relaxed">{theme.description}</p>

      {/* Market data */}
      {market && (
        <div className="rounded-lg bg-black/20 p-3 space-y-1.5 text-xs">
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">国内市場規模</span>
            <span className="text-slate-200 text-right">{market.marketSize.japan}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">成長率(CAGR)</span>
            <span className={`text-right font-medium ${colors.icon}`}>{market.growth.cagr.split('、')[0]}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">政府支援規模</span>
            <span className="text-slate-200 text-right">{market.govSupport.totalBudget}</span>
          </div>
        </div>
      )}

      {/* Keywords */}
      <div className="flex flex-wrap gap-1.5">
        {theme.keywords.slice(0, 4).map(k => (
          <span
            key={k}
            className={`text-xs px-2 py-0.5 rounded-full border ${colors.badge}`}
          >
            {k}
          </span>
        ))}
      </div>

      {/* Representative stocks */}
      <div className="flex flex-col gap-1.5">
        <p className="text-slate-400 text-xs font-medium">代表銘柄</p>
        {theme.representativeStocks.map(stock => (
          <button
            key={stock.ticker}
            onClick={() => onStockClick(stock.ticker)}
            className="flex items-center gap-2 text-left hover:bg-white/5 rounded-lg px-2 py-1.5 transition-colors group"
          >
            <span className={`text-xs font-mono font-bold ${colors.icon} shrink-0`}>{stock.ticker}</span>
            <span className="text-slate-200 text-xs font-medium truncate">{stock.name}</span>
            <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-slate-300 shrink-0 ml-auto transition-colors" />
          </button>
        ))}
      </div>
    </div>
  )
}

export default function StockPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navigateToStock = useCallback(
    (ticker: string) => {
      router.push(`/stock/${encodeURIComponent(ticker)}`)
    },
    [router],
  )

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/stock/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setSearchResults(data.results || [])
        setShowDropdown(true)
        setSelectedIndex(-1)
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || searchResults.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        // Try navigating with the query as ticker directly (e.g. 7203.T)
        const ticker = query.trim().toUpperCase()
        if (/^\d{4}\.T$/i.test(ticker) || /^[A-Z]{1,5}$/.test(ticker)) {
          navigateToStock(ticker)
        }
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, searchResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0) {
        navigateToStock(searchResults[selectedIndex].ticker)
        setShowDropdown(false)
      } else if (searchResults.length > 0) {
        navigateToStock(searchResults[0].ticker)
        setShowDropdown(false)
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  // Collect all popular stocks across themes (deduplicated)
  const popularStocks = Array.from(
    new Map(
      POLICY_THEMES.flatMap(t => t.representativeStocks).map(s => [s.ticker, s]),
    ).values(),
  ).slice(0, 12)

  return (
    <main className="min-h-screen relative">
      {/* Mesh background */}
      <div className="mesh-bg" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">ホームに戻る</span>
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <TrendingUp className="w-7 h-7 text-blue-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black gradient-text">
              国策銘柄 分析ダッシュボード
            </h1>
          </div>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            骨太の方針 2024/2025 に基づく政策テーマ別銘柄を AI が分析。
            東証上場銘柄の将来性を多角的に評価します。
          </p>
        </div>

        {/* 20-year policy history banner */}
        <div
          className="glass rounded-xl p-4 mb-8 border border-purple-400/20 flex items-center justify-between gap-4 cursor-pointer hover:border-purple-400/40 transition-colors group"
          onClick={() => router.push('/stock/history')}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && router.push('/stock/history')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-400/10 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">骨太の方針 20年史（2001〜2024年）</div>
              <div className="text-xs text-slate-400">過去20年間の国策テーマ変遷・優先度ヒートマップ・政策継続性ランキングを分析の土台として提供</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors shrink-0" />
        </div>

        {/* Search bar */}
        <div className="relative max-w-xl mx-auto mb-12">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400 z-10 pointer-events-none" />
            {isSearching && (
              <Loader2 className="absolute right-4 w-4 h-4 text-blue-400 animate-spin z-10 pointer-events-none" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              placeholder="銘柄名またはティッカーで検索（例: トヨタ, 7203.T）"
              className="w-full glass rounded-xl pl-11 pr-11 py-3.5 text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500/60 border border-white/10 transition-colors"
              autoComplete="off"
            />
          </div>

          {/* Search dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute top-full mt-2 left-0 right-0 glass-strong rounded-xl border border-white/10 overflow-hidden z-50 shadow-2xl"
            >
              {searchResults.map((result, idx) => (
                <button
                  key={result.ticker}
                  onClick={() => {
                    navigateToStock(result.ticker)
                    setShowDropdown(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    idx === selectedIndex ? 'bg-blue-500/15' : 'hover:bg-white/5'
                  } ${idx !== 0 ? 'border-t border-white/5' : ''}`}
                >
                  <span className="text-xs font-mono font-bold text-blue-400 w-20 shrink-0">{result.ticker}</span>
                  <span className="text-slate-200 text-sm truncate flex-1">{result.name}</span>
                  <span className="text-slate-500 text-xs shrink-0">{result.exchange}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Popular stocks quick links */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-yellow-400" />
            <h2 className="text-white font-bold text-lg">人気の国策銘柄</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularStocks.map(stock => (
              <button
                key={stock.ticker}
                onClick={() => navigateToStock(stock.ticker)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/10 transition-all group text-sm"
              >
                <span className="text-blue-400 font-mono font-bold text-xs">{stock.ticker}</span>
                <span className="text-slate-300">{stock.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Policy themes */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <h2 className="text-white font-bold text-xl">政策テーマ別銘柄</h2>
            <span className="text-slate-500 text-sm ml-1">骨太の方針 2024/2025</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {POLICY_THEMES.map(theme => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                market={MARKET_RESEARCH.find(m => m.themeId === theme.id)}
                onStockClick={navigateToStock}
              />
            ))}
          </div>
        </section>

        {/* Footer note */}
        <p className="text-center text-slate-600 text-xs mt-12">
          ※ 本アプリの情報は投資判断の参考であり、投資を推奨するものではありません。投資は自己責任でお願いします。
        </p>
      </div>
    </main>
  )
}
