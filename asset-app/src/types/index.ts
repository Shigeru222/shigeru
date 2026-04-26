// アプリ全体で使う型定義

export type AssetClass =
  | 'jp_stock'        // 日本株・ETF
  | 'us_stock'        // 米国株・ETF・ADR
  | 'mutual_fund'     // 投資信託
  | 'cash'            // 現金・預金
  | 'crypto'          // 仮想通貨
  | 'wealthnavi'      // ウェルスナビ
  | 'brokerage';      // 証券口座（MFインポートで個別銘柄に展開しない残高）

export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  jp_stock: '日本株・ETF',
  us_stock: '米国株・ETF・ADR',
  mutual_fund: '投資信託',
  cash: '現金・預金',
  crypto: '仮想通貨',
  wealthnavi: 'ウェルスナビ',
  brokerage: '証券口座（評価額）',
};

export const ASSET_CLASS_COLORS: Record<AssetClass, string> = {
  jp_stock: '#1f77b4',
  us_stock: '#ff7f0e',
  mutual_fund: '#2ca02c',
  cash: '#9467bd',
  crypto: '#d62728',
  wealthnavi: '#17becf',
  brokerage: '#8c564b',
};

export type Currency = 'JPY' | 'USD';

// 個別銘柄保有
export interface HoldingAsset {
  id: string;
  kind: 'holding';
  assetClass: Extract<AssetClass, 'jp_stock' | 'us_stock' | 'mutual_fund' | 'crypto'>;
  name: string;
  // 銘柄コード/識別子。例: 7203.T (日本株), AAPL (米国株), 0331418A (投信), bitcoin (CoinGecko id)
  ticker: string;
  currency: Currency;
  quantity: number;
  costBasis: number; // 取得単価（通貨は currency に従う）
  lastPrice?: number;
  lastUpdatedAt?: string; // ISO
  manualPrice?: number;  // 自動取得失敗時の手入力上書き
  note?: string;
}

// 残高型資産（現金・ウェルスナビ・証券口座など、評価額のみ管理）
export interface BalanceAsset {
  id: string;
  kind: 'balance';
  assetClass: Extract<AssetClass, 'cash' | 'wealthnavi' | 'brokerage'>;
  name: string;
  currency: Currency;
  balance: number;
  institution?: string; // 金融機関名（MF CSV由来など）
  updatedAt: string; // ISO
  note?: string;
}

export type Asset = HoldingAsset | BalanceAsset;

export interface RealEstate {
  id: string;
  name: string;
  purchasePrice: number;   // 購入金額（円）
  currentValue: number;    // 現在評価額（円・手入力）
  loanBalance: number;     // ローン残債（円）
  note?: string;
  updatedAt: string;
}

export interface FxRate {
  usdJpy: number;
  updatedAt: string;
}

export interface SimulationParams {
  currentAssets: number;     // 現在の総資産（円）
  monthlyContribution: number;
  monthlyWithdraw: number;
  years: number;
  rates: number[]; // 利回り%（例: [3, 5, 7]）
  goalAmount: number; // 逆算モード用
}

export interface AppSettings {
  // CORSプロキシURL。空文字なら同一オリジンの /proxy/... を使う（dev環境用）
  // 推奨：https://corsproxy.io/?  形式（末尾にエンコード対象URLが付く）
  corsProxy: string;
}

export interface AppState {
  assets: Asset[];
  realEstate: RealEstate[];
  fx: FxRate;
  simulation: SimulationParams;
  settings: AppSettings;
}

export const DEFAULT_STATE: AppState = {
  assets: [],
  realEstate: [],
  fx: { usdJpy: 150, updatedAt: new Date(0).toISOString() },
  simulation: {
    currentAssets: 0,
    monthlyContribution: 50000,
    monthlyWithdraw: 200000,
    years: 30,
    rates: [3, 5, 7],
    goalAmount: 30_000_000,
  },
  settings: {
    corsProxy: 'https://corsproxy.io/?',
  },
};
