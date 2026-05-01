import { NextRequest, NextResponse } from 'next/server';
import { getSubmissions } from '@/lib/mental-training-storage';

function escapeCSV(value: string): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  const pin = request.nextUrl.searchParams.get('pin');
  const correctPin = process.env.COACH_PIN || '1234';
  const grade = request.nextUrl.searchParams.get('grade');

  if (pin !== correctPin) {
    return NextResponse.json({ error: 'PINが正しくありません' }, { status: 401 });
  }

  try {
    let submissions = await getSubmissions();
    if (grade && grade !== 'all') {
      submissions = submissions.filter(s => s.grade === grade);
    }

    const headers = [
      '提出日時', '名前', '学年', '記入日',
      'ネガティブな言葉①', 'ポジティブな言葉①',
      'ネガティブな言葉②', 'ポジティブな言葉②',
      'ネガティブな言葉③', 'ポジティブな言葉③',
      'ネガティブな言葉④', 'ポジティブな言葉④',
      'ネガティブな言葉⑤', 'ポジティブな言葉⑤',
      '振り返り',
    ];

    const rows = submissions.map(s => {
      const submittedAt = new Date(s.submittedAt).toLocaleString('ja-JP', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      });
      const pairs = Array.from({ length: 5 }, (_, i) => s.wordPairs[i] || { negative: '', positive: '' });
      return [
        submittedAt, s.name, s.grade, s.date,
        ...pairs.flatMap(p => [p.negative, p.positive]),
        s.reflection,
      ].map(escapeCSV).join(',');
    });

    const csv = '﻿' + [headers.map(escapeCSV).join(','), ...rows].join('\r\n');
    const dateStr = new Date().toISOString().slice(0, 10);

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename*=UTF-8''mental-training-${dateStr}.csv`,
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'エクスポートに失敗しました' }, { status: 500 });
  }
}
