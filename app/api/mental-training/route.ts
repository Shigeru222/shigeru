import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { MentalTrainingSubmission } from '@/lib/mental-training-types';

// On Vercel, process.cwd() is read-only; use /tmp instead
const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'mental-training.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readSubmissions(): MentalTrainingSubmission[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeSubmissions(submissions: MentalTrainingSubmission[]): void {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2), 'utf-8');
}

export async function GET(request: NextRequest) {
  const pin = request.nextUrl.searchParams.get('pin');
  const correctPin = process.env.COACH_PIN || '1234';

  if (pin !== correctPin) {
    return NextResponse.json({ error: 'PINが正しくありません' }, { status: 401 });
  }

  const grade = request.nextUrl.searchParams.get('grade');
  let submissions = readSubmissions();

  if (grade && grade !== 'all') {
    submissions = submissions.filter(s => s.grade === grade);
  }

  return NextResponse.json(submissions);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, grade, date, wordPairs, reflection } = body;

    if (!name || !grade || !date || !wordPairs) {
      return NextResponse.json({ error: '必須項目が入力されていません' }, { status: 400 });
    }

    const submission: MentalTrainingSubmission = {
      id: crypto.randomUUID(),
      name: String(name).trim(),
      grade,
      date,
      submittedAt: new Date().toISOString(),
      wordPairs,
      reflection: String(reflection || '').trim(),
    };

    const submissions = readSubmissions();
    submissions.unshift(submission);
    writeSubmissions(submissions);

    return NextResponse.json({ success: true, id: submission.id });
  } catch (err) {
    console.error('POST /api/mental-training error:', err);
    return NextResponse.json({ error: '保存に失敗しました。しばらくしてから再度お試しください。' }, { status: 500 });
  }
}
