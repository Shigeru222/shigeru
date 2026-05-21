export interface AnnualPolicyEntry {
  year: number
  cabinet: string
  overallTheme: string
  economicContext: string
  themePresence: Record<string, {
    priority: 'top' | 'high' | 'medium' | 'none'
    description: string
    budgetTrend: 'surge' | 'increase' | 'stable' | 'decrease' | 'na'
  }>
}

// 骨太の方針 主要テーマID（lib/stock/policies.ts の PolicyTheme.id と対応）
// ai-semiconductor, gx, defense, digital-gov, healthcare, childcare, tourism, economic-security

export const ANNUAL_POLICIES: AnnualPolicyEntry[] = [
  {
    year: 2001,
    cabinet: '第1次小泉内閣',
    overallTheme: '聖域なき構造改革',
    economicContext: 'バブル崩壊後の長期デフレ。不良債権問題が深刻化。IT バブル崩壊で株価低迷。',
    themePresence: {
      'ai-semiconductor': { priority: 'none', description: 'ITバブル崩壊直後で政策的支援なし', budgetTrend: 'na' },
      'gx': { priority: 'none', description: '環境政策は初期段階。京都議定書批准問題', budgetTrend: 'na' },
      'defense': { priority: 'none', description: '9.11直後で安保の議論は始まったが予算は横ばい', budgetTrend: 'stable' },
      'digital-gov': { priority: 'medium', description: 'e-Japan戦略でブロードバンド整備を推進', budgetTrend: 'increase' },
      'healthcare': { priority: 'high', description: '医療費削減・社会保障の持続可能性が最重要課題', budgetTrend: 'decrease' },
      'childcare': { priority: 'medium', description: '少子化への危機感が高まり始め、政策論議開始', budgetTrend: 'stable' },
      'tourism': { priority: 'none', description: '観光政策は未整備', budgetTrend: 'na' },
      'economic-security': { priority: 'none', description: 'まだ概念として確立されていない', budgetTrend: 'na' },
    }
  },
  {
    year: 2002,
    cabinet: '第1次小泉内閣',
    overallTheme: '構造改革と経済財政の中期展望',
    economicContext: '不良債権処理加速。デフレ継続。りそな銀行破綻問題。株価8,000円台まで下落。',
    themePresence: {
      'ai-semiconductor': { priority: 'none', description: 'IT振興は縮小傾向', budgetTrend: 'na' },
      'gx': { priority: 'none', description: '京都議定書問題が続くも予算は最小限', budgetTrend: 'na' },
      'defense': { priority: 'none', description: '有事法制整備の議論開始', budgetTrend: 'stable' },
      'digital-gov': { priority: 'high', description: 'e-Japan戦略2002。電子政府の本格推進', budgetTrend: 'increase' },
      'healthcare': { priority: 'top', description: '老人医療費自己負担引き上げ。健康保険改革', budgetTrend: 'decrease' },
      'childcare': { priority: 'medium', description: '少子化対策プラスワン策定', budgetTrend: 'increase' },
      'tourism': { priority: 'none', description: '', budgetTrend: 'na' },
      'economic-security': { priority: 'none', description: '', budgetTrend: 'na' },
    }
  },
  {
    year: 2003,
    cabinet: '第2次小泉内閣',
    overallTheme: '改革加速と活力ある経済社会の実現',
    economicContext: 'イラク戦争。SARS流行。不良債権処理がヤマ場。りそな銀行公的資金注入で株式市場底打ち。',
    themePresence: {
      'ai-semiconductor': { priority: 'none', description: 'IT政策は維持レベル', budgetTrend: 'na' },
      'gx': { priority: 'none', description: '京都議定書目標達成に向けた初期取り組み', budgetTrend: 'stable' },
      'defense': { priority: 'medium', description: 'イラク特措法成立。防衛力整備が議題に', budgetTrend: 'stable' },
      'digital-gov': { priority: 'high', description: 'e-Japan重点計画2003。ブロードバンド普及加速', budgetTrend: 'increase' },
      'healthcare': { priority: 'top', description: '医療制度構造改革。診療報酬マイナス改定', budgetTrend: 'decrease' },
      'childcare': { priority: 'high', description: '次世代育成支援対策推進法成立。少子化対策大綱', budgetTrend: 'increase' },
      'tourism': { priority: 'medium', description: 'ビジット・ジャパン・キャンペーン開始（訪日目標1,000万人）', budgetTrend: 'increase' },
      'economic-security': { priority: 'none', description: '', budgetTrend: 'na' },
    }
  },
  {
    year: 2004,
    cabinet: '第2次小泉内閣',
    overallTheme: '改革なくして成長なし',
    economicContext: '景気回復局面入り。株価上昇基調。年金改革問題で政局混乱。中国経済の台頭。',
    themePresence: {
      'ai-semiconductor': { priority: 'none', description: '', budgetTrend: 'na' },
      'gx': { priority: 'none', description: '京都議定書2005年発効に向けた対応', budgetTrend: 'stable' },
      'defense': { priority: 'medium', description: 'ミサイル防衛システム導入決定', budgetTrend: 'stable' },
      'digital-gov': { priority: 'high', description: 'u-Japan構想。ユビキタスネット社会への移行', budgetTrend: 'stable' },
      'healthcare': { priority: 'top', description: '年金改革法成立。医療費適正化計画', budgetTrend: 'decrease' },
      'childcare': { priority: 'high', description: '子ども・子育て応援プラン。保育所整備加速', budgetTrend: 'increase' },
      'tourism': { priority: 'medium', description: 'ビジット・ジャパン継続。観光立国懇談会', budgetTrend: 'stable' },
      'economic-security': { priority: 'none', description: '', budgetTrend: 'na' },
    }
  },
  {
    year: 2005,
    cabinet: '第3次小泉内閣',
    overallTheme: '郵政民営化と構造改革の総仕上げ',
    economicContext: '郵政選挙で自民大勝。景気拡大「いざなみ景気」。原油高騰問題浮上。',
    themePresence: {
      'ai-semiconductor': { priority: 'none', description: '', budgetTrend: 'na' },
      'gx': { priority: 'medium', description: '京都議定書発効。省エネ・再エネ政策強化', budgetTrend: 'increase' },
      'defense': { priority: 'medium', description: '日米同盟強化。在日米軍再編', budgetTrend: 'stable' },
      'digital-gov': { priority: 'high', description: 'u-Japan政策。デジタル・ディバイド解消', budgetTrend: 'stable' },
      'healthcare': { priority: 'top', description: '医療制度改革大綱。後期高齢者医療制度創設へ', budgetTrend: 'decrease' },
      'childcare': { priority: 'high', description: '少子化社会対策大綱推進。仕事と育児の両立支援', budgetTrend: 'increase' },
      'tourism': { priority: 'high', description: '観光立国推進基本法制定準備。訪日客1,000万人目標', budgetTrend: 'increase' },
      'economic-security': { priority: 'none', description: '', budgetTrend: 'na' },
    }
  },
  {
    year: 2006,
    cabinet: '安倍内閣（第1次）',
    overallTheme: '成長力強化と財政再建の両立',
    economicContext: '「美しい国」路線。アジア外交重視。いざなみ景気継続。成長戦略が政策の中心に。',
    themePresence: {
      'ai-semiconductor': { priority: 'medium', description: 'イノベーション25策定。科学技術振興', budgetTrend: 'increase' },
      'gx': { priority: 'medium', description: 'クールアース構想の前身。省エネ政策強化', budgetTrend: 'increase' },
      'defense': { priority: 'medium', description: '防衛庁から防衛省へ昇格（2007年）準備', budgetTrend: 'stable' },
      'digital-gov': { priority: 'high', description: 'IT新改革戦略。電子政府・電子自治体推進', budgetTrend: 'stable' },
      'healthcare': { priority: 'top', description: '医療制度改革法成立。後期高齢者医療制度', budgetTrend: 'decrease' },
      'childcare': { priority: 'high', description: '子どもと家族を応援する日本。仕事と生活の調和', budgetTrend: 'increase' },
      'tourism': { priority: 'high', description: '観光立国推進基本法成立。訪日外国人倍増計画', budgetTrend: 'increase' },
      'economic-security': { priority: 'none', description: '', budgetTrend: 'na' },
    }
  },
  {
    year: 2007,
    cabinet: '福田内閣',
    overallTheme: '生活者・消費者が主役の社会',
    economicContext: 'サブプライムローン問題表面化。年金記録問題で内閣支持率急落。参院選敗北。株価下落開始。',
    themePresence: {
      'ai-semiconductor': { priority: 'medium', description: 'イノベーション25。科学技術重点投資', budgetTrend: 'stable' },
      'gx': { priority: 'high', description: 'クールアース50。2050年CO2半減宣言', budgetTrend: 'increase' },
      'defense': { priority: 'medium', description: '防衛省設置完了。新防衛大綱の検討', budgetTrend: 'stable' },
      'digital-gov': { priority: 'medium', description: '重点計画2007。公共サービスのオンライン化', budgetTrend: 'stable' },
      'healthcare': { priority: 'top', description: '後期高齢者医療制度問題。社会保障費削減路線の見直し', budgetTrend: 'stable' },
      'childcare': { priority: 'high', description: '子どもと家族を応援する日本。働き方改革議論開始', budgetTrend: 'increase' },
      'tourism': { priority: 'high', description: '観光立国推進基本計画。訪日1,000万人目標継続', budgetTrend: 'stable' },
      'economic-security': { priority: 'none', description: '', budgetTrend: 'na' },
    }
  },
  {
    year: 2008,
    cabinet: '麻生内閣',
    overallTheme: '百年に一度の経済危機への対応',
    economicContext: 'リーマンショック（9月）。世界同時不況。株価暴落。景気緊急対策。GDP -5%。',
    themePresence: {
      'ai-semiconductor': { priority: 'none', description: '景気悪化で科学技術政策は後退', budgetTrend: 'decrease' },
      'gx': { priority: 'medium', description: '「低炭素社会づくり行動計画」策定', budgetTrend: 'stable' },
      'defense': { priority: 'medium', description: '北朝鮮核問題。防衛予算は微増', budgetTrend: 'stable' },
      'digital-gov': { priority: 'medium', description: 'IT戦略2015（5か年計画）策定', budgetTrend: 'stable' },
      'healthcare': { priority: 'high', description: '社会保障費削減撤回。後期高齢者医療制度廃止議論', budgetTrend: 'increase' },
      'childcare': { priority: 'medium', description: '「子育て応援特別手当」給付（緊急対策）', budgetTrend: 'increase' },
      'tourism': { priority: 'medium', description: '観光立国推進継続。世界金融危機で訪日客減少', budgetTrend: 'stable' },
      'economic-security': { priority: 'none', description: '', budgetTrend: 'na' },
    }
  },
  {
    year: 2009,
    cabinet: '鳩山内閣（民主党政権）',
    overallTheme: '官僚主導から政治主導へ。コンクリートから人へ',
    economicContext: '民主党政権交代。事業仕分けで予算削減。デフレ深刻化。CO2 25%削減宣言（鳩山イニシアチブ）。',
    themePresence: {
      'ai-semiconductor': { priority: 'none', description: '事業仕分けでIT関連予算も削減対象に', budgetTrend: 'decrease' },
      'gx': { priority: 'high', description: 'CO2 25%削減の国際公約。再エネ固定買取制度議論', budgetTrend: 'increase' },
      'defense': { priority: 'none', description: '普天間問題で日米関係悪化', budgetTrend: 'decrease' },
      'digital-gov': { priority: 'medium', description: '政府のIT戦略継続するも事業仕分けで規模縮小', budgetTrend: 'decrease' },
      'healthcare': { priority: 'high', description: '「コンクリートから人へ」で社会保障費増額', budgetTrend: 'increase' },
      'childcare': { priority: 'top', description: '子ども手当創設（月26,000円）。高校無償化', budgetTrend: 'surge' },
      'tourism': { priority: 'medium', description: '観光立国の継続。民主党も観光政策維持', budgetTrend: 'stable' },
      'economic-security': { priority: 'none', description: '', budgetTrend: 'na' },
    }
  },
  {
    year: 2010,
    cabinet: '菅内閣（民主党）',
    overallTheme: '強い経済・強い財政・強い社会保障',
    economicContext: '東日本大震災前年。円高進行（1ドル80円台）。尖閣問題で日中関係悪化。新成長戦略。',
    themePresence: {
      'ai-semiconductor': { priority: 'medium', description: '新成長戦略にIT・クラウドを位置づけ', budgetTrend: 'stable' },
      'gx': { priority: 'high', description: '「グリーンイノベーション」を新成長戦略の柱に。再エネ普及', budgetTrend: 'increase' },
      'defense': { priority: 'medium', description: '尖閣事件で防衛意識高まる。中期防衛力整備計画', budgetTrend: 'stable' },
      'digital-gov': { priority: 'high', description: '「情報通信技術戦略」。クラウドコンピューティング導入', budgetTrend: 'increase' },
      'healthcare': { priority: 'high', description: '社会保障・税一体改革議論開始。介護保険制度見直し', budgetTrend: 'increase' },
      'childcare': { priority: 'high', description: '子ども・子育て新システム検討。幼保一体化議論', budgetTrend: 'stable' },
      'tourism': { priority: 'high', description: '観光立国推進。2020年訪日2,500万人目標設定', budgetTrend: 'increase' },
      'economic-security': { priority: 'none', description: '希少資源確保（中国レアアース規制問題）が浮上', budgetTrend: 'na' },
    }
  },
  {
    year: 2011,
    cabinet: '野田内閣（民主党）',
    overallTheme: '東日本大震災からの復興と財政再建',
    economicContext: '3.11東日本大震災・福島原発事故（3月）。復興需要で一部セクター堅調。円高は続く。',
    themePresence: {
      'ai-semiconductor': { priority: 'none', description: '復興優先で科学技術政策は縮小', budgetTrend: 'decrease' },
      'gx': { priority: 'high', description: '原発停止で再エネ固定買取制度（FIT）導入決定', budgetTrend: 'surge' },
      'defense': { priority: 'medium', description: '震災対応で自衛隊の役割再評価。防衛力整備', budgetTrend: 'stable' },
      'digital-gov': { priority: 'high', description: '「電子行政推進計画」。オープンデータ推進', budgetTrend: 'stable' },
      'healthcare': { priority: 'high', description: '社会保障・税一体改革。消費税引き上げ論議', budgetTrend: 'increase' },
      'childcare': { priority: 'medium', description: '子ども・子育て関連3法成立に向けた議論', budgetTrend: 'stable' },
      'tourism': { priority: 'medium', description: '震災後訪日客激減。風評被害対策・観光復興', budgetTrend: 'stable' },
      'economic-security': { priority: 'medium', description: 'サプライチェーン強靱化（震災後の部品不足問題）', budgetTrend: 'increase' },
    }
  },
  {
    year: 2012,
    cabinet: '野田内閣 → 第2次安倍内閣',
    overallTheme: 'アベノミクス始動（年末政権交代）',
    economicContext: 'ユーロ危機。消費増税法成立。12月衆院選で自民大勝・安倍政権誕生。円安・株高転換。',
    themePresence: {
      'ai-semiconductor': { priority: 'none', description: '', budgetTrend: 'na' },
      'gx': { priority: 'high', description: 'FIT制度本格稼働。太陽光発電ブーム開始', budgetTrend: 'surge' },
      'defense': { priority: 'medium', description: '安倍首相就任で安全保障政策強化方針', budgetTrend: 'stable' },
      'digital-gov': { priority: 'medium', description: '電子政府推進。マイナンバー法成立準備', budgetTrend: 'stable' },
      'healthcare': { priority: 'high', description: '社会保障制度改革推進法。一体改革路線継続', budgetTrend: 'stable' },
      'childcare': { priority: 'high', description: '子ども・子育て支援法成立。保育所待機児童解消', budgetTrend: 'increase' },
      'tourism': { priority: 'medium', description: '観光庁体制強化。ビザ緩和でインバウンド回復', budgetTrend: 'increase' },
      'economic-security': { priority: 'none', description: '', budgetTrend: 'na' },
    }
  },
  {
    year: 2013,
    cabinet: '第2次安倍内閣',
    overallTheme: 'アベノミクス三本の矢・日本再興戦略',
    economicContext: '金融緩和（黒田バズーカ）・財政出動・成長戦略。円安株高進行。日経平均1万6,000円台回復。',
    themePresence: {
      'ai-semiconductor': { priority: 'high', description: '日本再興戦略にIT・ロボット革命を明記。IoT推進', budgetTrend: 'increase' },
      'gx': { priority: 'high', description: 'エネルギーベストミックス議論。再エネ拡大継続', budgetTrend: 'stable' },
      'defense': { priority: 'high', description: '国家安全保障会議（NSC）設置。特定秘密保護法', budgetTrend: 'increase' },
      'digital-gov': { priority: 'high', description: 'IT利活用促進。マイナンバー法成立', budgetTrend: 'increase' },
      'healthcare': { priority: 'high', description: '医療・介護分野の成長産業化。健康寿命延伸', budgetTrend: 'increase' },
      'childcare': { priority: 'high', description: '女性活躍推進。待機児童ゼロ作戦', budgetTrend: 'increase' },
      'tourism': { priority: 'top', description: '東京2020五輪招致成功。観光立国を国家戦略に格上げ', budgetTrend: 'surge' },
      'economic-security': { priority: 'none', description: '', budgetTrend: 'na' },
    }
  },
  {
    year: 2014,
    cabinet: '第2次・第3次安倍内閣',
    overallTheme: '日本再興戦略2014・地方創生',
    economicContext: '消費税8%引き上げ（4月）。地方創生政策。円安加速（1ドル120円台）。企業業績好調。',
    themePresence: {
      'ai-semiconductor': { priority: 'high', description: 'ロボット革命実現会議。AI研究推進', budgetTrend: 'increase' },
      'gx': { priority: 'medium', description: 'エネルギーミックス見直し。原発再稼働問題', budgetTrend: 'stable' },
      'defense': { priority: 'high', description: '集団的自衛権の行使容認閣議決定。防衛費増額', budgetTrend: 'increase' },
      'digital-gov': { priority: 'high', description: 'マイナンバー制度構築。電子政府加速', budgetTrend: 'increase' },
      'healthcare': { priority: 'high', description: '医療介護総合確保推進法。地域包括ケアシステム', budgetTrend: 'increase' },
      'childcare': { priority: 'top', description: '「まち・ひと・しごと創生法」。地方移住・少子化対策一体化', budgetTrend: 'surge' },
      'tourism': { priority: 'top', description: 'ビザ緩和で訪日客急増。免税店拡充。爆買いブーム', budgetTrend: 'surge' },
      'economic-security': { priority: 'none', description: '', budgetTrend: 'na' },
    }
  },
  {
    year: 2015,
    cabinet: '第3次安倍内閣',
    overallTheme: '一億総活躍社会・ニッポン一億総活躍プラン',
    economicContext: '中国経済減速懸念。原油安。アベノミクス第2ステージ宣言。日経平均2万円台回復。',
    themePresence: {
      'ai-semiconductor': { priority: 'high', description: 'ロボット新戦略。AI・IoTを成長戦略の中核に', budgetTrend: 'increase' },
      'gx': { priority: 'high', description: 'COP21パリ協定（12月）。2030年度排出削減目標26%', budgetTrend: 'increase' },
      'defense': { priority: 'high', description: '安保法制成立。防衛費5年連続増額', budgetTrend: 'increase' },
      'digital-gov': { priority: 'high', description: 'マイナンバー配布開始（10月）。社会保障番号制度', budgetTrend: 'increase' },
      'healthcare': { priority: 'top', description: '一億総活躍プランに医療・介護を位置づけ', budgetTrend: 'increase' },
      'childcare': { priority: 'top', description: '「新・三本の矢」で希望出生率1.8を目標設定', budgetTrend: 'surge' },
      'tourism': { priority: 'top', description: '訪日客2,000万人目標達成（2015年）。4,000万人目標へ', budgetTrend: 'surge' },
      'economic-security': { priority: 'none', description: '', budgetTrend: 'na' },
    }
  },
  {
    year: 2016,
    cabinet: '第3次安倍内閣改造',
    overallTheme: 'アベノミクス第2ステージ。未来への投資',
    economicContext: 'マイナス金利導入（2月）。Brexit（6月）。日経平均乱高下。消費増税延期（2017年→2019年）。',
    themePresence: {
      'ai-semiconductor': { priority: 'top', description: '第4次産業革命・Society 5.0を国家ビジョンに格上げ', budgetTrend: 'surge' },
      'gx': { priority: 'high', description: 'パリ協定批准。再エネ最大限導入目標', budgetTrend: 'increase' },
      'defense': { priority: 'high', description: '南シナ海問題。防衛費5兆円超え', budgetTrend: 'increase' },
      'digital-gov': { priority: 'high', description: '「官民データ活用推進基本法」成立。AI政策本格化', budgetTrend: 'increase' },
      'healthcare': { priority: 'high', description: '医療・介護の2025年問題に対応。地域包括ケア', budgetTrend: 'increase' },
      'childcare': { priority: 'high', description: '「子育て安心プラン」。保育所待機児童ゼロ2020年', budgetTrend: 'increase' },
      'tourism': { priority: 'top', description: '訪日客2,400万人（2016年）。明日の日本を支える観光ビジョン', budgetTrend: 'surge' },
      'economic-security': { priority: 'none', description: '', budgetTrend: 'na' },
    }
  },
  {
    year: 2017,
    cabinet: '第3次安倍内閣',
    overallTheme: 'Society 5.0の実現・人づくり革命',
    economicContext: '景気回復長期化（いざなみ景気超え）。北朝鮮核・ミサイル問題深刻化。日経2万3,000円台。',
    themePresence: {
      'ai-semiconductor': { priority: 'top', description: 'AI戦略2017。Society 5.0で医療・製造・移動にAI実装', budgetTrend: 'surge' },
      'gx': { priority: 'high', description: '再エネ・水素の本格展開。水素基本戦略策定', budgetTrend: 'increase' },
      'defense': { priority: 'top', description: '北朝鮮危機。弾道ミサイル防衛強化。防衛費過去最大', budgetTrend: 'surge' },
      'digital-gov': { priority: 'top', description: '「デジタル・ガバメント推進方針」。AI活用行政', budgetTrend: 'surge' },
      'healthcare': { priority: 'high', description: '人づくり革命。教育の無償化・リカレント教育', budgetTrend: 'increase' },
      'childcare': { priority: 'top', description: '幼児教育無償化決定。人づくり革命の柱', budgetTrend: 'surge' },
      'tourism': { priority: 'top', description: '訪日客2,870万人（2017年）。観光先進国宣言', budgetTrend: 'surge' },
      'economic-security': { priority: 'none', description: '', budgetTrend: 'na' },
    }
  },
  {
    year: 2018,
    cabinet: '第4次安倍内閣',
    overallTheme: '生産性革命・人づくり革命',
    economicContext: '米中貿易戦争激化。日経平均24,000円台（バブル後最高値）→年末に急落。働き方改革法成立。',
    themePresence: {
      'ai-semiconductor': { priority: 'top', description: 'AI戦略・統合イノベーション戦略。量子コンピュータ研究', budgetTrend: 'surge' },
      'gx': { priority: 'high', description: '第5次エネルギー基本計画。再エネ「主力電源化」', budgetTrend: 'increase' },
      'defense': { priority: 'high', description: '新防衛計画の大綱策定。イージス・アショア導入検討', budgetTrend: 'increase' },
      'digital-gov': { priority: 'top', description: '「デジタル・ガバメント実行計画」。AI・ビッグデータ活用', budgetTrend: 'surge' },
      'healthcare': { priority: 'high', description: '全世代型社会保障検討。高齢者就労促進', budgetTrend: 'increase' },
      'childcare': { priority: 'high', description: '幼児教育・保育の無償化2019年10月実施へ', budgetTrend: 'increase' },
      'tourism': { priority: 'top', description: '訪日客3,119万人（2018年）。観光先進国への道', budgetTrend: 'surge' },
      'economic-security': { priority: 'none', description: '米中対立激化で経済安保の重要性認識高まる', budgetTrend: 'na' },
    }
  },
  {
    year: 2019,
    cabinet: '第4次安倍内閣改造',
    overallTheme: '令和の新しい時代・Society 5.0の実現',
    economicContext: '令和改元（5月）。消費税10%引き上げ（10月）。米中貿易戦争。日韓関係悪化（GSOMIA問題）。',
    themePresence: {
      'ai-semiconductor': { priority: 'top', description: 'AI戦略2019策定。AI・データ利活用を国家戦略に', budgetTrend: 'surge' },
      'gx': { priority: 'high', description: 'パリ協定目標達成に向けた行動計画。洋上風力推進', budgetTrend: 'increase' },
      'defense': { priority: 'high', description: '宇宙・サイバー・電磁波を新ドメインに追加', budgetTrend: 'increase' },
      'digital-gov': { priority: 'top', description: '「デジタル手続法」成立。行政手続きオンライン化', budgetTrend: 'surge' },
      'healthcare': { priority: 'high', description: '全世代型社会保障改革。75歳以上の窓口負担見直し', budgetTrend: 'stable' },
      'childcare': { priority: 'high', description: '幼児教育・保育無償化実施（10月）', budgetTrend: 'surge' },
      'tourism': { priority: 'top', description: '訪日客3,188万人（2019年、コロナ前ピーク）。2030年に6,000万人目標', budgetTrend: 'stable' },
      'economic-security': { priority: 'medium', description: '重要技術の流出防止。外為法改正でスクリーニング強化', budgetTrend: 'increase' },
    }
  },
  {
    year: 2020,
    cabinet: '菅内閣（安倍辞任→菅就任）',
    overallTheme: 'デジタル社会の実現・2050年カーボンニュートラル宣言',
    economicContext: '新型コロナ感染拡大。緊急事態宣言。GDP-4.3%。テレワーク浸透。脱ハンコ推進。',
    themePresence: {
      'ai-semiconductor': { priority: 'high', description: '5G・AI・量子コンピュータへの投資加速', budgetTrend: 'surge' },
      'gx': { priority: 'top', description: '2050年カーボンニュートラル宣言（10月）。GX革命始動', budgetTrend: 'surge' },
      'defense': { priority: 'high', description: 'イージス・アショア計画中止。代替検討', budgetTrend: 'stable' },
      'digital-gov': { priority: 'top', description: 'デジタル庁設置（2021年9月）決定。コロナ禍でDX緊急課題に', budgetTrend: 'surge' },
      'healthcare': { priority: 'top', description: 'コロナ対応で医療体制強化。ワクチン接種体制整備', budgetTrend: 'surge' },
      'childcare': { priority: 'high', description: '少子化対策推進。出生率低下に危機感', budgetTrend: 'increase' },
      'tourism': { priority: 'medium', description: 'コロナで訪日客ほぼゼロ。GoToトラベル（停止）', budgetTrend: 'decrease' },
      'economic-security': { priority: 'high', description: 'コロナで露呈したサプライチェーン脆弱性。医療品・半導体', budgetTrend: 'surge' },
    }
  },
  {
    year: 2021,
    cabinet: '岸田内閣（菅辞任→岸田就任）',
    overallTheme: '新しい資本主義・成長と分配の好循環',
    economicContext: '東京五輪開催（無観客）。ワクチン接種加速。衆院選自民勝利。コロナ禍からの回復軌道。',
    themePresence: {
      'ai-semiconductor': { priority: 'top', description: '半導体・量子・AI戦略。TSMCの熊本工場誘致決定', budgetTrend: 'surge' },
      'gx': { priority: 'top', description: 'GX推進戦略。2030年再エネ36-38%目標。洋上風力100GW', budgetTrend: 'surge' },
      'defense': { priority: 'high', description: '台湾有事懸念。GDP2%に向けた防衛費議論開始', budgetTrend: 'increase' },
      'digital-gov': { priority: 'top', description: 'デジタル庁設置（9月）。マイナンバー活用加速', budgetTrend: 'surge' },
      'healthcare': { priority: 'high', description: '全世代型社会保障改革。予防医療・ヘルスケアDX', budgetTrend: 'increase' },
      'childcare': { priority: 'high', description: '「こども家庭庁」設置方針。子育て支援拡充', budgetTrend: 'increase' },
      'tourism': { priority: 'medium', description: '観光復興戦略。インバウンド再開準備', budgetTrend: 'stable' },
      'economic-security': { priority: 'top', description: '経済安全保障推進法成立準備。半導体・医薬品の国産化', budgetTrend: 'surge' },
    }
  },
  {
    year: 2022,
    cabinet: '岸田内閣',
    overallTheme: '新しい資本主義・スタートアップ育成5カ年計画',
    economicContext: 'ウクライナ侵攻（2月）。円安加速（1ドル150円台）。エネルギー危機。物価高騰。安倍元首相暗殺。',
    themePresence: {
      'ai-semiconductor': { priority: 'top', description: '経済安保法成立で半導体を「特定重要物資」に指定。ラピダス設立', budgetTrend: 'surge' },
      'gx': { priority: 'top', description: 'GX実行会議。GX経済移行債（20兆円）発行決定', budgetTrend: 'surge' },
      'defense': { priority: 'top', description: '防衛3文書改定。防衛費GDP2%への倍増計画決定', budgetTrend: 'surge' },
      'digital-gov': { priority: 'top', description: 'デジタル田園都市国家構想。マイナ保険証推進', budgetTrend: 'surge' },
      'healthcare': { priority: 'high', description: '医療DX推進。電子カルテ標準化', budgetTrend: 'increase' },
      'childcare': { priority: 'top', description: '「異次元の少子化対策」の原型。こども家庭庁設置法成立', budgetTrend: 'surge' },
      'tourism': { priority: 'high', description: '訪日客受け入れ再開（10月）。インバウンド急回復', budgetTrend: 'surge' },
      'economic-security': { priority: 'top', description: '経済安全保障推進法施行。重要物資サプライチェーン強靱化', budgetTrend: 'surge' },
    }
  },
  {
    year: 2023,
    cabinet: '岸田内閣',
    overallTheme: '異次元の少子化対策・GX・AI戦略',
    economicContext: '賃上げ実現（30年ぶり高水準）。日経平均3万3,000円台（バブル後最高値更新）。インバウンド急回復。',
    themePresence: {
      'ai-semiconductor': { priority: 'top', description: 'AI戦略2023。ChatGPT普及でAI政策が最優先課題に', budgetTrend: 'surge' },
      'gx': { priority: 'top', description: 'GX推進法成立。GX経済移行債の本格発行開始', budgetTrend: 'surge' },
      'defense': { priority: 'top', description: '防衛費急増。スタンドオフ防衛能力・反撃能力整備', budgetTrend: 'surge' },
      'digital-gov': { priority: 'top', description: 'マイナ保険証・健康保険証廃止決定。行政DX加速', budgetTrend: 'surge' },
      'healthcare': { priority: 'high', description: '医療DX推進本部設置。電子処方箋普及', budgetTrend: 'increase' },
      'childcare': { priority: 'top', description: 'こども家庭庁発足（4月）。こども・子育て支援法改正', budgetTrend: 'surge' },
      'tourism': { priority: 'top', description: '訪日客2,507万人（2023年）回復。2025年3,000万人目標', budgetTrend: 'surge' },
      'economic-security': { priority: 'top', description: 'セキュリティ・クリアランス制度創設。重要技術保護', budgetTrend: 'surge' },
    }
  },
  {
    year: 2024,
    cabinet: '岸田内閣 → 石破内閣',
    overallTheme: '賃上げ・成長と分配の好循環・AI/半導体立国',
    economicContext: '日経平均4万円突破（史上最高値）。日銀利上げ開始。物価高継続。石破内閣発足（10月）。',
    themePresence: {
      'ai-semiconductor': { priority: 'top', description: 'AI・半導体を「国家基幹産業」と位置づけ。ラピダス2nm量産目標', budgetTrend: 'surge' },
      'gx': { priority: 'top', description: 'GX2040ビジョン策定。次世代原子力・核融合への投資', budgetTrend: 'surge' },
      'defense': { priority: 'top', description: '防衛費増額継続。国産防衛装備品の輸出解禁拡大', budgetTrend: 'surge' },
      'digital-gov': { priority: 'top', description: '生成AI行政活用推進。デジタル田園都市国家構想深化', budgetTrend: 'surge' },
      'healthcare': { priority: 'high', description: '医療・介護DX。創薬支援・バイオ医薬品産業育成', budgetTrend: 'increase' },
      'childcare': { priority: 'top', description: '少子化対策「加速化プラン」。児童手当拡充・育休給付拡大', budgetTrend: 'surge' },
      'tourism': { priority: 'top', description: '訪日客3,688万人（2024年、過去最多更新）。観光公害対策', budgetTrend: 'surge' },
      'economic-security': { priority: 'top', description: 'セキュリティ・クリアランス法施行。重要インフラ防護', budgetTrend: 'surge' },
    }
  },
]

// テーマ別の継続年数と累積優先度を計算するユーティリティ
export function computePolicyContinuity(themeId: string) {
  const priorityScore = { top: 4, high: 3, medium: 2, none: 0 }
  let continuousYears = 0
  let totalScore = 0
  let maxPriority: 'top' | 'high' | 'medium' | 'none' = 'none'
  let recentMomentum: 'accelerating' | 'stable' | 'declining' = 'stable'

  for (const entry of ANNUAL_POLICIES) {
    const presence = entry.themePresence[themeId]
    if (!presence) continue
    if (presence.priority !== 'none') {
      continuousYears++
      const score = priorityScore[presence.priority]
      totalScore += score
      if (priorityScore[presence.priority] > priorityScore[maxPriority]) {
        maxPriority = presence.priority
      }
    }
  }

  // 直近3年と直前3年の比較でモメンタム判定
  const recent = ANNUAL_POLICIES.slice(-3)
  const prev = ANNUAL_POLICIES.slice(-6, -3)
  const recentScore = recent.reduce((s, e) => s + (priorityScore[e.themePresence[themeId]?.priority ?? 'none'] ?? 0), 0)
  const prevScore = prev.reduce((s, e) => s + (priorityScore[e.themePresence[themeId]?.priority ?? 'none'] ?? 0), 0)
  if (recentScore > prevScore + 2) recentMomentum = 'accelerating'
  else if (recentScore < prevScore - 2) recentMomentum = 'declining'

  return {
    themeId,
    continuousYears,
    totalScore,
    maxPriority,
    recentMomentum,
    avgScore: continuousYears > 0 ? totalScore / ANNUAL_POLICIES.length : 0,
  }
}

export function getAllThemeContinuity() {
  const themeIds = ['ai-semiconductor', 'gx', 'defense', 'digital-gov', 'healthcare', 'childcare', 'tourism', 'economic-security']
  return themeIds.map(computePolicyContinuity)
}
