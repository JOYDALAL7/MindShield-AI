import { NextResponse } from "next/server";
import OpenAI from "openai";

// ✅ Force Node.js runtime (required for OpenAI SDK)
export const runtime = "nodejs";

// ❗ Safe lazy OpenAI init (prevents build-time crash)
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    // Validate URL
    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return NextResponse.json(
        { error: "Invalid URL provided." },
        { status: 400 }
      );
    }

    // 🟥 Basic phishing heuristics
    const suspiciousPatterns = ["login", "verify", "bank", "account", "free", "update"];
    const isSuspicious = suspiciousPatterns.some((p) =>
      url.toLowerCase().includes(p)
    );

    // ❗ If OpenAI missing → don't break route
    if (!openai) {
      console.error("❌ Missing OPENAI_API_KEY on server.");
      return NextResponse.json(
        {
          url,
          isSuspicious,
          explanation:
            "AI risk explanation unavailable (missing OpenAI API key on server).",
        },
        { status: 200 }
      );
    }

    // 🧠 AI explanation
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a concise cybersecurity AI that analyzes phishing URL risks and explains them simply.",
        },
        {
          role: "user",
          content: `URL: ${url}
Heuristic suspicion: ${isSuspicious}.
Explain if this URL seems risky and why.`,
        },
      ],
      max_tokens: 200,
    });

    const explanation =
      aiResponse.choices?.[0]?.message?.content ||
      "Could not generate AI explanation.";

    return NextResponse.json(
      { url, isSuspicious, explanation },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("🔥 Phishing route error:", error?.message || error);

    return NextResponse.json(
      { error: "Failed to analyze URL." },
      { status: 500 }
    );
  }
}
