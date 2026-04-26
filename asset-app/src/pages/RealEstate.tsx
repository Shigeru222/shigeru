import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { RealEstate } from '../types';
import { formatJpy, realEstateNetJpy } from '../utils/formatters';
import { uid } from '../utils/id';

export default function RealEstatePage() {
  const { state, dispatch } = useApp();
  const [editing, setEditing] = useState<RealEstate | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          物件名・購入金額・現在評価額（手入力）・ローン残債を入力すると、純資産（評価額 − 残債）がポートフォリオに合算されます。
        </p>
        <button
          className="btn-primary"
          onClick={() =>
            setEditing({
              id: uid(),
              name: '',
              purchasePrice: 0,
              currentValue: 0,
              loanBalance: 0,
              updatedAt: new Date().toISOString(),
            })
          }
        >
          ＋ 物件を追加
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="table-th">物件名</th>
              <th className="table-th text-right">購入金額</th>
              <th className="table-th text-right">現在評価額</th>
              <th className="table-th text-right">ローン残債</th>
              <th className="table-th text-right">純資産</th>
              <th className="table-th"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {state.realEstate.length === 0 && (
              <tr>
                <td colSpan={6} className="table-td text-center text-slate-500 py-6">
                  物件が登録されていません
                </td>
              </tr>
            )}
            {state.realEstate.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="table-td font-medium">{r.name}</td>
                <td className="table-td text-right tabular-nums">{formatJpy(r.purchasePrice)}</td>
                <td className="table-td text-right tabular-nums">{formatJpy(r.currentValue)}</td>
                <td className="table-td text-right tabular-nums">{formatJpy(r.loanBalance)}</td>
                <td className={`table-td text-right tabular-nums font-medium ${realEstateNetJpy(r) < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                  {formatJpy(realEstateNetJpy(r))}
                </td>
                <td className="table-td whitespace-nowrap">
                  <button className="text-blue-700 text-xs mr-2" onClick={() => setEditing(r)}>
                    編集
                  </button>
                  <button
                    className="text-red-700 text-xs"
                    onClick={() => {
                      if (confirm(`${r.name} を削除しますか？`)) {
                        dispatch({ type: 'DELETE_REAL_ESTATE', id: r.id });
                      }
                    }}
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <RealEstateEditor
          item={editing}
          onCancel={() => setEditing(null)}
          onSave={(item) => {
            dispatch({ type: 'UPSERT_REAL_ESTATE', item: { ...item, updatedAt: new Date().toISOString() } });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function RealEstateEditor({
  item,
  onCancel,
  onSave,
}: {
  item: RealEstate;
  onCancel: () => void;
  onSave: (r: RealEstate) => void;
}) {
  const [draft, setDraft] = useState<RealEstate>(item);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-10 p-4" onClick={onCancel}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold text-slate-800">物件の{item.name ? '編集' : '追加'}</h3>
        <div>
          <label className="label">物件名</label>
          <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">購入金額（円）</label>
            <input
              type="number"
              className="input tabular-nums"
              value={draft.purchasePrice}
              onChange={(e) => setDraft({ ...draft, purchasePrice: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="label">現在評価額（円）</label>
            <input
              type="number"
              className="input tabular-nums"
              value={draft.currentValue}
              onChange={(e) => setDraft({ ...draft, currentValue: Number(e.target.value) })}
            />
          </div>
        </div>
        <div>
          <label className="label">ローン残債（円）</label>
          <input
            type="number"
            className="input tabular-nums"
            value={draft.loanBalance}
            onChange={(e) => setDraft({ ...draft, loanBalance: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="label">メモ</label>
          <input className="input" value={draft.note ?? ''} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button className="btn-secondary" onClick={onCancel}>
            キャンセル
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              if (!draft.name.trim()) {
                alert('物件名は必須です');
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
