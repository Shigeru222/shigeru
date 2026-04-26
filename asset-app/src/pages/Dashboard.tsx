import { useMemo } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useApp } from '../store/AppContext';
import { ASSET_CLASS_COLORS, ASSET_CLASS_LABELS, AssetClass } from '../types';
import { formatJpy, realEstateNetJpy, totalAssetsJpy, valueInJpy } from '../utils/formatters';

export default function Dashboard() {
  const { state } = useApp();
  const total = totalAssetsJpy(state.assets, state.realEstate, state.fx);

  const breakdown = useMemo(() => {
    const map = new Map<AssetClass | 'real_estate', number>();
    for (const a of state.assets) {
      const v = valueInJpy(a, state.fx);
      map.set(a.assetClass, (map.get(a.assetClass) ?? 0) + v);
    }
    const reTotal = state.realEstate.reduce((s, r) => s + realEstateNetJpy(r), 0);
    if (reTotal !== 0) map.set('real_estate', reTotal);
    return Array.from(map.entries()).map(([key, value]) => ({
      key,
      label: key === 'real_estate' ? '不動産（純資産）' : ASSET_CLASS_LABELS[key],
      color: key === 'real_estate' ? '#e377c2' : ASSET_CLASS_COLORS[key],
      value,
    }));
  }, [state.assets, state.realEstate, state.fx]);

  const positive = breakdown.filter((b) => b.value > 0);
  const totalPositive = positive.reduce((s, b) => s + b.value, 0);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="総資産（円換算）" value={formatJpy(total)} accent />
        <SummaryCard
          title="USD/JPY"
          value={state.fx.usdJpy.toFixed(2)}
          sub={state.fx.updatedAt && state.fx.updatedAt !== new Date(0).toISOString()
            ? `更新: ${new Date(state.fx.updatedAt).toLocaleString('ja-JP')}`
            : '未取得（資産一覧から更新可能）'}
        />
        <SummaryCard
          title="登録資産数"
          value={`${state.assets.length} 銘柄 / ${state.realEstate.length} 物件`}
        />
      </section>

      <section className="card">
        <h2 className="font-semibold text-slate-800 mb-3">資産クラス別ポートフォリオ比率</h2>
        {positive.length === 0 ? (
          <p className="text-slate-500 text-sm">
            データがありません。「資産一覧」または「不動産」から登録してください。
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={positive}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={1}
                  >
                    {positive.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: any) => formatJpy(Number(v))}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-th">資産クラス</th>
                  <th className="table-th text-right">評価額</th>
                  <th className="table-th text-right">比率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {breakdown.map((b) => {
                  const pct = totalPositive > 0 && b.value > 0 ? (b.value / totalPositive) * 100 : 0;
                  return (
                    <tr key={b.key}>
                      <td className="table-td">
                        <span className="inline-block w-3 h-3 rounded-full mr-2 align-middle" style={{ backgroundColor: b.color }} />
                        {b.label}
                      </td>
                      <td className="table-td text-right tabular-nums">{formatJpy(b.value)}</td>
                      <td className="table-td text-right tabular-nums">{pct.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ title, value, sub, accent }: { title: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`card ${accent ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white ring-0' : ''}`}>
      <div className={`text-xs ${accent ? 'text-blue-100' : 'text-slate-500'}`}>{title}</div>
      <div className="text-2xl font-bold mt-1 tabular-nums">{value}</div>
      {sub && <div className={`text-xs mt-1 ${accent ? 'text-blue-100' : 'text-slate-500'}`}>{sub}</div>}
    </div>
  );
}
