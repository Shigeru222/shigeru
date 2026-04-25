import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const maxDuration = 60;

const client = new Anthropic();

export async function POST(request: Request) {
  try {
    const { questions, answers, passage } = await request.json();

    const answerDetails = questions.map((q: { id: number; type: string; question: string; situation?: string; sampleAnswer: string }, i: number) => ({
      questionId: q.id,
      type: q.type,
      question: q.type === "illustration" ? q.situation : q.question,
      studentAnswer: answers[q.id] || "(未回答)",
      sampleAnswer: q.sampleAnswer,
    }));

    const prompt = `You are a strict but encouraging Eiken Grade 2 interview examiner. Evaluate this student's interview performance.

Passage used:
"${passage.text}"

Student's answers:
${JSON.stringify(answerDetails, null, 2)}

Evaluate each answer and provide overall feedback. Return ONLY valid JSON:

{
  "questionFeedback": [
    {
      "questionId": 1,
      "score": 3,
      "maxScore": 4,
      "evaluation": "評価コメント（日本語、2文程度）",
      "goodPoints": "良かった点（日本語）",
      "improvements": "改善点（日本語）",
      "betterAnswer": "より良い回答例（英語）"
    }
  ],
  "totalScore": 11,
  "maxTotalScore": 16,
  "grade": "合格圏",
  "overallComment": "全体的な評価（日本語、2-3文）",
  "strongPoints": ["強み1", "強み2"],
  "weakPoints": ["弱点1", "弱点2"],
  "studyAdvice": "学習アドバイス（日本語、具体的に2-3文）"
}

Scoring criteria per question (4 points each):
- 4: Excellent — natural, accurate, well-structured, appropriate length
- 3: Good — mostly correct with minor errors or slightly short
- 2: Fair — understandable but significant grammar errors or incomplete
- 1: Poor — very short, major errors, or off-topic
- 0: No answer or completely incomprehensible

For the passage question: check if they correctly identified information from the passage
For illustration: check if they described multiple elements clearly
For opinion questions: check if they gave a clear opinion AND a specific reason

Provide all feedback in Japanese except betterAnswer (in English).
Be encouraging but honest about areas needing improvement.`;

    const message = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 2000,
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
    const evaluation = JSON.parse(jsonText);

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("Error evaluating interview:", error);
    return NextResponse.json(
      { error: "面接の評価に失敗しました。" },
      { status: 500 }
    );
  }
}
