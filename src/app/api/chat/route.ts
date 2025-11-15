import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs"; // ✅ Force Node runtime to support OpenAI SDK

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid input message." }, { status: 400 });
    }

    // 🧠 Generate assistant response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are MindShield-AI — a friendly and cyber-aware assistant integrated into a threat intelligence dashboard. Keep answers short, clear, and contextual.",
        },
        { role: "user", content: message },
      ],
      max_tokens: 200,
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "⚠️ Sorry, I couldn’t process that right now.";

    return NextResponse.json({ reply }, { status: 200 });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Internal server error while processing your chat request." },
      { status: 500 }
    );
  }
}
