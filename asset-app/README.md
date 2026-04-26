# 資産管理・将来予測アプリ

ブラウザ単体で動作する個人用の資産管理＆将来予測シミュレーションアプリです。サーバー・DB は不要、データはすべて `localStorage` に保存されます。

## 主な機能

- **ダッシュボード**: 総資産（円換算）と資産クラス別ポートフォリオ円グラフ
- **資産一覧**: 日本株・米国株・投信・仮想通貨の銘柄管理＋現金・ウェルスナビ・証券口座の残高管理。価格・USD/JPY を一括自動更新
- **不動産**: 物件ごとに購入金額・現在評価額・ローン残債を入力し、純資産を合算
- **シミュレーション**: FP6係数（終価／現価／年金終価／年金現価／減債基金／資本回収）を順算/逆算モードで切り替え。複利＋月次積立の将来資産推移を 3 利回りで折れ線比較。利回り×期間の早見表も表示
- **設定**: JSON エクスポート/インポート、マネーフォワード資産残高 CSV のインポート（汎用列マッピングUI）、CORS プロキシ URL

## 技術スタック

- React 18 + TypeScript
- Vite 5
- Tailwind CSS v3
- Recharts
- 状態管理は `useReducer` + Context（外部ライブラリなし）

## セットアップ

```bash
cd asset-app
npm install
npm run dev    # http://localhost:5173
```

ビルド:

```bash
npm run build
npm run preview
```

## API 制限と CORS について

価格取得には以下のキー不要・無料APIを利用します。

| 用途 | API |
|------|-----|
| 日本株・米国株・ETF・ADR・USD/JPY | Yahoo Finance v7/v8（非公式） |
| 投資信託 | Yahoo Finance Japan の chart API（協会コード+`.T`） |
| 仮想通貨 | CoinGecko `simple/price` |

### CORS の扱い

ブラウザから直接これらのAPIを叩くと、**Yahoo Finance は CORS でブロック**されることが多いため、以下のいずれかの方法でアクセスします。

1. **公開 CORS プロキシ（本番／推奨）**
   - 設定タブで `CORS プロキシ URL` を指定（デフォルトは `https://corsproxy.io/?`）。
   - 末尾が `?` または `=` の場合は、対象URLを `encodeURIComponent` して連結します。
   - 末尾がそれ以外の場合は、対象URLをそのまま末尾に連結します（`https://proxy.example.com/https://...` のようなパススルー型）。
   - レート制限がある場合があるため、必要に応じて自分のプロキシに差し替えてください。

2. **Vite dev server のプロキシ（開発時）**
   - `corsProxy` を空欄にすると、`/proxy/yahoo` `/proxy/coingecko` 経由でリクエストされます（`vite.config.ts` 参照）。
   - 静的ホスティングした本番では使えません。

### ティッカーの記述例

| 種類 | 入力例 |
|------|--------|
| 日本株 | `7203.T`（トヨタ）, `9432.T`（NTT）, `1306.T`（TOPIX ETF） |
| 米国株・ETF・ADR | `AAPL`, `VOO`, `PBR`（Petrobras 普通株）, `PBR.A`（A種） |
| 投資信託 | Yahoo Japan のファンドコード（例: `0331418A`）。`.T` は自動付与 |
| 仮想通貨 | CoinGecko の id（例: `bitcoin`, `ethereum`, `solana`） |

### 取得失敗時のリカバリ

- 自動取得に失敗した銘柄は、編集画面の「手動価格上書き」欄に直接入力できます（自動取得値より優先されます）。
- 一括更新後、失敗した銘柄は資産一覧に黄色の通知として一覧表示されます。「価格を一括更新」ボタンで手動リトライ可能です。

## マネーフォワード CSV のインポート

CSV を選択するとヘッダーが解析され、UI で `日付・口座名・残高・金融機関名` の列を割り当てます。デフォルトの資産クラス（現金/ウェルスナビ/証券口座）と、口座ごとの上書きを指定できます。インポート時に同名の残高資産がある場合は上書き確認ダイアログが出ます。

> 証券口座の残高は個別銘柄に展開せず、ウェルスナビと同様に「評価額」として扱います（ポートフォリオ円グラフ・将来予測のいずれにも反映されます）。

## データ保存

- すべて `localStorage` に保存されます（キー: `asset-app/state/v1`）。
- バックアップは設定タブから JSON でエクスポート／インポートできます。
- データを完全に消すにはブラウザの DevTools から localStorage を削除してください。

## ディレクトリ構成

```
asset-app/
  src/
    api/        外部APIクライアント（Yahoo, CoinGecko, FX, CORSプロキシ）
    components/ 共通UI（現状なし）
    pages/      Dashboard / Assets / RealEstate / Simulation / Settings
    storage/    localStorage 入出力
    store/      AppContext + reducer
    types/      型定義
    utils/      FP6計算・CSVパーサ・整形ユーティリティ
```

## 注意事項

- 提供価格はあくまで参考値であり、投資判断の根拠としての正確性を保証するものではありません。
- 非公式 API（Yahoo Finance）は仕様変更で動かなくなる場合があります。その際は手動価格入力／別プロキシ／別データソースで対応してください。
