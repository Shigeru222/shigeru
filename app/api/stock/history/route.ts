import { NextRequest, NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')
  const period = request.nextUrl.searchParams.get('period') || '3m'
  if (!ticker) return NextResponse.json({ error: 'Ticker required' }, { status: 400 })

  const periodMap: Record<string, { startDate: string }> = {
    '1m': { startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    '3m': { startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    '6m': { startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    '1y': { startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    '3y': { startDate: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  }

  try {
    const { startDate } = periodMap[period] || periodMap['3m']
    const history = await yahooFinance.historical(ticker, {
      period1: startDate,
      interval: period === '3y' ? '1wk' : '1d',
    })

    const data = history.map(h => ({
      date: h.date.toISOString().split('T')[0],
      open: h.open,
      high: h.high,
      low: h.low,
      close: h.close,
      volume: h.volume,
    }))

    return NextResponse.json({ history: data })
  } catch (error) {
    console.error('History error:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
