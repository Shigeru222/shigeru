import { NextRequest, NextResponse } from 'next/server';
import { MentalTrainingSubmission } from '@/lib/mental-training-types';
import { getSubmissions, addSubmission } from '@/lib/mental-training-storage';

export async function GET(request: NextRequest) {
  const pin = request.nextUrl.searchParams.get('pin');
  const correctPin = process.env.COACH_PIN || '1234';

  if (pin !== correctPin) {
    return NextResponse.json({ error: 'PINが正しくありません' }, { status: 401 });
  }

  try {
    const grade = request.nextUrl.searchParams.get('grade');
    let submissions = await getSubmissions();
    if (grade && grade !== 'all') {
      submissions = submissions.filter(s => s.grade === grade);
    }
    return NextResponse.json(submissions);
  } catch (err) {
    console.error('GET error:', err);
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 });
  }
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

    await addSubmission(submission);

    return NextResponse.json({ success: true, id: submission.id });
  } catch (err) {
    console.error('POST error:', err);
    return NextResponse.json({ error: '保存に失敗しました。しばらくしてから再度お試しください。' }, { status: 500 });
  }
}
