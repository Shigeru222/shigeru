import type { MentalTrainingSubmission } from './mental-training-types';

const KV_KEY = 'mental-training-submissions';

export async function getSubmissions(): Promise<MentalTrainingSubmission[]> {
  if (process.env.KV_REST_API_URL) {
    const { kv } = await import('@vercel/kv');
    return (await kv.get<MentalTrainingSubmission[]>(KV_KEY)) ?? [];
  }
  // ローカル開発用: ファイルシステム
  const fs = await import('fs');
  const path = await import('path');
  const file = path.join(process.cwd(), 'data', 'mental-training.json');
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return [];
  }
}

export async function saveSubmissions(submissions: MentalTrainingSubmission[]): Promise<void> {
  if (process.env.KV_REST_API_URL) {
    const { kv } = await import('@vercel/kv');
    await kv.set(KV_KEY, submissions);
    return;
  }
  // ローカル開発用: ファイルシステム
  const fs = await import('fs');
  const path = await import('path');
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'mental-training.json'),
    JSON.stringify(submissions, null, 2),
    'utf-8'
  );
}
