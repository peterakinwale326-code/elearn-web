import { nodeApiUrl } from "@/lib/node-api";

const supportedActions = new Set(["login", "signup"]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;
  if (action !== "me") {
    return Response.json({ message: "Unsupported authentication action" }, { status: 404 });
  }

  try {
    const headers = new Headers({ Accept: "application/json" });
    const cookie = request.headers.get("cookie");
    if (cookie) headers.set("Cookie", cookie);

    const upstream = await fetch(nodeApiUrl("/auth/me"), { headers, cache: "no-store" });
    const responseHeaders = new Headers({
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    });
    return new Response(await upstream.text(), { status: upstream.status, headers: responseHeaders });
  } catch {
    return Response.json({ message: "The Node API could not be reached. Start it with npm run api:dev." }, { status: 503 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;
  if (!supportedActions.has(action)) {
    return Response.json({ message: "Unsupported authentication action" }, { status: 404 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: "A valid JSON request is required" }, { status: 400 });
  }

  try {
    const requestHeaders = new Headers({ "Content-Type": "application/json", Accept: "application/json" });
    const cookie = request.headers.get("cookie");
    if (cookie) requestHeaders.set("Cookie", cookie);

    const upstream = await fetch(nodeApiUrl(`/auth/${action}`), {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const headers = new Headers({
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    });
    for (const cookie of upstream.headers.getSetCookie()) {
      headers.append("Set-Cookie", cookie);
    }

    return new Response(await upstream.text(), { status: upstream.status, headers });
  } catch {
    return Response.json({ message: "The Node API could not be reached. Start it with npm run api:dev." }, { status: 503 });
  }
}