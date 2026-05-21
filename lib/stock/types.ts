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

export interface ManagementChallenge {
  title: string
  description: string
  impact: string
  priority: 'high' | 'medium' | 'low'
}

export interface PolicyAnalysis {
  ticker: string
  companyName: string
  overallScore: number
  futureScore: number
  policyRelevance: {
    themeId: string
    themeTitle: string
    relevanceScore: number
    explanation: string
  }[]
  strengths: string[]
  risks: string[]
  summary: string
  recommendation: 'strong_buy' | 'buy' | 'neutral' | 'caution' | 'avoid'
  recommendationReason: string
  managementChallenges?: ManagementChallenge[]
}

export interface AnnualPerformance {
  date: string
  revenue: number | null
  operatingIncome: number | null
  netIncome: number | null
  eps: number | null
  grossProfit: number | null
}

export interface ShareholderComposition {
  insidersPercent: number | null
  institutionsPercent: number | null
  floatPercent: number | null
  topInstitutions: {
    name: string
    percent: number
    shares: number
    reportDate: string | null
  }[]
}

export interface CompanyDetail {
  ticker: string
  shareholderComposition: ShareholderComposition
  companyProfile: {
    employees: number | null
    website: string | null
    sector: string | null
    industry: string | null
    country: string | null
    description: string | null
    address: string | null
  }
  fiveYearPerformance: AnnualPerformance[]
  additionalMetrics: {
    revenueGrowth: number | null
    grossMargins: number | null
    operatingMargins: number | null
    profitMargins: number | null
    sharesOutstanding: number | null
    bookValue: number | null
    forwardPE: number | null
  }
}
