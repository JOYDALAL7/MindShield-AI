import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    // Quick validation
    if (!url || !url.startsWith("http")) {
      return NextResponse.json({ error: "Invalid URL provided." }, { status: 400 });
    }

    // Simple phishing detection heuristic (you can later replace with ML model)
    const suspiciousPatterns = ["login", "verify", "bank", "account", "free", "update"];
    const isSuspicious = suspiciousPatterns.some((p) => url.toLowerCase().includes(p));

    // Ask OpenAI to explain the result
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a cybersecurity AI that explains phishing risk levels in short, clear points.",
        },
        {
          role: "user",
          content: `Analyze this URL: ${url}. Is it phishing or safe? Suspicious patterns found: ${isSuspicious}.`,
        },
      ],
    });

    const explanation = aiResponse.choices[0].message.content;

    return NextResponse.json({
      url,
      isSuspicious,
      explanation,
    });
  } catch (error) {
    console.error("Phishing API error:", error);
    return NextResponse.json({ error: "Failed to analyze URL." }, { status: 500 });
  }
}
