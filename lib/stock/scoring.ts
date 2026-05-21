import { getAllThemeContinuity } from './historical-policies'
import { getAllMarketResearch } from './market-research'
import { CANDIDATE_STOCKS_MERGED, CandidateStock, BenefitType } from './candidate-stocks'
import { POLICY_THEMES } from './policies'

export interface StockScore {
  ticker: string
  name: string
  themes: CandidateStock['themes']
  sector: string
  marketCapTier: string

  // Score breakdown
  scores: {
    policyDirectness: number    // 0-35
    policyContinuity: number    // 0-25
    financialHealth: number     // 0-25 (filled in after Yahoo Finance data)
    marketGrowth: number        // 0-15
    total: number               // sum
  }

  // Score explanations
  scoreDetails: {
    policyDirectnessReason: string
    policyContinuityReason: string
    financialHealthReason: string
    marketGrowthReason: string
  }

  // Financial data (filled by screener API)
  financials?: {
    price?: number
    changePercent?: number
    per?: number
    pbr?: number
    roe?: number
    marketCap?: number
    dividendYield?: number
  }

  // Whether financial data has been populated
  financialDataAvailable: boolean

  // Best theme for this stock
  primaryThemeId: string
  primaryThemeTitle: string
  topBenefit: string
}

export interface ScreenerFilter {
  themeIds: string[]          // empty = all themes
  benefitTypes: BenefitType[] // empty = all types
  marketCapTiers: string[]    // empty = all sizes
  minRoe?: number             // minimum ROE %
  maxPer?: number             // maximum PER
  maxPbr?: number             // maximum PBR
  minScore?: number           // minimum total score
}

// ─────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────

/**
 * Determine the "primary" (highest-impact) theme entry for a stock.
 * Priority order: primary > secondary > enabler.
 * When tied, prefer the theme that appears first in the themes array.
 */
function pickPrimaryThemeEntry(stock: CandidateStock): CandidateStock['themes'][number] {
  const rank: Record<BenefitType, number> = { primary: 3, secondary: 2, enabler: 1 }
  return [...stock.themes].sort((a, b) => rank[b.benefitType] - rank[a.benefitType])[0]
}

/**
 * Calculate policyDirectness score (0-35).
 *
 * - primary  → 35 pts base
 * - secondary → 22 pts base
 * - enabler  → 14 pts base
 * - Appears in 2+ themes → +5 bonus (capped at 35)
 */
function calcPolicyDirectness(stock: CandidateStock): { score: number; reason: string } {
  const benefitRank: Record<BenefitType, number> = { primary: 35, secondary: 22, enabler: 14 }
  const primaryEntry = pickPrimaryThemeEntry(stock)
  const base = benefitRank[primaryEntry.benefitType]
  const multiThemeBonus = stock.themes.length >= 2 ? 5 : 0
  const score = Math.min(35, base + multiThemeBonus)

  const typeLabelMap: Record<BenefitType, string> = {
    primary: '直接受益',
    secondary: '間接受益',
    enabler: 'インフラ提供',
  }
  const bonusText = multiThemeBonus > 0 ? `、${stock.themes.length}テーマ出現で+5` : ''
  const reason = `${typeLabelMap[primaryEntry.benefitType]}(${base}点)${bonusText} → ${score}点`

  return { score, reason }
}

/**
 * Extract the highest CAGR percentage number mentioned in a CAGR string.
 * Returns null if no number is found.
 *
 * Examples:
 *  "半導体市場全体: 約10%/年、AI半導体: 約25〜30%/年" → 30
 *  "訪日客数: コロナ前から年率5〜10%成長軌道に復帰"   → 10
 */
function extractMaxCagr(cagrStr: string): number | null {
  // Match all numeric values (including decimals) that appear before a % sign
  const matches = cagrStr.match(/(\d+(?:\.\d+)?)\s*%/g)
  if (!matches || matches.length === 0) return null

  const values = matches.map(m => parseFloat(m.replace('%', '').trim()))
  return Math.max(...values)
}

/**
 * Calculate marketGrowth score (0-15) from the CAGR string in MARKET_RESEARCH.
 */
function calcMarketGrowth(themeId: string): { score: number; reason: string } {
  const research = getAllMarketResearch().find(r => r.themeId === themeId)
  if (!research) {
    return { score: 2, reason: '市場調査データなし（デフォルト2点）' }
  }

  const maxCagr = extractMaxCagr(research.growth.cagr)
  if (maxCagr === null) {
    return { score: 2, reason: `CAGR数値取得不可（デフォルト2点）: ${research.growth.cagr}` }
  }

  let score: number
  let label: string
  if (maxCagr >= 25) {
    score = 15
    label = `CAGR ${maxCagr}%（≥25%）→ 15点`
  } else if (maxCagr >= 15) {
    score = 12
    label = `CAGR ${maxCagr}%（≥15%）→ 12点`
  } else if (maxCagr >= 10) {
    score = 8
    label = `CAGR ${maxCagr}%（≥10%）→ 8点`
  } else if (maxCagr >= 5) {
    score = 4
    label = `CAGR ${maxCagr}%（≥5%）→ 4点`
  } else {
    score = 2
    label = `CAGR ${maxCagr}%（<5%）→ 2点`
  }

  return { score, reason: label }
}

/**
 * Calculate policyContinuity score (0-25) for a given themeId.
 */
function calcPolicyContinuity(themeId: string): { score: number; reason: string } {
  const continuities = getAllThemeContinuity()
  const continuity = continuities.find(c => c.themeId === themeId)

  if (!continuity) {
    return { score: 5, reason: '政策継続データなし（デフォルト5点）' }
  }

  const { continuousYears, recentMomentum } = continuity

  let base: number
  let label: string
  if (continuousYears >= 20) {
    base = 25
    label = `継続${continuousYears}年（≥20年）→ 25点`
  } else if (continuousYears >= 15) {
    base = 20
    label = `継続${continuousYears}年（≥15年）→ 20点`
  } else if (continuousYears >= 10) {
    base = 15
    label = `継続${continuousYears}年（≥10年）→ 15点`
  } else if (continuousYears >= 5) {
    base = 10
    label = `継続${continuousYears}年（≥5年）→ 10点`
  } else {
    base = 5
    label = `継続${continuousYears}年（<5年）→ 5点`
  }

  let momentumAdj = 0
  let momentumLabel = ''
  if (recentMomentum === 'accelerating') {
    momentumAdj = 3
    momentumLabel = '、直近加速中+3'
  } else if (recentMomentum === 'declining') {
    momentumAdj = -3
    momentumLabel = '、直近減速中-3'
  }

  const score = Math.max(0, Math.min(25, base + momentumAdj))
  const reason = `${label}${momentumLabel}、最終${score}点`

  return { score, reason }
}

/**
 * Calculate financialHealth score (0-25) from actual financial data.
 * When data is unavailable, returns 12 (placeholder).
 */
function calcFinancialHealth(financials?: StockScore['financials']): {
  score: number
  reason: string
  dataAvailable: boolean
} {
  if (!financials || (financials.roe === undefined && financials.pbr === undefined && financials.per === undefined)) {
    return {
      score: 12,
      reason: '財務データ未取得（プレースホルダー12点）',
      dataAvailable: false,
    }
  }

  // ROE (0-12)
  let roeScore = 1
  let roeLabel = 'ROE: データなし(1点)'
  if (financials.roe !== undefined) {
    if (financials.roe >= 20) { roeScore = 12; roeLabel = `ROE ${financials.roe.toFixed(1)}%（≥20%）12点` }
    else if (financials.roe >= 15) { roeScore = 9; roeLabel = `ROE ${financials.roe.toFixed(1)}%（≥15%）9点` }
    else if (financials.roe >= 10) { roeScore = 6; roeLabel = `ROE ${financials.roe.toFixed(1)}%（≥10%）6点` }
    else if (financials.roe >= 5) { roeScore = 3; roeLabel = `ROE ${financials.roe.toFixed(1)}%（≥5%）3点` }
    else { roeScore = 1; roeLabel = `ROE ${financials.roe.toFixed(1)}%（<5%）1点` }
  }

  // PBR (0-7)
  let pbrScore = 1
  let pbrLabel = 'PBR: データなし(1点)'
  if (financials.pbr !== undefined) {
    if (financials.pbr <= 1.5) { pbrScore = 7; pbrLabel = `PBR ${financials.pbr.toFixed(2)}倍（≤1.5）7点` }
    else if (financials.pbr <= 3) { pbrScore = 5; pbrLabel = `PBR ${financials.pbr.toFixed(2)}倍（≤3）5点` }
    else if (financials.pbr <= 5) { pbrScore = 3; pbrLabel = `PBR ${financials.pbr.toFixed(2)}倍（≤5）3点` }
    else { pbrScore = 1; pbrLabel = `PBR ${financials.pbr.toFixed(2)}倍（>5）1点` }
  }

  // PER (0-6)
  let perScore = 1
  let perLabel = 'PER: N/A(1点)'
  if (financials.per !== undefined && financials.per > 0) {
    if (financials.per <= 15) { perScore = 6; perLabel = `PER ${financials.per.toFixed(1)}倍（≤15）6点` }
    else if (financials.per <= 25) { perScore = 4; perLabel = `PER ${financials.per.toFixed(1)}倍（≤25）4点` }
    else if (financials.per <= 40) { perScore = 2; perLabel = `PER ${financials.per.toFixed(1)}倍（≤40）2点` }
    else { perScore = 1; perLabel = `PER ${financials.per.toFixed(1)}倍（>40）1点` }
  }

  const score = roeScore + pbrScore + perScore
  const reason = `${roeLabel} / ${pbrLabel} / ${perLabel} → 合計${score}点`

  return { score, reason, dataAvailable: true }
}

// ─────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────

/**
 * Calculate the base score for a stock (without actual financial data).
 *
 * @param stock - The candidate stock to score.
 * @param themeIds - Optional subset of themes to consider. If empty/undefined, uses the stock's primary theme.
 */
export function calculateBaseScore(stock: CandidateStock, themeIds?: string[]): StockScore {
  const primaryEntry = pickPrimaryThemeEntry(stock)

  // Determine which themeId to use for continuity/growth calculations.
  // If themeIds is provided and non-empty, prefer the first matching theme in priority order.
  let primaryThemeId = primaryEntry.themeId
  if (themeIds && themeIds.length > 0) {
    const matchingEntry = stock.themes
      .filter(t => themeIds.includes(t.themeId))
      .sort((a, b) => {
        const rank: Record<BenefitType, number> = { primary: 3, secondary: 2, enabler: 1 }
        return rank[b.benefitType] - rank[a.benefitType]
      })[0]
    if (matchingEntry) primaryThemeId = matchingEntry.themeId
  }

  const policyTheme = POLICY_THEMES.find(pt => pt.id === primaryThemeId)
  const primaryThemeTitle = policyTheme?.title ?? primaryThemeId

  const directness = calcPolicyDirectness(stock)
  const continuity = calcPolicyContinuity(primaryThemeId)
  const financial = calcFinancialHealth(undefined)
  const growth = calcMarketGrowth(primaryThemeId)

  const total = directness.score + continuity.score + financial.score + growth.score

  return {
    ticker: stock.ticker,
    name: stock.name,
    themes: stock.themes,
    sector: stock.sector,
    marketCapTier: stock.marketCapTier,
    scores: {
      policyDirectness: directness.score,
      policyContinuity: continuity.score,
      financialHealth: financial.score,
      marketGrowth: growth.score,
      total,
    },
    scoreDetails: {
      policyDirectnessReason: directness.reason,
      policyContinuityReason: continuity.reason,
      financialHealthReason: financial.reason,
      marketGrowthReason: growth.reason,
    },
    financialDataAvailable: false,
    primaryThemeId,
    primaryThemeTitle,
    topBenefit: primaryEntry.reason,
  }
}

/**
 * Recalculate the financialHealth portion of a score using actual Yahoo Finance data.
 * Returns a new StockScore with updated financials and total.
 */
export function calculateFinancialScore(
  score: StockScore,
  financials: StockScore['financials'],
): StockScore {
  const financial = calcFinancialHealth(financials)

  const updatedScores = {
    ...score.scores,
    financialHealth: financial.score,
    total:
      score.scores.policyDirectness +
      score.scores.policyContinuity +
      financial.score +
      score.scores.marketGrowth,
  }

  return {
    ...score,
    financials,
    financialDataAvailable: financial.dataAvailable,
    scores: updatedScores,
    scoreDetails: {
      ...score.scoreDetails,
      financialHealthReason: financial.reason,
    },
  }
}

/**
 * Filter a list of StockScores by the given ScreenerFilter criteria.
 * Numeric filters (minRoe, maxPer, maxPbr) are only applied when financialDataAvailable is true.
 */
export function applyScreenerFilter(scores: StockScore[], filter: ScreenerFilter): StockScore[] {
  return scores.filter(score => {
    // Theme filter
    if (filter.themeIds.length > 0) {
      const themeSet = new Set(filter.themeIds)
      const hasMatchingTheme = score.themes.some(t => themeSet.has(t.themeId))
      if (!hasMatchingTheme) return false
    }

    // BenefitType filter
    if (filter.benefitTypes.length > 0) {
      const typeSet = new Set(filter.benefitTypes)
      const hasMatchingType = score.themes.some(t => typeSet.has(t.benefitType))
      if (!hasMatchingType) return false
    }

    // MarketCap tier filter
    if (filter.marketCapTiers.length > 0) {
      if (!filter.marketCapTiers.includes(score.marketCapTier)) return false
    }

    // Minimum total score
    if (filter.minScore !== undefined && score.scores.total < filter.minScore) return false

    // Financial filters — only applied when data is available
    if (score.financialDataAvailable && score.financials) {
      if (
        filter.minRoe !== undefined &&
        score.financials.roe !== undefined &&
        score.financials.roe < filter.minRoe
      ) return false

      if (
        filter.maxPer !== undefined &&
        score.financials.per !== undefined &&
        score.financials.per > filter.maxPer
      ) return false

      if (
        filter.maxPbr !== undefined &&
        score.financials.pbr !== undefined &&
        score.financials.pbr > filter.maxPbr
      ) return false
    }

    return true
  })
}

/**
 * Convenience: calculate base scores for all candidate stocks.
 * Optionally pass themeIds to scope the primary-theme resolution.
 */
export function calculateAllBaseScores(themeIds?: string[]): StockScore[] {
  return CANDIDATE_STOCKS_MERGED.map(stock => calculateBaseScore(stock, themeIds))
    .sort((a, b) => b.scores.total - a.scores.total)
}
