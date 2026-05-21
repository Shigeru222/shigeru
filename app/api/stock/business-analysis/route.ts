import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(request: NextRequest) {
  const body = await request.json()
  const {
    ticker,
    companyName,
    sector,
    industry,
    description,
    employees,
    marketCap,
    revenueGrowth,
    operatingMargins,
    website,
  } = body

  const prompt = `あなたは事業分析の専門家です。以下の企業について、投資家・社会の視点から「事業の本質」を深く分析してください。

## 分析対象
- ティッカー: ${ticker}
- 企業名: ${companyName}
- セクター: ${sector || '不明'}
- 業種: ${industry || '不明'}
- 従業員数: ${employees ? Number(employees).toLocaleString('ja-JP') + '人' : '不明'}
- 時価総額: ${marketCap ? (Number(marketCap) / 1e9).toFixed(0) + '億円' : '不明'}
- 売上成長率: ${revenueGrowth ? Number(revenueGrowth).toFixed(1) + '%' : '不明'}
- 営業利益率: ${operatingMargins ? Number(operatingMargins).toFixed(1) + '%' : '不明'}
- 事業概要: ${description ? String(description).substring(0, 600) : '不明'}

## 分析の視点
1. **社会課題の解決**: この企業が取り組む具体的な社会課題は何か。それは重要か。
2. **価値提供の構造**: BtoCなら生活者に、BtoBなら取引先企業に、BtoGなら行政・公共に、どのような具体的価値を届けているか。
3. **解決アプローチ**: 技術・ビジネスモデル・ネットワーク等のどの手段で課題に取り組んでいるか。
4. **競争優位（モート）**: なぜ他社が容易に真似できないのか。
5. **成長トリガー**: 今後3〜5年で業績・株価を動かす具体的な事象は何か。

## 出力形式（必ずJSONのみを出力）
{
  "businessType": "<事業タイプ一言説明（20字以内）>",
  "oneLiner": "<事業の本質を一文で（50字以内、投資家向け）>",
  "socialChallenges": [
    {
      "challenge": "<社会課題名（20字以内）>",
      "severity": "<critical|high|medium>",
      "description": "<課題の具体的内容（80字以内）>",
      "scale": "<課題の規模感（市場規模・影響人口等、40字以内）>"
    }
  ],
  "valuePropositions": [
    {
      "target": "<価値提供対象（30字以内）>",
      "businessModel": "<BtoC|BtoB|BtoB2C|BtoG|その他>",
      "coreValue": "<中核的な価値（50字以内）>",
      "specificBenefits": ["<具体的ベネフィット1>", "<具体的ベネフィット2>", "<具体的ベネフィット3>"],
      "differentiator": "<競合との差別化（60字以内）>"
    }
  ],
  "solutionApproach": "<どのように解決するか（技術・ビジネスモデル面、150字以内）>",
  "moat": "<競争優位の源泉（経済的堀、80字以内）>",
  "growthCatalysts": ["<成長トリガー1（40字以内）>", "<成長トリガー2>", "<成長トリガー3>"],
  "esgHighlights": "<ESG・サステナビリティの観点（60字以内）>"
}

- socialChallengesは1〜3個（最も重要なものを選ぶ）
- valuePropositionsはビジネスモデルが異なる場合のみ複数。通常は1つ
- specificBenefitsは必ず3〜4項目、各40字以内で具体的に記述`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const analysis = JSON.parse(jsonMatch[0])
    analysis.ticker = ticker
    analysis.companyName = companyName

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Business analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
