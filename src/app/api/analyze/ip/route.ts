import { NextResponse } from "next/server";
import axios from "axios";
import OpenAI from "openai";

export const runtime = "nodejs";

// Lazy safe OpenAI init
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(req: Request) {
  try {
    const { ip } = await req.json();

    if (!ip || typeof ip !== "string") {
      return NextResponse.json(
        { error: "No IP or domain provided." },
        { status: 400 }
      );
    }

    if (!process.env.VIRUSTOTAL_API_KEY) {
      return NextResponse.json(
        {
          error: "Server is missing VirusTotal API Key.",
        },
        { status: 500 }
      );
    }

    // -------------------------------------
    // 🔍 VIRUSTOTAL LOOKUP
    // -------------------------------------
    const vt = await axios.get(
      `https://www.virustotal.com/api/v3/ip_addresses/${ip}`,
      {
        headers: { "x-apikey": process.env.VIRUSTOTAL_API_KEY },
      }
    );

    const attributes = vt.data?.data?.attributes || {};
    const stats = attributes?.last_analysis_stats || {};

    const maliciousCount = stats.malicious ?? 0;
    const suspiciousCount = stats.suspicious ?? 0;
    const reputation = attributes.reputation ?? 0;

    // -------------------------------------
    // 🧮 HEURISTIC SCORE (0–60)
    // -------------------------------------
    let heuristicScore = 0;

    if (maliciousCount > 0) heuristicScore += Math.min(maliciousCount * 8, 40);
    if (suspiciousCount > 0) heuristicScore += Math.min(suspiciousCount * 5, 20);

    if (reputation < 0) heuristicScore += 10;

    heuristicScore = Math.min(heuristicScore, 60);

    // -------------------------------------
    // 🧠 AI RISK SCORE (0–100)
    // -------------------------------------
    let aiScore = 0;
    let explanation = "AI unavailable.";

    if (openai) {
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a cybersecurity AI. Provide an IP reputation risk score (0-100) and a short explanation.",
          },
          {
            role: "user",
            content: `Return only a number (0–100) and then a short explanation.\n\nIP report: ${JSON.stringify(
              attributes
            )}`,
          },
        ],
        max_tokens: 150,
      });

      const text =
        aiResponse.choices?.[0]?.message?.content ||
        "0 No explanation.";

      const match = text.match(/(\d{1,3})/);
      aiScore = match ? Math.min(parseInt(match[1]), 100) : 0;

      explanation = text.replace(match?.[0] || "", "").trim();
    }

    // -------------------------------------
    // 🎯 FINAL RISK SCORE
    // -------------------------------------
    const finalScore = Math.round(aiScore * 0.6 + heuristicScore * 0.4);

    // -------------------------------------
    // 🌡️ RISK LEVEL + COLOR
    // -------------------------------------
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

    // -------------------------------------
    // ✅ FINAL RESPONSE
    // -------------------------------------
    return NextResponse.json(
      {
        ip,
        finalScore,
        heuristicScore,
        aiScore,
        maliciousCount,
        suspiciousCount,
        riskLevel,
        color,
        explanation,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("🔥 IP API Error:", err?.response?.data || err.message);
    return NextResponse.json(
      { error: "Failed to check IP." },
      { status: 500 }
    );
  }
}
