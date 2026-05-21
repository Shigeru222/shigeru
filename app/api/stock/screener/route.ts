import { NextRequest, NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'
import { calculateAllBaseScores, calculateFinancialScore, applyScreenerFilter, ScreenerFilter } from '@/lib/stock/scoring'

const yf = new YahooFinance()

async function fetchFinancials(ticker: string) {
  try {
    const [quote, summary] = await Promise.all([
      yf.quote(ticker),
      yf.quoteSummary(ticker, {
        modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData'],
      }).catch(() => null),
    ])
    return {
      price: quote.regularMarketPrice ?? undefined,
      changePercent: quote.regularMarketChangePercent ?? undefined,
      per: summary?.summaryDetail?.trailingPE ?? quote.trailingPE ?? undefined,
      pbr: summary?.defaultKeyStatistics?.priceToBook ?? undefined,
      roe: summary?.financialData?.returnOnEquity != null
        ? summary.financialData.returnOnEquity * 100
        : undefined,
      marketCap: quote.marketCap ?? undefined,
      dividendYield: summary?.summaryDetail?.dividendYield != null
        ? summary.summaryDetail.dividendYield * 100
        : undefined,
    }
  } catch {
    return null
  }
}

// Fetch financials in batches to respect Yahoo Finance rate limits
async function fetchInBatches(tickers: string[], batchSize = 5, delayMs = 300) {
  const results: Record<string, Awaited<ReturnType<typeof fetchFinancials>>> = {}
  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(t => fetchFinancials(t)))
    batch.forEach((t, idx) => { results[t] = batchResults[idx] })
    if (i + batchSize < tickers.length) {
      await new Promise(r => setTimeout(r, delayMs))
    }
  }
  return results
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const filter: ScreenerFilter = {
    themeIds: body.themeIds ?? [],
    benefitTypes: body.benefitTypes ?? [],
    marketCapTiers: body.marketCapTiers ?? [],
    minRoe: body.minRoe,
    maxPer: body.maxPer,
    maxPbr: body.maxPbr,
    minScore: body.minScore,
  }
  const fetchLive = body.fetchLive !== false  // default true

  // 1. Calculate base scores for all candidates
  const baseScores = calculateAllBaseScores(filter.themeIds.length ? filter.themeIds : undefined)

  // 2. Apply non-financial filters first to reduce Yahoo Finance calls
  const preFiltered = applyScreenerFilter(baseScores, {
    ...filter,
    minRoe: undefined,   // apply after fetching
    maxPer: undefined,
    maxPbr: undefined,
  })

  // 3. Fetch live financial data (cap at 60 stocks to keep response fast)
  const candidates = preFiltered.slice(0, 60)
  let finalScores = candidates

  if (fetchLive) {
    const tickers = candidates.map(s => s.ticker)
    const financials = await fetchInBatches(tickers, 5, 250)
    finalScores = candidates.map(score => {
      const fin = financials[score.ticker]
      return fin ? calculateFinancialScore(score, fin) : score
    })
  }

  // 4. Apply financial filters and re-sort
  const results = applyScreenerFilter(finalScores, {
    themeIds: [],
    benefitTypes: [],
    marketCapTiers: [],
    minRoe: filter.minRoe,
    maxPer: filter.maxPer,
    maxPbr: filter.maxPbr,
    minScore: filter.minScore,
  }).sort((a, b) => b.scores.total - a.scores.total)

  return NextResponse.json({
    results: results.slice(0, 50),
    total: results.length,
    fetchedLive: fetchLive,
  })
}
