"use client";

import { useEffect, useState, useCallback } from "react";

// ── ステータス定義 ──────────────────────────────────────────────
const STATUS = [
  { id: 0, label: "未導入",       bg: "#374151", border: "#4B5563", text: "#9CA3AF", dot: "#6B7280" },
  { id: 1, label: "相談中",       bg: "#78350F", border: "#92400E", text: "#FCD34D", dot: "#F59E0B" },
  { id: 2, label: "案件推進中",   bg: "#7C2D12", border: "#9A3412", text: "#FED7AA", dot: "#F97316" },
  { id: 3, label: "導入実績あり", bg: "#064E3B", border: "#065F46", text: "#6EE7B7", dot: "#10B981" },
] as const;

type StatusId = 0 | 1 | 2 | 3;

// ── 組織データ ─────────────────────────────────────────────────
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

const ORG: Honbu[] = [
  {
    id: "hq_keiei",
    name: "経営戦略本部",
    units: [
      { id: "keiei_bu",      name: "経営戦略部",                    type: "部" },
      { id: "zaimu_bu",      name: "財務部",                        type: "部" },
      { id: "corp_comm_bu",  name: "コーポレートコミュニケーション部", type: "部" },
      { id: "jinzai_bu",     name: "人財戦略部",                    type: "部" },
      { id: "soumu_bu",      name: "総務・秘書部",                  type: "部" },
    ],
  },
  {
    id: "hq_governance",
    name: "ガバナンス推進本部",
    units: [
      { id: "homu_bu",    name: "法務部",              type: "部" },
      { id: "comp_bu",    name: "コンプライアンス推進部", type: "部" },
      { id: "kansa_bu",   name: "監査部",              type: "部" },
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
      { id: "eki_bu",          name: "駅業務部",   type: "部", children: [] },
      {
        id: "unyu_bu", name: "運輸部", type: "部",
        children: [
          { id: "unyu_kikaku_ka",  name: "企画戦略課",                   type: "課" },
          { id: "unyu_yuso_ka",    name: "輸送戦略課",                   type: "課" },
          { id: "unyu_ops_ka",     name: "運輸オペレーションマネジメント課", type: "課" },
          { id: "unyu_setsby_ka",  name: "運輸設備マネジメント課",         type: "課" },
          { id: "tetsudo_hk_ka",   name: "鉄道システム変革課",            type: "課" },
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
      { id: "cs_bu",           name: "CS戦略部",  type: "部",  children: [] },
      { id: "shinkansen_hq",   name: "新幹線本部", type: "本部", children: [] },
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
      { id: "dx_bu",   name: "DX推進部",           type: "部" },
      { id: "data_bu", name: "データアナリティクス部", type: "部" },
    ],
  },
  {
    id: "hq_chiho",
    name: "地方機関",
    units: [
      { id: "kinki_tokatsu",   name: "近畿統括本部",         type: "本部" },
      { id: "chugoku_tokatsu", name: "中国統括本部",         type: "本部" },
      { id: "sanyo_shinkansen",name: "山陽新幹線統括本部",   type: "本部" },
      { id: "tokyo_honbu",     name: "東京本部",             type: "本部" },
    ],
  },
];

// ── ユーティリティ ─────────────────────────────────────────────
const STORAGE_KEY = "jr_west_heatmap_v1";

function flatUnits(honbu: Honbu): Unit[] {
  return honbu.units.flatMap((u) => [u, ...(u.children ?? [])]);
}

function allUnits(): Unit[] {
  return ORG.flatMap(flatUnits);
}

// ── メインコンポーネント ───────────────────────────────────────
export default function HeatmapPage() {
  const [state, setState] = useState<Record<string, StatusId>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setState(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  const getStatus = useCallback((id: string): StatusId => (state[id] ?? 0) as StatusId, [state]);

  const cycleStatus = useCallback(
    (id: string) => {
      setState((prev) => {
        const next = { ...prev, [id]: (((prev[id] ?? 0) + 1) % STATUS.length) as StatusId };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const resetAll = useCallback(() => {
    if (!confirm("全ステータスをリセットしますか？")) return;
    setState({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  if (!loaded) return null;

  const units = allUnits();
  const counts = STATUS.map((s) => units.filter((u) => getStatus(u.id) === s.id).length);
  const total = units.length;

  return (
    <div className="min-h-screen" style={{ background: "#0a0a1a", color: "#e2e8f0" }}>
      {/* ヘッダー */}
      <header
        style={{
          background: "rgba(15,23,42,0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "14px 20px",
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9" }}>
                JR西日本 部門進捗ヒートマップ
              </h1>
              <p style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                カードをクリックしてステータスを更新 — 自動保存
              </p>
            </div>

            {/* 集計バッジ */}
            <div style={{ display: "flex", gap: 8, marginLeft: "auto", flexWrap: "wrap", alignItems: "center" }}>
              {STATUS.map((s, i) => (
                <span
                  key={s.id}
                  style={{
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                    color: s.text,
                    padding: "3px 10px",
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
                  {s.label}
                  <strong>{counts[i]}</strong>
                </span>
              ))}
              <span style={{ fontSize: 12, color: "#64748b" }}>/ {total} 部課</span>
              <button
                onClick={resetAll}
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  background: "transparent",
                  border: "1px solid #374151",
                  borderRadius: 6,
                  padding: "3px 10px",
                  cursor: "pointer",
                }}
              >
                リセット
              </button>
            </div>
          </div>

          {/* 凡例 */}
          <div style={{ display: "flex", gap: 20, marginTop: 10, flexWrap: "wrap" }}>
            {STATUS.map((s) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#94a3b8" }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: s.dot, display: "inline-block" }} />
                {s.label}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* 本体 */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
        {ORG.map((honbu) => (
          <HonbuBlock key={honbu.id} honbu={honbu} getStatus={getStatus} cycleStatus={cycleStatus} />
        ))}
      </main>
    </div>
  );
}

// ── 本部ブロック ──────────────────────────────────────────────
function HonbuBlock({
  honbu,
  getStatus,
  cycleStatus,
}: {
  honbu: Honbu;
  getStatus: (id: string) => StatusId;
  cycleStatus: (id: string) => void;
}) {
  const units = flatUnits(honbu);
  const greenCount = units.filter((u) => getStatus(u.id) === 3).length;
  const orangeCount = units.filter((u) => getStatus(u.id) === 2).length;
  const yellowCount = units.filter((u) => getStatus(u.id) === 1).length;
  const progress = Math.round((greenCount / units.length) * 100);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* 本部ヘッダー */}
      <div
        style={{
          background: "rgba(30,41,59,0.8)",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{honbu.name}</span>
        <div style={{ display: "flex", gap: 8, marginLeft: "auto", alignItems: "center" }}>
          {yellowCount > 0 && (
            <span style={{ fontSize: 11, color: "#FCD34D" }}>相談中 {yellowCount}</span>
          )}
          {orangeCount > 0 && (
            <span style={{ fontSize: 11, color: "#FED7AA" }}>推進中 {orangeCount}</span>
          )}
          <span style={{ fontSize: 11, color: "#6EE7B7" }}>導入済 {greenCount}/{units.length}</span>
          {/* プログレスバー */}
          <div style={{ width: 60, height: 4, background: "#1e293b", borderRadius: 99, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "#10B981",
                borderRadius: 99,
                transition: "width 0.3s",
              }}
            />
          </div>
        </div>
      </div>

      {/* 部・課カード */}
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {honbu.units.map((unit) => (
          <UnitGroup key={unit.id} unit={unit} getStatus={getStatus} cycleStatus={cycleStatus} />
        ))}
      </div>
    </div>
  );
}

// ── 部グループ（部カード + 課カード群） ───────────────────────
function UnitGroup({
  unit,
  getStatus,
  cycleStatus,
}: {
  unit: Unit;
  getStatus: (id: string) => StatusId;
  cycleStatus: (id: string) => void;
}) {
  const hasChildren = unit.children && unit.children.length > 0;

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <StatusCard unit={unit} getStatus={getStatus} cycleStatus={cycleStatus} size="md" />
      </div>
      {hasChildren && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 5,
            marginTop: 6,
            marginLeft: 20,
            paddingLeft: 10,
            borderLeft: "2px solid rgba(255,255,255,0.08)",
          }}
        >
          {unit.children!.map((child) => (
            <StatusCard key={child.id} unit={child} getStatus={getStatus} cycleStatus={cycleStatus} size="sm" />
          ))}
        </div>
      )}
    </div>
  );
}

// ── ステータスカード ───────────────────────────────────────────
function StatusCard({
  unit,
  getStatus,
  cycleStatus,
  size,
}: {
  unit: Unit;
  getStatus: (id: string) => StatusId;
  cycleStatus: (id: string) => void;
  size: "md" | "sm";
}) {
  const [hovered, setHovered] = useState(false);
  const s = STATUS[getStatus(unit.id)];
  const isMd = size === "md";

  return (
    <button
      onClick={() => cycleStatus(unit.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`クリックで次のステータスへ\n現在: ${s.label}`}
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderLeft: `3px solid ${s.dot}`,
        color: s.text,
        borderRadius: 7,
        padding: isMd ? "8px 12px" : "6px 10px",
        minWidth: isMd ? 130 : 110,
        maxWidth: 220,
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s",
        transform: hovered ? "translateY(-1px)" : "none",
        boxShadow: hovered ? `0 4px 12px rgba(0,0,0,0.4)` : "none",
        filter: hovered ? "brightness(1.15)" : "none",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 600,
          opacity: 0.6,
          marginBottom: 3,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {unit.type}
      </div>
      <div
        style={{
          fontSize: isMd ? 13 : 11,
          fontWeight: 700,
          lineHeight: 1.4,
        }}
      >
        {unit.name}
      </div>
      <div
        style={{
          fontSize: 10,
          marginTop: 4,
          display: "flex",
          alignItems: "center",
          gap: 4,
          opacity: 0.85,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
        {s.label}
      </div>
    </button>
  );
}
