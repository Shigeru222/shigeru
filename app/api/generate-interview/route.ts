import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const maxDuration = 60;

const client = new Anthropic();

export async function POST() {
  try {
    const prompt = `You are an expert Eiken Grade 2 interview examiner. Generate a complete Eiken Grade 2 speaking test (面接) scenario.

Return ONLY valid JSON with this exact structure:

{
  "passage": {
    "title": "The Rise of Remote Work",
    "text": "A 3-4 sentence passage at Eiken Grade 2 level that the student will read aloud. Should be on a social/contemporary topic. Use complex but readable sentences."
  },
  "questions": [
    {
      "id": 1,
      "type": "passage",
      "question": "According to the passage, what is one benefit of remote work?",
      "hint": "Look at the passage for specific information.",
      "sampleAnswer": "According to the passage, one benefit of remote work is that employees can save time by not commuting to the office."
    },
    {
      "id": 2,
      "type": "illustration",
      "situation": "A family is at a shopping mall. The mother is looking at her smartphone with a worried expression. The father is carrying many shopping bags. A teenage daughter is pointing at an expensive dress in a shop window. A young boy is eating ice cream and dropping it on the floor.",
      "question": "Please describe the situation in the picture.",
      "hint": "Describe what each person is doing and the overall atmosphere.",
      "sampleAnswer": "In this picture, a family is at a shopping mall. The mother looks worried as she checks her smartphone, perhaps looking at their budget. The father is struggling with many shopping bags. Their teenage daughter is pointing at an expensive dress, and the young boy has dropped his ice cream on the floor. The family seems to be having a stressful shopping trip."
    },
    {
      "id": 3,
      "type": "opinion",
      "question": "Do you think it is better for students to study at home or at school? Please tell me your opinion with a reason.",
      "hint": "Give your opinion clearly and support it with one specific reason.",
      "sampleAnswer": "I think it is better for students to study at school. This is because they can interact with classmates and teachers directly, which helps them understand difficult subjects more easily. Also, studying with others can motivate students to work harder."
    },
    {
      "id": 4,
      "type": "opinion",
      "question": "These days, many people use social media to get news. Do you think this is a good trend? Please tell me your opinion with a reason.",
      "hint": "Consider both advantages and disadvantages before giving your opinion.",
      "sampleAnswer": "I don't think this is entirely a good trend. While social media allows people to access news quickly and easily, it also spreads false information rapidly. People may believe incorrect news without checking reliable sources, which can cause misunderstanding in society."
    }
  ]
}

Requirements:
- passage: 3-4 sentences, academic/social topic, Eiken Grade 2 reading level
- Question 1: asks about specific information in the passage (type: "passage")
- Question 2: describes a situation/illustration with multiple people doing different things (type: "illustration") — make the situation vivid and detailed with 4-5 people or elements
- Questions 3-4: opinion questions on social topics relevant to Japanese high school students (type: "opinion") — ask for opinion + reason
- All sample answers should be natural, appropriate length (2-4 sentences), and demonstrate good Eiken Grade 2 speaking ability
- Topics should vary each time: education, technology, environment, health, society, culture

Generate a fresh interview scenario now:`;

    const message = await client.messages.create({
      model: process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6",
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
    const interviewData = JSON.parse(jsonText);

    return NextResponse.json(interviewData);
  } catch (error) {
    console.error("Error generating interview:", error);
    return NextResponse.json(
      { error: "面接問題の生成に失敗しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
