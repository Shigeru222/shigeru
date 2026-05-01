import type { MentalTrainingSubmission } from './mental-training-types';

const KV_KEY = 'mental_training_submissions';

async function upstashCommand(command: unknown[]): Promise<{ result: unknown }> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const res = await fetch(url!, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
  });
  return res.json();
}

// LRANGE: 全件取得（LPUSHで追加しているので最新順）
async function upstashGetAll(): Promise<MentalTrainingSubmission[]> {
  const data = await upstashCommand(['LRANGE', KV_KEY, '0', '-1']);
  const items = (data.result as string[] | null) ?? [];
  return items.map(item => JSON.parse(item));
}

// LPUSH: 1件だけ先頭に追加（アトミック操作 — 同時送信でもデータ消失なし）
async function upstashPush(submission: MentalTrainingSubmission): Promise<void> {
  await upstashCommand(['LPUSH', KV_KEY, JSON.stringify(submission)]);
}

async function fileGet(): Promise<MentalTrainingSubmission[]> {
  const fs = await import('fs');
  const path = await import('path');
  const file = path.join(process.cwd(), 'data', 'mental-training.json');
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return []; }
}

async function fileAdd(submission: MentalTrainingSubmission): Promise<void> {
  const fs = await import('fs');
  const path = await import('path');
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const existing = await fileGet();
  existing.unshift(submission);
  fs.writeFileSync(path.join(dir, 'mental-training.json'), JSON.stringify(existing, null, 2), 'utf-8');
}

const useUpstash = () => Boolean(process.env.KV_REST_API_URL);

export async function getSubmissions(): Promise<MentalTrainingSubmission[]> {
  return useUpstash() ? upstashGetAll() : fileGet();
}

// 1件追加（同時アクセス安全）
export async function addSubmission(submission: MentalTrainingSubmission): Promise<void> {
  return useUpstash() ? upstashPush(submission) : fileAdd(submission);
}
