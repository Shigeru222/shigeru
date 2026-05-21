export interface StockQuote {
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  per?: number        // PER
  pbr?: number        // PBR
  roe?: number        // ROE (%)
  dividendYield?: number
  sector?: string
  industry?: string
}

export interface HistoricalPrice {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface PolicyTheme {
  id: string
  title: string
  subtitle: string
  description: string
  keywords: string[]
  color: 'blue' | 'green' | 'purple' | 'cyan' | 'orange' | 'red' | 'pink' | 'yellow'
  icon: string
  representativeStocks: { ticker: string; name: string; reason: string }[]
}

export interface PolicyContinuity {
  themeId: string
  continuousYears: number
  totalScore: number
  maxPriority: 'top' | 'high' | 'medium' | 'none'
  recentMomentum: 'accelerating' | 'stable' | 'declining'
  avgScore: number
}

export interface PolicyAnalysis {
  ticker: string
  companyName: string
  overallScore: number          // 0-100
  futureScore: number           // 将来性スコア 0-100
  policyRelevance: {
    themeId: string
    themeTitle: string
    relevanceScore: number      // 0-100
    explanation: string
  }[]
  strengths: string[]
  risks: string[]
  summary: string
  recommendation: 'strong_buy' | 'buy' | 'neutral' | 'caution' | 'avoid'
  recommendationReason: string
}
