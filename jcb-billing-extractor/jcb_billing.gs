/**
 * JCB請求メール抽出スクリプト（Google Apps Script版）
 * mail@qa.jcb.co.jp からのメールを取得し、請求金額をスプレッドシートに記録する
 */

var SENDER = 'mail@qa.jcb.co.jp';
var SPREADSHEET_NAME = 'JCB請求履歴';
var SHEET_NAME = 'JCB請求履歴';
var MSG_ID_COL = 7; // 重複チェック用のメッセージIDを格納する列（非表示）

function extractJcbBilling() {
  var ss = getOrCreateSpreadsheet();
  var sheet = getOrCreateSheet(ss);

  setupHeadersIfEmpty(sheet);

  var existingIds = getExistingMessageIds(sheet);
  var threads = GmailApp.search('from:' + SENDER);
  var newCount = 0;

  for (var i = 0; i < threads.length; i++) {
    var messages = threads[i].getMessages();
    for (var j = 0; j < messages.length; j++) {
      var msg = messages[j];
      var msgId = msg.getId();

      if (existingIds[msgId]) continue;

      var subject = msg.getSubject();
      var date = msg.getDate();
      var body = msg.getPlainBody();

      var billingAmount = extractBillingAmount(body);
      var billingMonth = extractBillingMonth(body);
      var paymentDate = extractPaymentDate(body);
      var dateStr = Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');

      sheet.appendRow([dateStr, subject, SENDER, billingMonth, paymentDate, billingAmount, msgId]);
      newCount++;
    }
  }

  // 受信日時で昇順ソート（ヘッダー行を除く）
  var lastRow = sheet.getLastRow();
  if (lastRow > 2) {
    sheet.getRange(2, 1, lastRow - 1, MSG_ID_COL).sort({ column: 1, ascending: true });
  }

  // 請求金額列の書式を数値に設定
  if (lastRow > 1) {
    sheet.getRange(2, 6, lastRow - 1, 1).setNumberFormat('#,##0');
  }

  var url = ss.getUrl();
  var message = newCount + ' 件の新規メールを追加しました。\n' + url;
  Logger.log(message);

  try {
    SpreadsheetApp.getUi().alert('完了', message, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    // スクリプトエディタから実行した場合はアラート不要
  }
}

// ────────────────────────────────────────────────────────────
// 請求金額を抽出する（数値 or null）
// ────────────────────────────────────────────────────────────
function extractBillingAmount(body) {
  var patterns = [
    /ご請求金額[\s　]*[：:]\s*([\d,，]+)円/,
    /請求金額[\s　]*[：:]\s*([\d,，]+)円/,
    /お支払金額[\s　]*[：:]\s*([\d,，]+)円/,
    /お支払い金額[\s　]*[：:]\s*([\d,，]+)円/,
    /合計金額[\s　]*[：:]\s*([\d,，]+)円/,
    /([\d,，]+)円.*?ご請求/,
  ];

  for (var i = 0; i < patterns.length; i++) {
    var match = body.match(patterns[i]);
    if (match) {
      var cleaned = match[1].replace(/[,，]/g, '');
      var amount = parseInt(cleaned, 10);
      if (!isNaN(amount)) return amount;
    }
  }
  return null;
}

// ────────────────────────────────────────────────────────────
// 請求月を抽出する（例: "2025年04月" or ""）
// ────────────────────────────────────────────────────────────
function extractBillingMonth(body) {
  var patterns = [
    /(\d{4})年\s*(\d{1,2})月.*?ご請求/,
    /(\d{4})年(\d{1,2})月分/,
    /(\d{4})\/(\d{1,2}).*?ご請求/,
  ];

  for (var i = 0; i < patterns.length; i++) {
    var match = body.match(patterns[i]);
    if (match) {
      var month = ('0' + match[2]).slice(-2);
      return match[1] + '年' + month + '月';
    }
  }
  return '';
}

// ────────────────────────────────────────────────────────────
// 支払日を抽出する（例: "2025/05/10" or ""）
// ────────────────────────────────────────────────────────────
function extractPaymentDate(body) {
  var patterns = [
    /お引き落とし日[\s　]*[：:]\s*(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/,
    /(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日.*?お引き落とし/,
    /支払日[\s　]*[：:]\s*(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/,
    /(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日.*?引落/,
  ];

  for (var i = 0; i < patterns.length; i++) {
    var match = body.match(patterns[i]);
    if (match) {
      var month = ('0' + match[2]).slice(-2);
      var day = ('0' + match[3]).slice(-2);
      return match[1] + '/' + month + '/' + day;
    }
  }
  return '';
}

// ────────────────────────────────────────────────────────────
// ヘルパー関数
// ────────────────────────────────────────────────────────────

function getOrCreateSpreadsheet() {
  var files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
  return SpreadsheetApp.create(SPREADSHEET_NAME);
}

function getOrCreateSheet(ss) {
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getActiveSheet();
    sheet.setName(SHEET_NAME);
  }
  return sheet;
}

function setupHeadersIfEmpty(sheet) {
  if (sheet.getLastRow() > 0) return;

  var headers = ['受信日時', '件名', '送信元', '請求月', '支払日', '請求金額（円）', 'msgId'];
  sheet.appendRow(headers);

  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1F4E79');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  // msgId列（G列）を非表示にする
  sheet.hideColumns(MSG_ID_COL);

  // 列幅の設定
  sheet.setColumnWidth(1, 150); // 受信日時
  sheet.setColumnWidth(2, 350); // 件名
  sheet.setColumnWidth(3, 180); // 送信元
  sheet.setColumnWidth(4, 100); // 請求月
  sheet.setColumnWidth(5, 110); // 支払日
  sheet.setColumnWidth(6, 140); // 請求金額

  sheet.setFrozenRows(1);
}

function getExistingMessageIds(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return {};

  var ids = sheet.getRange(2, MSG_ID_COL, lastRow - 1, 1).getValues();
  var idMap = {};
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0]) idMap[ids[i][0]] = true;
  }
  return idMap;
}
