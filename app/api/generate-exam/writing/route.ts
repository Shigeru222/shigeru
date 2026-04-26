import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const client = new Anthropic();

const PROMPT = `You are an expert English language examiner specializing in the Japanese Eiken Grade 2 exam.

Generate a single writing prompt for the writing section of an Eiken Grade 2 mock exam.

Return ONLY valid JSON, no markdown, no explanation. The JSON must match this exact schema:

{
  "writingPrompt": {
    "topic": "Should governments impose stricter regulations on social media companies to protect users' mental health?",
    "instructions": "Write an essay of 80-100 words expressing your opinion on this topic. Give TWO specific reasons to support your opinion. Write in English.",
    "wordLimit": 100
  }
}

Requirements:
- The topic must be controversial and thought-provoking, requiring nuanced argument
- Vary the topic each time: education, technology, environment, health, society, work, culture, ethics
- The topic must be approachable for upper-level Eiken Grade 2 test takers
- instructions must require giving TWO supporting reasons
- All content in English

Generate the writing prompt now:`;

export async function POST() {
  const stream = client.messages.stream({
    model: process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6",
    max_tokens: 600,
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
