import type { NextRequest } from "next/server";
import { searchMulti } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").slice(0, 100);
  const results = await searchMulti(q).catch(() => null);
  if (!results) return Response.json({ error: "Search unavailable" }, { status: 503 });
  return Response.json(results, { headers: { "cache-control": "public, max-age=300" } });
}
