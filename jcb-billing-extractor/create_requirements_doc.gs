/**
 * 要件定義書をGoogleドキュメントとして生成する
 * 実行後、生成されたGoogle DocをFile → Download → Microsoft Word (.docx) でWord形式に変換できる
 */

function createRequirementsDoc() {
  var doc = DocumentApp.create('要件定義書_JCBカードご利用通知メール自動集計ツール');
  var body = doc.getBody();
  body.clear();

  // タイトル
  var titlePara = body.appendParagraph('要件定義書');
  titlePara.setHeading(DocumentApp.ParagraphHeading.TITLE);
  titlePara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  var subPara = body.appendParagraph('JCBカードご利用通知メール自動集計ツール');
  subPara.setHeading(DocumentApp.ParagraphHeading.SUBTITLE);
  subPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  styleTable(body.appendTable([['作成日', '2026年5月6日'], ['バージョン', '1.1']]), false);

  // 1. 概要
  addH1(body, '1. 概要');
  addP(body, 'JCBカードの利用通知メールをGmailから自動取得し、利用日時・金額をGoogleスプレッドシートに記録・保存するツール。');

  // 2. 背景・課題
  addH1(body, '2. 背景・課題');
  addH2(body, '2-1. 現状の課題');
  styleTable(body.appendTable([
    ['No', '課題', '内容'],
    ['1', '確認の手間', 'JCBカード利用のたびにメールアプリを開いて金額を確認する必要がある'],
    ['2', '記録の欠如', '利用履歴をまとめて把握する手段がなく、家計管理に活用できていない'],
    ['3', '手動転記のミス', '金額を手動でメモ・表計算ソフトへ転記する際に記入漏れやミスが発生しやすい'],
    ['4', '環境の制約', 'PCを持たずスマートフォンのみで管理したいが、既存ツールはPC前提のものが多い']
  ]), true);
  addH2(body, '2-2. 解決方針');
  addP(body, 'Google Apps Scriptを活用し、スマートフォンのブラウザのみで動作する自動集計ツールを構築する。メールの取得・金額抽出・スプレッドシートへの記録・Googleドライブへの保存をすべて自動化する。');

  // 3. 目的
  addH1(body, '3. 目的');
  addP(body, 'JCBカードの利用明細をメールから手動で確認・記録する手間を省き、利用履歴をスプレッドシートで一元管理できるようにする。');

  // 4. 対象ユーザー
  addH1(body, '4. 対象ユーザー');
  addBullet(body, 'JCBカード会員');
  addBullet(body, 'Gmailを利用しているユーザー');
  addBullet(body, 'PCなしでスマートフォンのみで運用したいユーザー');

  // 5. システム構成
  addH1(body, '5. システム構成');
  styleTable(body.appendTable([
    ['要素', '内容', '選定理由'],
    ['実行環境', 'Google Apps Script', 'Googleアカウントさえあれば追加費用・インストール不要でブラウザから実行できる。スマートフォンのブラウザのみで完結できる唯一の選択肢。'],
    ['メール取得元', 'Gmail', 'GmailAppクラスで標準APIとして直接アクセスできるため、外部ライブラリや認証情報の別途取得が不要。'],
    ['出力形式', 'Googleスプレッドシート', 'Excelと同等の操作性を持ちながら、スマートフォンでもブラウザから閲覧・編集が可能。'],
    ['保存先', 'Googleドライブ', '追加設定なしで自動保存される。スマートフォンからもアクセス可能で、共有・バックアップ機能も標準搭載。'],
    ['追加インストール', '不要', 'Google Apps ScriptはGoogleアカウントに付属する無料サービス。非エンジニアでも即時利用可能な点を優先した。']
  ]), true);

  // 6. 処理フロー
  addH1(body, '6. 処理フロー');
  addNumbered(body, '① Gmailを検索（from:mail@qa.jcb.co.jp, subject:"ショッピングご利用のお知らせ"）');
  addNumbered(body, '② 件名フィルタ確認 → 「JCBカード／ショッピングご利用のお知らせ」を含むもののみ処理');
  addNumbered(body, '③ メール本文からデータ抽出（受信日時・件名・送信元・請求金額）');
  addNumbered(body, '④ 受信日時の昇順でソート');
  addNumbered(body, '⑤ 新規Googleスプレッドシートを生成（ファイル名: JCB請求履歴_yyyyMMdd_HHmm）');
  addNumbered(body, '⑥ データ書き込み・書式設定・合計行追加');
  addNumbered(body, '⑦ Googleドライブに保存・実行ログに件数とURLを出力');

  // 7. 機能要件
  addH1(body, '7. 機能要件');
  addH2(body, '7-1. メール取得');
  addBullet(body, '送信元アドレス mail@qa.jcb.co.jp のメールを対象とする');
  addBullet(body, '件名に「JCBカード／ショッピングご利用のお知らせ」を含むメールのみ処理する');
  addBullet(body, 'それ以外の件名（入会案内・お振替通知など）は除外する');
  addH2(body, '7-2. データ抽出');
  styleTable(body.appendTable([
    ['項目', '抽出元', '抽出方法', '備考'],
    ['受信日時', 'メールのヘッダー情報', 'GmailApp標準API', 'yyyy/MM/dd HH:mm 形式'],
    ['件名', 'メールの件名', 'GmailApp標準API', ''],
    ['送信元', '固定値', 'ハードコード', 'mail@qa.jcb.co.jp'],
    ['請求金額（円）', 'メール本文', '正規表現（【ご利用金額】）', '抽出できない場合は空欄']
  ]), true);
  addH2(body, '7-3. スプレッドシート生成');
  addBullet(body, '実行のたびに新規スプレッドシートを生成する');
  addBullet(body, 'ファイル名は JCB請求履歴_yyyyMMdd_HHmm 形式とする');
  addBullet(body, '保存先はGoogleドライブのマイドライブ直下とする');
  addBullet(body, 'データは受信日時の昇順で並べる');
  addH2(body, '7-4. スプレッドシートの構成');
  styleTable(body.appendTable([
    ['列', '項目', '書式'],
    ['A', '受信日時', 'テキスト'],
    ['B', '件名', 'テキスト'],
    ['C', '送信元', 'テキスト'],
    ['D', '請求月', 'テキスト'],
    ['E', '支払日', 'テキスト'],
    ['F', '請求金額（円）', '数値（#,##0）']
  ]), true);
  addBullet(body, '1行目はヘッダー行（紺色背景・白文字・太字）');
  addBullet(body, '1行目を固定表示（スクロール時も常に表示）');
  addBullet(body, '最終行に合計金額を表示する（水色背景・太字）');

  // 8. 非機能要件
  addH1(body, '8. 非機能要件');
  styleTable(body.appendTable([
    ['項目', '要件', '補足'],
    ['実行環境', 'スマートフォンのブラウザのみで完結すること', 'PC不要'],
    ['追加費用', '無料で運用できること', 'Google Apps Scriptの無料枠内'],
    ['セキュリティ', 'メールデータは自身のGoogleアカウント内のみで処理すること', '外部サーバーへの送信なし'],
    ['操作性', '非エンジニアでも手順書に従い設定・実行できること', '初回設定含め30分以内を目安'],
    ['保守性', '金額抽出パターンをコード上部の変数で管理し、変更容易にすること', 'メールフォーマット変更への対応']
  ]), true);

  // 9. エラーハンドリング要件
  addH1(body, '9. エラーハンドリング要件');
  styleTable(body.appendTable([
    ['ケース', '挙動'],
    ['対象メールが1件も見つからない', 'スプレッドシートはヘッダー行のみで生成し、実行ログに0件と出力する'],
    ['メール本文から金額が抽出できない', '該当行の請求金額列を空欄にしてスプレッドシートへ記録する（処理は継続）'],
    ['スプレッドシートの生成に失敗した', '実行ログにエラー内容を出力し、処理を中断する'],
    ['実行時間が上限（6分）に達した', '途中までのデータでスプレッドシートを生成し、残りは次回実行で対応する']
  ]), true);

  // 10. テスト要件
  addH1(body, '10. テスト要件');
  styleTable(body.appendTable([
    ['テスト項目', '確認内容', '期待結果'],
    ['件名フィルタ', '対象外メールが除外されること', '入会案内・お振替通知が出力されないこと'],
    ['金額抽出', '【ご利用金額】から正しく数値が取れること', '金額列に正しい数値が入ること'],
    ['ソート順', '受信日時の昇順でデータが並ぶこと', '上から古い順に並んでいること'],
    ['合計行', '最終行にF列の合計が表示されること', 'SUM関数で全行の合計が正しく計算されること'],
    ['ファイル名', '実行日時を含むファイル名で生成されること', 'JCB請求履歴_20260506_0703 のような形式'],
    ['新規生成', '実行するたびに新しいファイルが作成されること', '既存ファイルが上書きされないこと']
  ]), true);

  // 11. 制約条件
  addH1(body, '11. 制約条件');
  addBullet(body, 'Google Apps Scriptの1回の実行時間上限は6分（大量のメールがある場合は注意）');
  addBullet(body, 'Gmailの検索APIは最大500スレッドまで取得可能');
  addBullet(body, 'getPlainBody() でテキスト形式の本文を取得するため、HTML専用メールは抽出不可の場合がある');
  addBullet(body, 'JCBからのメールフォーマットが変更された場合、正規表現パターンの修正が必要になる可能性がある');

  // 12. 対象外
  addH1(body, '12. 対象外');
  addBullet(body, 'Outlook等のGmail以外のメールサービス');
  addBullet(body, 'JCB以外のカード会社のメール');
  addBullet(body, '月次請求金額の合算（利用通知ごとの個別金額を記録する）');
  addBullet(body, 'リアルタイム通知・プッシュ通知');
  addBullet(body, '複数Googleアカウントの同時管理');

  // 13. 将来の拡張候補
  addH1(body, '13. 将来の拡張候補');
  styleTable(body.appendTable([
    ['項目', '内容'],
    ['定期自動実行', 'Google Apps Scriptのトリガー機能で毎日・毎週自動実行する'],
    ['利用店舗の抽出', 'メール本文の【ご利用先】から店舗名を抽出して列に追加する'],
    ['月別集計シート', '月ごとの合計金額をまとめた集計シートを自動生成する'],
    ['複数カード対応', 'JCB以外のカード会社メールにも対応できるよう設定化する'],
    ['通知機能', '集計完了後にGmailで結果通知メールを自動送信する']
  ]), true);

  // 14. 実行手順
  addH1(body, '14. 実行手順');
  addNumbered(body, '① script.google.com をブラウザで開く');
  addNumbered(body, '② 「新しいプロジェクト」を作成する');
  addNumbered(body, '③ デフォルトのコードを削除し、jcb_billing.gs の内容を貼り付ける');
  addNumbered(body, '④ 関数のドロップダウンで extractJcbBilling を選択して ▶ 実行する');
  addNumbered(body, '⑤ 初回のみ「承認が必要です」→「権限を確認」→「許可」を選択する');
  addNumbered(body, '⑥ Googleドライブのマイドライブに JCB請求履歴_日時 ファイルが生成されていることを確認する');

  // 15. 用語定義
  addH1(body, '15. 用語定義');
  styleTable(body.appendTable([
    ['用語', '説明'],
    ['Google Apps Script（GAS）', 'Googleが提供するクラウドベースのスクリプト実行環境。JavaScriptをベースとし、GoogleサービスのAPIに標準で対応している'],
    ['GmailApp', 'GASでGmailを操作するための標準クラス'],
    ['SpreadsheetApp', 'GASでGoogleスプレッドシートを操作するための標準クラス'],
    ['正規表現', '文字列のパターンを記述するための表現。メール本文から金額を抽出する際に使用している'],
    ['利用通知メール', 'JCBカードを利用した際に mail@qa.jcb.co.jp から送信される「JCBカード／ショッピングご利用のお知らせ」メール']
  ]), true);

  // 16. 前提条件
  addH1(body, '16. 前提条件');
  styleTable(body.appendTable([
    ['No', '前提条件', '確認方法'],
    ['1', 'Googleアカウントを保有していること', 'Gmailにログインできること'],
    ['2', 'JCBカードの利用通知メールがGmailに届いていること', '受信トレイに mail@qa.jcb.co.jp からのメールがあること'],
    ['3', 'script.google.com にアクセスできること', 'ブラウザで開けること'],
    ['4', 'Googleドライブの空き容量があること', 'マイドライブに空き容量があること'],
    ['5', 'JCBカードの利用通知メール設定が有効になっていること', 'MyJCBで「カードご利用お知らせメール」が有効になっていること']
  ]), true);

  // 17. ステークホルダー
  addH1(body, '17. ステークホルダー');
  styleTable(body.appendTable([
    ['役割', '説明', '関与内容'],
    ['利用者', 'JCBカード会員本人', 'ツールの実行・スプレッドシートの閲覧・管理'],
    ['開発者', 'ツール作成者', 'コードの作成・保守・機能追加対応'],
    ['JCB（外部）', 'カード会社', '利用通知メールの送信元。メールフォーマットの変更が本ツールに影響する可能性がある'],
    ['Google（外部）', 'サービス提供者', 'Gmail・GAS・Googleドライブの運営。API仕様変更が本ツールに影響する可能性がある']
  ]), true);

  // 18. リスクと対策
  addH1(body, '18. リスクと対策');
  styleTable(body.appendTable([
    ['No', 'リスク', '影響度', '発生可能性', '対策'],
    ['1', 'JCBメールのフォーマット変更', '高', '中', '定期的に出力結果を目視確認し、金額が空欄になっている場合は正規表現パターンを修正する'],
    ['2', 'Google Apps ScriptのAPI仕様変更', '高', '低', 'Googleの公式リリースノートを定期確認し、廃止予定のAPIがあれば事前に対応する'],
    ['3', 'Gmailの検索結果上限（500件）超過', '中', '低', 'メール件数が増加した場合はページネーション処理を追加対応する'],
    ['4', '実行時間上限（6分）超過', '中', '低', 'メール件数が多い場合は期間を絞った検索クエリに変更して分割実行する'],
    ['5', 'Googleアカウントへの不正アクセス', '高', '低', 'Googleアカウントに2段階認証を設定し、定期的にパスワードを変更する'],
    ['6', 'HTML専用メールへの対応漏れ', '低', '低', 'getPlainBody() が空の場合はHTMLタグを除去してフォールバック処理を追加する']
  ]), true);

  // 19. 運用・保守要件
  addH1(body, '19. 運用・保守要件');
  addH2(body, '19-1. 運用');
  styleTable(body.appendTable([
    ['項目', '内容'],
    ['実行タイミング', '任意のタイミングで手動実行。またはトリガー機能で定期自動実行も可能'],
    ['実行頻度の推奨', '月1回（月末～月初）を目安とする'],
    ['出力ファイルの管理', '実行のたびに新規ファイルが生成されるため、不要なファイルはGoogleドライブから手動削除する'],
    ['動作確認方法', '実行後にGoogleドライブで生成ファイルを開き、件数・金額・合計が正しいことを目視確認する']
  ]), true);
  addH2(body, '19-2. 保守');
  styleTable(body.appendTable([
    ['項目', '内容'],
    ['金額抽出パターンの変更', 'jcb_billing.gs 内の extractBillingAmount 関数の正規表現パターンを修正する'],
    ['対象メールアドレスの変更', 'コード冒頭の var SENDER を変更する'],
    ['対象件名の変更', 'コード冒頭の var TARGET_SUBJECT を変更する'],
    ['トラブル時の調査', 'debugEmailBody 関数を実行してメール本文を実行ログで確認する']
  ]), true);

  // 20. 受け入れ条件
  addH1(body, '20. 受け入れ条件');
  styleTable(body.appendTable([
    ['No', '受け入れ条件'],
    ['1', '「JCBカード／ショッピングご利用のお知らせ」の件名を持つメールのみが出力されること'],
    ['2', '各メールから請求金額が正しく抽出されてF列に数値で表示されること'],
    ['3', 'データが受信日時の昇順で並んでいること'],
    ['4', 'スプレッドシートの最終行に全件の合計金額が表示されること'],
    ['5', '実行のたびに新しいスプレッドシートが JCB請求履歴_yyyyMMdd_HHmm の名前で生成されること'],
    ['6', 'スマートフォンのブラウザのみで初回設定から実行まで完結できること']
  ]), true);

  // 21. コスト
  addH1(body, '21. コスト');
  var costTable = body.appendTable([
    ['項目', '費用', '備考'],
    ['Google Apps Script', '無料', 'Googleアカウントに付属。1日あたりの実行時間上限は90分'],
    ['Gmail', '無料', 'Googleアカウントに付属'],
    ['Googleドライブ', '無料', 'Googleスプレッドシートはドライブの容量を消費しない'],
    ['Googleスプレッドシート', '無料', 'Googleアカウントに付属'],
    ['合計', '¥0', 'すべてGoogleの無料サービスで完結']
  ]);
  styleTable(costTable, true);
  var lastRow = costTable.getRow(costTable.getNumRows() - 1);
  for (var c = 0; c < lastRow.getNumCells(); c++) {
    lastRow.getCell(c).editAsText().setBold(true);
  }

  // 22. 改訂履歴
  addH1(body, '22. 改訂履歴');
  styleTable(body.appendTable([
    ['バージョン', '日付', '変更内容'],
    ['1.0', '2026年5月6日', '初版作成'],
    ['1.1', '2026年5月6日', '前提条件・ステークホルダー・リスクと対策・運用保守要件・受け入れ条件・コストを追加']
  ]), true);

  doc.saveAndClose();
  var url = doc.getUrl();
  Logger.log('要件定義書を作成しました: ' + url);
  try {
    SpreadsheetApp.getUi().alert('完了', '要件定義書を作成しました。\n' + url, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {}
}

// ── ヘルパー関数 ──────────────────────────────

function addH1(body, text) {
  var p = body.appendParagraph(text);
  p.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  return p;
}

function addH2(body, text) {
  var p = body.appendParagraph(text);
  p.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  return p;
}

function addP(body, text) {
  return body.appendParagraph(text);
}

function addBullet(body, text) {
  var p = body.appendParagraph('・' + text);
  p.setIndentStart(20);
  return p;
}

function addNumbered(body, text) {
  return body.appendParagraph(text);
}

function styleTable(table, hasHeader) {
  table.setBorderWidth(1);
  for (var r = 0; r < table.getNumRows(); r++) {
    var row = table.getRow(r);
    for (var c = 0; c < row.getNumCells(); c++) {
      var cell = row.getCell(c);
      cell.setPaddingTop(4);
      cell.setPaddingBottom(4);
      cell.setPaddingLeft(6);
      cell.setPaddingRight(6);
      if (hasHeader && r === 0) {
        cell.setBackgroundColor('#1F4E79');
        cell.editAsText().setForegroundColor('#FFFFFF').setBold(true);
      }
    }
  }
  return table;
}
