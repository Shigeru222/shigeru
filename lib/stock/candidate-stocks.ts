export type BenefitType = 'primary' | 'secondary' | 'enabler'
// primary = 直接受益（政府調達・補助金の直接対象）
// secondary = 間接受益（需要増・市場拡大の恩恵）
// enabler = インフラ提供（政策実現を技術・サービスで支える）

export interface CandidateStock {
  ticker: string          // Yahoo Finance format, e.g. "7203.T"
  name: string            // Japanese company name
  themes: {
    themeId: string
    benefitType: BenefitType
    reason: string          // 30字以内: why this stock benefits from this theme
  }[]
  sector: string
  marketCapTier: 'large' | 'mid' | 'small'  // 大型(1兆円超)/中型(1000億〜1兆)/小型(1000億未満)
}

export const CANDIDATE_STOCKS: CandidateStock[] = [
  // ────────────────────────────────────────
  // AI・半導体
  // ────────────────────────────────────────
  {
    ticker: '6857.T',
    name: 'アドバンテスト',
    themes: [
      { themeId: 'ai-semiconductor', benefitType: 'primary', reason: 'AIチップ向けテスト装置で世界首位' },
    ],
    sector: '電気機器',
    marketCapTier: 'large',
  },
  {
    ticker: '8035.T',
    name: '東京エレクトロン',
    themes: [
      { themeId: 'ai-semiconductor', benefitType: 'primary', reason: '半導体製造装置国内最大手' },
      { themeId: 'economic-security', benefitType: 'secondary', reason: '国内半導体製造装置供給の要' },
    ],
    sector: '電気機器',
    marketCapTier: 'large',
  },
  {
    ticker: '6920.T',
    name: 'レーザーテック',
    themes: [
      { themeId: 'ai-semiconductor', benefitType: 'primary', reason: 'EUV検査装置で世界シェア独占' },
    ],
    sector: '電気機器',
    marketCapTier: 'large',
  },
  {
    ticker: '4063.T',
    name: '信越化学工業',
    themes: [
      { themeId: 'ai-semiconductor', benefitType: 'primary', reason: 'シリコンウェーハで世界首位' },
      { themeId: 'economic-security', benefitType: 'primary', reason: '半導体材料の国内安定供給' },
    ],
    sector: '化学',
    marketCapTier: 'large',
  },
  {
    ticker: '6146.T',
    name: 'ディスコ',
    themes: [
      { themeId: 'ai-semiconductor', benefitType: 'primary', reason: 'ウェーハ切断装置で世界高シェア' },
    ],
    sector: '電気機器',
    marketCapTier: 'large',
  },
  {
    ticker: '4369.T',
    name: 'トリケミカル研究所',
    themes: [
      { themeId: 'ai-semiconductor', benefitType: 'primary', reason: '先端半導体向け特殊ガス材料' },
    ],
    sector: '化学',
    marketCapTier: 'small',
  },
  {
    ticker: '6967.T',
    name: '新光電気工業',
    themes: [
      { themeId: 'ai-semiconductor', benefitType: 'primary', reason: 'AI半導体パッケージ基板' },
    ],
    sector: '電気機器',
    marketCapTier: 'mid',
  },
  {
    ticker: '6963.T',
    name: 'ローム',
    themes: [
      { themeId: 'ai-semiconductor', benefitType: 'secondary', reason: 'パワー半導体・SiC半導体拡大' },
      { themeId: 'gx', benefitType: 'secondary', reason: 'EV向けSiCパワー半導体需要増' },
    ],
    sector: '電気機器',
    marketCapTier: 'large',
  },
  {
    ticker: '6770.T',
    name: 'アルプスアルパイン',
    themes: [
      { themeId: 'ai-semiconductor', benefitType: 'secondary', reason: 'スマートデバイス向け電子部品' },
    ],
    sector: '電気機器',
    marketCapTier: 'mid',
  },
  {
    ticker: '4185.T',
    name: 'JSR',
    themes: [
      { themeId: 'ai-semiconductor', benefitType: 'primary', reason: '半導体フォトレジスト材料で世界大手' },
      { themeId: 'economic-security', benefitType: 'primary', reason: '先端半導体材料の国産化' },
    ],
    sector: '化学',
    marketCapTier: 'large',
  },
  {
    ticker: '6981.T',
    name: '村田製作所',
    themes: [
      { themeId: 'ai-semiconductor', benefitType: 'secondary', reason: 'AI機器向け積層セラミックコンデンサ' },
    ],
    sector: '電気機器',
    marketCapTier: 'large',
  },
  {
    ticker: '9984.T',
    name: 'ソフトバンクグループ',
    themes: [
      { themeId: 'ai-semiconductor', benefitType: 'secondary', reason: 'AI・半導体ベンチャーへの大規模投資' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'large',
  },
  {
    ticker: '4307.T',
    name: '野村総合研究所',
    themes: [
      { themeId: 'ai-semiconductor', benefitType: 'enabler', reason: 'AI活用ソリューション提供' },
      { themeId: 'digital-gov', benefitType: 'primary', reason: '官公庁SI・行政DX支援で実績' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'large',
  },
  {
    ticker: '6762.T',
    name: 'TDK',
    themes: [
      { themeId: 'ai-semiconductor', benefitType: 'secondary', reason: 'AI・IoT機器向け電子部品供給' },
      { themeId: 'gx', benefitType: 'secondary', reason: 'EV向け電池・電子部品の需要増' },
    ],
    sector: '電気機器',
    marketCapTier: 'large',
  },
  {
    ticker: '6723.T',
    name: 'ルネサスエレクトロニクス',
    themes: [
      { themeId: 'ai-semiconductor', benefitType: 'primary', reason: '車載マイコン・SoCの国内大手' },
      { themeId: 'economic-security', benefitType: 'primary', reason: '車載半導体の国産化・安定供給' },
    ],
    sector: '電気機器',
    marketCapTier: 'large',
  },
  {
    ticker: '4004.T',
    name: '昭和電工マテリアルズ',
    themes: [
      { themeId: 'ai-semiconductor', benefitType: 'primary', reason: '半導体研磨材・CMP材料' },
      { themeId: 'economic-security', benefitType: 'primary', reason: '半導体材料の国産化強化' },
    ],
    sector: '化学',
    marketCapTier: 'large',
  },
  {
    ticker: '4901.T',
    name: '富士フイルムHD',
    themes: [
      { themeId: 'ai-semiconductor', benefitType: 'primary', reason: '半導体材料・フォトマスク事業' },
      { themeId: 'economic-security', benefitType: 'primary', reason: '医薬品・半導体材料の国内製造強化' },
      { themeId: 'healthcare', benefitType: 'secondary', reason: 'バイオ医薬品CDMO・医療機器' },
    ],
    sector: '化学',
    marketCapTier: 'large',
  },
  {
    ticker: '2345.T',
    name: 'クォンタムソリューションズ',
    themes: [
      { themeId: 'ai-semiconductor', benefitType: 'enabler', reason: 'AI活用サービス・量子関連小型株' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'small',
  },
  {
    ticker: '6326.T',
    name: 'クボタ',
    themes: [
      { themeId: 'ai-semiconductor', benefitType: 'secondary', reason: '農機IoT・スマート農業DX' },
      { themeId: 'defense', benefitType: 'secondary', reason: '装甲車両・作業機械部品供給' },
    ],
    sector: '機械',
    marketCapTier: 'large',
  },
  {
    ticker: '6954.T',
    name: 'ファナック',
    themes: [
      { themeId: 'ai-semiconductor', benefitType: 'secondary', reason: '半導体工場向け精密ロボット' },
      { themeId: 'defense', benefitType: 'secondary', reason: '防衛製造ライン自動化機器' },
    ],
    sector: '電気機器',
    marketCapTier: 'large',
  },

  // ────────────────────────────────────────
  // GX（グリーン・トランスフォーメーション）
  // ────────────────────────────────────────
  {
    ticker: '6501.T',
    name: '日立製作所',
    themes: [
      { themeId: 'gx', benefitType: 'primary', reason: 'エネルギーマネジメント・再エネインフラ' },
      { themeId: 'digital-gov', benefitType: 'primary', reason: '官公庁・社会インフラDXで実績' },
      { themeId: 'economic-security', benefitType: 'primary', reason: '重要インフラ制御システム国内大手' },
    ],
    sector: '電気機器',
    marketCapTier: 'large',
  },
  {
    ticker: '7203.T',
    name: 'トヨタ自動車',
    themes: [
      { themeId: 'gx', benefitType: 'primary', reason: 'EV・水素FCV両軸で脱炭素をリード' },
      { themeId: 'economic-security', benefitType: 'secondary', reason: '国内自動車産業基盤の維持' },
    ],
    sector: '輸送用機器',
    marketCapTier: 'large',
  },
  {
    ticker: '7011.T',
    name: '三菱重工業',
    themes: [
      { themeId: 'gx', benefitType: 'primary', reason: 'ガスタービン・水素発電インフラ' },
      { themeId: 'defense', benefitType: 'primary', reason: '戦闘機・艦艇・ミサイル主要メーカー' },
    ],
    sector: '機械',
    marketCapTier: 'large',
  },
  {
    ticker: '9531.T',
    name: '東京ガス',
    themes: [
      { themeId: 'gx', benefitType: 'primary', reason: '水素・LNG活用でGX移行を牽引' },
    ],
    sector: 'ガス・電気事業',
    marketCapTier: 'large',
  },
  {
    ticker: '9501.T',
    name: '東京電力HD',
    themes: [
      { themeId: 'gx', benefitType: 'secondary', reason: '再エネ導入拡大・洋上風力開発' },
    ],
    sector: 'ガス・電気事業',
    marketCapTier: 'large',
  },
  {
    ticker: '9503.T',
    name: '関西電力',
    themes: [
      { themeId: 'gx', benefitType: 'secondary', reason: '原子力・再エネで低炭素電力供給' },
    ],
    sector: 'ガス・電気事業',
    marketCapTier: 'large',
  },
  {
    ticker: '5713.T',
    name: '住友金属鉱山',
    themes: [
      { themeId: 'gx', benefitType: 'secondary', reason: 'EV蓄電池向けニッケル・コバルト供給' },
      { themeId: 'economic-security', benefitType: 'primary', reason: 'レアメタル国内生産・資源権益確保' },
    ],
    sector: '非鉄金属',
    marketCapTier: 'large',
  },
  {
    ticker: '6302.T',
    name: '住友重機械工業',
    themes: [
      { themeId: 'gx', benefitType: 'enabler', reason: '省エネ設備・ギアモータで製造DX' },
    ],
    sector: '機械',
    marketCapTier: 'mid',
  },
  {
    ticker: '6674.T',
    name: 'GSユアサ',
    themes: [
      { themeId: 'gx', benefitType: 'primary', reason: '蓄電池・産業用バッテリー製造' },
      { themeId: 'economic-security', benefitType: 'secondary', reason: '蓄電池の国内生産強化' },
    ],
    sector: '電気機器',
    marketCapTier: 'mid',
  },
  {
    ticker: '4204.T',
    name: '積水化学工業',
    themes: [
      { themeId: 'gx', benefitType: 'enabler', reason: '断熱材・省エネ住宅資材で脱炭素' },
    ],
    sector: '化学',
    marketCapTier: 'large',
  },
  {
    ticker: '1605.T',
    name: 'INPEX',
    themes: [
      { themeId: 'gx', benefitType: 'secondary', reason: 'LNG・水素の安定供給でGX移行支援' },
      { themeId: 'economic-security', benefitType: 'primary', reason: '海外資源権益確保で食料・エネルギー安保' },
    ],
    sector: '石油・石炭製品',
    marketCapTier: 'large',
  },
  {
    ticker: '5020.T',
    name: 'ENEOSホールディングス',
    themes: [
      { themeId: 'gx', benefitType: 'secondary', reason: 'SAF・水素エネルギー事業展開' },
    ],
    sector: '石油・石炭製品',
    marketCapTier: 'large',
  },
  {
    ticker: '7012.T',
    name: '川崎重工業',
    themes: [
      { themeId: 'gx', benefitType: 'primary', reason: '水素インフラ・液化水素サプライチェーン' },
      { themeId: 'defense', benefitType: 'primary', reason: '潜水艦・ヘリコプター等幅広い防衛装備' },
    ],
    sector: '機械',
    marketCapTier: 'large',
  },
  {
    ticker: '1878.T',
    name: '大東建託',
    themes: [
      { themeId: 'gx', benefitType: 'enabler', reason: 'ZEH・省エネ住宅建設で脱炭素' },
    ],
    sector: '建設業',
    marketCapTier: 'large',
  },
  {
    ticker: '6703.T',
    name: 'OKIエンジニアリング',
    themes: [
      { themeId: 'gx', benefitType: 'enabler', reason: '再エネ機器の信頼性試験・計測' },
    ],
    sector: '電気機器',
    marketCapTier: 'small',
  },
  {
    ticker: '5401.T',
    name: '日本製鉄',
    themes: [
      { themeId: 'gx', benefitType: 'primary', reason: '水素還元製鉄で鉄鋼脱炭素をリード' },
      { themeId: 'economic-security', benefitType: 'secondary', reason: '国内鉄鋼生産基盤の維持強化' },
    ],
    sector: '鉄鋼',
    marketCapTier: 'large',
  },

  // ────────────────────────────────────────
  // 防衛・安全保障
  // ────────────────────────────────────────
  {
    ticker: '7013.T',
    name: 'IHI',
    themes: [
      { themeId: 'defense', benefitType: 'primary', reason: '戦闘機エンジン・防衛航空機部品' },
      { themeId: 'gx', benefitType: 'secondary', reason: 'ガスタービン・水素燃焼技術' },
      { themeId: 'economic-security', benefitType: 'secondary', reason: '航空機エンジン国産化の要' },
    ],
    sector: '機械',
    marketCapTier: 'large',
  },
  {
    ticker: '6706.T',
    name: '電気興業',
    themes: [
      { themeId: 'defense', benefitType: 'primary', reason: '防衛通信アンテナ・電子戦装備' },
    ],
    sector: '電気機器',
    marketCapTier: 'mid',
  },
  {
    ticker: '6814.T',
    name: '古野電気',
    themes: [
      { themeId: 'defense', benefitType: 'primary', reason: '自衛隊艦艇向けレーダー・航法機器' },
    ],
    sector: '電気機器',
    marketCapTier: 'mid',
  },
  {
    ticker: '6632.T',
    name: 'JVCケンウッド',
    themes: [
      { themeId: 'defense', benefitType: 'primary', reason: '防衛通信機器・野戦用システム' },
    ],
    sector: '電気機器',
    marketCapTier: 'mid',
  },
  {
    ticker: '6701.T',
    name: 'NEC',
    themes: [
      { themeId: 'defense', benefitType: 'primary', reason: '防衛電子システム・C4Iシステム構築' },
      { themeId: 'digital-gov', benefitType: 'primary', reason: '官公庁ITシステム・マイナ関連' },
      { themeId: 'economic-security', benefitType: 'primary', reason: '重要インフラ防護・サイバーセキュリティ' },
    ],
    sector: '電気機器',
    marketCapTier: 'large',
  },
  {
    ticker: '6702.T',
    name: '富士通',
    themes: [
      { themeId: 'defense', benefitType: 'primary', reason: '防衛省ITシステム・量子コンピュータ' },
      { themeId: 'digital-gov', benefitType: 'primary', reason: '行政DX・電子政府システム構築' },
    ],
    sector: '電気機器',
    marketCapTier: 'large',
  },
  {
    ticker: '7733.T',
    name: 'オリンパス',
    themes: [
      { themeId: 'defense', benefitType: 'enabler', reason: '精密光学技術が防衛機器に応用' },
      { themeId: 'healthcare', benefitType: 'primary', reason: '消化器内視鏡で世界市場をリード' },
    ],
    sector: '精密機器',
    marketCapTier: 'large',
  },
  {
    ticker: '5631.T',
    name: '日本製鋼所',
    themes: [
      { themeId: 'defense', benefitType: 'primary', reason: '砲身・装甲鋼板など防衛装備部材' },
      { themeId: 'economic-security', benefitType: 'secondary', reason: '特殊鋼・防衛材料の国内製造' },
    ],
    sector: '機械',
    marketCapTier: 'mid',
  },
  {
    ticker: '6586.T',
    name: 'マキタ',
    themes: [
      { themeId: 'defense', benefitType: 'enabler', reason: '防衛施設建設・野外作業ツール' },
      { themeId: 'economic-security', benefitType: 'secondary', reason: '国内製造基盤・工具産業の維持' },
    ],
    sector: '電気機器',
    marketCapTier: 'large',
  },
  {
    ticker: '4062.T',
    name: 'イビデン',
    themes: [
      { themeId: 'defense', benefitType: 'secondary', reason: '高機能プリント基板が防衛電子に利用' },
      { themeId: 'ai-semiconductor', benefitType: 'primary', reason: 'AI半導体向け高密度パッケージ基板' },
    ],
    sector: '電気機器',
    marketCapTier: 'large',
  },
  {
    ticker: '6503.T',
    name: '三菱電機',
    themes: [
      { themeId: 'defense', benefitType: 'primary', reason: 'レーダー・防衛電子システム製造' },
      { themeId: 'economic-security', benefitType: 'primary', reason: '重要インフラ制御システム国内首位' },
    ],
    sector: '電気機器',
    marketCapTier: 'large',
  },
  {
    ticker: '7762.T',
    name: 'シチズン時計',
    themes: [
      { themeId: 'defense', benefitType: 'secondary', reason: '精密機械加工技術が防衛部品に応用' },
      { themeId: 'healthcare', benefitType: 'secondary', reason: '医療機器用精密部品の製造' },
    ],
    sector: '精密機器',
    marketCapTier: 'mid',
  },

  // ────────────────────────────────────────
  // デジタル・行政DX
  // ────────────────────────────────────────
  {
    ticker: '3626.T',
    name: 'TIS',
    themes: [
      { themeId: 'digital-gov', benefitType: 'primary', reason: '自治体DX・官公庁システム開発' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'large',
  },
  {
    ticker: '9432.T',
    name: 'NTT',
    themes: [
      { themeId: 'digital-gov', benefitType: 'primary', reason: '政府DXインフラ・ガバメントクラウド' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'large',
  },
  {
    ticker: '4684.T',
    name: 'オービック',
    themes: [
      { themeId: 'digital-gov', benefitType: 'primary', reason: '自治体・官公庁向けERP・会計' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'large',
  },
  {
    ticker: '3697.T',
    name: 'SHIFT',
    themes: [
      { themeId: 'digital-gov', benefitType: 'secondary', reason: '行政システムの品質保証・QA' },
      { themeId: 'childcare', benefitType: 'secondary', reason: 'IT人材育成・研修事業の拡大' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'large',
  },
  {
    ticker: '4776.T',
    name: 'サイボウズ',
    themes: [
      { themeId: 'digital-gov', benefitType: 'enabler', reason: '自治体グループウェアkintone普及' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'mid',
  },
  {
    ticker: '9613.T',
    name: 'NTTデータグループ',
    themes: [
      { themeId: 'digital-gov', benefitType: 'primary', reason: '官公庁・中央省庁システム受注筆頭' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'large',
  },
  {
    ticker: '6752.T',
    name: 'パナソニックHD',
    themes: [
      { themeId: 'digital-gov', benefitType: 'secondary', reason: '行政窓口・電子政府端末供給' },
      { themeId: 'gx', benefitType: 'secondary', reason: 'EV向け電池・省エネ家電製造' },
    ],
    sector: '電気機器',
    marketCapTier: 'large',
  },
  {
    ticker: '4689.T',
    name: 'LINEヤフー',
    themes: [
      { themeId: 'digital-gov', benefitType: 'secondary', reason: 'マイナポータル・行政連携サービス' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'large',
  },
  {
    ticker: '3774.T',
    name: 'インターネットイニシアティブ',
    themes: [
      { themeId: 'digital-gov', benefitType: 'enabler', reason: '政府クラウド・行政ネットワーク構築' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'mid',
  },
  {
    ticker: '4053.T',
    name: 'SBテクノロジー',
    themes: [
      { themeId: 'digital-gov', benefitType: 'enabler', reason: '自治体クラウド移行・セキュリティ' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'small',
  },
  {
    ticker: '4768.T',
    name: '大塚商会',
    themes: [
      { themeId: 'digital-gov', benefitType: 'secondary', reason: '自治体IT機器・ソフト一括調達' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'large',
  },
  {
    ticker: '3994.T',
    name: 'マネーフォワード',
    themes: [
      { themeId: 'digital-gov', benefitType: 'enabler', reason: '公会計DX・電子帳票管理' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'mid',
  },
  {
    ticker: '4686.T',
    name: 'ジャストシステム',
    themes: [
      { themeId: 'digital-gov', benefitType: 'enabler', reason: '電子文書・行政向けソフトウェア' },
      { themeId: 'childcare', benefitType: 'primary', reason: '学習ソフト「スマイルゼミ」でEdTech' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'mid',
  },
  {
    ticker: '9433.T',
    name: 'KDDI',
    themes: [
      { themeId: 'digital-gov', benefitType: 'secondary', reason: '5G展開・自治体DX支援事業' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'large',
  },

  // ────────────────────────────────────────
  // 医療・介護・ヘルスケア
  // ────────────────────────────────────────
  {
    ticker: '4502.T',
    name: '武田薬品工業',
    themes: [
      { themeId: 'healthcare', benefitType: 'primary', reason: '政府の創薬支援政策の中心的受益者' },
    ],
    sector: '医薬品',
    marketCapTier: 'large',
  },
  {
    ticker: '6869.T',
    name: 'シスメックス',
    themes: [
      { themeId: 'healthcare', benefitType: 'primary', reason: '体外診断機器・医療DX検査を牽引' },
    ],
    sector: '精密機器',
    marketCapTier: 'large',
  },
  {
    ticker: '7741.T',
    name: 'HOYA',
    themes: [
      { themeId: 'healthcare', benefitType: 'primary', reason: '内視鏡・眼内レンズで医療機器大手' },
    ],
    sector: '精密機器',
    marketCapTier: 'large',
  },
  {
    ticker: '4519.T',
    name: '中外製薬',
    themes: [
      { themeId: 'healthcare', benefitType: 'primary', reason: 'AI創薬・バイオ抗体医薬で革新' },
    ],
    sector: '医薬品',
    marketCapTier: 'large',
  },
  {
    ticker: '4507.T',
    name: '塩野義製薬',
    themes: [
      { themeId: 'healthcare', benefitType: 'secondary', reason: '感染症薬・創薬支援政策の恩恵' },
    ],
    sector: '医薬品',
    marketCapTier: 'large',
  },
  {
    ticker: '2413.T',
    name: 'エムスリー',
    themes: [
      { themeId: 'healthcare', benefitType: 'primary', reason: '医師向けプラットフォーム・医療DX' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'large',
  },
  {
    ticker: '3831.T',
    name: 'メドレー',
    themes: [
      { themeId: 'healthcare', benefitType: 'primary', reason: '電子カルテ・医療DXのSaaS大手' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'mid',
  },
  {
    ticker: '4523.T',
    name: 'エーザイ',
    themes: [
      { themeId: 'healthcare', benefitType: 'secondary', reason: 'アルツハイマー治療薬で世界需要増' },
    ],
    sector: '医薬品',
    marketCapTier: 'large',
  },
  {
    ticker: '4543.T',
    name: 'テルモ',
    themes: [
      { themeId: 'healthcare', benefitType: 'primary', reason: '医療機器・血管治療デバイス大手' },
    ],
    sector: '精密機器',
    marketCapTier: 'large',
  },
  {
    ticker: '4588.T',
    name: 'オンコリスバイオファーマ',
    themes: [
      { themeId: 'healthcare', benefitType: 'primary', reason: 'バイオ創薬・がん免疫療法ベンチャー' },
    ],
    sector: '医薬品',
    marketCapTier: 'small',
  },
  {
    ticker: '2432.T',
    name: 'DeNA',
    themes: [
      { themeId: 'healthcare', benefitType: 'secondary', reason: 'PHR・個人健康管理サービス事業' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'mid',
  },
  {
    ticker: '6315.T',
    name: 'TOWA',
    themes: [
      { themeId: 'healthcare', benefitType: 'enabler', reason: '半導体封止装置は医療機器製造に利用' },
      { themeId: 'ai-semiconductor', benefitType: 'primary', reason: '半導体封止装置で高シェア' },
    ],
    sector: '機械',
    marketCapTier: 'small',
  },
  {
    ticker: '3038.T',
    name: '神戸物産',
    themes: [
      { themeId: 'healthcare', benefitType: 'enabler', reason: '健康食品・業務スーパーで食支援' },
    ],
    sector: '小売業',
    marketCapTier: 'large',
  },
  {
    ticker: '9832.T',
    name: 'オートバックスセブン',
    themes: [
      { themeId: 'healthcare', benefitType: 'enabler', reason: '車内・モビリティ医療サービス展開' },
    ],
    sector: '小売業',
    marketCapTier: 'mid',
  },
  {
    ticker: '7011.T',
    name: '三菱重工業',
    themes: [],  // 既にgx/defenseで定義済み
    sector: '機械',
    marketCapTier: 'large',
  },

  // ────────────────────────────────────────
  // 少子化対策・子育て支援
  // ────────────────────────────────────────
  {
    ticker: '2181.T',
    name: 'テンプホールディングス',
    themes: [
      { themeId: 'childcare', benefitType: 'primary', reason: '保育士・教育人材の派遣で直接受益' },
    ],
    sector: 'サービス業',
    marketCapTier: 'large',
  },
  {
    ticker: '4751.T',
    name: 'サイバーエージェント',
    themes: [
      { themeId: 'childcare', benefitType: 'secondary', reason: 'AbemaTV等子ども向けEdTech強化' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'large',
  },
  {
    ticker: '9468.T',
    name: 'KADOKAWA',
    themes: [
      { themeId: 'childcare', benefitType: 'secondary', reason: '教育コンテンツ・学習教材事業' },
      { themeId: 'tourism', benefitType: 'secondary', reason: 'アニメ・コンテンツがインバウンド誘引' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'large',
  },
  {
    ticker: '2170.T',
    name: 'リンクアンドモチベーション',
    themes: [
      { themeId: 'childcare', benefitType: 'enabler', reason: 'HR・組織開発で働き方改革支援' },
    ],
    sector: 'サービス業',
    marketCapTier: 'mid',
  },
  {
    ticker: '2928.T',
    name: 'RIZAPグループ',
    themes: [
      { themeId: 'childcare', benefitType: 'secondary', reason: '健康・育児支援サービスの展開' },
    ],
    sector: 'サービス業',
    marketCapTier: 'small',
  },
  {
    ticker: '4371.T',
    name: 'コアコンセプト・テクノロジー',
    themes: [
      { themeId: 'childcare', benefitType: 'enabler', reason: 'HRtech・人材管理DXで保育業界支援' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'small',
  },
  {
    ticker: '2326.T',
    name: 'デジタルアーツ',
    themes: [
      { themeId: 'childcare', benefitType: 'enabler', reason: '子ども向けWebフィルタリング提供' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'small',
  },
  {
    ticker: '9696.T',
    name: 'ウィザスホールディングス',
    themes: [
      { themeId: 'childcare', benefitType: 'primary', reason: '学習塾・教育サービス事業で直接受益' },
    ],
    sector: 'サービス業',
    marketCapTier: 'small',
  },
  {
    ticker: '4268.T',
    name: 'エストHD',
    themes: [
      { themeId: 'childcare', benefitType: 'enabler', reason: '保育所ICT化・管理システム提供' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'small',
  },
  {
    ticker: '2462.T',
    name: 'ライク',
    themes: [
      { themeId: 'childcare', benefitType: 'primary', reason: '保育士・介護士の人材派遣大手' },
    ],
    sector: 'サービス業',
    marketCapTier: 'mid',
  },
  {
    ticker: '3276.T',
    name: '日本管理センター',
    themes: [
      { themeId: 'childcare', benefitType: 'secondary', reason: 'ファミリー・子育て向け賃貸住宅管理' },
    ],
    sector: '不動産業',
    marketCapTier: 'small',
  },
  {
    ticker: '4368.T',
    name: '扶桑薬品工業',
    themes: [
      { themeId: 'childcare', benefitType: 'secondary', reason: '乳幼児向け医薬品・衛生品の需要増' },
    ],
    sector: '医薬品',
    marketCapTier: 'small',
  },
  {
    ticker: '9437.T',
    name: 'NTTドコモ',
    themes: [
      { themeId: 'childcare', benefitType: 'secondary', reason: '子ども向けスマートフォン・見守りサービス' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'large',
  },
  {
    ticker: '4783.T',
    name: 'NSDグループ',
    themes: [
      { themeId: 'childcare', benefitType: 'secondary', reason: '教育機関向けシステム開発' },
    ],
    sector: '情報・通信業',
    marketCapTier: 'small',
  },

  // ────────────────────────────────────────
  // 観光・インバウンド
  // ────────────────────────────────────────
  {
    ticker: '9603.T',
    name: 'エイチ・アイ・エス',
    themes: [
      { themeId: 'tourism', benefitType: 'primary', reason: 'インバウンド・旅行代理店で直接受益' },
    ],
    sector: 'サービス業',
    marketCapTier: 'mid',
  },
  {
    ticker: '9706.T',
    name: '日本空港ビルデング',
    themes: [
      { themeId: 'tourism', benefitType: 'primary', reason: '羽田空港免税・商業施設の直接受益者' },
    ],
    sector: 'サービス業',
    marketCapTier: 'large',
  },
  {
    ticker: '9104.T',
    name: '商船三井',
    themes: [
      { themeId: 'tourism', benefitType: 'secondary', reason: 'クルーズ船事業でインバウンド観光' },
      { themeId: 'economic-security', benefitType: 'primary', reason: '海上輸送・物流の安全保障確保' },
    ],
    sector: '海運業',
    marketCapTier: 'large',
  },
  {
    ticker: '6098.T',
    name: 'リクルートホールディングス',
    themes: [
      { themeId: 'tourism', benefitType: 'secondary', reason: 'じゃらん・ホットペッパーで観光消費支援' },
    ],
    sector: 'サービス業',
    marketCapTier: 'large',
  },
  {
    ticker: '9007.T',
    name: '小田急電鉄',
    themes: [
      { themeId: 'tourism', benefitType: 'secondary', reason: '箱根観光路線で訪日客輸送増加' },
    ],
    sector: '陸運業',
    marketCapTier: 'large',
  },
  {
    ticker: '9009.T',
    name: '京成電鉄',
    themes: [
      { themeId: 'tourism', benefitType: 'primary', reason: '成田空港アクセス路線で訪日客直接輸送' },
    ],
    sector: '陸運業',
    marketCapTier: 'large',
  },
  {
    ticker: '9008.T',
    name: '京王電鉄',
    themes: [
      { themeId: 'tourism', benefitType: 'secondary', reason: '都内・高尾山観光路線でインバウンド増加' },
    ],
    sector: '陸運業',
    marketCapTier: 'large',
  },
  {
    ticker: '9201.T',
    name: '日本航空',
    themes: [
      { themeId: 'tourism', benefitType: 'primary', reason: '訪日客・日本発観光客輸送で直接受益' },
    ],
    sector: '空運業',
    marketCapTier: 'large',
  },
  {
    ticker: '9202.T',
    name: 'ANAホールディングス',
    themes: [
      { themeId: 'tourism', benefitType: 'primary', reason: '訪日客輸送・国際線拡張で直接受益' },
    ],
    sector: '空運業',
    marketCapTier: 'large',
  },
  {
    ticker: '8136.T',
    name: 'サンリオ',
    themes: [
      { themeId: 'tourism', benefitType: 'secondary', reason: 'キャラクターコンテンツがインバウンド誘引' },
    ],
    sector: '小売業',
    marketCapTier: 'large',
  },
  {
    ticker: '9726.T',
    name: 'KNTCT',
    themes: [
      { themeId: 'tourism', benefitType: 'primary', reason: '旅行代理店・インバウンド取扱い拡大' },
    ],
    sector: 'サービス業',
    marketCapTier: 'mid',
  },
  {
    ticker: '9616.T',
    name: '共立メンテナンス',
    themes: [
      { themeId: 'tourism', benefitType: 'primary', reason: 'ドーミーイン等ホテル・学生寮運営' },
    ],
    sector: 'サービス業',
    marketCapTier: 'large',
  },
  {
    ticker: '4666.T',
    name: 'パーク24',
    themes: [
      { themeId: 'tourism', benefitType: 'secondary', reason: '観光地周辺駐車・レンタカーで需要増' },
    ],
    sector: 'サービス業',
    marketCapTier: 'mid',
  },
  {
    ticker: '6758.T',
    name: 'ソニーグループ',
    themes: [
      { themeId: 'tourism', benefitType: 'secondary', reason: 'アニメ・コンテンツIPがインバウンド誘引' },
      { themeId: 'ai-semiconductor', benefitType: 'secondary', reason: 'イメージセンサーでAI・スマートフォン市場' },
    ],
    sector: '電気機器',
    marketCapTier: 'large',
  },
  {
    ticker: '3328.T',
    name: 'BEAMS',
    themes: [
      { themeId: 'tourism', benefitType: 'secondary', reason: 'インバウンド消費・和製ファッション人気' },
    ],
    sector: '小売業',
    marketCapTier: 'small',
  },

  // ────────────────────────────────────────
  // 経済安全保障
  // ────────────────────────────────────────
  {
    ticker: '6479.T',
    name: 'ミネベアミツミ',
    themes: [
      { themeId: 'economic-security', benefitType: 'primary', reason: '精密小型モータ・部品の国産化強化' },
      { themeId: 'defense', benefitType: 'secondary', reason: '航空機・防衛装備向け精密部品' },
    ],
    sector: '電気機器',
    marketCapTier: 'large',
  },
  {
    ticker: '2002.T',
    name: '日清製粉グループ本社',
    themes: [
      { themeId: 'economic-security', benefitType: 'primary', reason: '国内製粉・食料安全保障の担い手' },
    ],
    sector: '食料品',
    marketCapTier: 'large',
  },
  {
    ticker: '2212.T',
    name: '山崎製パン',
    themes: [
      { themeId: 'economic-security', benefitType: 'secondary', reason: '食料安定供給・国内製パン産業維持' },
    ],
    sector: '食料品',
    marketCapTier: 'large',
  },
  {
    ticker: '5411.T',
    name: 'JFEホールディングス',
    themes: [
      { themeId: 'economic-security', benefitType: 'secondary', reason: '国内鉄鋼生産基盤の維持強化' },
    ],
    sector: '鉄鋼',
    marketCapTier: 'large',
  },
  {
    ticker: '5714.T',
    name: 'DOWAホールディングス',
    themes: [
      { themeId: 'economic-security', benefitType: 'primary', reason: 'レアメタルリサイクル・国内精錬' },
    ],
    sector: '非鉄金属',
    marketCapTier: 'mid',
  },
  {
    ticker: '2875.T',
    name: '東洋水産',
    themes: [
      { themeId: 'economic-security', benefitType: 'secondary', reason: '食料安保・水産・加工食品の国内供給' },
    ],
    sector: '食料品',
    marketCapTier: 'mid',
  },
  {
    ticker: '9101.T',
    name: '日本郵船',
    themes: [
      { themeId: 'economic-security', benefitType: 'primary', reason: '海上輸送安保・重要物資の安定輸送' },
    ],
    sector: '海運業',
    marketCapTier: 'large',
  },
]

// 三菱重工業は複数テーマに登場するので、統合エントリーとして正規化
// CANDIDATE_STOCKS内の三菱重工業の空themesエントリを削除し、
// 正規化済みの単一エントリを保証するため、重複tickerをマージした最終リストを生成

function mergeDuplicates(stocks: CandidateStock[]): CandidateStock[] {
  const map = new Map<string, CandidateStock>()

  for (const stock of stocks) {
    // 空themesのダミーエントリはスキップ
    if (stock.themes.length === 0) continue

    const existing = map.get(stock.ticker)
    if (!existing) {
      map.set(stock.ticker, { ...stock, themes: [...stock.themes] })
    } else {
      // themeIdの重複を避けてマージ
      const existingThemeIds = new Set(existing.themes.map(t => t.themeId))
      for (const theme of stock.themes) {
        if (!existingThemeIds.has(theme.themeId)) {
          existing.themes.push(theme)
          existingThemeIds.add(theme.themeId)
        }
      }
    }
  }

  return Array.from(map.values())
}

// 三菱重工業の正規エントリー（全テーマをまとめて定義）
const MITSUBISHI_HEAVY: CandidateStock = {
  ticker: '7011.T',
  name: '三菱重工業',
  themes: [
    { themeId: 'gx', benefitType: 'primary', reason: 'ガスタービン・水素発電インフラ' },
    { themeId: 'defense', benefitType: 'primary', reason: '戦闘機・艦艇・ミサイル主要メーカー' },
  ],
  sector: '機械',
  marketCapTier: 'large',
}

// 重複除去前の生データ（MITSUBISHI_HEAVYの空エントリを排除）
const RAW_STOCKS = CANDIDATE_STOCKS.filter(s => s.ticker !== '7011.T')
RAW_STOCKS.push(MITSUBISHI_HEAVY)

export const CANDIDATE_STOCKS_MERGED: CandidateStock[] = mergeDuplicates(RAW_STOCKS)

export function getCandidatesByTheme(themeId: string): CandidateStock[] {
  return CANDIDATE_STOCKS_MERGED.filter(stock =>
    stock.themes.some(t => t.themeId === themeId)
  )
}

export function getCandidatesByThemes(themeIds: string[]): CandidateStock[] {
  if (themeIds.length === 0) return CANDIDATE_STOCKS_MERGED
  const idSet = new Set(themeIds)
  return CANDIDATE_STOCKS_MERGED.filter(stock =>
    stock.themes.some(t => idSet.has(t.themeId))
  )
}
