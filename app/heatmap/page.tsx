"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

// ── ステータス定義 ──────────────────────────────────────────────
const STATUS = [
  { id: 0, label: "未導入",       bg: "#1f2937", border: "#374151", text: "#9CA3AF", dot: "#6B7280" },
  { id: 1, label: "相談中",       bg: "#78350F", border: "#92400E", text: "#FCD34D", dot: "#F59E0B" },
  { id: 2, label: "案件推進中",   bg: "#7C2D12", border: "#9A3412", text: "#FED7AA", dot: "#F97316" },
  { id: 3, label: "導入実績あり", bg: "#064E3B", border: "#065F46", text: "#6EE7B7", dot: "#10B981" },
] as const;

type StatusId = 0 | 1 | 2 | 3;

interface Unit {
  id: string;
  name: string;
  type: string;
  children?: Unit[];
}

interface Honbu {
  id: string;
  name: string;
  units: Unit[];
}

interface CustomEntry {
  id: string;
  name: string;
  type: string;
  level: "honbu" | "bu" | "ka";
  parentId?: string;
}

// ── 組織データ（ベース） ───────────────────────────────────────
const BASE_ORG: Honbu[] = [
  {
    id: "hq_keiei",
    name: "経営戦略本部",
    units: [
      { id: "keiei_bu",     name: "経営戦略部",                    type: "部" },
      { id: "zaimu_bu",     name: "財務部",                        type: "部" },
      { id: "corp_comm_bu", name: "コーポレートコミュニケーション部", type: "部" },
      { id: "jinzai_bu",    name: "人財戦略部",                    type: "部" },
      { id: "soumu_bu",     name: "総務・秘書部",                  type: "部" },
    ],
  },
  {
    id: "hq_governance",
    name: "ガバナンス推進本部",
    units: [
      { id: "homu_bu",  name: "法務部",               type: "部" },
      { id: "comp_bu",  name: "コンプライアンス推進部", type: "部" },
      { id: "kansa_bu", name: "監査部",               type: "部" },
    ],
  },
  {
    id: "hq_anzen",
    name: "安全推進本部",
    units: [
      { id: "anzen_bu",  name: "安全推進部", type: "部" },
      { id: "anzen_lab", name: "安全研究所",  type: "研究所" },
    ],
  },
  {
    id: "hq_tetsudo",
    name: "鉄道本部",
    units: [
      { id: "eki_bu",        name: "駅業務部",   type: "部",  children: [] },
      {
        id: "unyu_bu", name: "運輸部", type: "部",
        children: [
          { id: "unyu_kikaku_ka", name: "企画戦略課",                   type: "課" },
          { id: "unyu_yuso_ka",   name: "輸送戦略課",                   type: "課" },
          { id: "unyu_ops_ka",    name: "運輸オペレーションマネジメント課", type: "課" },
          { id: "unyu_setsby_ka", name: "運輸設備マネジメント課",         type: "課" },
          { id: "tetsudo_hk_ka",  name: "鉄道システム変革課",            type: "課" },
        ],
      },
      {
        id: "sharyo_bu", name: "車両部", type: "部",
        children: [{ id: "sharyo_sekkei", name: "車両設計室", type: "室" }],
      },
      {
        id: "shisetsu_bu", name: "施設部", type: "部",
        children: [{ id: "shisetsu_gijutsu", name: "施設技術室", type: "室" }],
      },
      {
        id: "denki_bu", name: "電気部", type: "部",
        children: [{ id: "denki_gijutsu", name: "電気技術室", type: "室" }],
      },
      { id: "cs_bu",         name: "CS戦略部",  type: "部",  children: [] },
      { id: "shinkansen_hq", name: "新幹線本部", type: "本部", children: [] },
    ],
  },
  {
    id: "hq_marketing",
    name: "マーケティング本部",
    units: [
      {
        id: "tetsudo_mkt_bu", name: "鉄道マーケティング部", type: "部",
        children: [{ id: "kinki_eigyo_bu", name: "近畿営業部", type: "部" }],
      },
      { id: "group_mkt_bu", name: "グループマーケティング推進部", type: "部", children: [] },
    ],
  },
  {
    id: "hq_chiiki",
    name: "地域まちづくり本部",
    units: [
      { id: "chiiki_kyosei_bu", name: "地域共生部",      type: "部" },
      { id: "machi_suishin_bu", name: "まちづくり推進部", type: "部" },
    ],
  },
  {
    id: "hq_digital",
    name: "デジタルソリューション本部",
    units: [
      { id: "dx_bu",   name: "DX推進部",            type: "部" },
      { id: "data_bu", name: "データアナリティクス部", type: "部" },
    ],
  },
  {
    id: "hq_chiho",
    name: "地方機関",
    units: [
      { id: "kinki_tokatsu",    name: "近畿統括本部",       type: "本部" },
      { id: "chugoku_tokatsu",  name: "中国統括本部",       type: "本部" },
      { id: "sanyo_shinkansen", name: "山陽新幹線統括本部", type: "本部" },
      { id: "tokyo_honbu",      name: "東京本部",           type: "本部" },
    ],
  },
];

// 3カラム配置
const BASE_COLUMNS: string[][] = [
  ["hq_keiei", "hq_governance", "hq_anzen"],
  ["hq_tetsudo"],
  ["hq_marketing", "hq_chiiki", "hq_digital", "hq_chiho"],
];

// ── ユーティリティ ─────────────────────────────────────────────
const STATUS_KEY  = "jr_west_heatmap_v1";
const CUSTOM_KEY  = "jr_west_custom_orgs_v1";

function genId(): string {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
}

function buildOrg(base: Honbu[], customs: CustomEntry[]): Honbu[] {
  const org: Honbu[] = JSON.parse(JSON.stringify(base));
  customs.filter(c => c.level === "honbu").forEach(c =>
    org.push({ id: c.id, name: c.name, units: [] })
  );
  customs.filter(c => c.level === "bu").forEach(c => {
    const h = org.find(h => h.id === c.parentId);
    if (h) h.units.push({ id: c.id, name: c.name, type: c.type, children: [] });
  });
  customs.filter(c => c.level === "ka").forEach(c => {
    for (const h of org) {
      const bu = h.units.find(u => u.id === c.parentId);
      if (bu) { (bu.children ??= []).push({ id: c.id, name: c.name, type: c.type }); break; }
    }
  });
  return org;
}

function flatUnits(honbu: Honbu): Unit[] {
  return honbu.units.flatMap(u => [u, ...(u.children ?? [])]);
}

// ── メインコンポーネント ───────────────────────────────────────
export default function HeatmapPage() {
  const [statusState, setStatusState] = useState<Record<string, StatusId>>({});
  const [customs, setCustoms]         = useState<CustomEntry[]>([]);
  const [loaded, setLoaded]           = useState(false);
  const [showModal, setShowModal]     = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STATUS_KEY);
      if (s) setStatusState(JSON.parse(s));
      const c = localStorage.getItem(CUSTOM_KEY);
      if (c) setCustoms(JSON.parse(c));
    } catch {}
    setLoaded(true);
  }, []);

  const org = useMemo(() => buildOrg(BASE_ORG, customs), [customs]);

  const columns = useMemo(() => {
    const baseSet = new Set(BASE_COLUMNS.flat());
    const extra   = org.map(h => h.id).filter(id => !baseSet.has(id));
    if (extra.length === 0) return BASE_COLUMNS;
    return [BASE_COLUMNS[0], BASE_COLUMNS[1], [...BASE_COLUMNS[2], ...extra]];
  }, [org]);

  const customIds  = useMemo(() => new Set(customs.map(c => c.id)), [customs]);
  const allUnits   = useMemo(() => org.flatMap(flatUnits), [org]);
  const counts     = useMemo(
    () => STATUS.map((s, i) => ({ ...s, count: allUnits.filter(u => (statusState[u.id] ?? 0) === i).length })),
    [allUnits, statusState]
  );

  const getStatus = useCallback((id: string): StatusId => (statusState[id] ?? 0) as StatusId, [statusState]);

  const cycleStatus = useCallback((id: string) => {
    setStatusState(prev => {
      const next = { ...prev, [id]: (((prev[id] ?? 0) + 1) % STATUS.length) as StatusId };
      localStorage.setItem(STATUS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addCustom = useCallback((entry: Omit<CustomEntry, "id">) => {
    setCustoms(prev => {
      const next = [...prev, { ...entry, id: genId() }];
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteCustom = useCallback((id: string) => {
    setCustoms(prev => {
      const toDelete = new Set<string>();
      const mark = (tid: string) => {
        toDelete.add(tid);
        prev.filter(c => c.parentId === tid).forEach(c => mark(c.id));
      };
      mark(id);
      const next = prev.filter(c => !toDelete.has(c.id));
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
      setStatusState(s => {
        const ns = { ...s };
        toDelete.forEach(tid => delete ns[tid]);
        localStorage.setItem(STATUS_KEY, JSON.stringify(ns));
        return ns;
      });
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    if (!confirm("全ステータスをリセットしますか？")) return;
    setStatusState({});
    localStorage.removeItem(STATUS_KEY);
  }, []);

  if (!loaded) return null;

  return (
    <div style={{
      height: "100dvh", display: "flex", flexDirection: "column",
      background: "#0a0a1a", color: "#e2e8f0", overflow: "hidden",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Noto Sans JP', sans-serif",
    }}>
      {/* ── ヘッダー ── */}
      <header style={{
        flexShrink: 0, padding: "8px 14px 6px",
        background: "rgba(15,23,42,0.97)", borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>JR西日本 組織マップ</span>
          <div style={{ display: "flex", gap: 5, marginLeft: "auto", alignItems: "center", flexWrap: "wrap" }}>
            {counts.map(s => (
              <span key={s.id} style={{
                background: s.bg, border: `1px solid ${s.border}`, color: s.text,
                padding: "2px 7px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
                {s.label}&nbsp;<strong>{s.count}</strong>
              </span>
            ))}
            <span style={{ fontSize: 11, color: "#4b5563" }}>/ {allUnits.length}</span>
            <button
              onClick={() => setShowModal(true)}
              style={{
                fontSize: 11, color: "#93c5fd",
                background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)",
                borderRadius: 5, padding: "2px 10px", cursor: "pointer", marginLeft: 4,
              }}
            >
              ＋ 組織を追加
            </button>
            <button
              onClick={resetAll}
              style={{
                fontSize: 10, color: "#6b7280", background: "transparent",
                border: "1px solid #374151", borderRadius: 5, padding: "2px 8px", cursor: "pointer",
              }}
            >
              リセット
            </button>
          </div>
        </div>
        {/* 凡例 */}
        <div style={{ display: "flex", gap: 14, marginTop: 5, alignItems: "center" }}>
          {STATUS.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#94a3b8" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: s.dot, display: "inline-block", flexShrink: 0 }} />
              {s.label}
            </div>
          ))}
          <span style={{ fontSize: 10, color: "#374151", marginLeft: "auto" }}>クリックでステータス変更</span>
        </div>
      </header>

      {/* ── 3カラム本体 ── */}
      <div style={{
        flex: 1, display: "grid", gridTemplateColumns: "1fr 1.15fr 1fr",
        gap: 8, padding: "8px", overflow: "hidden", minHeight: 0,
      }}>
        {columns.map((honbuIds, colIdx) => (
          <div key={colIdx} style={{
            display: "flex", flexDirection: "column", gap: 6,
            overflowY: "auto", minHeight: 0,
          }}>
            {honbuIds.map(hid => {
              const honbu = org.find(h => h.id === hid);
              if (!honbu) return null;
              return (
                <HonbuBlock
                  key={hid}
                  honbu={honbu}
                  getStatus={getStatus}
                  cycleStatus={cycleStatus}
                  customIds={customIds}
                  onDeleteCustom={deleteCustom}
                  isCustomHonbu={customIds.has(hid)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* ── 追加モーダル ── */}
      {showModal && (
        <AddModal org={org} onAdd={addCustom} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

// ── 本部ブロック ──────────────────────────────────────────────
function HonbuBlock({
  honbu, getStatus, cycleStatus, customIds, onDeleteCustom, isCustomHonbu,
}: {
  honbu: Honbu;
  getStatus: (id: string) => StatusId;
  cycleStatus: (id: string) => void;
  customIds: Set<string>;
  onDeleteCustom: (id: string) => void;
  isCustomHonbu: boolean;
}) {
  const fu         = flatUnits(honbu);
  const greenCount = fu.filter(u => getStatus(u.id) === 3).length;
  const progress   = fu.length > 0 ? Math.round((greenCount / fu.length) * 100) : 0;

  return (
    <div style={{
      background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 7, overflow: "hidden", flexShrink: 0,
    }}>
      {/* 本部ヘッダー */}
      <div style={{
        background: isCustomHonbu ? "rgba(59,130,246,0.15)" : "rgba(30,41,59,0.85)",
        padding: "4px 10px", display: "flex", alignItems: "center", gap: 8,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {honbu.name}
          {isCustomHonbu && <span style={{ fontSize: 9, marginLeft: 5, color: "#93c5fd", opacity: 0.7 }}>カスタム</span>}
        </span>
        <div style={{ width: 36, height: 3, background: "#1e293b", borderRadius: 99, overflow: "hidden", flexShrink: 0 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "#10B981", borderRadius: 99, transition: "width 0.3s" }} />
        </div>
        <span style={{ fontSize: 10, color: "#6EE7B7", flexShrink: 0 }}>{greenCount}/{fu.length}</span>
        {isCustomHonbu && (
          <button
            onClick={() => { if (confirm(`「${honbu.name}」を削除しますか？\n配下のカスタム追加部署も削除されます。`)) onDeleteCustom(honbu.id); }}
            style={{ fontSize: 11, color: "#f87171", background: "transparent", border: "none", cursor: "pointer", padding: "0 2px", lineHeight: 1, flexShrink: 0 }}
            title="この本部を削除"
          >
            ✕
          </button>
        )}
      </div>

      {/* カード一覧 */}
      <div style={{ padding: "5px 6px", display: "flex", flexDirection: "column", gap: 2 }}>
        {honbu.units.map(unit => (
          <UnitRow
            key={unit.id}
            unit={unit}
            getStatus={getStatus}
            cycleStatus={cycleStatus}
            customIds={customIds}
            onDeleteCustom={onDeleteCustom}
          />
        ))}
      </div>
    </div>
  );
}

// ── 部グループ ────────────────────────────────────────────────
function UnitRow({ unit, getStatus, cycleStatus, customIds, onDeleteCustom }: {
  unit: Unit;
  getStatus: (id: string) => StatusId;
  cycleStatus: (id: string) => void;
  customIds: Set<string>;
  onDeleteCustom: (id: string) => void;
}) {
  return (
    <div>
      <CompactCard
        unit={unit}
        status={getStatus(unit.id)}
        onCycle={cycleStatus}
        isChild={false}
        isCustom={customIds.has(unit.id)}
        onDelete={customIds.has(unit.id) ? onDeleteCustom : undefined}
      />
      {unit.children && unit.children.length > 0 && (
        <div style={{
          marginTop: 2, marginLeft: 8, paddingLeft: 6,
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          {unit.children.map(child => (
            <CompactCard
              key={child.id}
              unit={child}
              status={getStatus(child.id)}
              onCycle={cycleStatus}
              isChild={true}
              isCustom={customIds.has(child.id)}
              onDelete={customIds.has(child.id) ? onDeleteCustom : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── コンパクトカード ───────────────────────────────────────────
function CompactCard({ unit, status, onCycle, isChild, isCustom, onDelete }: {
  unit: Unit;
  status: StatusId;
  onCycle: (id: string) => void;
  isChild: boolean;
  isCustom: boolean;
  onDelete?: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const s = STATUS[status];

  return (
    <div style={{ position: "relative" }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <button
        onClick={() => onCycle(unit.id)}
        title={`${unit.name}（${unit.type}）— ${s.label}\nクリックで次のステータスへ`}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          width: "100%", height: isChild ? 20 : 23,
          padding: `0 ${onDelete && hovered ? "22px" : "6px"} 0 6px`,
          background: hovered ? `color-mix(in srgb, ${s.bg} 80%, white 20%)` : s.bg,
          border: `1px solid ${isCustom ? "rgba(59,130,246,0.4)" : s.border}`,
          borderLeft: `3px solid ${isCustom ? "#60a5fa" : s.dot}`,
          borderRadius: 4, cursor: "pointer", color: s.text,
          textAlign: "left", transition: "filter 0.1s, transform 0.1s",
          filter: hovered ? "brightness(1.2)" : "brightness(1)",
          transform: hovered ? "translateX(1px)" : "none",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 8, opacity: 0.5, flexShrink: 0, lineHeight: 1 }}>{unit.type}</span>
        <span style={{ fontSize: isChild ? 10 : 11, fontWeight: isChild ? 500 : 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, lineHeight: 1 }}>
          {unit.name}
        </span>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: isCustom ? "#60a5fa" : s.dot, flexShrink: 0 }} />
      </button>

      {/* カスタム削除ボタン */}
      {onDelete && hovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`「${unit.name}」を削除しますか？`)) onDelete(unit.id);
          }}
          style={{
            position: "absolute", right: 3, top: "50%", transform: "translateY(-50%)",
            fontSize: 10, color: "#f87171", background: "rgba(239,68,68,0.15)",
            border: "none", borderRadius: 3, cursor: "pointer",
            padding: "1px 4px", lineHeight: 1, zIndex: 1,
          }}
          title="削除"
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ── 追加モーダル ──────────────────────────────────────────────
function AddModal({ org, onAdd, onClose }: {
  org: Honbu[];
  onAdd: (entry: Omit<CustomEntry, "id">) => void;
  onClose: () => void;
}) {
  const [level, setLevel]               = useState<"honbu" | "bu" | "ka">("bu");
  const [parentHonbuId, setParentHonbuId] = useState(org[0]?.id ?? "");
  const [parentBuId, setParentBuId]     = useState("");
  const [name, setName]                 = useState("");
  const [type, setType]                 = useState("部");

  // levelが変わったらtype初期値をリセット
  useEffect(() => {
    if (level === "honbu") setType("本部");
    else if (level === "bu") setType("部");
    else setType("課");
  }, [level]);

  // 本部が変わったら部リストの先頭を選択
  useEffect(() => {
    const h = org.find(h => h.id === parentHonbuId);
    setParentBuId(h?.units[0]?.id ?? "");
  }, [parentHonbuId, org]);

  const buOptions = org.find(h => h.id === parentHonbuId)?.units ?? [];

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (level === "honbu")     onAdd({ name: name.trim(), type, level: "honbu" });
    else if (level === "bu")   onAdd({ name: name.trim(), type, level: "bu",  parentId: parentHonbuId });
    else                       onAdd({ name: name.trim(), type, level: "ka",  parentId: parentBuId });
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "7px 10px",
    background: "#1e293b", border: "1px solid #374151",
    borderRadius: 6, color: "#e2e8f0", fontSize: 12, outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: 24, width: 380, maxWidth: "90vw" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18, color: "#f1f5f9" }}>組織を追加</h2>

        {/* 階層選択 */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 6 }}>追加する階層</label>
          <div style={{ display: "flex", gap: 6 }}>
            {([["honbu", "本部"], ["bu", "部"], ["ka", "課・室"]] as const).map(([v, label]) => (
              <button key={v} onClick={() => setLevel(v)} style={{
                flex: 1, padding: "6px 0", borderRadius: 6, cursor: "pointer",
                border: level === v ? "1px solid #3b82f6" : "1px solid #374151",
                background: level === v ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.03)",
                color: level === v ? "#93c5fd" : "#9ca3af",
                fontSize: 12, fontWeight: level === v ? 700 : 400,
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 親本部選択 */}
        {(level === "bu" || level === "ka") && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 6 }}>所属する本部</label>
            <select value={parentHonbuId} onChange={e => setParentHonbuId(e.target.value)} style={inputStyle}>
              {org.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
        )}

        {/* 親部選択 */}
        {level === "ka" && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 6 }}>所属する部</label>
            <select value={parentBuId} onChange={e => setParentBuId(e.target.value)} style={inputStyle}>
              {buOptions.length === 0
                ? <option value="">（この本部に部がありません）</option>
                : buOptions.map(u => <option key={u.id} value={u.id}>{u.name}</option>)
              }
            </select>
          </div>
        )}

        {/* 名称入力 */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 6 }}>名称</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") onClose(); }}
            placeholder={level === "honbu" ? "例: 新事業推進本部" : level === "bu" ? "例: 新規事業部" : "例: 企画課"}
            style={inputStyle}
            autoFocus
          />
        </div>

        {/* 種別選択 */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 6 }}>種別</label>
          <select value={type} onChange={e => setType(e.target.value)} style={inputStyle}>
            {level === "honbu" && <option value="本部">本部</option>}
            {level === "bu" && (<><option value="部">部</option><option value="本部">本部</option></>)}
            {level === "ka" && (<><option value="課">課</option><option value="室">室</option><option value="部">部</option></>)}
          </select>
        </div>

        {/* ボタン */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "7px 16px", borderRadius: 6, border: "1px solid #374151", background: "transparent", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            style={{
              padding: "7px 16px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600,
              background: name.trim() ? "#2563eb" : "#1e3a5f",
              color: name.trim() ? "#fff" : "#64748b",
              cursor: name.trim() ? "pointer" : "default",
            }}
          >
            追加する
          </button>
        </div>
      </div>
    </div>
  );
}
