import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AIProvider } from "@/lib/ai-provider";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Preflight request handler
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET all knowledge items
export async function GET() {
  try {
    const items = await prisma.knowledge.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items, { headers: corsHeaders });
  } catch (error) {
    console.error("GET /api/knowledge error:", error);
    return NextResponse.json(
      { error: "Failed to fetch knowledge" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// CREATE a knowledge item
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, type, tags } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // 🔒 SAFE DEFAULTS
    let summary: string | null = null;
    let finalTags: string[] = tags || [];

    // 🤖 AI IS OPTIONAL — NEVER BLOCK SAVE
    try {
      summary = await AIProvider.summarize(content);
    } catch (err) {
      console.warn("⚠️ AI summary skipped:", err);
    }

    try {
      if (!finalTags.length) {
        finalTags = await AIProvider.generateTags(title, content);
      }
    } catch (err) {
      console.warn("⚠️ AI tags skipped:", err);
    }

    // ✅ ALWAYS SAVE
    const item = await prisma.knowledge.create({
      data: {
        title,
        content,
        type: type || "note",
        tags: finalTags,
        summary,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("POST /api/knowledge error:", error);
    return NextResponse.json(
      { error: "Failed to create knowledge" },
      { status: 500 }
    );
  }
}
