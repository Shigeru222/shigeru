import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { POLICY_THEMES } from '@/lib/stock/policies'
import { getAllThemeContinuity } from '@/lib/stock/historical-policies'

const client = new Anthropic()

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { ticker, companyName, sector, industry, description, per, pbr, roe, marketCap } = body

  const continuity = getAllThemeContinuity()
  const continuityMap = Object.fromEntries(continuity.map(c => [c.themeId, c]))

  const themesOverview = POLICY_THEMES.map(t => {
    const c = continuityMap[t.id]
    const momentumLabel = c?.recentMomentum === 'accelerating' ? '⬆加速中' : c?.recentMomentum === 'declining' ? '⬇減速' : '→安定'
    return `- ${t.title} (id: ${t.id}): ${t.description}\n  継続年数:${c?.continuousYears ?? 0}年 モメンタム:${momentumLabel} 最高優先度:${c?.maxPriority ?? 'none'}`
  }).join('\n')

  const prompt = `あなたは株式投資の専門家アナリストです。以下の企業を「日本政府の骨太の方針2001〜2024年（20年以上の歴史的文脈）」に照らして分析し、国策銘柄としての中長期的な将来性を評価してください。

## 重要な分析視点（20年の政策史から）
- 政策継続性: 長期間にわたって重要テーマとされてきたか（継続年数・累積優先度）
- 政策モメンタム: 近年加速しているか（2022〜2024年の優先度上昇幅）
- 予算規模: 国家予算・民間投資の動員規模（GX経済移行債20兆円、防衛費倍増等）
- 市場規模の裏付け: 政策が実需・市場成長と合致しているか

## 分析対象企業
- ティッカー: ${ticker}
- 企業名: ${companyName}
- セクター: ${sector || '不明'}
- 業種: ${industry || '不明'}
- PER: ${per ? Number(per).toFixed(1) + '倍' : '不明'}
- PBR: ${pbr ? Number(pbr).toFixed(2) + '倍' : '不明'}
- ROE: ${roe ? Number(roe).toFixed(1) + '%' : '不明'}
- 時価総額: ${marketCap ? (Number(marketCap) / 1e9).toFixed(0) + '億円' : '不明'}
- 事業内容: ${description ? String(description).substring(0, 500) : '不明'}

## 骨太の方針 テーマ別 政策継続性データ（2001〜2024年）
${themesOverview}

## 出力形式（必ずJSON形式のみを出力。前後に説明文を入れないこと）
{
  "overallScore": <総合評価スコア 0-100の整数>,
  "futureScore": <将来性スコア 0-100の整数>,
  "policyRelevance": [
    {
      "themeId": "<上記テーマのid>",
      "themeTitle": "<テーマ名>",
      "relevanceScore": <関連性スコア 0-100の整数>,
      "explanation": "<50字以内の説明>"
    }
  ],
  "strengths": ["<強み1>", "<強み2>", "<強み3>"],
  "risks": ["<リスク1>", "<リスク2>"],
  "summary": "<100字以内の総合評価>",
  "recommendation": "<strong_buy|buy|neutral|caution|avoid>",
  "recommendationReason": "<50字以内の推奨理由>"
}

relevanceScoreが30以上のテーマのみpolicyRelevanceに含めてください。`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const analysis = JSON.parse(jsonMatch[0])
    analysis.ticker = ticker
    analysis.companyName = companyName

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Analyze error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
