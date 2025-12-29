import { NextRequest, NextResponse } from "next/server";
import { getPaste, isPasteAvailable, incrementViewCount } from "@/lib/kv";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const testNowMs = request.headers.get("x-test-now-ms");
    
    const paste = await getPaste(id);
    
    if (!paste) {
      return NextResponse.json(
        { error: "Paste not found" },
        { status: 404 }
      );
    }

    // Check if paste is available BEFORE incrementing
    // This ensures we don't increment if the paste is already unavailable
    if (!isPasteAvailable(paste, testNowMs)) {
      return NextResponse.json(
        { error: "Paste not found" },
        { status: 404 }
      );
    }

    // Increment view count (this counts as a view)
    await incrementViewCount(id);

    // Get updated paste to get the new view count
    const updatedPaste = await getPaste(id);
    if (!updatedPaste) {
      return NextResponse.json(
        { error: "Paste not found" },
        { status: 404 }
      );
    }

    // Calculate remaining views (after this view)
    const remaining_views = updatedPaste.maxViews !== null
      ? Math.max(0, updatedPaste.maxViews - updatedPaste.viewCount)
      : null;

    // Format expires_at
    const expires_at = updatedPaste.expiresAt
      ? new Date(updatedPaste.expiresAt).toISOString()
      : null;

    return NextResponse.json({
      content: updatedPaste.content,
      remaining_views,
      expires_at,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching paste:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
