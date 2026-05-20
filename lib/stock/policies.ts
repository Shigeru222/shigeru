import { PolicyTheme } from './types'

export const POLICY_THEMES: PolicyTheme[] = [
  {
    id: 'ai-semiconductor',
    title: 'AI・半導体',
    subtitle: '次世代産業の基盤',
    description: '生成AI活用・半導体国内製造強化・TSMC誘致・AI人材育成による経済成長',
    keywords: ['AI', '人工知能', '半導体', 'TSMC', 'ラピダス', '量子コンピュータ'],
    color: 'blue',
    icon: '🤖',
    representativeStocks: [
      { ticker: '6857.T', name: 'アドバンテスト', reason: '半導体テスト装置の世界大手。AI向けHBMテスト需要急増' },
      { ticker: '8035.T', name: '東京エレクトロン', reason: '半導体製造装置の国内最大手。国策支援を受けて国内投資拡大' },
      { ticker: '6920.T', name: 'レーザーテック', reason: 'EUV対応検査装置で世界シェア独占。次世代半導体製造に不可欠' },
      { ticker: '4063.T', name: '信越化学工業', reason: '半導体シリコンウェーハで世界首位。供給安定化の恩恵大' },
    ]
  },
  {
    id: 'gx',
    title: 'グリーン・トランスフォーメーション（GX）',
    subtitle: '脱炭素・エネルギー転換',
    description: '2050年カーボンニュートラル実現。再生可能エネルギー・水素・EV・蓄電池への大規模投資',
    keywords: ['脱炭素', 'GX', '再生エネルギー', '水素', 'EV', '蓄電池', 'カーボンニュートラル'],
    color: 'green',
    icon: '🌿',
    representativeStocks: [
      { ticker: '6501.T', name: '日立製作所', reason: 'エネルギーマネジメント・再エネ関連インフラで国内最大手' },
      { ticker: '6702.T', name: '富士通', reason: 'GXデジタルソリューション・脱炭素支援サービスを展開' },
      { ticker: '5401.T', name: '日本製鉄', reason: '水素還元製鉄など革新的脱炭素技術の開発をリード' },
      { ticker: '7203.T', name: 'トヨタ自動車', reason: 'EV・水素FCV両軸で次世代モビリティをリード' },
    ]
  },
  {
    id: 'defense',
    title: '防衛・安全保障',
    subtitle: '防衛力の抜本的強化',
    description: '防衛費の対GDP2%目標。装備品の国産化・サイバー防衛・宇宙安全保障の強化',
    keywords: ['防衛', '安全保障', '自衛隊', 'サイバー防衛', '装備品', '国産化'],
    color: 'red',
    icon: '🛡️',
    representativeStocks: [
      { ticker: '7011.T', name: '三菱重工業', reason: '防衛装備品の主要メーカー。戦闘機・艦艇を手掛ける' },
      { ticker: '6632.T', name: 'JVCケンウッド', reason: '通信機器・防衛電子機器で防衛省向け安定受注' },
      { ticker: '6814.T', name: '古野電気', reason: '自衛隊向け電子機器・レーダーシステムの実績あり' },
      { ticker: '7012.T', name: '川崎重工業', reason: '潜水艦・ヘリコプターなど幅広い防衛装備を製造' },
    ]
  },
  {
    id: 'digital-gov',
    title: 'デジタル・行政DX',
    subtitle: '行政・社会のデジタル化',
    description: 'デジタル庁主導の行政DX。マイナンバー活用・電子政府・スマートシティ推進',
    keywords: ['DX', 'デジタル化', 'マイナンバー', 'スマートシティ', '行政DX', 'クラウド'],
    color: 'purple',
    icon: '💻',
    representativeStocks: [
      { ticker: '4307.T', name: '野村総合研究所', reason: '官公庁向けITシステム構築・行政DX支援で圧倒的実績' },
      { ticker: '3626.T', name: 'TIS', reason: 'デジタル政府・自治体DX支援を積極展開' },
      { ticker: '9432.T', name: 'NTT', reason: '政府DXインフラ・ネットワーク整備の中核を担う' },
      { ticker: '9433.T', name: 'KDDI', reason: '5G展開・自治体DX支援・スマートシティ事業を推進' },
    ]
  },
  {
    id: 'healthcare',
    title: '医療・介護・ヘルスケア',
    subtitle: '社会保障の持続可能性',
    description: '高齢化対応・医療DX・創薬支援・介護ロボット・予防医療への重点投資',
    keywords: ['医療', '介護', 'ヘルスケア', '創薬', '医療DX', '高齢化', '予防医療'],
    color: 'cyan',
    icon: '🏥',
    representativeStocks: [
      { ticker: '4502.T', name: '武田薬品工業', reason: 'グローバル製薬大手。政府の創薬支援政策の中心的受益者' },
      { ticker: '6869.T', name: 'シスメックス', reason: '体外診断機器の世界大手。医療DX・検査自動化でリード' },
      { ticker: '7741.T', name: 'HOYA', reason: '内視鏡・医療機器分野で国際競争力を持つ' },
      { ticker: '4519.T', name: '中外製薬', reason: 'AI創薬・バイオ医薬品で革新的新薬を開発' },
    ]
  },
  {
    id: 'childcare',
    title: '少子化対策・子育て支援',
    subtitle: '人口減少への対応',
    description: '異次元の少子化対策。育児支援・保育充実・教育費無償化・不妊治療支援への大規模予算配分',
    keywords: ['少子化', '子育て', '保育', '教育', '育児', '人口減少'],
    color: 'pink',
    icon: '👶',
    representativeStocks: [
      { ticker: '2181.T', name: 'テンプホールディングス', reason: '保育・教育施設運営・人材派遣で少子化対策関連需要を取り込む' },
      { ticker: '4751.T', name: 'サイバーエージェント', reason: 'アベマTV等の子ども向けコンテンツ・EdTech分野を強化' },
      { ticker: '9468.T', name: 'KADOKAWA', reason: '教育コンテンツ・学習教材事業で成長' },
      { ticker: '3697.T', name: 'SHIFT', reason: 'IT人材育成・研修事業で人的資本投資の恩恵を受ける' },
    ]
  },
  {
    id: 'tourism',
    title: '観光・インバウンド',
    subtitle: '訪日客2000万人超時代',
    description: '観光立国推進。インバウンド消費拡大・地方観光資源活用・MICE誘致・宿泊施設整備',
    keywords: ['観光', 'インバウンド', '訪日', 'MICE', '地方創生', 'ホテル'],
    color: 'orange',
    icon: '✈️',
    representativeStocks: [
      { ticker: '9603.T', name: 'エイチ・アイ・エス', reason: 'インバウンド・アウトバウンド旅行の大手。訪日客回復で業績急伸' },
      { ticker: '9706.T', name: '日本空港ビルデング', reason: '羽田空港の免税・商業施設運営。インバウンド拡大の直接受益者' },
      { ticker: '9104.T', name: '商船三井', reason: 'クルーズ船事業でインバウンド観光需要を取り込む' },
      { ticker: '6098.T', name: 'リクルートHD', reason: 'じゃらん・ホットペッパーで国内観光・飲食消費を支援' },
    ]
  },
  {
    id: 'economic-security',
    title: '経済安全保障',
    subtitle: 'サプライチェーン強靱化',
    description: '重要物資の国内生産・備蓄強化。重要インフラ防護・先端技術の流出防止',
    keywords: ['経済安保', 'サプライチェーン', '重要物資', 'レアメタル', '食料安全保障'],
    color: 'yellow',
    icon: '🔒',
    representativeStocks: [
      { ticker: '5713.T', name: '住友金属鉱山', reason: 'レアメタル・非鉄金属の国内最大手。資源安保強化の恩恵大' },
      { ticker: '2002.T', name: '日清製粉グループ本社', reason: '食料安全保障政策で国内製粉・食品の安定供給を担う' },
      { ticker: '4004.T', name: '昭和電工マテリアルズ', reason: '半導体材料・化学品の国産化強化に貢献' },
      { ticker: '6479.T', name: 'ミネベアミツミ', reason: '精密部品の国内生産強化。航空機・防衛向けにも展開' },
    ]
  },
]
