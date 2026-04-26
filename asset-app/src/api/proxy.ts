// CORSプロキシ経由で外部APIを叩くためのラッパ。
// 設定画面で `corsProxy` をユーザーが差し替え可能。
//
// 動作モード:
// 1) corsProxy が空文字 → Vite dev server の /proxy/yahoo, /proxy/coingecko を使う（開発用）
// 2) corsProxy が "https://corsproxy.io/?" 等 → `${proxy}${encodeURIComponent(url)}` 形式
// 3) corsProxy が "https://example.com/" 等で末尾が `?` でない → `${proxy}${url}` 形式（パススルー型）

export function buildProxiedUrl(absoluteUrl: string, proxy: string): string {
  if (!proxy) {
    // dev fallback: ホスト名で振り分け
    const u = new URL(absoluteUrl);
    if (u.hostname.includes('finance.yahoo.com') || u.hostname.includes('query1.finance.yahoo.com') || u.hostname.includes('query2.finance.yahoo.com')) {
      return '/proxy/yahoo' + u.pathname + u.search;
    }
    if (u.hostname.includes('coingecko.com')) {
      return '/proxy/coingecko' + u.pathname + u.search;
    }
    return absoluteUrl;
  }
  if (proxy.endsWith('?') || proxy.endsWith('=')) {
    return proxy + encodeURIComponent(absoluteUrl);
  }
  // パススルー型（"https://proxy.example.com/" + URL）
  return proxy + absoluteUrl;
}

export async function proxiedFetch(absoluteUrl: string, proxy: string, init?: RequestInit): Promise<Response> {
  const url = buildProxiedUrl(absoluteUrl, proxy);
  return fetch(url, init);
}
