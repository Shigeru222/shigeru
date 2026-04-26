// 単純なCSVパーサ（ダブルクォート対応）。
// マネーフォワードの「資産残高CSV」を想定するが、列名は環境差があるためパース後にUI上でマッピングする。

export type CsvRow = Record<string, string>;

export function parseCsv(text: string): { headers: string[]; rows: CsvRow[] } {
  // BOM除去
  const t = text.replace(/^﻿/, '');
  const lines = splitLines(t);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = parseLine(lines[0]);
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cells = parseLine(line);
    const row: CsvRow = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = cells[j] ?? '';
    }
    rows.push(row);
  }
  return { headers, rows };
}

function splitLines(text: string): string[] {
  // CSVのダブルクォート内の改行を保持するため、簡易ステートマシンで分割
  const out: string[] = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuote = !inQuote;
      cur += c;
    } else if ((c === '\n' || c === '\r') && !inQuote) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      out.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  if (cur.length > 0) out.push(cur);
  return out;
}

function parseLine(line: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuote) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        inQuote = false;
      } else {
        cur += c;
      }
    } else {
      if (c === ',') {
        cells.push(cur);
        cur = '';
      } else if (c === '"') {
        inQuote = true;
      } else {
        cur += c;
      }
    }
  }
  cells.push(cur);
  return cells.map((s) => s.trim());
}

// 数値（日本円ロケールにありがちな ¥, ・カンマ・全角空白付）を数値化
export function parseAmount(raw: string): number {
  if (!raw) return 0;
  const s = raw
    .replace(/[¥￥,]/g, '')
    .replace(/[　\s]/g, '')
    .replace(/円$/, '')
    .replace(/[（(].*[)）]/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}
