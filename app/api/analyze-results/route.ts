import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { ExamResult } from "@/lib/types";

const client = new Anthropic();

export async function POST(request: Request) {
  try {
    const result: ExamResult = await request.json();

    const vocabWrong = result.vocabAnswers.filter(
      (a) => a.selectedIndex !== result.examData.vocabQuestions[a.questionId - 1]?.correctIndex
    );
    const readingWrong = result.readingAnswers.filter(
      (a) => a.selectedIndex !== result.examData.readingPassage.questions[a.questionId - 1]?.correctIndex
    );

    const wrongVocabDetails = vocabWrong.map((a) => {
      const q = result.examData.vocabQuestions[a.questionId - 1];
      return {
        question: q.question,
        selected: q.options[a.selectedIndex],
        correct: q.options[q.correctIndex],
        explanation: q.explanation,
      };
    });

    const wrongReadingDetails = readingWrong.map((a) => {
      const q = result.examData.readingPassage.questions[a.questionId - 1];
      return {
        question: q.question,
        selected: q.options[a.selectedIndex],
        correct: q.options[q.correctIndex],
        explanation: q.explanation,
      };
    });

    const prompt = `You are an expert English language coach specializing in Eiken Grade 2 exam preparation for Japanese students.

Analyze this student's exam performance and provide detailed, actionable improvement advice in Japanese.

## Exam Results:
- Vocabulary score: ${result.scores.vocab}/${result.scores.maxVocab}点
- Reading score: ${result.scores.reading}/${result.scores.maxReading}点
- Writing score: ${result.scores.writing}/${result.scores.maxWriting}点
- Total: ${result.scores.total}/${result.scores.maxTotal}点 (${Math.round((result.scores.total / result.scores.maxTotal) * 100)}%)
- Result: ${result.passed ? "合格圏" : "不合格圏"}

## Writing evaluation:
Topic: "${result.examData.writingPrompt.topic}"
Student's essay: "${result.writingAnswer}"
Writing feedback: ${result.writingEvaluation.feedback}

## Wrong vocab/grammar answers (${wrongVocabDetails.length}問):
${JSON.stringify(wrongVocabDetails, null, 2)}

## Wrong reading answers (${wrongReadingDetails.length}問):
${JSON.stringify(wrongReadingDetails, null, 2)}

Provide a comprehensive analysis in Japanese. Return ONLY valid JSON with this exact structure:

{
  "overallComment": "全体的な評価と総括（2-3文、励ましを含む）",
  "weakAreas": [
    {
      "category": "弱点カテゴリ名（例：語彙力、文法、読解速度、英作文構成）",
      "description": "具体的な弱点の説明（間違えたパターンを分析）",
      "severity": "high"
    }
  ],
  "improvementActions": [
    {
      "title": "アクションのタイトル",
      "description": "具体的に何をすべきか、どのように学習するかの詳細説明",
      "duration": "毎日15分 / 1週間で完了 など",
      "priority": "high"
    }
  ],
  "studyPlan": "今後2週間の具体的な学習計画（箇条書き形式で）",
  "encouragement": "モチベーションを高める励ましのメッセージ（1-2文）"
}

Requirements:
- weakAreas: 2-4 items, severity must be "high", "medium", or "low"
- improvementActions: 3-5 concrete, actionable items, priority must be "high", "medium", or "low"
- Base analysis on actual mistakes, not generic advice
- All text in Japanese except JSON keys
- Be specific and encouraging`;

    const message = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    let jsonText = "";
    for (const block of message.content) {
      if (block.type === "text") {
        jsonText = block.text;
        break;
      }
    }

    jsonText = jsonText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();

    const analysis = JSON.parse(jsonText);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error analyzing results:", error);
    return NextResponse.json(
      { error: "分析に失敗しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
