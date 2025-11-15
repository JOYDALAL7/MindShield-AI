import { NextResponse } from "next/server";
import axios from "axios";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { ip } = await req.json();
    if (!ip) return NextResponse.json({ error: "No IP or domain provided." }, { status: 400 });

    const response = await axios.get(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
      headers: { "x-apikey": process.env.VIRUSTOTAL_API_KEY! },
    });

    const data = response.data;
    const maliciousCount = data?.data?.attributes?.last_analysis_stats?.malicious ?? 0;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a cybersecurity assistant that summarizes IP threat reports clearly.",
        },
        {
          role: "user",
          content: `Analyze this IP report: ${JSON.stringify(data?.data?.attributes)}.`,
        },
      ],
    });

    const explanation = aiResponse.choices[0].message.content;

    return NextResponse.json({
      ip,
      maliciousCount,
      explanation,
    });
  } catch (error: any) {
    console.error("IP check error:", error?.response?.data || error.message);
    return NextResponse.json({ error: "Failed to check IP." }, { status: 500 });
  }
}
