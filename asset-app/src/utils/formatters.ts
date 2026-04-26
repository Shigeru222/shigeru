import { Asset, FxRate, BalanceAsset, HoldingAsset, RealEstate } from '../types';

export function formatJpy(n: number): string {
  if (!Number.isFinite(n)) return '-';
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(Math.round(n));
}

export function formatUsd(n: number): string {
  if (!Number.isFinite(n)) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
}

export function formatNumber(n: number, digits = 0): string {
  if (!Number.isFinite(n)) return '-';
  return new Intl.NumberFormat('ja-JP', { maximumFractionDigits: digits }).format(n);
}

export function formatPercent(n: number, digits = 2): string {
  return `${(n * 100).toFixed(digits)}%`;
}

// 評価額（円換算）
export function valueInJpy(asset: Asset, fx: FxRate): number {
  if (asset.kind === 'balance') {
    const v = asset.balance;
    return asset.currency === 'JPY' ? v : v * fx.usdJpy;
  }
  const price = asset.manualPrice ?? asset.lastPrice ?? 0;
  const v = price * asset.quantity;
  return asset.currency === 'JPY' ? v : v * fx.usdJpy;
}

// ネイティブ通貨（円換算前）の評価額
export function valueInNative(asset: Asset): { amount: number; currency: 'JPY' | 'USD' } {
  if (asset.kind === 'balance') {
    return { amount: asset.balance, currency: asset.currency };
  }
  const price = asset.manualPrice ?? asset.lastPrice ?? 0;
  return { amount: price * asset.quantity, currency: asset.currency };
}

export function realEstateNetJpy(re: RealEstate): number {
  return re.currentValue - re.loanBalance;
}

export function totalAssetsJpy(assets: Asset[], realEstate: RealEstate[], fx: FxRate): number {
  const a = assets.reduce((sum, x) => sum + valueInJpy(x, fx), 0);
  const r = realEstate.reduce((sum, x) => sum + realEstateNetJpy(x), 0);
  return a + r;
}

// 保有銘柄かどうか
export function isHolding(a: Asset): a is HoldingAsset {
  return a.kind === 'holding';
}

export function isBalance(a: Asset): a is BalanceAsset {
  return a.kind === 'balance';
}
