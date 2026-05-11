// KanjiVG (CC BY-SA 3.0) から小学2年生の漢字160字分の書き順データを取得し、
// lib/kanji-strokes.json として保存する一回限りのスクリプト。
//
// 使い方:
//   node scripts/fetch-strokes.mjs
//
// 出力:
//   lib/kanji-strokes.json
//   { "古": ["M...", "M...", ...], "新": [...], ... }

import { readFile, writeFile } from "node:fs/promises";

const KANJIVG_BASE = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji";

const dataSource = await readFile("lib/kanji-data.ts", "utf-8");
const chars = [...dataSource.matchAll(/\{ char: "(.+?)",/g)].map((m) => m[1]);
console.log(`Found ${chars.length} kanji in kanji-data.ts`);

function hexCode(char) {
  return char.codePointAt(0).toString(16).padStart(5, "0");
}

function extractStrokes(svg, code) {
  const start = svg.indexOf(`StrokePaths_${code}`);
  if (start < 0) return null;
  // StrokePaths と StrokeNumbers の間の <path d="..."> をすべて抽出
  const end = svg.indexOf("StrokeNumbers_", start);
  const slice = end > 0 ? svg.slice(start, end) : svg.slice(start);
  const paths = [...slice.matchAll(/<path[^>]*\bd="([^"]+)"/g)].map((m) => m[1]);
  return paths;
}

const out = {};
let ok = 0;
let fail = 0;

for (const char of chars) {
  const code = hexCode(char);
  const url = `${KANJIVG_BASE}/${code}.svg`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const svg = await res.text();
    const paths = extractStrokes(svg, code);
    if (!paths || paths.length === 0) {
      console.warn(`! ${char} (${code}): no strokes`);
      fail++;
      continue;
    }
    out[char] = paths;
    ok++;
    if (ok % 20 === 0) console.log(`  ... ${ok}/${chars.length}`);
  } catch (e) {
    console.error(`! ${char} (${code}): ${e.message}`);
    fail++;
  }
}

await writeFile("lib/kanji-strokes.json", JSON.stringify(out));
console.log(`\nDone: ${ok} OK, ${fail} failed`);
console.log(`Wrote lib/kanji-strokes.json (${(JSON.stringify(out).length / 1024).toFixed(1)} KB)`);
