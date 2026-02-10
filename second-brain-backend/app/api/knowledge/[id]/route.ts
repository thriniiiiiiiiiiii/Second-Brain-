import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "*",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Preflight handler
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

/* =========================
   GET SINGLE NOTE
========================= */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.knowledge.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(item, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("GET /api/knowledge/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

/* =========================
   UPDATE NOTE
========================= */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body || (!body.title && !body.content && !body.summary && !body.tags && !body.type)) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const updated = await prisma.knowledge.update({
      where: { id },
      data: {
        title: body.title,
        content: body.content,
        summary: body.summary,
        tags: body.tags,
        type: body.type,
      },
    });

    return NextResponse.json(updated, { headers: CORS_HEADERS });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    console.error("PUT /api/knowledge/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

/* =========================
   DELETE NOTE
========================= */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.knowledge.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    console.error("DELETE /api/knowledge/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

