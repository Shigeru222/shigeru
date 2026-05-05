"use client";

import { useEffect, useState, useCallback } from "react";

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

// ── 組織データ ─────────────────────────────────────────────────
const ORG: Honbu[] = [
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

// 3カラムのレイアウト配置
const COLUMN_LAYOUT: string[][] = [
  ["hq_keiei", "hq_governance", "hq_anzen"],
  ["hq_tetsudo"],
  ["hq_marketing", "hq_chiiki", "hq_digital", "hq_chiho"],
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

  const getStatus = useCallback(
    (id: string): StatusId => (state[id] ?? 0) as StatusId,
    [state]
  );

  const cycleStatus = useCallback((id: string) => {
    setState((prev) => {
      const next = {
        ...prev,
        [id]: (((prev[id] ?? 0) + 1) % STATUS.length) as StatusId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    if (!confirm("全ステータスをリセットしますか？")) return;
    setState({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  if (!loaded) return null;

  const units = allUnits();
  const counts = STATUS.map((s, i) => ({
    ...s,
    count: units.filter((u) => getStatus(u.id) === i).length,
  }));

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#0a0a1a",
        color: "#e2e8f0",
        overflow: "hidden",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Noto Sans JP', sans-serif",
      }}
    >
      {/* ── ヘッダー ── */}
      <header
        style={{
          flexShrink: 0,
          padding: "8px 14px 6px",
          background: "rgba(15,23,42,0.97)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>
            JR西日本 部門進捗ヒートマップ
          </span>

          {/* 集計バッジ */}
          <div
            style={{
              display: "flex",
              gap: 5,
              marginLeft: "auto",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {counts.map((s) => (
              <span
                key={s.id}
                style={{
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                  color: s.text,
                  padding: "2px 7px",
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: s.dot,
                    display: "inline-block",
                  }}
                />
                {s.label}&nbsp;
                <strong>{s.count}</strong>
              </span>
            ))}
            <span style={{ fontSize: 11, color: "#4b5563" }}>
              / {units.length}
            </span>
            <button
              onClick={resetAll}
              style={{
                fontSize: 10,
                color: "#6b7280",
                background: "transparent",
                border: "1px solid #374151",
                borderRadius: 5,
                padding: "2px 8px",
                cursor: "pointer",
                marginLeft: 4,
              }}
            >
              リセット
            </button>
          </div>
        </div>

        {/* 凡例 */}
        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 5,
            alignItems: "center",
          }}
        >
          {STATUS.map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                color: "#94a3b8",
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: s.dot,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              {s.label}
            </div>
          ))}
          <span style={{ fontSize: 10, color: "#374151", marginLeft: "auto" }}>
            クリックでステータス変更
          </span>
        </div>
      </header>

      {/* ── 3カラム本体 ── */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1.15fr 1fr",
          gap: 8,
          padding: "8px",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {COLUMN_LAYOUT.map((honbuIds, colIdx) => (
          <div
            key={colIdx}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            {honbuIds.map((hid) => {
              const honbu = ORG.find((h) => h.id === hid)!;
              const fu = flatUnits(honbu);
              const greenCount = fu.filter((u) => getStatus(u.id) === 3).length;
              const progress = Math.round((greenCount / fu.length) * 100);

              return (
                <div
                  key={hid}
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 7,
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {/* 本部ヘッダー */}
                  <div
                    style={{
                      background: "rgba(30,41,59,0.85)",
                      padding: "4px 10px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#e2e8f0",
                        flex: 1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {honbu.name}
                    </span>
                    {/* プログレスバー */}
                    <div
                      style={{
                        width: 36,
                        height: 3,
                        background: "#1e293b",
                        borderRadius: 99,
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
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
                    <span
                      style={{
                        fontSize: 10,
                        color: "#6EE7B7",
                        flexShrink: 0,
                      }}
                    >
                      {greenCount}/{fu.length}
                    </span>
                  </div>

                  {/* カード一覧 */}
                  <div
                    style={{
                      padding: "5px 6px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    {honbu.units.map((unit) => (
                      <UnitRow
                        key={unit.id}
                        unit={unit}
                        getStatus={getStatus}
                        cycleStatus={cycleStatus}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 部グループ（部 + 子の課・室） ─────────────────────────────
function UnitRow({
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
      <CompactCard
        unit={unit}
        status={getStatus(unit.id)}
        onCycle={cycleStatus}
        isChild={false}
      />
      {hasChildren && (
        <div
          style={{
            marginTop: 2,
            marginLeft: 8,
            paddingLeft: 6,
            borderLeft: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {unit.children!.map((child) => (
            <CompactCard
              key={child.id}
              unit={child}
              status={getStatus(child.id)}
              onCycle={cycleStatus}
              isChild={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── コンパクトカード ───────────────────────────────────────────
function CompactCard({
  unit,
  status,
  onCycle,
  isChild,
}: {
  unit: Unit;
  status: StatusId;
  onCycle: (id: string) => void;
  isChild: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const s = STATUS[status];

  return (
    <button
      onClick={() => onCycle(unit.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`${unit.name}（${unit.type}）— ${s.label}\nクリックで次へ`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        width: "100%",
        height: isChild ? 20 : 23,
        padding: "0 6px",
        background: hovered
          ? `color-mix(in srgb, ${s.bg} 80%, white 20%)`
          : s.bg,
        border: `1px solid ${s.border}`,
        borderLeft: `3px solid ${s.dot}`,
        borderRadius: 4,
        cursor: "pointer",
        color: s.text,
        textAlign: "left",
        transition: "filter 0.1s, transform 0.1s",
        filter: hovered ? "brightness(1.2)" : "brightness(1)",
        transform: hovered ? "translateX(1px)" : "none",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: 8,
          opacity: 0.5,
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        {unit.type}
      </span>
      <span
        style={{
          fontSize: isChild ? 10 : 11,
          fontWeight: isChild ? 500 : 700,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flex: 1,
          lineHeight: 1,
        }}
      >
        {unit.name}
      </span>
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: s.dot,
          flexShrink: 0,
        }}
      />
    </button>
  );
}
