import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return NextResponse.json({
      step: 'env',
      ok: false,
      url: url ? 'set' : 'MISSING',
      token: token ? 'set' : 'MISSING',
    });
  }

  async function cmd(command: unknown[]) {
    const res = await fetch(url!, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
      cache: 'no-store',
    });
    const text = await res.text();
    try { return JSON.parse(text); } catch { return { raw: text }; }
  }

  // 1. PING
  const ping = await cmd(['PING']);

  // 2. テスト書き込み
  const testKey = 'health_test';
  const pushResult = await cmd(['LPUSH', testKey, 'test_value']);

  // 3. テスト読み込み
  const rangeResult = await cmd(['LRANGE', testKey, '0', '-1']);

  // 4. テストデータ削除
  await cmd(['DEL', testKey]);

  // 5. 本番データ件数
  const llen = await cmd(['LLEN', 'mental_training_submissions']);

  return NextResponse.json({
    ping: ping.result,
    write_test: pushResult.result,
    read_test: rangeResult.result,
    count: llen.result,
    url_prefix: url.slice(0, 30),
  });
}
