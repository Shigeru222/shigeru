import { NextResponse } from 'next/server'
import { ANNUAL_POLICIES, getAllThemeContinuity } from '@/lib/stock/historical-policies'

export async function GET() {
  const continuity = getAllThemeContinuity()
  return NextResponse.json({
    policies: ANNUAL_POLICIES,
    continuity,
    yearRange: { start: 2001, end: 2024 },
  })
}
