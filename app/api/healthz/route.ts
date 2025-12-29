import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET() {
  try {
    // Test KV connection by performing a simple read operation
    // Using get with a non-existent key is a lightweight operation
    await kv.get("__health_check__");
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    // If KV is not available, still return 200 but with ok: false
    // to indicate unhealthy state while still being fast
    // This allows the health check to reflect whether the app can access its persistence layer
    console.error("Health check failed:", error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
