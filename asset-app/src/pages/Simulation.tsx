import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../store/AppContext';
import {
  annuityFvFactor,
  annuityPvFactor,
  buildProjectionSeries,
  capitalRecoveryFactor,
  fvFactor,
  pvFactor,
  requiredFireFund,
  requiredMonthlyContribution,
  sinkingFundFactor,
  yearsUntilDepleted,
} from '../utils/fp';
import { formatJpy, totalAssetsJpy } from '../utils/formatters';

type Mode = 'forward' | 'reverse';

const SERIES_COLORS = ['#1f77b4', '#2ca02c', '#d62728', '#ff7f0e'];

export default function Simulation() {
  const { state, dispatch } = useApp();
  const [mode, setMode] = useState<Mode>('forward');
  const [showLookup, setShowLookup] = useState(false);

  const dashTotal = totalAssetsJpy(state.assets, state.realEstate, state.fx);

  const { simulation: sim } = state;

  function syncFromDashboard() {
    dispatch({ type: 'SET_SIMULATION', sim: { currentAssets: Math.round(dashTotal) } });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 bg-slate-100 rounded-md p-1">
          <button
            onClick={() => setMode('forward')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${mode === 'forward' ? 'bg-white shadow text-slate-900' : 'text-slate-600'}`}
          >
            順算モード（現状ベース）
          </button>
          <button
            onClick={() => setMode('reverse')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${mode === 'reverse' ? 'bg-white shadow text-slate-900' : 'text-slate-600'}`}
          >
            逆算モード（目標ベース）
          </button>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setShowLookup((v) => !v)}>
            {showLookup ? '早見表を閉じる' : '6係数 早見表を表示'}
          </button>
        </div>
      </div>

      <section className="card">
        <h3 className="font-semibold text-slate-800 mb-3">共通パラメータ</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="label">現在の総資産（円）</label>
            <div className="flex gap-2">
              <input
                type="number"
                className="input tabular-nums"
                value={sim.currentAssets}
                onChange={(e) => dispatch({ type: 'SET_SIMULATION', sim: { currentAssets: Number(e.target.value) } })}
              />
              <button
                title="ダッシュボードの合計を反映"
                className="btn-secondary whitespace-nowrap"
                onClick={syncFromDashboard}
              >
                同期
              </button>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              ダッシュボード合計: {formatJpy(dashTotal)}
            </div>
          </div>
          <div>
            <label className="label">期間（年）</label>
            <input
              type="number"
              className="input tabular-nums"
              value={sim.years}
              onChange={(e) => dispatch({ type: 'SET_SIMULATION', sim: { years: Math.max(1, Number(e.target.value)) } })}
            />
          </div>
          <div>
            <label className="label">毎月の積立額（円）</label>
            <input
              type="number"
              className="input tabular-nums"
              value={sim.monthlyContribution}
              onChange={(e) => dispatch({ type: 'SET_SIMULATION', sim: { monthlyContribution: Number(e.target.value) } })}
            />
          </div>
          <div>
            <label className="label">毎月の取り崩し額（円）</label>
            <input
              type="number"
              className="input tabular-nums"
              value={sim.monthlyWithdraw}
              onChange={(e) => dispatch({ type: 'SET_SIMULATION', sim: { monthlyWithdraw: Number(e.target.value) } })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">想定年利回り（%）— カンマ区切りで複数指定</label>
            <input
              className="input"
              value={sim.rates.join(',')}
              onChange={(e) => {
                const list = e.target.value
                  .split(',')
                  .map((s) => Number(s.trim()))
                  .filter((n) => Number.isFinite(n));
                if (list.length > 0) dispatch({ type: 'SET_SIMULATION', sim: { rates: list } });
              }}
            />
          </div>
          {mode === 'reverse' && (
            <div className="md:col-span-2">
              <label className="label">目標額（円）</label>
              <input
                type="number"
                className="input tabular-nums"
                value={sim.goalAmount}
                onChange={(e) => dispatch({ type: 'SET_SIMULATION', sim: { goalAmount: Number(e.target.value) } })}
              />
            </div>
          )}
        </div>
      </section>

      {mode === 'forward' ? <ForwardPanel /> : <ReversePanel />}

      {showLookup && <LookupTable />}
    </div>
  );
}

function ForwardPanel() {
  const { state } = useApp();
  const { simulation: sim } = state;

  const series = useMemo(
    () => buildProjectionSeries(sim.currentAssets, sim.monthlyContribution, sim.years, sim.rates),
    [sim],
  );

  const baseRate = sim.rates[0] ?? 5;

  // FP6: 順算モードで関連の深い係数
  const coefficients = useMemo(() => {
    const r = baseRate / 100;
    const n = sim.years;
    const fv = fvFactor(r, n);
    const annFv = annuityFvFactor(r, n);
    const cap = capitalRecoveryFactor(r, n);
    return [
      {
        title: '終価係数',
        value: fv,
        valueLabel: `× ${fv.toFixed(4)}`,
        result: `${formatJpy(sim.currentAssets * fv)} （現資産が ${n}年後にこの額に）`,
        description: `現在の保有額 ${formatJpy(sim.currentAssets)} を年利${baseRate}%で${n}年運用したときの将来額。`,
      },
      {
        title: '年金終価係数',
        value: annFv,
        valueLabel: `× ${annFv.toFixed(4)}`,
        result: `${formatJpy(sim.monthlyContribution * 12 * annFv)} （年額 ${formatJpy(sim.monthlyContribution * 12)} 積立）`,
        description: `毎月 ${formatJpy(sim.monthlyContribution)} を年利${baseRate}%で${n}年積立てたときの合計額（年単位の近似）。`,
      },
      {
        title: '資本回収係数',
        value: cap,
        valueLabel: `× ${cap.toFixed(4)}`,
        result: `毎年 ${formatJpy(sim.currentAssets * cap)} ／ 毎月 ${formatJpy((sim.currentAssets * cap) / 12)}`,
        description: `現在の資産 ${formatJpy(sim.currentAssets)} を ${n}年で取り崩すと、毎年いくら受け取れるか。`,
      },
    ];
  }, [baseRate, sim]);

  // 取り崩し可能年数
  const depletion = useMemo(() => {
    return sim.rates.map((r) => ({
      rate: r,
      years: yearsUntilDepleted(sim.currentAssets, sim.monthlyWithdraw, r / 100),
    }));
  }, [sim]);

  return (
    <div className="space-y-4">
      <section className="card">
        <h3 className="font-semibold text-slate-800 mb-3">将来資産推移（複利＋月次積立）</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ left: 16, right: 16, top: 8, bottom: 8 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis dataKey="year" tickFormatter={(y) => `${y}年`} />
              <YAxis tickFormatter={(v: number) => `${(v / 10000).toLocaleString('ja-JP')}万`} width={80} />
              <Tooltip formatter={(v: any) => formatJpy(Number(v))} labelFormatter={(l) => `${l}年後`} />
              <Legend />
              {sim.rates.map((r, i) => (
                <Line
                  key={r}
                  type="monotone"
                  dataKey={`values.${r}%`}
                  name={`${r}%`}
                  stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {coefficients.map((c) => (
          <CoefficientCard key={c.title} title={c.title} valueLabel={c.valueLabel} result={c.result} description={c.description} />
        ))}
      </section>

      <section className="card">
        <h3 className="font-semibold text-slate-800 mb-3">取り崩しシミュレーション</h3>
        <p className="text-xs text-slate-500 mb-2">
          現資産 {formatJpy(sim.currentAssets)} を毎月 {formatJpy(sim.monthlyWithdraw)} 取り崩した場合、各利回りで何年もつか。
        </p>
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="table-th">利回り</th>
              <th className="table-th text-right">持続年数</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {depletion.map((d) => (
              <tr key={d.rate}>
                <td className="table-td">{d.rate}%</td>
                <td className="table-td text-right tabular-nums">
                  {Number.isFinite(d.years) ? `${d.years.toFixed(1)} 年` : '永続（利息で賄える）'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function ReversePanel() {
  const { state } = useApp();
  const { simulation: sim } = state;
  const baseRate = sim.rates[0] ?? 5;
  const r = baseRate / 100;
  const n = sim.years;

  const items = useMemo(() => {
    const pv = pvFactor(r, n);
    const monthly = requiredMonthlyContribution(sim.goalAmount, sim.currentAssets, r, n);
    const fire = requiredFireFund(sim.monthlyWithdraw, r, n);
    return [
      {
        title: '現価係数',
        valueLabel: `× ${pv.toFixed(4)}`,
        result: `${formatJpy(sim.goalAmount * pv)} （${n}年後に ${formatJpy(sim.goalAmount)} を作るには今これだけ必要）`,
        description: `年利${baseRate}%で運用するなら、目標額 ${formatJpy(sim.goalAmount)} を達成するために今いくら原資が必要か。`,
      },
      {
        title: '減債基金係数（必要積立）',
        valueLabel: `${formatJpy(monthly)} / 月`,
        result: `現資産 ${formatJpy(sim.currentAssets)} を運用しつつ、毎月この額を ${n}年積立てれば目標達成。`,
        description: `目標額に対して毎月いくら積立てるべきか（現資産の複利運用も込み）。`,
      },
      {
        title: '年金現価係数（FIRE原資）',
        valueLabel: formatJpy(fire),
        result: `退職時点でこの額があれば、毎月 ${formatJpy(sim.monthlyWithdraw)} を ${n}年取り崩せる。`,
        description: `老後に毎月 ${formatJpy(sim.monthlyWithdraw)} を ${n}年受け取るために、退職時に必要な原資。`,
      },
    ];
  }, [r, n, sim]);

  // 達成可否表示
  const projectedNoContribution = sim.currentAssets * fvFactor(r, n);
  const gap = sim.goalAmount - projectedNoContribution;

  return (
    <div className="space-y-4">
      <section className="card">
        <h3 className="font-semibold text-slate-800 mb-3">逆算サマリ（年利 {baseRate}% / {n}年）</h3>
        <div className="text-sm space-y-1">
          <div>
            現資産だけで運用した場合の到達額:{' '}
            <span className="tabular-nums font-medium">{formatJpy(projectedNoContribution)}</span>
          </div>
          <div>
            目標額との差:{' '}
            <span className={`tabular-nums font-medium ${gap > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
              {gap > 0 ? `不足 ${formatJpy(gap)}` : `達成済 +${formatJpy(-gap)}`}
            </span>
          </div>
        </div>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((c) => (
          <CoefficientCard key={c.title} title={c.title} valueLabel={c.valueLabel} result={c.result} description={c.description} />
        ))}
      </section>
    </div>
  );
}

function CoefficientCard({ title, valueLabel, result, description }: { title: string; valueLabel: string; result: string; description: string }) {
  return (
    <div className="card">
      <div className="flex items-baseline justify-between">
        <h4 className="font-semibold text-slate-800">{title}</h4>
        <div className="font-mono text-sm text-blue-700">{valueLabel}</div>
      </div>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
      <p className="text-sm text-slate-800 mt-2 tabular-nums">{result}</p>
    </div>
  );
}

const LOOKUP_RATES = [1, 2, 3, 4, 5, 6, 7, 8];
const LOOKUP_YEARS = [5, 10, 15, 20, 25, 30, 35, 40];

const COEFF_DEFS: { key: string; title: string; calc: (r: number, n: number) => number; desc: string }[] = [
  { key: 'fv', title: '終価係数', calc: fvFactor, desc: '1円が n年後にいくらになるか' },
  { key: 'pv', title: '現価係数', calc: pvFactor, desc: 'n年後の1円は今いくらか' },
  { key: 'annFv', title: '年金終価係数', calc: annuityFvFactor, desc: '毎年1円積立て n年後の合計' },
  { key: 'sink', title: '減債基金係数', calc: sinkingFundFactor, desc: 'n年後に1円貯めるための毎年の積立額' },
  { key: 'annPv', title: '年金現価係数', calc: annuityPvFactor, desc: '毎年1円受取りを n年続けるための原資' },
  { key: 'cap', title: '資本回収係数', calc: capitalRecoveryFactor, desc: '1円を n年で取り崩した毎年の受取額' },
];

function LookupTable() {
  const [defKey, setDefKey] = useState<string>('fv');
  const def = COEFF_DEFS.find((c) => c.key === defKey)!;

  return (
    <section className="card overflow-x-auto">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="font-semibold text-slate-800">FP6係数 早見表</h3>
        <select className="input max-w-xs" value={defKey} onChange={(e) => setDefKey(e.target.value)}>
          {COEFF_DEFS.map((c) => (
            <option key={c.key} value={c.key}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-slate-500 mb-3">{def.desc}</p>
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="table-th">利回り＼期間</th>
            {LOOKUP_YEARS.map((y) => (
              <th key={y} className="table-th text-right">
                {y}年
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {LOOKUP_RATES.map((r) => (
            <tr key={r}>
              <td className="table-td font-medium">{r}%</td>
              {LOOKUP_YEARS.map((y) => (
                <td key={y} className="table-td text-right tabular-nums">
                  {def.calc(r / 100, y).toFixed(4)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
