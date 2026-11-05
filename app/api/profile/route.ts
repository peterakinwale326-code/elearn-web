import { nodeApiUrl } from "@/lib/node-api";

async function forwardProfileRequest(request: Request, method: "GET" | "PATCH") {
  try {
    const headers = new Headers({ Accept: "application/json" });
    const cookie = request.headers.get("cookie");
    if (cookie) headers.set("Cookie", cookie);

    const options: RequestInit = { method, headers, cache: "no-store" };
    if (method === "PATCH") {
      headers.set("Content-Type", "application/json");
      options.body = await request.text();
    }

    const upstream = await fetch(nodeApiUrl("/api/profile"), options);
    const responseHeaders = new Headers({
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    });
    for (const cookieHeader of upstream.headers.getSetCookie()) {
      responseHeaders.append("Set-Cookie", cookieHeader);
    }
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return Response.json(
      { message: "The Node API could not be reached. Start it with npm run api:dev." },
      { status: 503 },
    );
  }
}

export async function GET(request: Request) {
  return forwardProfileRequest(request, "GET");
}

export async function PATCH(request: Request) {
  return forwardProfileRequest(request, "PATCH");
}
