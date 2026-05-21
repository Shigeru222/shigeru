import { NextRequest, NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

const yf = new YahooFinance()

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')
  if (!ticker) return NextResponse.json({ error: 'Ticker required' }, { status: 400 })

  try {
    const [quote, summary] = await Promise.all([
      yf.quote(ticker),
      yf.quoteSummary(ticker, {
        modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData', 'assetProfile']
      }).catch(() => null)
    ])

    const data = {
      ticker,
      name: quote.longName || quote.shortName || ticker,
      price: quote.regularMarketPrice ?? 0,
      change: quote.regularMarketChange ?? 0,
      changePercent: quote.regularMarketChangePercent ?? 0,
      volume: quote.regularMarketVolume ?? 0,
      marketCap: quote.marketCap,
      per: summary?.summaryDetail?.trailingPE ?? quote.trailingPE,
      pbr: summary?.defaultKeyStatistics?.priceToBook,
      roe: summary?.financialData?.returnOnEquity
        ? (summary.financialData.returnOnEquity * 100)
        : undefined,
      dividendYield: summary?.summaryDetail?.dividendYield
        ? (summary.summaryDetail.dividendYield * 100)
        : undefined,
      sector: summary?.assetProfile?.sector,
      industry: summary?.assetProfile?.industry,
      country: summary?.assetProfile?.country,
      website: summary?.assetProfile?.website,
      description: summary?.assetProfile?.longBusinessSummary,
      currency: quote.currency,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      averageVolume: quote.averageDailyVolume3Month,
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Quote error:', error)
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 })
  }
}
