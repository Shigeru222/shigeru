import { useMemo, useState } from 'react';
import { useApp } from '../store/AppContext';
import {
  ASSET_CLASS_LABELS,
  Asset,
  AssetClass,
  BalanceAsset,
  Currency,
  HoldingAsset,
} from '../types';
import { formatJpy, formatNumber, isHolding, valueInJpy, valueInNative } from '../utils/formatters';
import { uid } from '../utils/id';
import { fetchUsdJpy, refreshPrices } from '../api/prices';

const HOLDING_CLASSES: AssetClass[] = ['jp_stock', 'us_stock', 'mutual_fund', 'crypto'];
const BALANCE_CLASSES: AssetClass[] = ['cash', 'wealthnavi', 'brokerage'];

const TICKER_HINTS: Record<string, string> = {
  jp_stock: '例: 7203.T（トヨタ）, 9432.T（NTT）, 1306.T（TOPIX ETF）',
  us_stock: '例: AAPL, VOO, PBR（Petrobras 普通）, PBR.A（Petrobras A種）',
  mutual_fund: '例: 0331418A.T（eMAXIS Slim 全世界）など Yahoo Japan のファンドコード',
  crypto: '例: bitcoin, ethereum, solana（CoinGecko の id を入力）',
};

export default function Assets() {
  const { state, dispatch } = useApp();
  const [editing, setEditing] = useState<Asset | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState<{ assetId: string; message: string }[]>([]);
  const [info, setInfo] = useState<string | null>(null);

  const sorted = useMemo(
    () => state.assets.slice().sort((a, b) => a.assetClass.localeCompare(b.assetClass) || a.name.localeCompare(b.name)),
    [state.assets],
  );

  async function onRefresh() {
    setRefreshing(true);
    setErrors([]);
    setInfo(null);
    try {
      const fx = await fetchUsdJpy(state.settings.corsProxy).catch(() => null);
      if (fx) dispatch({ type: 'SET_FX', fx: { usdJpy: fx, updatedAt: new Date().toISOString() } });

      const holdings = state.assets.filter(isHolding);
      const result = await refreshPrices(holdings, state.settings.corsProxy);
      const updates = Object.entries(result.updated).map(([id, q]) => ({
        id,
        price: q.price,
        updatedAt: new Date().toISOString(),
      }));
      dispatch({ type: 'UPDATE_PRICES', updates });
      setErrors(result.errors);
      setInfo(`${updates.length}件の価格を更新しました${fx ? `（USD/JPY=${fx.toFixed(2)} 反映）` : ''}`);
    } catch (e: any) {
      setInfo(`価格取得に失敗: ${e?.message ?? e}（CORSプロキシ未設定や制限の可能性。設定タブを確認）`);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-sm text-slate-600">
          銘柄を登録すると、現在価格と為替を Yahoo Finance / CoinGecko から自動取得し、円換算で評価額を表示します。
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={onRefresh} disabled={refreshing}>
            {refreshing ? '更新中…' : '価格を一括更新'}
          </button>
          <button className="btn-secondary" onClick={() => setEditing(makeNewAsset('jp_stock'))}>
            ＋ 銘柄を追加
          </button>
          <button className="btn-secondary" onClick={() => setEditing(makeNewBalance('cash'))}>
            ＋ 残高（現金等）
          </button>
        </div>
      </div>

      {info && (
        <div className="rounded-md bg-blue-50 ring-1 ring-blue-200 px-3 py-2 text-sm text-blue-800">{info}</div>
      )}
      {errors.length > 0 && (
        <div className="rounded-md bg-amber-50 ring-1 ring-amber-200 px-3 py-2 text-sm text-amber-800">
          <div className="font-semibold mb-1">取得失敗 ({errors.length}件)</div>
          <ul className="list-disc pl-5">
            {errors.map((e, i) => (
              <li key={i}>
                {state.assets.find((a) => a.id === e.assetId)?.name ?? e.assetId}: {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="table-th">資産クラス</th>
              <th className="table-th">名称</th>
              <th className="table-th">ティッカー</th>
              <th className="table-th text-right">数量</th>
              <th className="table-th text-right">取得単価</th>
              <th className="table-th text-right">現在価格</th>
              <th className="table-th text-right">評価額（ネイティブ）</th>
              <th className="table-th text-right">評価額（円換算）</th>
              <th className="table-th"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} className="table-td text-center text-slate-500 py-6">
                  まだ登録がありません
                </td>
              </tr>
            )}
            {sorted.map((a) => {
              const native = valueInNative(a);
              return (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="table-td">{ASSET_CLASS_LABELS[a.assetClass]}</td>
                  <td className="table-td font-medium">{a.name}</td>
                  <td className="table-td font-mono text-xs">
                    {a.kind === 'holding' ? a.ticker : '-'}
                  </td>
                  <td className="table-td text-right tabular-nums">
                    {a.kind === 'holding' ? formatNumber(a.quantity, 4) : '-'}
                  </td>
                  <td className="table-td text-right tabular-nums">
                    {a.kind === 'holding'
                      ? `${formatNumber(a.costBasis, 2)} ${a.currency}`
                      : '-'}
                  </td>
                  <td className="table-td text-right tabular-nums">
                    {a.kind === 'holding' ? renderHoldingPrice(a) : '-'}
                  </td>
                  <td className="table-td text-right tabular-nums">
                    {formatNumber(native.amount, 2)} {native.currency}
                  </td>
                  <td className="table-td text-right tabular-nums font-medium">
                    {formatJpy(valueInJpy(a, state.fx))}
                  </td>
                  <td className="table-td whitespace-nowrap">
                    <button className="text-blue-700 text-xs mr-2" onClick={() => setEditing(a)}>
                      編集
                    </button>
                    <button
                      className="text-red-700 text-xs"
                      onClick={() => {
                        if (confirm(`${a.name} を削除しますか？`)) {
                          dispatch({ type: 'DELETE_ASSET', id: a.id });
                        }
                      }}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <AssetEditor
          asset={editing}
          onCancel={() => setEditing(null)}
          onSave={(a) => {
            dispatch({ type: 'UPSERT_ASSET', asset: a });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function renderHoldingPrice(a: HoldingAsset): string {
  const p = a.manualPrice ?? a.lastPrice;
  if (p == null) return '-';
  const stamp = a.lastUpdatedAt ? ` (${new Date(a.lastUpdatedAt).toLocaleDateString('ja-JP')})` : '';
  const tag = a.manualPrice != null ? ' [手動]' : '';
  return `${formatNumber(p, 2)} ${a.currency}${tag}${stamp}`;
}

function makeNewAsset(cls: Extract<AssetClass, 'jp_stock' | 'us_stock' | 'mutual_fund' | 'crypto'>): HoldingAsset {
  return {
    id: uid(),
    kind: 'holding',
    assetClass: cls,
    name: '',
    ticker: '',
    currency: cls === 'us_stock' || cls === 'crypto' ? 'USD' : 'JPY',
    quantity: 0,
    costBasis: 0,
  };
}

function makeNewBalance(cls: Extract<AssetClass, 'cash' | 'wealthnavi' | 'brokerage'>): BalanceAsset {
  return {
    id: uid(),
    kind: 'balance',
    assetClass: cls,
    name: '',
    currency: 'JPY',
    balance: 0,
    updatedAt: new Date().toISOString(),
  };
}

function AssetEditor({
  asset,
  onSave,
  onCancel,
}: {
  asset: Asset;
  onSave: (a: Asset) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Asset>(asset);

  function setKind(kindAndClass: { kind: Asset['kind']; cls: AssetClass }) {
    if (kindAndClass.kind === 'holding') {
      const cls = kindAndClass.cls as HoldingAsset['assetClass'];
      setDraft({
        id: draft.id,
        kind: 'holding',
        assetClass: cls,
        name: draft.name,
        ticker: (draft as HoldingAsset).ticker ?? '',
        currency: cls === 'us_stock' || cls === 'crypto' ? 'USD' : 'JPY',
        quantity: (draft as HoldingAsset).quantity ?? 0,
        costBasis: (draft as HoldingAsset).costBasis ?? 0,
        manualPrice: (draft as HoldingAsset).manualPrice,
        lastPrice: (draft as HoldingAsset).lastPrice,
        lastUpdatedAt: (draft as HoldingAsset).lastUpdatedAt,
        note: draft.note,
      });
    } else {
      const cls = kindAndClass.cls as BalanceAsset['assetClass'];
      setDraft({
        id: draft.id,
        kind: 'balance',
        assetClass: cls,
        name: draft.name,
        currency: 'JPY',
        balance: (draft as BalanceAsset).balance ?? 0,
        institution: (draft as BalanceAsset).institution,
        updatedAt: new Date().toISOString(),
        note: draft.note,
      });
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10 p-4" onClick={onCancel}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg p-5 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold text-slate-800">資産の{asset.name ? '編集' : '追加'}</h3>

        <div>
          <label className="label">種別</label>
          <div className="flex flex-wrap gap-2">
            {HOLDING_CLASSES.map((c) => (
              <button
                key={c}
                onClick={() => setKind({ kind: 'holding', cls: c })}
                className={`px-2.5 py-1 rounded-md text-xs ${
                  draft.kind === 'holding' && draft.assetClass === c
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {ASSET_CLASS_LABELS[c]}
              </button>
            ))}
            {BALANCE_CLASSES.map((c) => (
              <button
                key={c}
                onClick={() => setKind({ kind: 'balance', cls: c })}
                className={`px-2.5 py-1 rounded-md text-xs ${
                  draft.kind === 'balance' && draft.assetClass === c
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {ASSET_CLASS_LABELS[c]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">名称</label>
          <input
            className="input"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="例: トヨタ自動車 / みずほ普通預金"
          />
        </div>

        {draft.kind === 'holding' ? (
          <HoldingFields draft={draft} setDraft={setDraft} />
        ) : (
          <BalanceFields draft={draft} setDraft={setDraft} />
        )}

        <div>
          <label className="label">メモ</label>
          <input
            className="input"
            value={draft.note ?? ''}
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button className="btn-secondary" onClick={onCancel}>
            キャンセル
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              if (!draft.name.trim()) {
                alert('名称は必須です');
                return;
              }
              if (draft.kind === 'holding' && !draft.ticker.trim()) {
                alert('ティッカーは必須です');
                return;
              }
              onSave(draft);
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

function HoldingFields({ draft, setDraft }: { draft: HoldingAsset; setDraft: (a: HoldingAsset) => void }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">ティッカー</label>
          <input
            className="input font-mono"
            value={draft.ticker}
            onChange={(e) => setDraft({ ...draft, ticker: e.target.value })}
          />
          <div className="text-[11px] text-slate-500 mt-1">{TICKER_HINTS[draft.assetClass]}</div>
        </div>
        <div>
          <label className="label">通貨</label>
          <select
            className="input"
            value={draft.currency}
            onChange={(e) => setDraft({ ...draft, currency: e.target.value as Currency })}
          >
            <option value="JPY">JPY</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">数量</label>
          <input
            type="number"
            step="any"
            className="input tabular-nums"
            value={draft.quantity}
            onChange={(e) => setDraft({ ...draft, quantity: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="label">取得単価</label>
          <input
            type="number"
            step="any"
            className="input tabular-nums"
            value={draft.costBasis}
            onChange={(e) => setDraft({ ...draft, costBasis: Number(e.target.value) })}
          />
        </div>
      </div>
      <div>
        <label className="label">手動価格上書き（自動取得不可な場合のみ）</label>
        <input
          type="number"
          step="any"
          className="input tabular-nums"
          value={draft.manualPrice ?? ''}
          onChange={(e) =>
            setDraft({ ...draft, manualPrice: e.target.value === '' ? undefined : Number(e.target.value) })
          }
          placeholder="未指定なら自動取得値を使用"
        />
      </div>
    </>
  );
}

function BalanceFields({ draft, setDraft }: { draft: BalanceAsset; setDraft: (a: BalanceAsset) => void }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">残高</label>
          <input
            type="number"
            step="any"
            className="input tabular-nums"
            value={draft.balance}
            onChange={(e) => setDraft({ ...draft, balance: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="label">通貨</label>
          <select
            className="input"
            value={draft.currency}
            onChange={(e) => setDraft({ ...draft, currency: e.target.value as Currency })}
          >
            <option value="JPY">JPY</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">金融機関</label>
        <input
          className="input"
          value={draft.institution ?? ''}
          onChange={(e) => setDraft({ ...draft, institution: e.target.value })}
          placeholder="例: 三菱UFJ銀行 / SBI証券 / ウェルスナビ"
        />
      </div>
    </>
  );
}
