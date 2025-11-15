import { NextResponse } from "next/server";
import OpenAI from "openai";

// ✅ Ensure Node.js runtime (required for OpenAI SDK)
export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    // 🟣 Parse request body
    const body = await req.json();
    const message = body?.message;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid input message." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ Missing OPENAI_API_KEY in server environment!");
      return NextResponse.json(
        { error: "Server missing AI configuration." },
        { status: 500 }
      );
    }

    // 🤖 Generate AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are MindShield-AI — a friendly, concise cybersecurity assistant embedded inside a threat dashboard.",
        },
        { role: "user", content: message },
      ],
      max_tokens: 200,
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "⚠️ I couldn’t understand that. Try again.";

    return NextResponse.json({ reply }, { status: 200 });
  } catch (err: any) {
    console.error("🔥 Chat API Error:", err?.message || err);
    return NextResponse.json(
      { error: "Failed to process chat request." },
      { status: 500 }
    );
  }
}
