import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY!,
    });

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 300,
      messages: [
        { role: "user", content: prompt }
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    const reply = textBlock && "text" in textBlock ? textBlock.text : "";

    return NextResponse.json({
      reply,
    });

  } catch (error) {
    console.error("Claude API error:", error);
    return NextResponse.json(
      { error: "Claude request failed" },
      { status: 500 }
    );
  }
}
