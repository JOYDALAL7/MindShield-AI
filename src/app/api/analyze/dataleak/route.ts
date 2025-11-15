import { NextResponse } from "next/server";
import axios from "axios";
import OpenAI from "openai";

// ✅ Force Node.js runtime for OpenAI SDK
export const runtime = "nodejs";

// ❗ Safe OpenAI initialization
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

    // ❗ Check RapidAPI key
    if (!process.env.RAPIDAPI_KEY) {
      return NextResponse.json(
        {
          error:
            "Server missing RapidAPI key for BreachDirectory. Please configure RAPIDAPI_KEY.",
        },
        { status: 500 }
      );
    }

    // 🧠 BreachDirectory API request
    let breached = false;
    let breaches: any[] = [];

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
      console.error(
        "BreachDirectory API Error:",
        err?.response?.data || err.message
      );
    }

    // ❗ If no OpenAI key → return fallback
    if (!openai) {
      return NextResponse.json(
        {
          email,
          breached,
          leaks: breaches,
          aiSummary:
            "AI summarization unavailable — missing OpenAI API Key on server.",
        },
        { status: 200 }
      );
    }

    // 🧠 AI Risk Summary
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a cybersecurity AI assistant. Summarize breach risk, exposed data, and security steps clearly.",
        },
        {
          role: "user",
          content: `Email: ${email}
Found in ${breaches.length} breaches.
Examples: ${breaches
            .slice(0, 3)
            .map((b: any) => b.name || b.title || "Unknown Source")
            .join(", ")}.

Provide:
1. Risk Level (Low/Medium/High)
2. Possible data exposed
3. Steps to secure the account
4. A short reminder at the end.`,
        },
      ],
      max_tokens: 300,
    });

    const aiSummary =
      completion.choices?.[0]?.message?.content ||
      "AI summary unavailable.";

    return NextResponse.json(
      {
        email,
        breached,
        leaks: breaches.map((b: any) => ({
          name: b.name || b.title || "Unknown Source",
          domain: b.domain || "N/A",
          date: b.date || "Unknown",
          dataClasses: b.data_classes || ["Email", "Password"],
        })),
        aiSummary,
        note: "Data from BreachDirectory (RapidAPI).",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Data Leak Route Error:", error.message);
    return NextResponse.json(
      { error: "Failed to check data leak." },
      { status: 500 }
    );
  }
}
