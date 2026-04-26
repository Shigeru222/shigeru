import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const client = new Anthropic();

const PROMPT = `You are an expert English language examiner specializing in the Japanese Eiken Grade 2 exam. Your goal is to generate a challenging reading section at the UPPER end of Eiken Grade 2 difficulty.

Generate the reading section of an Eiken Grade 2 mock exam.

Return ONLY valid JSON, no markdown, no explanation. The JSON must match this exact schema:

{
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
      // ... exactly 6 total reading questions, ids 1..6
    ]
  }
}

Difficulty requirements — strictly enforce these:
- 400-500 words (longer than standard) on a complex topic (climate policy, neuroscience, economics, global affairs, medical research)
- Use complex sentence structures, passive voice, academic register
- exactly 6 comprehension questions that require careful reading and inference, not just scanning
- Include at least 2 inference questions where the answer is implied but not stated directly
- All 4 options must look plausible — avoid obviously wrong answers
- All content in English
- Explanations must clearly explain WHY the correct answer is right AND why distractors are wrong

Generate the reading section now:`;

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
