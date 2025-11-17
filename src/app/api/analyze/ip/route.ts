import { NextResponse } from "next/server";
import axios from "axios";
import OpenAI from "openai";

export const runtime = "nodejs";

// Safe lazy OpenAI init
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
        { error: "Server missing VirusTotal API key." },
        { status: 500 }
      );
    }

    // -------------------------------------------------------
    // 🔍 VIRUSTOTAL LOOKUP — SAFELY FETCHED
    // -------------------------------------------------------
    let vtData: any = {};
    try {
      const vt = await axios.get(
        `https://www.virustotal.com/api/v3/ip_addresses/${ip}`,
        {
          headers: { "x-apikey": process.env.VIRUSTOTAL_API_KEY },
        }
      );

      vtData = vt.data?.data?.attributes || {};
    } catch (err: any) {
      console.warn("VirusTotal failed:", err?.message);
    }

    const stats = vtData.last_analysis_stats || {};

    const maliciousCount = stats.malicious ?? 0;
    const suspiciousCount = stats.suspicious ?? 0;
    const undetected = stats.undetected ?? 0;
    const harmless = stats.harmless ?? 0;
    const reputation = vtData.reputation ?? 0;

    // -------------------------------------------------------
    // 🧮 HEURISTIC SCORE (0–60)
    // -------------------------------------------------------
    let heuristicScore = 0;

    heuristicScore += Math.min(maliciousCount * 10, 40);
    heuristicScore += Math.min(suspiciousCount * 6, 20);

    if (reputation < 0) heuristicScore += 10;
    if (maliciousCount > 5) heuristicScore += 15;

    heuristicScore = Math.min(heuristicScore, 60);

    // -------------------------------------------------------
    // 🤖 AI SCORE (0–100)
    // -------------------------------------------------------
    let aiScore = 0;
    let explanation = "AI summary unavailable.";

    if (openai) {
      try {
        const ai = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a cybersecurity AI. Return only a NUMBER (0–100) and then a short 1–2 sentence explanation.",
            },
            {
              role: "user",
              content: `Analyze this IP intelligence:\n\n${JSON.stringify(
                vtData,
                null,
                2
              )}`,
            },
          ],
        });

        const text = ai.choices?.[0]?.message?.content || "0 No explanation.";

        const match = text.match(/(\d{1,3})/);
        aiScore = match ? Math.min(parseInt(match[1]), 100) : 0;

        explanation = text.replace(match?.[0] || "", "").trim();
      } catch (err: any) {
        console.warn("AI scoring failed:", err?.message);
      }
    }

    // -------------------------------------------------------
    // 🎯 FINAL SCORE (0–100)
    // -------------------------------------------------------
    const finalScore = Math.min(
      Math.round(aiScore * 0.6 + heuristicScore * 0.4),
      100
    );

    // -------------------------------------------------------
    // 🌡️ RISK MAPPING (Dashboard-Compatible)
    // -------------------------------------------------------
    let riskLevel: "low" | "medium" | "high" | "critical" = "low";
    let color: "green" | "purple" | "red" = "green"; // removed unused "blue"

    if (finalScore < 30) {
      riskLevel = "low";
      color = "green";
    } else if (finalScore < 60) {
      riskLevel = "medium";
      color = "purple"; // dashboard expects purple
    } else if (finalScore < 85) {
      riskLevel = "high";
      color = "red";
    } else {
      riskLevel = "critical";
      color = "red";
    }

    // -------------------------------------------------------
    // 🌍 GEO LOOKUP (OPTIONAL + SAFE)
    // -------------------------------------------------------
    let geo: any = {};
    try {
      const geoRes = await axios.get(
        `http://ip-api.com/json/${ip}?fields=status,country,city,isp`
      );
      if (geoRes.data?.status === "success") geo = geoRes.data;
    } catch (err: any) {
      console.warn("Geo lookup failed:", err?.message);
    }

    // -------------------------------------------------------
    // 🟢 FINAL JSON RESPONSE (100% Dashboard Compatible)
    // -------------------------------------------------------
    return NextResponse.json(
      {
        type: "ip",
        ip,

        // scoring
        finalScore,
        riskScore: finalScore,
        riskLevel,
        color,
        isSuspicious: finalScore >= 40,

        // VT data
        maliciousCount,
        suspiciousCount,
        undetected,
        harmless,
        reputation,

        // geo data
        country: geo.country ?? "Unknown",
        city: geo.city ?? null,
        isp: geo.isp ?? null,

        // AI explanation
        aiSummary: explanation,
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
