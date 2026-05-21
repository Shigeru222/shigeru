import { NextRequest, NextResponse } from 'next/server'
import { getMarketResearch, getAllMarketResearch } from '@/lib/stock/market-research'

export async function GET(request: NextRequest) {
  const themeId = request.nextUrl.searchParams.get('themeId')
  if (themeId) {
    const data = getMarketResearch(themeId)
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  }
  return NextResponse.json({ data: getAllMarketResearch() })
}
