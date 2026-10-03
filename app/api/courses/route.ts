import { nodeApiUrl } from "@/lib/node-api";

export async function GET() {
  try {
    const upstream = await fetch(nodeApiUrl("/api/courses"), { cache: "no-store" });
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json({ error: "Course API unavailable" }, { status: 503 });
  }
}
