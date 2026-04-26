// FP6係数（年単位）と、月次積立を考慮した将来予測ヘルパー

export interface CoefficientResult {
  name: string;
  formula: string;
  description: string;
  value: number;
}

// 終価係数: 1円が n年後にいくらになるか
export function fvFactor(rate: number, years: number): number {
  return Math.pow(1 + rate, years);
}

// 現価係数: n年後の1円は今いくらか
export function pvFactor(rate: number, years: number): number {
  return 1 / Math.pow(1 + rate, years);
}

// 年金終価係数: 毎年1円ずつ積立てた n年後の合計
export function annuityFvFactor(rate: number, years: number): number {
  if (rate === 0) return years;
  return (Math.pow(1 + rate, years) - 1) / rate;
}

// 減債基金係数: n年後に1円貯めるには毎年いくら積立てるか
export function sinkingFundFactor(rate: number, years: number): number {
  if (rate === 0) return 1 / years;
  return rate / (Math.pow(1 + rate, years) - 1);
}

// 年金現価係数: 毎年1円受取りを n年続けるための原資
export function annuityPvFactor(rate: number, years: number): number {
  if (rate === 0) return years;
  return (1 - Math.pow(1 + rate, -years)) / rate;
}

// 資本回収係数: 1円を n年で取り崩すと毎年いくら受取れるか
export function capitalRecoveryFactor(rate: number, years: number): number {
  if (rate === 0) return 1 / years;
  return rate / (1 - Math.pow(1 + rate, -years));
}

// 月次積立を含めた t年後の資産額
// PV: 現在資産, M: 月次積立, r: 年利, t: 経過年数
export function projectedValue(pv: number, monthly: number, annualRate: number, years: number): number {
  const m = annualRate / 12;
  const n = years * 12;
  const fvLump = pv * Math.pow(1 + m, n);
  const fvAnnuity = m === 0 ? monthly * n : monthly * (Math.pow(1 + m, n) - 1) / m;
  return fvLump + fvAnnuity;
}

// 取り崩しモード: 現在資産を毎月withdraw円取り崩したとき、何年もつか（年）
export function yearsUntilDepleted(pv: number, monthlyWithdraw: number, annualRate: number): number {
  if (monthlyWithdraw <= 0) return Infinity;
  const m = annualRate / 12;
  if (m === 0) return pv / monthlyWithdraw / 12;
  // PV = W * (1 - (1+m)^-n) / m  =>  n = -log(1 - PV*m/W) / log(1+m)
  const ratio = (pv * m) / monthlyWithdraw;
  if (ratio >= 1) return Infinity; // 利息だけで賄える → 永続
  const months = -Math.log(1 - ratio) / Math.log(1 + m);
  return months / 12;
}

// 逆算：目標額を達成するために必要な月次積立額
export function requiredMonthlyContribution(goal: number, pv: number, annualRate: number, years: number): number {
  const m = annualRate / 12;
  const n = years * 12;
  const fvOfPv = pv * Math.pow(1 + m, n);
  const remaining = goal - fvOfPv;
  if (remaining <= 0) return 0;
  if (m === 0) return remaining / n;
  return remaining * m / (Math.pow(1 + m, n) - 1);
}

// 逆算：FIRE。退職後 years年間、毎月withdrawを得るために退職時に必要な原資
export function requiredFireFund(monthlyWithdraw: number, annualRate: number, years: number): number {
  const m = annualRate / 12;
  const n = years * 12;
  if (m === 0) return monthlyWithdraw * n;
  return monthlyWithdraw * (1 - Math.pow(1 + m, -n)) / m;
}

// 年ごとの将来資産推移（折れ線グラフ用）
export interface ProjectionPoint {
  year: number;
  values: Record<string, number>; // 利回りラベル -> 額
}

export function buildProjectionSeries(pv: number, monthly: number, years: number, rates: number[]): ProjectionPoint[] {
  const points: ProjectionPoint[] = [];
  for (let y = 0; y <= years; y++) {
    const point: ProjectionPoint = { year: y, values: {} };
    for (const r of rates) {
      point.values[`${r}%`] = projectedValue(pv, monthly, r / 100, y);
    }
    points.push(point);
  }
  return points;
}
