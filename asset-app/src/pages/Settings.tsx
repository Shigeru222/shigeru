import { useMemo, useState } from 'react';
import { useApp } from '../store/AppContext';
import { exportJson, importJson } from '../storage/localStorage';
import { parseAmount, parseCsv, CsvRow } from '../utils/csv';
import { ASSET_CLASS_LABELS, AssetClass, BalanceAsset } from '../types';
import { uid } from '../utils/id';
import { formatJpy } from '../utils/formatters';

export default function Settings() {
  const { state, dispatch } = useApp();
  const [json, setJson] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleExport() {
    const data = exportJson(state);
    setJson(data);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asset-app-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    setError(null);
    setMessage(null);
    try {
      const next = importJson(json);
      if (!confirm('現在のデータを上書きします。よろしいですか？')) return;
      dispatch({ type: 'SET_STATE', state: next });
      setMessage('インポートしました');
    } catch (e: any) {
      setError(`インポート失敗: ${e?.message ?? e}`);
    }
  }

  return (
    <div className="space-y-6">
      <section className="card space-y-3">
        <h3 className="font-semibold text-slate-800">CORS プロキシ設定</h3>
        <p className="text-xs text-slate-500">
          Yahoo Finance / CoinGecko 等のAPIを直接叩くと CORS でブロックされる場合があります。
          <code className="bg-slate-100 px-1">https://corsproxy.io/?</code> 等のURLを指定してください（末尾に対象URLが付く形式）。
          <br />
          末尾が <code className="bg-slate-100 px-1">?</code> や <code className="bg-slate-100 px-1">=</code> ならエンコード結合、それ以外はパススルー結合になります。
          空欄にすると、開発サーバーの <code className="bg-slate-100 px-1">/proxy/...</code>（vite.config.ts 設定）を使います。
        </p>
        <input
          className="input"
          value={state.settings.corsProxy}
          onChange={(e) => dispatch({ type: 'SET_SETTINGS', settings: { corsProxy: e.target.value } })}
          placeholder="https://corsproxy.io/?"
        />
      </section>

      <section className="card space-y-3">
        <h3 className="font-semibold text-slate-800">JSON バックアップ</h3>
        <div className="flex gap-2 flex-wrap">
          <button className="btn-primary" onClick={handleExport}>
            エクスポート（ダウンロード）
          </button>
          <label className="btn-secondary cursor-pointer">
            ファイルから読込
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const text = await f.text();
                setJson(text);
              }}
            />
          </label>
          <button className="btn-secondary" onClick={handleImport} disabled={!json}>
            JSON をインポート
          </button>
        </div>
        <textarea
          className="input font-mono text-xs h-48"
          value={json}
          onChange={(e) => setJson(e.target.value)}
          placeholder="エクスポートまたは外部ファイルからの JSON テキスト"
        />
        {message && <div className="text-sm text-emerald-700">{message}</div>}
        {error && <div className="text-sm text-red-700">{error}</div>}
      </section>

      <CsvImportSection />
    </div>
  );
}

interface MappedRow {
  date: string;
  account: string;
  balance: number;
  institution: string;
  assetClass: AssetClass;
  enabled: boolean;
}

function CsvImportSection() {
  const { state, dispatch } = useApp();
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [colMap, setColMap] = useState<{ date: string; account: string; balance: string; institution: string }>({
    date: '',
    account: '',
    balance: '',
    institution: '',
  });
  const [defaultClass, setDefaultClass] = useState<AssetClass>('cash');
  const [classOverrides, setClassOverrides] = useState<Record<string, AssetClass>>({});
  const [enabled, setEnabled] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function onFile(file: File) {
    setError(null);
    setMessage(null);
    file
      .text()
      .then((t) => {
        const { headers, rows } = parseCsv(t);
        setHeaders(headers);
        setRows(rows);
        // ヘッダ自動推定（マネーフォワードの一般的な列名に当たれば反映）
        const guess = (cands: string[]) => headers.find((h) => cands.some((c) => h.includes(c))) ?? '';
        setColMap({
          date: guess(['日付', '取得日', '年月日']),
          account: guess(['口座', '口座名', '名称', '科目']),
          balance: guess(['残高', '評価額', '金額']),
          institution: guess(['金融機関', '機関', 'サービス']),
        });
        const en: Record<number, boolean> = {};
        rows.forEach((_, i) => (en[i] = true));
        setEnabled(en);
        setClassOverrides({});
      })
      .catch((e) => setError(`CSV 読み込み失敗: ${e?.message ?? e}`));
  }

  const mapped = useMemo<MappedRow[]>(() => {
    return rows.map((r, i) => {
      const account = colMap.account ? r[colMap.account] : '';
      const institution = colMap.institution ? r[colMap.institution] : '';
      const date = colMap.date ? r[colMap.date] : '';
      const balance = colMap.balance ? parseAmount(r[colMap.balance]) : 0;
      const cls = classOverrides[account] ?? defaultClass;
      return {
        date,
        account,
        balance,
        institution,
        assetClass: cls,
        enabled: enabled[i] ?? true,
      };
    });
  }, [rows, colMap, classOverrides, defaultClass, enabled]);

  function applyImport() {
    setError(null);
    setMessage(null);
    if (!colMap.account || !colMap.balance) {
      setError('「口座名」と「残高」の列を選択してください');
      return;
    }
    const targets = mapped.filter((m) => m.enabled && m.account);
    if (targets.length === 0) {
      setError('インポート対象がありません');
      return;
    }
    // 既存の同名残高資産を上書き or 追加
    const existing = new Map(
      state.assets.filter((a) => a.kind === 'balance').map((a) => [`${a.assetClass}::${a.name}`, a as BalanceAsset]),
    );
    const overlap = targets.filter((t) => existing.has(`${t.assetClass}::${t.account}`));
    if (overlap.length > 0) {
      if (!confirm(`既存の残高資産 ${overlap.length} 件を上書きします。よろしいですか？`)) return;
    }

    let added = 0;
    let updated = 0;
    for (const t of targets) {
      const key = `${t.assetClass}::${t.account}`;
      const prev = existing.get(key);
      const next: BalanceAsset = {
        id: prev?.id ?? uid(),
        kind: 'balance',
        assetClass: t.assetClass as BalanceAsset['assetClass'],
        name: t.account,
        currency: 'JPY',
        balance: t.balance,
        institution: t.institution || prev?.institution,
        updatedAt: new Date().toISOString(),
        note: prev?.note,
      };
      dispatch({ type: 'UPSERT_ASSET', asset: next });
      if (prev) updated++;
      else added++;
    }
    setMessage(`インポート完了: 新規 ${added} 件 / 更新 ${updated} 件`);
  }

  const uniqueAccounts = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      if (colMap.account && r[colMap.account]) set.add(r[colMap.account]);
    }
    return Array.from(set);
  }, [rows, colMap.account]);

  // 残高型として割当可能なクラスのみ提示
  const balanceClasses: AssetClass[] = ['cash', 'wealthnavi', 'brokerage'];

  return (
    <section className="card space-y-3">
      <h3 className="font-semibold text-slate-800">マネーフォワード資産残高 CSV インポート</h3>
      <p className="text-xs text-slate-500">
        マネーフォワードからエクスポートした「資産残高CSV」を読み込み、列を「日付・口座名・残高・金融機関名」に割り当てます。
        証券口座の残高はウェルスナビと同様に評価額として扱われ、ポートフォリオ・将来予測にそのまま反映されます。
      </p>

      <label className="btn-secondary cursor-pointer w-fit">
        CSV ファイルを選択
        <input
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
      </label>

      {headers.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['date', 'account', 'balance', 'institution'] as const).map((k) => (
              <div key={k}>
                <label className="label">
                  {k === 'date' ? '日付' : k === 'account' ? '口座名 *' : k === 'balance' ? '残高 *' : '金融機関名'}
                </label>
                <select
                  className="input"
                  value={colMap[k]}
                  onChange={(e) => setColMap({ ...colMap, [k]: e.target.value })}
                >
                  <option value="">（選択）</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div>
            <label className="label">デフォルトの資産クラス</label>
            <select
              className="input max-w-xs"
              value={defaultClass}
              onChange={(e) => setDefaultClass(e.target.value as AssetClass)}
            >
              {balanceClasses.map((c) => (
                <option key={c} value={c}>
                  {ASSET_CLASS_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          {uniqueAccounts.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-1">口座ごとの資産クラス上書き</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {uniqueAccounts.map((acct) => (
                  <div key={acct} className="flex items-center gap-2">
                    <div className="text-xs text-slate-700 flex-1 truncate">{acct}</div>
                    <select
                      className="input max-w-[180px]"
                      value={classOverrides[acct] ?? defaultClass}
                      onChange={(e) =>
                        setClassOverrides({ ...classOverrides, [acct]: e.target.value as AssetClass })
                      }
                    >
                      {balanceClasses.map((c) => (
                        <option key={c} value={c}>
                          {ASSET_CLASS_LABELS[c]}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="table-th"></th>
                  <th className="table-th">日付</th>
                  <th className="table-th">口座</th>
                  <th className="table-th">金融機関</th>
                  <th className="table-th">資産クラス</th>
                  <th className="table-th text-right">残高</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mapped.slice(0, 50).map((m, i) => (
                  <tr key={i} className={m.enabled ? '' : 'opacity-40'}>
                    <td className="table-td">
                      <input
                        type="checkbox"
                        checked={m.enabled}
                        onChange={(e) => setEnabled({ ...enabled, [i]: e.target.checked })}
                      />
                    </td>
                    <td className="table-td">{m.date}</td>
                    <td className="table-td">{m.account}</td>
                    <td className="table-td">{m.institution}</td>
                    <td className="table-td">{ASSET_CLASS_LABELS[m.assetClass]}</td>
                    <td className="table-td text-right tabular-nums">{formatJpy(m.balance)}</td>
                  </tr>
                ))}
                {mapped.length > 50 && (
                  <tr>
                    <td colSpan={6} className="table-td text-center text-slate-500">
                      …他 {mapped.length - 50} 行（インポートには全件含まれます）
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <button className="btn-primary" onClick={applyImport}>
              選択行をインポート
            </button>
          </div>
        </>
      )}

      {message && <div className="text-sm text-emerald-700">{message}</div>}
      {error && <div className="text-sm text-red-700">{error}</div>}
    </section>
  );
}
