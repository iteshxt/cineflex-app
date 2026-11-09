import { getSeason } from "@/lib/tmdb";

export async function GET(_req: Request, ctx: RouteContext<"/api/tv/[id]/season/[season]">) {
  const { id, season } = await ctx.params;
  const showId = Number(id);
  const n = Number(season);
  if (!Number.isInteger(showId) || !Number.isInteger(n) || n < 0) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }
  const data = await getSeason(showId, n).catch(() => undefined);
  if (data === undefined) return Response.json({ error: "Upstream unavailable" }, { status: 503 });
  if (!data) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(data, { headers: { "cache-control": "public, max-age=3600, stale-while-revalidate=86400" } });
}
