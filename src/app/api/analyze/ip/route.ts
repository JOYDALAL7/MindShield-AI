import { NextResponse } from "next/server";
import axios from "axios";
import OpenAI from "openai";

// ✅ Force Node.js runtime (OpenAI SDK requires it)
export const runtime = "nodejs";

// ❗ Safe OpenAI initialization (avoids build crashes)
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

    // ❗ Check VirusTotal API key
    if (!process.env.VIRUSTOTAL_API_KEY) {
      return NextResponse.json(
        {
          error: "Server is missing VirusTotal API Key.",
        },
        { status: 500 }
      );
    }

    // 🔍 VirusTotal lookup
    const vt = await axios.get(
      `https://www.virustotal.com/api/v3/ip_addresses/${ip}`,
      {
        headers: {
          "x-apikey": process.env.VIRUSTOTAL_API_KEY,
        },
      }
    );

    const attributes = vt.data?.data?.attributes || {};
    const maliciousCount =
      attributes?.last_analysis_stats?.malicious ?? 0;

    // 🧠 Fallback if no OpenAI key
    if (!openai) {
      console.error("❌ Missing OPENAI_API_KEY");
      return NextResponse.json(
        {
          ip,
          maliciousCount,
          explanation:
            "AI threat explanation unavailable. Server is missing OpenAI configuration.",
        },
        { status: 200 }
      );
    }

    // 🧠 AI threat summary
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a cybersecurity expert. Summarize the IP reputation clearly and concisely.",
        },
        {
          role: "user",
          content: `Analyze this IP threat report: ${JSON.stringify(
            attributes
          )}`,
        },
      ],
      max_tokens: 180,
    });

    const explanation =
      aiResponse.choices?.[0]?.message?.content ??
      "AI could not generate an explanation.";

    return NextResponse.json(
      {
        ip,
        maliciousCount,
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
