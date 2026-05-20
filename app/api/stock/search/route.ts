import { NextRequest, NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')
  if (!query) return NextResponse.json({ results: [] })

  try {
    const results = await yahooFinance.search(query, {
      newsCount: 0,
      quotesCount: 10,
    })

    // Filter for Japanese stocks primarily (but allow others)
    const quotes = results.quotes
      .filter(q => q.quoteType === 'EQUITY' || q.quoteType === 'ETF')
      .slice(0, 8)
      .map(q => ({
        ticker: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchange,
        type: q.quoteType,
      }))

    return NextResponse.json({ results: quotes })
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
