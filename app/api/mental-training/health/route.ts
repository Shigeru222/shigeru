import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return NextResponse.json({
      step: 'env',
      status: 'error',
      KV_REST_API_URL: url ? '設定済み' : '未設定',
      KV_REST_API_TOKEN: token ? '設定済み' : '未設定',
    });
  }

  async function cmd(command: unknown[]) {
    const res = await fetch(url!, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
      cache: 'no-store',
    });
    return res.json();
  }

  try {
    // 1. PING
    const ping = await cmd(['PING']);

    // 2. 件数確認
    const llen = await cmd(['LLEN', 'mental_training_submissions']);

    // 3. 最新1件取得
    const latest = await cmd(['LRANGE', 'mental_training_submissions', '0', '0']);

    return NextResponse.json({
      status: 'ok',
      ping: ping.result,
      登録件数: llen.result,
      最新データ: latest.result?.[0] ? JSON.parse(latest.result[0]) : null,
    });
  } catch (err) {
    return NextResponse.json({ status: 'error', error: String(err) });
  }
}
