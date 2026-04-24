import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(request: Request) {
  try {
    const { topic, instructions, essay } = await request.json();

    if (!essay || essay.trim().length === 0) {
      return NextResponse.json({
        score: 0,
        maxScore: 16,
        content: "未回答",
        organization: "未回答",
        vocabulary: "未回答",
        grammar: "未回答",
        feedback: "英作文が空白でした。",
      });
    }

    const prompt = `You are an expert Eiken Grade 2 writing examiner. Evaluate this student essay.

Topic: "${topic}"
Instructions: "${instructions}"

Student's essay:
"${essay}"

Evaluate based on Eiken Grade 2 criteria (0-16 points total):
- Content (内容): Are two clear reasons given? Is the opinion clear? (0-4 points)
- Organization (構成): Is the essay well-structured with introduction, body, conclusion? (0-4 points)
- Vocabulary (語彙): Is vocabulary appropriate and varied for Grade 2 level? (0-4 points)
- Grammar (文法): Are sentences grammatically correct? (0-4 points)

Return ONLY valid JSON:
{
  "score": <total score 0-16>,
  "maxScore": 16,
  "content": "<content evaluation in Japanese, 1-2 sentences>",
  "organization": "<organization evaluation in Japanese, 1-2 sentences>",
  "vocabulary": "<vocabulary evaluation in Japanese, 1-2 sentences>",
  "grammar": "<grammar evaluation in Japanese, 1-2 sentences>",
  "feedback": "<overall feedback and suggestions in Japanese, 2-3 sentences>"
}`;

    const message = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1000,
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
    console.error("Error evaluating writing:", error);
    return NextResponse.json(
      { error: "英作文の評価に失敗しました。" },
      { status: 500 }
    );
  }
}
