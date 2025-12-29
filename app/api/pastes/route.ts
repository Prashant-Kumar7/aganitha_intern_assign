import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createPasteSchema } from "@/lib/schemas";
import { createPaste, getCurrentTime } from "@/lib/kv";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input with Zod
    const validationResult = createPasteSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { content, ttl_seconds, max_views } = validationResult.data;
    
    // Generate ID
    const id = nanoid();
    
    // Get current time (respects TEST_MODE)
    const testNowMs = request.headers.get("x-test-now-ms");
    const now = getCurrentTime(testNowMs);
    
    const expiresAt = ttl_seconds 
      ? now + ttl_seconds * 1000 
      : null;

    // Create paste
    await createPaste({
      id,
      content,
      createdAt: now,
      expiresAt,
      maxViews: max_views ?? null,
    }, testNowMs);

    // Get the base URL
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;
    const url = `${baseUrl}/p/${id}`;

    return NextResponse.json(
      { id, url },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating paste:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
