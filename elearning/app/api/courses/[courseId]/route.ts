import { nodeApiUrl } from "@/lib/node-api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  try {
    const upstream = await fetch(nodeApiUrl(`/api/courses/${encodeURIComponent(courseId)}`), { cache: "no-store" });
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