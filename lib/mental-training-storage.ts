import type { MentalTrainingSubmission } from './mental-training-types';

const KV_KEY = 'mental_training_submissions';

async function upstashCommand(command: unknown[]): Promise<{ result: unknown }> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
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

async function upstashGet(): Promise<MentalTrainingSubmission[]> {
  const data = await upstashCommand(['GET', KV_KEY]);
  if (!data.result) return [];
  return JSON.parse(data.result as string);
}

async function upstashSet(submissions: MentalTrainingSubmission[]): Promise<void> {
  await upstashCommand(['SET', KV_KEY, JSON.stringify(submissions)]);
}

async function fileGet(): Promise<MentalTrainingSubmission[]> {
  const fs = await import('fs');
  const path = await import('path');
  const file = path.join(process.cwd(), 'data', 'mental-training.json');
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return []; }
}

async function fileSet(submissions: MentalTrainingSubmission[]): Promise<void> {
  const fs = await import('fs');
  const path = await import('path');
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'mental-training.json'), JSON.stringify(submissions, null, 2), 'utf-8');
}

const useUpstash = () => Boolean(process.env.UPSTASH_REDIS_REST_URL);

export async function getSubmissions(): Promise<MentalTrainingSubmission[]> {
  return useUpstash() ? upstashGet() : fileGet();
}

export async function saveSubmissions(submissions: MentalTrainingSubmission[]): Promise<void> {
  return useUpstash() ? upstashSet(submissions) : fileSet(submissions);
}
