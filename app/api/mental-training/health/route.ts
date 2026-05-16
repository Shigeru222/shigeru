import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return NextResponse.json({
      status: 'error',
      message: '環境変数が設定されていません',
      KV_REST_API_URL: url ? '設定済み' : '未設定',
      KV_REST_API_TOKEN: token ? '設定済み' : '未設定',
    });
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['PING']),
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json({
      status: 'ok',
      message: 'Upstash接続成功',
      ping: data.result,
    });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: '接続失敗',
      error: String(err),
    });
  }
}
