// 各国策テーマの市場調査データ
// 出典: 経済産業省・内閣府・業界団体各種報告書・調査会社レポートを基に整理

export interface MarketResearch {
  themeId: string

  // 市場規模
  marketSize: {
    japan: string           // 日本国内市場規模（現在）
    global: string          // 世界市場規模（現在）
    unit: string            // 単位の説明
  }

  // 成長性
  growth: {
    cagr: string            // 年平均成長率（CAGR）
    projectedSize: string   // 予測市場規模（目標年）
    projectedYear: number   // 目標年
    growthDrivers: string[] // 成長ドライバー
  }

  // 政府支援規模
  govSupport: {
    totalBudget: string     // 累積予算・投資規模
    keyPrograms: {
      name: string
      amount: string
      description: string
    }[]
  }

  // 市場の存在意義
  significance: {
    strategicReason: string   // 国家戦略上の理由
    socialNeed: string        // 社会的必要性
    internationalContext: string // 国際競争・地政学的文脈
  }

  // 主要プレイヤー・バリューチェーン
  ecosystem: {
    upstream: string[]      // 川上（材料・部品）
    midstream: string[]     // 川中（製造・開発）
    downstream: string[]    // 川下（システム・サービス）
  }

  // 投資機会サマリー
  investmentHighlight: string
}

export const MARKET_RESEARCH: MarketResearch[] = [
  {
    themeId: 'ai-semiconductor',
    marketSize: {
      japan: '約3兆円（半導体製造装置・材料を含む）',
      global: '約65兆円（半導体市場全体、2024年）',
      unit: '年間売上・市場規模ベース',
    },
    growth: {
      cagr: '半導体市場全体: 約10%/年、AI半導体: 約25〜30%/年',
      projectedSize: '世界半導体市場 約100兆円超（2030年）、AI半導体単独で30兆円超',
      projectedYear: 2030,
      growthDrivers: [
        '生成AI・大規模言語モデルの爆発的普及によるデータセンター投資急増',
        'EV・自動運転向け車載半導体の需要拡大',
        '経済安保政策による国内製造・供給網強靱化への大規模投資',
        'スマートフォン・IoT機器の高機能化',
      ],
    },
    govSupport: {
      totalBudget: '4兆円超（2021〜2030年 国内向け補助金・支援策合計）',
      keyPrograms: [
        { name: 'TSMC熊本工場（JASM）支援', amount: '約4,760億円', description: '第1・第2工場への補助金。国内最先端半導体生産拠点形成' },
        { name: 'ラピダス支援（2nm量産）', amount: '3,300億円以上', description: 'IBMとの連携で2027年量産目標。国産最先端半導体復活計画' },
        { name: '半導体・デジタル産業戦略', amount: '約10兆円（官民合計）', description: '経産省主導。2030年に国内半導体売上15兆円目標' },
      ],
    },
    significance: {
      strategicReason: '半導体は現代産業の「コメ」。先端半導体を外国依存すると経済・安全保障が根本から脆弱になる。米中対立の中で国産・友好国調達が急務。',
      socialNeed: 'AIによる医療診断・行政効率化・製造業DXなど、社会課題解決の基盤技術。量子コンピュータも含め次世代産業インフラ。',
      internationalContext: '米国CHIPS法（527億ドル）・EU半導体法（430億ユーロ）に対抗する形で日本も国産強化。TSMCの日本誘致は地政学的分散の観点から米国も支持。',
    },
    ecosystem: {
      upstream: ['信越化学（Siウェーハ）', 'JSR・住友化学（フォトレジスト）', 'レゾナック（研磨材）'],
      midstream: ['東京エレクトロン・SCREENHDs（製造装置）', 'アドバンテスト・テラダイン（テスト装置）', 'ラピダス・TSMC（製造）'],
      downstream: ['ソニー（イメージセンサー）', 'ルネサス（マイコン）', 'キオクシア（NAND）'],
    },
    investmentHighlight: '国家支援額が最大規模で、2025〜2030年にかけて投資が集中する。装置・材料メーカーは政策リスクが低く、AI半導体ブームの直接受益者として最も注目度が高い。',
  },

  {
    themeId: 'gx',
    marketSize: {
      japan: '再生エネ市場: 約5兆円、GX関連投資: 約20兆円/年（目標）',
      global: '再生エネ市場: 約150兆円（2030年目標）、脱炭素市場全体: 数百兆円規模',
      unit: '投資額・市場規模ベース',
    },
    growth: {
      cagr: '再生エネ: 約15%/年、蓄電池: 約25%/年、水素: 約30%/年（小規模スタート）',
      projectedSize: '日本のGX投資 150兆円（2023〜2050年官民合計）',
      projectedYear: 2050,
      growthDrivers: [
        '2050年カーボンニュートラル目標の達成義務',
        'GX経済移行債20兆円による官民投資誘発',
        'CO2排出コスト（カーボンプライシング）導入による市場圧力',
        '再エネ・蓄電池コスト急低下によるコスト競争力向上',
      ],
    },
    govSupport: {
      totalBudget: '20兆円（GX経済移行債、2023〜2032年）＋追加民間投資誘発',
      keyPrograms: [
        { name: 'GX経済移行債', amount: '20兆円', description: '2023〜2032年。再エネ・水素・蓄電池・原子力等への投資支援' },
        { name: '洋上風力産業戦略', amount: '累計10兆円規模（民間）', description: '2030年10GW・2040年30〜45GW目標。国内産業育成' },
        { name: 'CCS（炭素回収貯留）補助', amount: '数千億円', description: '2030年までの実証・商業化支援' },
      ],
    },
    significance: {
      strategicReason: '気候変動対応は国際的義務（パリ協定）であり、対応できない企業・国家は国際市場から排除されるリスク。日本の製造業輸出にとって脱炭素は「通行手形」。',
      socialNeed: '異常気象・エネルギー安全保障（化石燃料輸入依存脱却）・電気代上昇抑制の観点から、国民生活・産業基盤の維持に不可欠。',
      internationalContext: 'EU・米国・中国が先行投資。日本が遅れると製造業の国際競争力・輸出に直接影響。EUのCBAM（炭素国境調整メカニズム）対応も必須。',
    },
    ecosystem: {
      upstream: ['日本製鉄・神戸製鋼（水素製鉄）', 'トクヤマ・東洋炭素（素材）', '太陽電池材料各社'],
      midstream: ['三菱重工・日立（タービン・系統機器）', 'パナソニック・東芝（蓄電池）', '三菱商事・関西電力（洋上風力開発）'],
      downstream: ['東京電力HD・関西電力（電力）', 'レノバ・エネルギー開発（再エネ発電）', 'ENEOS・出光（水素・SAF供給）'],
    },
    investmentHighlight: 'GX経済移行債20兆円は2033年まで毎年2兆円規模。インフラ・電力・蓄電池が直接受益。2030〜2035年は市場拡大のピークで、早期参入企業の競争優位が確立される。',
  },

  {
    themeId: 'defense',
    marketSize: {
      japan: '約6兆円（2024年度防衛予算）→2027年度に約8〜9兆円へ',
      global: '約3,000兆円規模（世界の軍事費）',
      unit: '年間予算・支出ベース',
    },
    growth: {
      cagr: '日本の防衛費: 約15〜20%/年（2022〜2027年の急増期）',
      projectedSize: '約9兆円/年（2027〜2028年、対GDP2%達成時）',
      projectedYear: 2027,
      growthDrivers: [
        '対GDP比2%目標（2022年決定）による予算倍増計画',
        '台湾有事リスクへの対応、南西諸島防衛強化',
        '無人機・ミサイル・サイバー等の新領域防衛への投資',
        '防衛装備品の国産化・輸出解禁による産業振興',
      ],
    },
    govSupport: {
      totalBudget: '43兆円（2023〜2027年の5年間防衛力整備計画）',
      keyPrograms: [
        { name: '防衛力整備計画', amount: '43兆円（5年間）', description: '2023〜2027年。スタンドオフ防衛・無人アセット・宇宙・サイバー等' },
        { name: '防衛産業支援法', amount: '数千億円/年', description: '2023年成立。国内防衛産業の生産基盤維持・強化を支援' },
        { name: '次期戦闘機（F-X）開発', amount: '数兆円規模', description: '英伊との国際共同開発。2035年配備目標' },
      ],
    },
    significance: {
      strategicReason: '北朝鮮ミサイル・中国軍拡・ロシアウクライナ侵攻を受け、「防衛力の抜本的強化」が閣議決定。憲法解釈も変更し反撃能力を保有。',
      socialNeed: '国民の安全・主権・領土を守るための最低限の実力。自衛隊の装備老朽化が深刻で、更新需要だけで数十兆円規模。',
      internationalContext: 'NATO諸国のGDP2%目標が基準に。日本も2027年度達成を公約。日米同盟強化の文脈でも日本側の防衛投資拡大が求められている。',
    },
    ecosystem: {
      upstream: ['東邦チタニウム（素材）', 'IHI・川崎重工（エンジン）', 'NECスペーステクノロジー（衛星）'],
      midstream: ['三菱重工・川崎重工（艦艇・航空機）', '三菱電機（レーダー・C4I）', '東芝インフラシステムズ（通信）'],
      downstream: ['NEC・富士通（システム統合）', '日本電気（サイバーセキュリティ）', 'SUBARU（UH-X等）'],
    },
    investmentHighlight: '2023〜2027年は予算確定済みの「確実な成長市場」。防衛装備品は民需と異なり景気に左右されない。三菱重工は防衛売上高急増中で最も直接的な受益企業。',
  },

  {
    themeId: 'digital-gov',
    marketSize: {
      japan: 'IT公共市場: 約3兆円/年、DX市場全体: 約10兆円',
      global: 'GovTech市場: 約100兆円（2025年）',
      unit: '年間IT投資額ベース',
    },
    growth: {
      cagr: '官公庁IT投資: 約8%/年、クラウド移行: 約20%/年',
      projectedSize: '国内DX市場 約15兆円（2030年）',
      projectedYear: 2030,
      growthDrivers: [
        'デジタル庁主導の全省庁システムクラウド化（ガバメントクラウド）',
        'マイナンバー活用拡大（保険証・運転免許証・年金等）',
        '地方自治体の基幹系システム標準化（2026年移行完了目標）',
        '生成AI行政活用（議事録・文書作成・審査自動化）',
      ],
    },
    govSupport: {
      totalBudget: '年間約3,000〜4,000億円のデジタル庁予算 ＋ 各省庁IT予算',
      keyPrograms: [
        { name: 'ガバメントクラウド整備', amount: '数百億円/年', description: 'AWS・Google・Microsoft等を活用。全省庁システムをクラウドへ' },
        { name: '自治体システム標準化', amount: '約900億円', description: '2026年度末までに全国1,700自治体の基幹システムを統一仕様に' },
        { name: 'マイナンバー普及・活用', amount: '累計数千億円', description: 'カード普及促進から健康保険証・運転免許への機能拡張' },
      ],
    },
    significance: {
      strategicReason: '行政の非効率（紙・対面・縦割り）は競争力低下の根本原因。デジタル化で行政コスト削減・サービス向上・データ活用が可能になる。',
      socialNeed: 'コロナ給付金遅延・ワクチン接種混乱で露呈した行政DXの遅れ。給付の迅速化・行政窓口レスに向けて国民の期待も高い。',
      internationalContext: 'エストニア・韓国等の電子政府先進国に大幅に遅れていた日本が急追。デジタル競争力向上は企業誘致・スタートアップ育成にも直結。',
    },
    ecosystem: {
      upstream: ['AWS・Google・Microsoft（クラウドインフラ）', 'NTTデータ・富士通・NEC（SI）'],
      midstream: ['デジタルガバメント推進法人', '地方自治情報センター', 'SCSKら受託開発各社'],
      downstream: ['マイナポータル活用企業', 'e-Gov連携業者', 'Gビズ連携サービス'],
    },
    investmentHighlight: '自治体標準化2026年完了・ガバメントクラウド移行が直近の確定需要。野村総研・TIS等の官公庁系SIerが最も安定した恩恵を受ける。生成AI活用で第2波の需要も期待。',
  },

  {
    themeId: 'healthcare',
    marketSize: {
      japan: '医療市場: 約50兆円（国民医療費ベース）、ヘルスケア産業全体: 約26兆円',
      global: '医療機器市場: 約70兆円、製薬市場: 約200兆円',
      unit: '年間市場規模ベース',
    },
    growth: {
      cagr: '国内医療IT: 約10%/年、創薬支援（AI創薬）: 約15%/年、医療機器: 約5%/年',
      projectedSize: '国内ヘルスケア産業 約37兆円（2025年）、医療DX市場 急拡大',
      projectedYear: 2030,
      growthDrivers: [
        '高齢化の加速（2025年問題：団塊世代が75歳以上に）',
        '医療DX（電子カルテ標準化・電子処方箋・PHR活用）',
        'AI創薬の実用化（創薬コスト・期間の大幅短縮）',
        '介護ロボット・遠隔医療の普及',
      ],
    },
    govSupport: {
      totalBudget: '国民医療費: 約47兆円/年（大部分が公的資金）、医療DX推進に専用予算',
      keyPrograms: [
        { name: '医療DX推進本部', amount: '数百億円/年', description: '2022年設置。電子カルテ標準化・全国医療情報ネットワーク構築' },
        { name: 'ヘルスケア産業創出', amount: '約2,000億円', description: '次世代医療基盤法、PHR活用、AI医療機器承認迅速化' },
        { name: '創薬力強化', amount: '数千億円', description: 'AI創薬支援・バイオベンチャー育成・臨床試験環境整備' },
      ],
    },
    significance: {
      strategicReason: '医療は超高齢社会の根幹。2025年以降は団塊世代800万人が一斉に後期高齢者化し、医療・介護需要が爆発的に増加。対応失敗は社会保障崩壊につながる。',
      socialNeed: '医師・看護師不足、地域医療格差、医療費増大という構造問題を、DXとイノベーションで解決することが不可欠。',
      internationalContext: '日本の医療機器・製薬は輸出産業としての潜在力あり。AI創薬でグローバルで先行できれば兆円規模の市場獲得が可能。',
    },
    ecosystem: {
      upstream: ['シスメックス（検査機器）', '島津製作所（分析機器）', '武田薬品・中外製薬（製薬）'],
      midstream: ['HOYA（内視鏡・眼内レンズ）', 'テルモ（医療機器）', 'オリンパス（消化器内視鏡）'],
      downstream: ['PHCHDs（血糖管理）', 'M3（医師向けプラットフォーム）', 'メドレー（医療IT）'],
    },
    investmentHighlight: '高齢化による需要は政策に関わらず確実。医療DX関連（M3・メドレー）は成長率高く、医療機器大手（シスメックス・HOYA）はグローバル競争力も兼備。',
  },

  {
    themeId: 'childcare',
    marketSize: {
      japan: '子育て・教育市場: 約15兆円、保育市場: 約3兆円',
      global: 'EdTech市場: 約45兆円（2025年）',
      unit: '年間市場規模・公的支出ベース',
    },
    growth: {
      cagr: '保育IT: 約15%/年、EdTech: 約15%/年、学童保育: 約8%/年',
      projectedSize: '少子化対策関連予算 約3.6兆円/年（こども・子育て支援加速化プラン）',
      projectedYear: 2028,
      growthDrivers: [
        '「加速化プラン」による児童手当拡充・保育無償化・育休給付増額',
        '保育所・学童クラブのDX（ICT化補助金）',
        '就学前教育・STEAM教育の質的向上への投資',
        '不妊治療・産後ケアの保険適用拡大',
      ],
    },
    govSupport: {
      totalBudget: '約3.6兆円/年（加速化プラン2024〜2026年）',
      keyPrograms: [
        { name: 'こども・子育て加速化プラン', amount: '3.6兆円/年', description: '児童手当拡充・保育無償化拡大・育休給付引上げ・産後ケア充実' },
        { name: '保育所DX補助', amount: '数百億円/年', description: 'ICT機器導入・連絡帳デジタル化・業務効率化支援' },
        { name: '教育費無償化', amount: '数千億円', description: '幼児教育・高等教育無償化の拡大（所得制限撤廃検討）' },
      ],
    },
    significance: {
      strategicReason: '出生率1.2（2023年）は社会の持続可能性の危機。労働力不足・社会保障財政悪化を避けるため、少子化対策は「国家の存亡」がかかった最重要課題。',
      socialNeed: '子育てコスト負担の重さ・保育所不足・働き方の硬直性が少子化の直接原因。これらを解消する政策サービスへの国民需要は旺盛。',
      internationalContext: '韓国・シンガポール等も少子化に悩むが有効策を見出せていない。教育・子育て支援のビジネスモデルは国際展開の余地もある。',
    },
    ecosystem: {
      upstream: ['ベネッセHD（教材・幼児教育）', 'こどもちゃれんじ等の通信教育'],
      midstream: ['キッズライン・CaSy（シッターマッチング）', 'コドモン・HugMog（保育ICT）'],
      downstream: ['学研HD（学童・塾）', 'ジョブズ（保育士派遣）', 'テンプHD（人材）'],
    },
    investmentHighlight: '政策予算は確定・拡大路線。ただし、少子化継続で利用児童数は増えないため、効率化・質向上・DXで付加価値を高める企業が有望。EdTechの成長は本物。',
  },

  {
    themeId: 'tourism',
    marketSize: {
      japan: 'インバウンド消費: 約8.1兆円（2024年、過去最高）、観光GDP貢献: 約10兆円超',
      global: '国際観光市場: 約200兆円（2024年回復）',
      unit: '年間消費額ベース',
    },
    growth: {
      cagr: '訪日客数: コロナ前から年率5〜10%成長軌道に復帰',
      projectedSize: '訪日客6,000万人・消費15兆円（2030年目標）',
      projectedYear: 2030,
      growthDrivers: [
        '円安による割安感（訪日コスト低下）で需要が構造的に高水準',
        '日本ブーム（アニメ・グルメ・自然）の世界的定着',
        'アジア中間層の拡大による潜在的訪日客増加',
        '地方観光資源の発掘・着地型観光の整備',
      ],
    },
    govSupport: {
      totalBudget: '観光庁予算: 約300〜400億円/年、日本版DMO支援・地域観光整備',
      keyPrograms: [
        { name: '観光立国推進基本計画（2023〜2025）', amount: '複数省庁の関連予算', description: '2025年に3,000万人・消費5兆円目標。MICE・高付加価値旅行強化' },
        { name: '地域資源活用型観光', amount: '数百億円', description: '観光DX推進・多言語対応・受入環境整備補助' },
        { name: 'Sustainable Tourism推進', amount: '数十億円', description: 'オーバーツーリズム対策・分散化・通年型観光へ' },
      ],
    },
    significance: {
      strategicReason: '訪日客は「動く輸出」。2024年のインバウンド消費8兆円は自動車輸出に匹敵するレベルまで成長。非製造業でも外貨獲得が可能な数少ない分野。',
      socialNeed: '地方創生・過疎問題の解決策として観光は有力。地方経済の活性化・雇用創出に直結。廃校・古民家など地域資産の有効活用にも寄与。',
      internationalContext: '円安が続く限り日本の価格競争力は高い。観光消費単価の向上（量から質へ）で成長の質も改善中。ラグジュアリー旅行・ウェルネスツーリズムに注力。',
    },
    ecosystem: {
      upstream: ['星野リゾート・ドーミーイン（宿泊）', 'HIS・JTB（旅行代理店）'],
      midstream: ['楽天トラベル・じゃらん（OTA）', 'ANA・JAL（航空）', '東海道新幹線（JR東海）'],
      downstream: ['百貨店各社・免税店（消費）', '外食チェーン（飲食）', 'アドベンチャートラベル各社'],
    },
    investmentHighlight: '2024年の消費8兆円は過去最高。2030年目標15兆円まで倍増余地あり。空港・ホテル・OTAは直接受益。円安が続く限り構造的な追い風が継続する。',
  },

  {
    themeId: 'economic-security',
    marketSize: {
      japan: '重要物資関連産業: 数十兆円規模（半導体・蓄電池・医薬品・食料等）',
      global: '経済安保関連市場: 100兆円超（2025年推計）',
      unit: '対象産業の合計市場規模',
    },
    growth: {
      cagr: '国内供給強化投資: 大幅増加（政策優先度が毎年上昇中）',
      projectedSize: '重要物資の国内生産比率を大幅引き上げ（具体目標は品目別）',
      projectedYear: 2030,
      growthDrivers: [
        '米中対立の激化による供給網の分断リスク顕在化',
        '経済安全保障推進法（2022年）による制度的後押し',
        'コロナ・ウクライナで露呈したサプライチェーン脆弱性への対応',
        'セキュリティ・クリアランス制度導入による機微技術保護',
      ],
    },
    govSupport: {
      totalBudget: '半導体・蓄電池・医薬品・重要鉱物の国内生産支援に数兆円規模',
      keyPrograms: [
        { name: '経済安全保障推進法', amount: '数千億円/年（補助金等）', description: '2022年成立。半導体・蓄電池・医薬品等を特定重要物資に指定' },
        { name: '重要鉱物確保戦略', amount: 'ODA・官民펀드を活用', description: 'コバルト・リチウム等のレアメタルを友好国から安定調達' },
        { name: 'セキュリティ・クリアランス制度', amount: '制度整備費', description: '2024年施行。先端技術の機密保持と国際共同研究への参加促進' },
      ],
    },
    significance: {
      strategicReason: '半導体・医薬品・食料の輸入依存は「有事の急所」。経済的威圧（チャイナ・リスク）への対抗手段として自給率向上が国家安全保障の必須要件に。',
      socialNeed: 'コロナでのマスク・医薬品不足、ウクライナ侵攻後の食料・エネルギー高騰が示したように、国民生活の安定のためにも戦略的備蓄・国産化が必要。',
      internationalContext: 'フレンドショアリング（友好国間での供給網再編）が国際潮流。日米・日欧・Quad（日米豪印）間での経済安保連携が加速。',
    },
    ecosystem: {
      upstream: ['住友金属鉱山（レアメタル）', 'JX金属（銅精錬）', '三井松島HD（石炭）'],
      midstream: ['旭化成・ダイキン（重要化学品）', 'ニコン・キヤノン（光学機器）', '横河電機（制御システム）'],
      downstream: ['NEC・富士通（重要インフラIT）', 'IHI（航空・宇宙エンジン）', 'セコム（セキュリティ）'],
    },
    investmentHighlight: '政策の強制力が最も高い分野。補助金・優先調達・規制によって国内産業が保護される。住友金属鉱山・IHI・横河電機等が安定した政策恩恵を受ける。',
  },
]

export function getMarketResearch(themeId: string): MarketResearch | undefined {
  return MARKET_RESEARCH.find(m => m.themeId === themeId)
}

export function getAllMarketResearch(): MarketResearch[] {
  return MARKET_RESEARCH
}
