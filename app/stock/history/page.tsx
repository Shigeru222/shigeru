"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Calendar, BarChart3, Flame, ChevronDown, ChevronUp, Globe } from 'lucide-react'
import { AnnualPolicyEntry } from '@/lib/stock/historical-policies'
import { PolicyContinuity } from '@/lib/stock/types'
import { POLICY_THEMES } from '@/lib/stock/policies'
import { MARKET_RESEARCH, MarketResearch } from '@/lib/stock/market-research'

const THEME_COLOR_MAP: Record<string, string> = {
  'ai-semiconductor': 'blue',
  'gx': 'green',
  'defense': 'red',
  'digital-gov': 'purple',
  'healthcare': 'cyan',
  'childcare': 'pink',
  'tourism': 'orange',
  'economic-security': 'yellow',
}

const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  blue:   { bg: 'bg-blue-400/10',   border: 'border-blue-400/40',   text: 'text-blue-400',   badge: 'bg-blue-400/20 text-blue-300' },
  green:  { bg: 'bg-green-400/10',  border: 'border-green-400/40',  text: 'text-green-400',  badge: 'bg-green-400/20 text-green-300' },
  red:    { bg: 'bg-red-400/10',    border: 'border-red-400/40',    text: 'text-red-400',    badge: 'bg-red-400/20 text-red-300' },
  purple: { bg: 'bg-purple-400/10', border: 'border-purple-400/40', text: 'text-purple-400', badge: 'bg-purple-400/20 text-purple-300' },
  cyan:   { bg: 'bg-cyan-400/10',   border: 'border-cyan-400/40',   text: 'text-cyan-400',   badge: 'bg-cyan-400/20 text-cyan-300' },
  pink:   { bg: 'bg-pink-400/10',   border: 'border-pink-400/40',   text: 'text-pink-400',   badge: 'bg-pink-400/20 text-pink-300' },
  orange: { bg: 'bg-orange-400/10', border: 'border-orange-400/40', text: 'text-orange-400', badge: 'bg-orange-400/20 text-orange-300' },
  yellow: { bg: 'bg-yellow-400/10', border: 'border-yellow-400/40', text: 'text-yellow-400', badge: 'bg-yellow-400/20 text-yellow-300' },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; intensity: number }> = {
  top:    { label: '最重要', color: '#f43f5e', intensity: 100 },
  high:   { label: '重要',   color: '#f59e0b', intensity: 70 },
  medium: { label: '中程度', color: '#3b82f6', intensity: 40 },
  none:   { label: '対象外', color: '#374151', intensity: 5 },
}

interface HistoryData {
  policies: AnnualPolicyEntry[]
  continuity: PolicyContinuity[]
  yearRange: { start: number; end: number }
}

export default function PolicyHistoryPage() {
  const router = useRouter()
  const [data, setData] = useState<HistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [expandedYear, setExpandedYear] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/stock/policy-history')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400">政策履歴データを読み込み中...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!data) return null

  const sortedContinuity = [...data.continuity].sort((a, b) => b.totalScore - a.totalScore)
  const reversedPolicies = [...data.policies].reverse()

  const themeMap = Object.fromEntries(POLICY_THEMES.map(t => [t.id, t]))
  const marketMap = Object.fromEntries(MARKET_RESEARCH.map(m => [m.themeId, m]))

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <button
            onClick={() => router.push('/stock')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            銘柄分析に戻る
          </button>
          <div className="glass rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-400/10 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <h1 className="text-3xl font-black">
                <span className="gradient-text">骨太の方針 20年史</span>
              </h1>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed">
              2001〜2024年の骨太の方針（経済財政運営と改革の基本方針）における政策テーマの変遷を可視化。
              <br />
              20年にわたる政策の継続性・強度・モメンタムを分析し、将来の国策銘柄を見極める土台とします。
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
              <span className="glass rounded-lg px-3 py-1">対象期間: 2001〜2024年（24年分）</span>
              <span className="glass rounded-lg px-3 py-1">政策テーマ: 8分野</span>
              <span className="glass rounded-lg px-3 py-1">内閣: 小泉〜石破</span>
            </div>
          </div>
        </div>

        {/* Continuity Rankings */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            政策継続性ランキング（20年間の累積優先度）
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedContinuity.map((c, rank) => {
              const theme = themeMap[c.themeId]
              if (!theme) return null
              const color = THEME_COLOR_MAP[c.themeId] || 'blue'
              const colors = COLOR_CLASSES[color]
              const maxPossibleScore = 24 * 4
              const pct = Math.round((c.totalScore / maxPossibleScore) * 100)

              return (
                <button
                  key={c.themeId}
                  onClick={() => setSelectedTheme(selectedTheme === c.themeId ? null : c.themeId)}
                  className={`glass rounded-xl p-5 text-left card-hover border transition-all ${
                    selectedTheme === c.themeId ? `border-${color}-400/60` : 'border-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-black ${rank < 3 ? colors.text : 'text-slate-500'}`}>
                        #{rank + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{theme.icon}</span>
                          <span className="font-bold text-white">{theme.title}</span>
                        </div>
                        <div className="text-sm text-slate-400">{theme.subtitle}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <MomentumBadge momentum={c.recentMomentum} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-400 mb-1">
                      <span>継続年数: <span className="text-white font-bold">{c.continuousYears}年</span></span>
                      <span>累積スコア: <span className={`font-bold ${colors.text}`}>{pct}%</span></span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${PRIORITY_CONFIG[c.maxPriority]?.color ?? '#4f8ef7'}, #a855f7)`
                        }}
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>
                        最高優先度: {PRIORITY_CONFIG[c.maxPriority]?.label}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Heatmap */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            政策優先度ヒートマップ（2001〜2024年）
          </h2>
          <div className="glass rounded-xl p-4 overflow-x-auto">
            <table className="w-full text-xs min-w-[700px]">
              <thead>
                <tr>
                  <th className="text-left text-slate-400 pr-3 pb-2 font-normal w-36">テーマ</th>
                  {data.policies.map(p => (
                    <th key={p.year} className="text-center text-slate-500 font-normal pb-2 w-8">
                      {p.year.toString().slice(2)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="space-y-1">
                {sortedContinuity.map(c => {
                  const theme = themeMap[c.themeId]
                  if (!theme) return null
                  return (
                    <tr key={c.themeId} className="border-b border-white/5">
                      <td className="pr-3 py-1.5">
                        <span className="text-slate-300 whitespace-nowrap">
                          {theme.icon} {theme.title.split('・')[0].split('（')[0].substring(0, 8)}
                        </span>
                      </td>
                      {data.policies.map(p => {
                        const presence = p.themePresence[c.themeId]
                        const priority = presence?.priority ?? 'none'
                        const intensity = PRIORITY_CONFIG[priority]?.intensity ?? 5
                        const bgColor = PRIORITY_CONFIG[priority]?.color ?? '#1f2937'
                        return (
                          <td key={p.year} className="text-center py-1.5 px-0.5">
                            <div
                              className="w-6 h-6 rounded mx-auto transition-transform hover:scale-125 cursor-default"
                              style={{
                                backgroundColor: bgColor,
                                opacity: intensity / 100,
                              }}
                              title={`${p.year}年: ${PRIORITY_CONFIG[priority]?.label} - ${presence?.description || ''}`}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
              <span className="text-xs text-slate-500">優先度：</span>
              {Object.entries(PRIORITY_CONFIG).reverse().map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: val.color, opacity: val.intensity / 100 }} />
                  <span className="text-xs text-slate-400">{val.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Research Section */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-400" />
            テーマ別 市場調査データ（銘柄選定の基礎情報）
          </h2>
          <div className="space-y-3">
            {sortedContinuity.map(c => {
              const theme = themeMap[c.themeId]
              const market = marketMap[c.themeId] as MarketResearch | undefined
              if (!theme || !market) return null
              const color = THEME_COLOR_MAP[c.themeId] || 'blue'
              const colors = COLOR_CLASSES[color]
              return (
                <div key={c.themeId} className={`glass rounded-xl border ${colors.border} overflow-hidden`}>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{theme.icon}</span>
                      <span className="font-bold text-white">{theme.title}</span>
                      <MomentumBadge momentum={c.recentMomentum} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mb-3">
                      <div className="rounded-lg bg-black/20 p-3">
                        <div className="text-slate-500 text-xs mb-1">国内市場規模</div>
                        <div className="text-white font-medium text-xs leading-relaxed">{market.marketSize.japan}</div>
                      </div>
                      <div className="rounded-lg bg-black/20 p-3">
                        <div className="text-slate-500 text-xs mb-1">成長率・予測</div>
                        <div className={`font-medium text-xs leading-relaxed ${colors.text}`}>{market.growth.cagr}</div>
                        <div className="text-slate-400 text-xs mt-1">{market.growth.projectedSize}</div>
                      </div>
                      <div className="rounded-lg bg-black/20 p-3">
                        <div className="text-slate-500 text-xs mb-1">政府支援規模</div>
                        <div className="text-white font-bold text-xs">{market.govSupport.totalBudget}</div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                      <span className="text-slate-300 font-medium">戦略的意義: </span>
                      {market.significance.strategicReason}
                    </div>
                    <div className="mt-2 text-xs">
                      <span className={`font-medium ${colors.text}`}>投資ポイント: </span>
                      <span className="text-slate-300">{market.investmentHighlight}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {market.govSupport.keyPrograms.map(p => (
                        <div key={p.name} className={`text-xs px-2 py-1 rounded-lg ${colors.badge}`}>
                          <span className="font-medium">{p.name}</span>
                          <span className="ml-1 opacity-80">{p.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Year Timeline */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            年別 政策詳細タイムライン
          </h2>
          <div className="space-y-2">
            {reversedPolicies.map(policy => (
              <div key={policy.year} className="glass rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedYear(expandedYear === policy.year ? null : policy.year)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-black gradient-text">{policy.year}</div>
                    <div className="text-left">
                      <div className="font-bold text-white">{policy.overallTheme}</div>
                      <div className="text-sm text-slate-400">{policy.cabinet}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex gap-1">
                      {Object.entries(policy.themePresence)
                        .filter(([, v]) => v.priority !== 'none')
                        .slice(0, 4)
                        .map(([themeId]) => {
                          const theme = themeMap[themeId]
                          return theme ? (
                            <span key={themeId} className="text-sm">{theme.icon}</span>
                          ) : null
                        })}
                    </div>
                    {expandedYear === policy.year
                      ? <ChevronUp className="w-4 h-4 text-slate-400" />
                      : <ChevronDown className="w-4 h-4 text-slate-400" />
                    }
                  </div>
                </button>

                {expandedYear === policy.year && (
                  <div className="px-4 pb-4 border-t border-white/5">
                    <p className="text-sm text-slate-400 mt-3 mb-4 leading-relaxed">
                      {policy.economicContext}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(policy.themePresence)
                        .filter(([, v]) => v.priority !== 'none')
                        .sort(([, a], [, b]) => {
                          const order = { top: 0, high: 1, medium: 2, none: 3 }
                          return order[a.priority] - order[b.priority]
                        })
                        .map(([themeId, presence]) => {
                          const theme = themeMap[themeId]
                          if (!theme) return null
                          const color = THEME_COLOR_MAP[themeId] || 'blue'
                          const colors = COLOR_CLASSES[color]
                          const pConfig = PRIORITY_CONFIG[presence.priority]
                          return (
                            <div key={themeId} className={`rounded-lg p-3 ${colors.bg} border ${colors.border}`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-white">
                                  {theme.icon} {theme.title}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{
                                  backgroundColor: `${pConfig.color}30`,
                                  color: pConfig.color,
                                }}>
                                  {pConfig.label}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">{presence.description}</p>
                              {presence.budgetTrend !== 'na' && (
                                <div className="mt-1">
                                  <BudgetTrendBadge trend={presence.budgetTrend} />
                                </div>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Investment Insight */}
        <div className="glass rounded-xl p-6 border border-blue-400/20">
          <h2 className="text-lg font-bold mb-3 text-blue-400">投資への示唆</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-300 leading-relaxed">
            <div>
              <div className="font-bold text-white mb-1">継続政策（低リスク）</div>
              <p>医療・介護・少子化対策は20年以上継続。人口動態が根拠のため政権交代に左右されにくく、長期安定投資として有効。</p>
            </div>
            <div>
              <div className="font-bold text-white mb-1">加速政策（高リターン期待）</div>
              <p>AI・半導体・防衛・経済安保は2022年以降に急加速。予算規模の伸びが最大で、政策効果が株価に最も強く反映される。</p>
            </div>
            <div>
              <div className="font-bold text-white mb-1">モメンタム銘柄の見極め</div>
              <p>「最重要」指定が続くテーマは予算が大規模・継続的に流入。テーマ内でも直接受益企業（一次受益）を優先する。</p>
            </div>
            <div>
              <div className="font-bold text-white mb-1">政権交代リスク</div>
              <p>GX・観光は政権によって温度差あり。一方、半導体・防衛は超党派の支持を得ており政策の継続性が高い。</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}

function MomentumBadge({ momentum }: { momentum: string }) {
  if (momentum === 'accelerating') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-400/20 text-green-400">
        <TrendingUp className="w-3 h-3" />
        加速中
      </span>
    )
  }
  if (momentum === 'declining') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-400/20 text-red-400">
        <TrendingDown className="w-3 h-3" />
        減速
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-400/20 text-slate-400">
      <Minus className="w-3 h-3" />
      安定
    </span>
  )
}

function BudgetTrendBadge({ trend }: { trend: string }) {
  const config: Record<string, { label: string; color: string }> = {
    surge:    { label: '予算急増', color: 'text-green-400' },
    increase: { label: '予算増加', color: 'text-blue-400' },
    stable:   { label: '予算横ばい', color: 'text-slate-400' },
    decrease: { label: '予算削減', color: 'text-red-400' },
    na:       { label: '', color: '' },
  }
  const c = config[trend]
  if (!c?.label) return null
  return <span className={`text-xs ${c.color}`}>📊 {c.label}</span>
}
