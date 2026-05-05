/**
 * JCB請求メール抽出スクリプト（Google Apps Script版）
 * mail@qa.jcb.co.jp からの「JCBカード／ショッピングご利用のお知らせ」を取得し、
 * 利用金額をスプレッドシートに記録する。実行のたびに新規ファイルを生成する。
 */

var SENDER = 'mail@qa.jcb.co.jp';
var TARGET_SUBJECT = 'JCBカード／ショッピングご利用のお知らせ';

function extractJcbBilling() {
  var timestamp = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMdd_HHmm');
  var ss = SpreadsheetApp.create('JCB請求履歴_' + timestamp);
  var sheet = ss.getActiveSheet();
  sheet.setName('JCB請求履歴');
  setupHeaders(sheet);

  var threads = GmailApp.search('from:' + SENDER + ' subject:"ショッピングご利用のお知らせ"');
  var rows = [];

  for (var i = 0; i < threads.length; i++) {
    var messages = threads[i].getMessages();
    for (var j = 0; j < messages.length; j++) {
      var msg = messages[j];
      var subject = msg.getSubject();
      if (subject.indexOf(TARGET_SUBJECT) === -1) continue;
      var date = msg.getDate();
      var body = msg.getPlainBody();
      var dateStr = Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');
      rows.push([dateStr, subject, SENDER, '', '', extractBillingAmount(body)]);
    }
  }

  if (rows.length > 0) {
    rows.sort(function(a, b) { return a[0] > b[0] ? 1 : -1; });
    sheet.getRange(2, 1, rows.length, 6).setValues(rows);
    sheet.getRange(2, 6, rows.length, 1).setNumberFormat('#,##0');
  }

  Logger.log(rows.length + ' 件追加: ' + ss.getUrl());
  try {
    SpreadsheetApp.getUi().alert('完了', rows.length + ' 件追加しました。\n' + ss.getUrl(), SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {}
}

function extractBillingAmount(body) {
  var patterns = [
    /【ご利用金額】[\s　]*([\d,，]+)円/,
    /【ご請求金額】[\s　]*([\d,，]+)円/,
    /ご利用金額[\s　]*[：:]\s*([\d,，]+)円/,
    /ご利用額[\s　]*[：:]\s*([\d,，]+)円/,
    /利用金額[\s　]*[：:]\s*([\d,，]+)円/,
    /ご請求金額[\s　]*[：:]\s*([\d,，]+)円/,
    /請求金額[\s　]*[：:]\s*([\d,，]+)円/,
    /お支払金額[\s　]*[：:]\s*([\d,，]+)円/,
    /合計金額[\s　]*[：:]\s*([\d,，]+)円/,
  ];
  for (var i = 0; i < patterns.length; i++) {
    var match = body.match(patterns[i]);
    if (match) {
      var amount = parseInt(match[1].replace(/[,，]/g, ''), 10);
      if (!isNaN(amount) && amount > 0) return amount;
    }
  }
  return null;
}

function setupHeaders(sheet) {
  var headers = ['受信日時', '件名', '送信元', '請求月', '支払日', '請求金額（円）'];
  sheet.appendRow(headers);
  var r = sheet.getRange(1, 1, 1, headers.length);
  r.setBackground('#1F4E79');
  r.setFontColor('#FFFFFF');
  r.setFontWeight('bold');
  r.setHorizontalAlignment('center');
  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidth(2, 350);
  sheet.setColumnWidth(3, 180);
  sheet.setColumnWidth(4, 100);
  sheet.setColumnWidth(5, 110);
  sheet.setColumnWidth(6, 140);
  sheet.setFrozenRows(1);
}

function debugEmailBody() {
  var threads = GmailApp.search('from:' + SENDER + ' subject:"ショッピングご利用のお知らせ"');
  if (threads.length === 0) { Logger.log('メールが見つかりませんでした'); return; }
  var msg = threads[0].getMessages()[0];
  Logger.log('=== 件名 ===');
  Logger.log(msg.getSubject());
  Logger.log('=== 本文（先頭500文字）===');
  Logger.log(msg.getPlainBody().substring(0, 500));
}
