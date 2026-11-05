import { nodeApiUrl } from "@/lib/node-api";

export async function POST(request: Request) {
  try {
    const headers = new Headers({
      Accept: "application/json",
      "Content-Type": request.headers.get("content-type") ?? "application/octet-stream",
    });
    const cookie = request.headers.get("cookie");
    if (cookie) headers.set("Cookie", cookie);

    const upstream = await fetch(nodeApiUrl("/api/profile/avatar"), {
      method: "POST",
      headers,
      body: await request.arrayBuffer(),
      cache: "no-store",
    });
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      { message: "The Node API could not be reached. Start it with npm run api:dev." },
      { status: 503 },
    );
  }
}
