import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

// Lazy OpenAI init (safe for build)
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return NextResponse.json(
        { error: "Invalid URL provided." },
        { status: 400 }
      );
    }

    // --------------------------
    // 🔍 HEURISTIC RISK SCORING
    // --------------------------
    const redFlags = [
      { pattern: "login", score: 20 },
      { pattern: "verify", score: 20 },
      { pattern: "bank", score: 25 },
      { pattern: "account", score: 15 },
      { pattern: "secure", score: 10 },
      { pattern: "update", score: 10 },
      { pattern: "free", score: 15 },
      { pattern: ".zip", score: 25 },
      { pattern: "-secure-", score: 20 },
      { pattern: "cloudfront", score: 20 },
    ];

    let heuristicScore = 0;
    redFlags.forEach(({ pattern, score }) => {
      if (url.toLowerCase().includes(pattern)) heuristicScore += score;
    });

    heuristicScore = Math.min(heuristicScore, 80); // heuristic max

    // --------------------------
    // ⚠️ AI RISK SCORING
    // --------------------------
    let aiScore = 0;
    let explanation = "AI model unavailable.";

    if (openai) {
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a cybersecurity AI. Evaluate phishing likelihood from 0 to 100 and explain briefly.",
          },
          {
            role: "user",
            content: `Give me a phishing risk score (0-100) for this URL and a 2-line explanation:\n${url}`,
          },
        ],
        max_tokens: 150,
      });

      const text =
        aiResponse.choices?.[0]?.message?.content || "0|No explanation.";

      // Extract score (first number found)
      const match = text.match(/(\d{1,3})/);
      aiScore = match ? Math.min(parseInt(match[1]), 100) : 0;

      explanation = text.replace(match?.[0] || "", "").trim();
    }

    // --------------------------
    // 🎯 FINAL RISK SCORE (0–100)
    // --------------------------
    const finalScore = Math.min(Math.round(heuristicScore * 0.4 + aiScore * 0.6), 100);

    // --------------------------
    // 🎨 RISK CATEGORY
    // --------------------------
    let riskLevel: "low" | "medium" | "high" | "critical" = "low";
    let color: "green" | "blue" | "red" | "purple" = "green";

    if (finalScore < 30) {
      riskLevel = "low";
      color = "green";
    } else if (finalScore < 60) {
      riskLevel = "medium";
      color = "blue";
    } else if (finalScore < 85) {
      riskLevel = "high";
      color = "red";
    } else {
      riskLevel = "critical";
      color = "red";
    }

    return NextResponse.json(
      {
        url,
        finalScore,
        heuristicScore,
        aiScore,
        riskLevel,
        color,
        explanation,
      },
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
