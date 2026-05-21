import { NextRequest, NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

const yf = new YahooFinance()

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')
  if (!ticker) return NextResponse.json({ error: 'Ticker required' }, { status: 400 })

  try {
    const summary = await yf.quoteSummary(ticker, {
      modules: [
        'assetProfile',
        'majorHoldersBreakdown',
        'institutionOwnership',
        'incomeStatementHistory',
        'financialData',
        'defaultKeyStatistics',
      ],
    })

    // 株主構成
    const holders = summary.majorHoldersBreakdown
    const institutions = summary.institutionOwnership?.ownershipList?.slice(0, 5) ?? []
    const shareholderComposition = {
      insidersPercent: holders?.insidersPercentHeld
        ? Math.round(holders.insidersPercentHeld * 1000) / 10
        : null,
      institutionsPercent: holders?.institutionsPercentHeld
        ? Math.round(holders.institutionsPercentHeld * 1000) / 10
        : null,
      floatPercent: holders?.institutionsFloatPercentHeld
        ? Math.round(holders.institutionsFloatPercentHeld * 1000) / 10
        : null,
      topInstitutions: institutions.map(inst => ({
        name: inst.organization ?? '',
        percent: inst.pctHeld ? Math.round(inst.pctHeld * 1000) / 10 : 0,
        shares: inst.position ?? 0,
        reportDate: inst.reportDate
          ? new Date(inst.reportDate).toLocaleDateString('ja-JP')
          : null,
      })),
    }

    // 会社プロフィール
    const profile = summary.assetProfile
    const companyProfile = {
      employees: profile?.fullTimeEmployees ?? null,
      website: profile?.website ?? null,
      sector: profile?.sector ?? null,
      industry: profile?.industry ?? null,
      country: profile?.country ?? null,
      description: profile?.longBusinessSummary ?? null,
      address: [profile?.address1, profile?.city, profile?.country]
        .filter(Boolean)
        .join(', ') || null,
    }

    // 過去5年の業績（incomeStatementHistory は4〜5期分）
    const stmts = summary.incomeStatementHistory?.incomeStatementHistory ?? []
    const fiveYearPerformance = stmts
      .slice(0, 5)
      .map(s => ({
        date: s.endDate
          ? new Date(s.endDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' })
          : '不明',
        revenue: s.totalRevenue ?? null,
        operatingIncome: s.operatingIncome ?? null,
        netIncome: s.netIncome ?? null,
        eps: (s as unknown as Record<string, number | null>).basicEPS ?? null,
        grossProfit: s.grossProfit ?? null,
      }))
      .reverse() // 古い順

    // 財務指標の補足
    const fin = summary.financialData
    const stats = summary.defaultKeyStatistics
    const additionalMetrics = {
      revenueGrowth: fin?.revenueGrowth
        ? Math.round(fin.revenueGrowth * 1000) / 10
        : null,
      grossMargins: fin?.grossMargins
        ? Math.round(fin.grossMargins * 1000) / 10
        : null,
      operatingMargins: fin?.operatingMargins
        ? Math.round(fin.operatingMargins * 1000) / 10
        : null,
      profitMargins: fin?.profitMargins
        ? Math.round(fin.profitMargins * 1000) / 10
        : null,
      sharesOutstanding: stats?.sharesOutstanding ?? null,
      bookValue: stats?.bookValue ?? null,
      forwardPE: stats?.forwardPE ?? null,
    }

    return NextResponse.json({
      ticker,
      shareholderComposition,
      companyProfile,
      fiveYearPerformance,
      additionalMetrics,
    })
  } catch (error) {
    console.error('Company detail error:', error)
    return NextResponse.json({ error: 'Failed to fetch company details' }, { status: 500 })
  }
}
