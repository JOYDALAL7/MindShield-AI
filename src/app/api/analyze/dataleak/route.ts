import { NextResponse } from "next/server";
import axios from "axios";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    // 🧠 RapidAPI BreachDirectory API
    const options = {
      method: "GET",
      url: `https://breachdirectory.p.rapidapi.com/?func=auto&term=${encodeURIComponent(email)}`,
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY || "",
        "x-rapidapi-host": "breachdirectory.p.rapidapi.com",
      },
    };

    let breaches: any[] = [];
    let breached = false;

    try {
      const response = await axios.request(options);

      if (response.data?.success && response.data?.result) {
        breaches = response.data.result;
        breached = breaches.length > 0;
      }
    } catch (err: any) {
      console.error("BreachDirectory API Error:", err.response?.data || err.message);
    }

    // 🔍 AI Risk Summary using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a cybersecurity AI assistant. Summarize risk levels, leaked data, and user recommendations clearly.",
        },
        {
          role: "user",
          content: `Email: ${email}
Found in ${breaches.length} breaches.
Examples: ${breaches
            .slice(0, 3)
            .map((b) => b.name || b.title || "Unknown Source")
            .join(", ")}.
Provide:
1. Risk Level (Low/Medium/High)
2. Possible data exposed
3. Steps to secure the account
4. Short final reminder.`,
        },
      ],
      max_tokens: 400,
    });

    const aiSummary = completion.choices?.[0]?.message?.content || "No AI summary available.";

    return NextResponse.json({
      email,
      breached,
      leaks: breaches.map((b: any) => ({
        name: b.name || b.title || "Unknown Source",
        domain: b.domain || "N/A",
        date: b.date || "Unknown",
        dataClasses: b.data_classes || ["Email", "Password"],
      })),
      aiSummary,
      note: "Data sourced from BreachDirectory via RapidAPI.",
    });
  } catch (error: any) {
    console.error("❌ Data Leak Route Error:", error.message);
    return NextResponse.json(
      { error: "Failed to check data leak. Please try again later." },
      { status: 500 }
    );
  }
}
