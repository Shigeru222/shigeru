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

export interface SocialChallenge {
  challenge: string          // 社会課題の名称（20字以内）
  severity: 'critical' | 'high' | 'medium'
  description: string        // 課題の具体的内容（80字以内）
  scale: string              // 課題の規模感（市場規模・影響人口等、40字以内）
}

export interface ValueProposition {
  target: string             // 価値提供対象（顧客セグメント、30字以内）
  businessModel: 'BtoC' | 'BtoB' | 'BtoB2C' | 'BtoG' | 'その他'
  coreValue: string          // 中核的な価値（50字以内）
  specificBenefits: string[] // 具体的なベネフィット3〜4項目（各40字以内）
  differentiator: string     // 競合との差別化ポイント（60字以内）
}

export interface BusinessAnalysis {
  ticker: string
  companyName: string
  businessType: string       // 事業タイプの一言説明（例: 「半導体製造装置の専業メーカー」）
  socialChallenges: SocialChallenge[]   // 解決する社会課題（1〜3個）
  valuePropositions: ValueProposition[] // 価値提供（セグメント別、1〜3個）
  solutionApproach: string   // どのように解決するか（技術・ビジネスモデル面、150字以内）
  moat: string               // 競争優位の源泉（経済的堀、80字以内）
  growthCatalysts: string[]  // 成長の触媒となる事象・トリガー（3項目）
  esgHighlights: string      // ESG・サステナビリティの観点（60字以内）
  oneLiner: string           // 事業の本質を一文で（50字以内、投資家向け）
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
