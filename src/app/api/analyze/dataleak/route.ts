import { NextResponse } from "next/server";
import axios from "axios";
import OpenAI from "openai";

export const runtime = "nodejs";

// Safe OpenAI init
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }

    // Check RapidAPI key
    if (!process.env.RAPIDAPI_KEY) {
      return NextResponse.json(
        {
          error: "Missing RAPIDAPI_KEY for breach lookup.",
        },
        { status: 500 }
      );
    }

    let breached = false;
    let breaches: any[] = [];

    // ----------------------------
    // 🔍 BREACH LOOKUP (RapidAPI)
    // ----------------------------
    try {
      const response = await axios.get(
        `https://breachdirectory.p.rapidapi.com/?func=auto&term=${encodeURIComponent(
          email
        )}`,
        {
          headers: {
            "x-rapidapi-key": process.env.RAPIDAPI_KEY,
            "x-rapidapi-host": "breachdirectory.p.rapidapi.com",
          },
        }
      );

      if (response.data?.success && response.data?.result) {
        breaches = response.data.result;
        breached = breaches.length > 0;
      }
    } catch (err: any) {
      console.error("🔥 BreachDirectory Error:", err?.response?.data || err);
    }

    // ----------------------------
    // 🧮 HEURISTIC SCORE (0–60)
    // ----------------------------
    let heuristicScore = 0;

    // More breaches = more score
    heuristicScore += Math.min(breaches.length * 8, 30);

    // Look at data classes
    const sensitiveTypes = ["password", "bank", "ssn", "credit", "api key"];
    let sensitiveHits = 0;

    breaches.forEach((b) => {
      const dataClasses: string[] = b.data_classes || [];
      dataClasses.forEach((d) => {
        if (sensitiveTypes.some((s) => d.toLowerCase().includes(s))) {
          sensitiveHits++;
        }
      });
    });

    heuristicScore += Math.min(sensitiveHits * 5, 30);

    heuristicScore = Math.min(heuristicScore, 60);

    // ----------------------------
    // 🧠 AI RISK SCORE (0–100)
    // ----------------------------
    let aiScore = 0;
    let aiSummary = "AI summary unavailable.";

    if (openai) {
      const ai = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You assess data breach severity. First output a risk score (0–100), then a compact explanation.",
          },
          {
            role: "user",
            content: `Email: ${email}
Total breaches: ${breaches.length}
Data examples: ${breaches
              .slice(0, 3)
              .map((b) => (b.data_classes || []).join(", "))
              .join("; ")}

Return format:
<number>
<short explanation>`,
          },
        ],
        max_tokens: 200,
      });

      const text = ai.choices?.[0]?.message?.content || "0 No explanation.";

      const numberMatch = text.match(/(\d{1,3})/);
      aiScore = numberMatch ? Math.min(parseInt(numberMatch[1]), 100) : 0;

      aiSummary = text.replace(numberMatch?.[0] || "", "").trim();
    }

    // ----------------------------
    // 🎯 FINAL RISK SCORE
    // ----------------------------
    const finalScore = Math.round(aiScore * 0.6 + heuristicScore * 0.4);

    // ----------------------------
    // 🌡️ RISK LEVEL + COLOR
    // ----------------------------
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

    // ----------------------------
    // FINAL RESPONSE
    // ----------------------------
    return NextResponse.json(
      {
        email,
        breached,
        leaks: breaches.map((b) => ({
          name: b.name || b.title || "Unknown Source",
          domain: b.domain || "N/A",
          date: b.date || "Unknown",
          dataClasses: b.data_classes || [],
        })),
        heuristicScore,
        aiScore,
        finalScore,
        riskLevel,
        color,
        aiSummary,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("🔥 Data Leak Route Error:", error?.message);
    return NextResponse.json(
      { error: "Failed to check data leak." },
      { status: 500 }
    );
  }
}
