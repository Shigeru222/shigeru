import { proxiedFetch } from './proxy';
import { HoldingAsset } from '../types';

export interface PriceQuote {
  price: number;
  currency: 'JPY' | 'USD';
  source: string;
}

// Yahoo Finance v7 quote API
// 例: https://query1.finance.yahoo.com/v7/finance/quote?symbols=AAPL,7203.T
async function fetchYahooQuotes(symbols: string[], proxy: string): Promise<Record<string, PriceQuote>> {
  if (symbols.length === 0) return {};
  const url =
    'https://query1.finance.yahoo.com/v7/finance/quote?symbols=' +
    encodeURIComponent(symbols.join(','));
  const res = await proxiedFetch(url, proxy);
  if (!res.ok) {
    throw new Error(`Yahoo Finance API エラー: ${res.status}`);
  }
  const data: any = await res.json();
  const out: Record<string, PriceQuote> = {};
  for (const q of data?.quoteResponse?.result ?? []) {
    if (typeof q.regularMarketPrice === 'number' && q.symbol) {
      out[q.symbol] = {
        price: q.regularMarketPrice,
        currency: (q.currency === 'JPY' ? 'JPY' : 'USD'),
        source: 'Yahoo Finance',
      };
    }
  }
  return out;
}

// CoinGecko simple/price API
async function fetchCoinGeckoPrices(ids: string[], proxy: string): Promise<Record<string, PriceQuote>> {
  if (ids.length === 0) return {};
  const url =
    'https://api.coingecko.com/api/v3/simple/price?ids=' +
    encodeURIComponent(ids.join(',')) +
    '&vs_currencies=jpy,usd';
  const res = await proxiedFetch(url, proxy);
  if (!res.ok) {
    throw new Error(`CoinGecko API エラー: ${res.status}`);
  }
  const data: Record<string, { jpy?: number; usd?: number }> = await res.json();
  const out: Record<string, PriceQuote> = {};
  for (const [id, v] of Object.entries(data)) {
    if (typeof v.jpy === 'number') {
      out[id] = { price: v.jpy, currency: 'JPY', source: 'CoinGecko' };
    } else if (typeof v.usd === 'number') {
      out[id] = { price: v.usd, currency: 'USD', source: 'CoinGecko' };
    }
  }
  return out;
}

// 投資信託：協会コード（8桁）の場合は Yahoo Finance Japan の chart API を試行
// 例: https://query1.finance.yahoo.com/v8/finance/chart/0331418A.T
async function fetchMutualFundPrice(ticker: string, proxy: string): Promise<PriceQuote | null> {
  // すでに ".T" 等が付いていなければ付ける
  const sym = /\./.test(ticker) ? ticker : `${ticker}.T`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}`;
  const res = await proxiedFetch(url, proxy);
  if (!res.ok) return null;
  const data: any = await res.json();
  const meta = data?.chart?.result?.[0]?.meta;
  if (meta && typeof meta.regularMarketPrice === 'number') {
    return { price: meta.regularMarketPrice, currency: 'JPY', source: 'Yahoo Finance Japan' };
  }
  return null;
}

// 為替（USD/JPY）
export async function fetchUsdJpy(proxy: string): Promise<number> {
  const quotes = await fetchYahooQuotes(['USDJPY=X'], proxy);
  const q = quotes['USDJPY=X'];
  if (!q) throw new Error('USD/JPY を取得できませんでした');
  return q.price;
}

export interface RefreshResult {
  updated: Record<string, PriceQuote>; // assetId -> quote
  errors: { assetId: string; message: string }[];
}

export async function refreshPrices(assets: HoldingAsset[], proxy: string): Promise<RefreshResult> {
  const updated: Record<string, PriceQuote> = {};
  const errors: { assetId: string; message: string }[] = [];

  const yahooSyms: HoldingAsset[] = [];
  const cryptos: HoldingAsset[] = [];
  const funds: HoldingAsset[] = [];

  for (const a of assets) {
    if (a.assetClass === 'crypto') cryptos.push(a);
    else if (a.assetClass === 'mutual_fund') funds.push(a);
    else yahooSyms.push(a);
  }

  // Yahoo（株・ETF）
  if (yahooSyms.length > 0) {
    try {
      const symbols = yahooSyms.map((a) => a.ticker);
      const quotes = await fetchYahooQuotes(symbols, proxy);
      for (const a of yahooSyms) {
        const q = quotes[a.ticker];
        if (q) updated[a.id] = q;
        else errors.push({ assetId: a.id, message: `${a.ticker} の価格を取得できません` });
      }
    } catch (e: any) {
      for (const a of yahooSyms) errors.push({ assetId: a.id, message: e?.message ?? 'fetch error' });
    }
  }

  // CoinGecko
  if (cryptos.length > 0) {
    try {
      const ids = cryptos.map((a) => a.ticker.toLowerCase());
      const quotes = await fetchCoinGeckoPrices(ids, proxy);
      for (const a of cryptos) {
        const q = quotes[a.ticker.toLowerCase()];
        if (q) updated[a.id] = q;
        else errors.push({ assetId: a.id, message: `${a.ticker} の価格を取得できません` });
      }
    } catch (e: any) {
      for (const a of cryptos) errors.push({ assetId: a.id, message: e?.message ?? 'fetch error' });
    }
  }

  // 投信（1件ずつ）
  for (const a of funds) {
    try {
      const q = await fetchMutualFundPrice(a.ticker, proxy);
      if (q) updated[a.id] = q;
      else errors.push({ assetId: a.id, message: `投信 ${a.ticker} の価格を取得できません` });
    } catch (e: any) {
      errors.push({ assetId: a.id, message: e?.message ?? 'fetch error' });
    }
  }

  return { updated, errors };
}
