import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const client = new Anthropic();

const PROMPT = `You are an expert English language examiner specializing in the Japanese Eiken Grade 2 exam. Your goal is to generate challenging questions at the UPPER end of Eiken Grade 2 difficulty — questions that would appear in the actual exam and that many test-takers find difficult.

Generate the vocabulary/grammar section of an Eiken Grade 2 mock exam.

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
    // ... exactly 20 total vocab/grammar questions, ids 1..20
  ]
}

Difficulty requirements — strictly enforce these:
- exactly 20 questions at CHALLENGING Eiken Grade 2 level
- Use advanced vocabulary: words like "exacerbate", "alleviate", "inevitably", "predominantly", "sustainable", "incentive", "contradict", "superficial", "legitimate", "elaborate", "consensus", "simultaneously", "contemporary", "consequently", "deteriorate"
- Grammar questions should test: subjunctive mood, inversion, complex conditionals, participial phrases, relative clauses with whom/whose
- Fill-in-the-blank sentences must be LONG (20+ words) with rich academic or professional context
- All 4 options must look plausible — avoid obviously wrong answers
- Mix: 12 vocabulary + 8 grammar questions
- All content in English
- Explanations must clearly explain WHY the correct answer is right AND why distractors are wrong

Generate the vocab section now:`;

export async function POST() {
  const stream = client.messages.stream({
    model: process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [{ role: "user", content: PROMPT }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
