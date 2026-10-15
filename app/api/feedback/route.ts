import { nodeApiUrl } from "@/lib/node-api";

export async function POST(request: Request) {
  try {
    const upstream = await fetch(nodeApiUrl("/api/feedback"), {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": request.headers.get("content-type") ?? "application/json",
        Cookie: request.headers.get("cookie") ?? "",
      },
      body: await request.text(),
    });

    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json({ message: "Feedback service is unavailable. Please try again." }, { status: 503 });
  }
}