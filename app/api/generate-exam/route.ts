import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const maxDuration = 60;

const client = new Anthropic();

export async function POST() {
  try {
    const prompt = `You are an expert English language examiner specializing in the Japanese Eiken Grade 2 exam. Your goal is to generate challenging questions at the UPPER end of Eiken Grade 2 difficulty — questions that would appear in the actual exam and that many test-takers find difficult.

Generate a complete Eiken Grade 2 mock exam with the following structure.

Return ONLY valid JSON, no markdown, no explanation. The JSON must match this exact schema:

{
  "vocabQuestions": [
    {
      "id": 1,
      "question": "The scientist's ( ) research into gene therapy has opened new possibilities for treating hereditary diseases.",
      "options": ["groundbreaking", "superficial", "redundant", "ambiguous"],
      "correctIndex": 0,
      "explanation": "'Groundbreaking' means innovative and pioneering. The context of 'opening new possibilities' requires a strongly positive adjective describing exceptional research."
    }
    // ... 20 total vocab/grammar questions
  ],
  "readingPassage": {
    "title": "Passage title in English",
    "passage": "A 400-500 word reading passage with complex sentence structures and academic vocabulary...",
    "questions": [
      {
        "id": 1,
        "question": "According to the passage, what is the main reason...?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 2,
        "explanation": "The passage states in paragraph 2 that..."
      }
      // ... 6 total reading questions
    ]
  },
  "writingPrompt": {
    "topic": "Should governments impose stricter regulations on social media companies to protect users' mental health?",
    "instructions": "Write an essay of 80-100 words expressing your opinion on this topic. Give TWO specific reasons to support your opinion. Write in English.",
    "wordLimit": 100
  }
}

Difficulty requirements — strictly enforce these:
- vocabQuestions: exactly 20 questions at CHALLENGING Eiken Grade 2 level
  - Use advanced vocabulary: words like "exacerbate", "alleviate", "inevitably", "predominantly", "sustainable", "incentive", "contradict", "superficial", "legitimate", "elaborate", "consensus", "simultaneously", "contemporary", "consequently", "deteriorate"
  - Grammar questions should test: subjunctive mood, inversion, complex conditionals, participial phrases, relative clauses with whom/whose
  - Fill-in-the-blank sentences must be LONG (20+ words) with rich academic or professional context
  - All 4 options must look plausible — avoid obviously wrong answers
  - Mix: 12 vocabulary + 8 grammar questions
- readingPassage: 400-500 words (longer than standard) on a complex topic (climate policy, neuroscience, economics, global affairs, medical research)
  - Use complex sentence structures, passive voice, academic register
  - 6 comprehension questions that require careful reading and inference, not just scanning
  - Include at least 2 inference questions where the answer is implied but not stated directly
- writingPrompt: controversial, thought-provoking topic that requires nuanced argument
- All content in English
- Explanations must clearly explain WHY the correct answer is right AND why distractors are wrong

Generate the full exam now:`;

    const message = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    });

    let jsonText = "";
    for (const block of message.content) {
      if (block.type === "text") {
        jsonText = block.text;
        break;
      }
    }

    // Strip markdown code fences if present
    jsonText = jsonText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();

    const examData = JSON.parse(jsonText);

    return NextResponse.json(examData);
  } catch (error) {
    console.error("Error generating exam:", error);
    return NextResponse.json(
      { error: "試験の生成に失敗しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
