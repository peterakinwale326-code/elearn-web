import { nodeApiUrl } from "@/lib/node-api";

async function proxyAdminRequest(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
  method: string,
) {
  const { path } = await params;
  if (!path || path.length === 0) {
    return Response.json({ message: "Admin route not found" }, { status: 404 });
  }

  const requestUrl = new URL(request.url);
  const upstreamUrl = new URL(
    `/api/admin/${path.join("/")}${requestUrl.search}`,
    nodeApiUrl("/")
  );

  const headers = new Headers({ Accept: "application/json" });
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("Cookie", cookie);

  let body: BodyInit | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const text = await request.text();
      if (text) {
        headers.set("Content-Type", "application/json");
        body = text;
      }
    } else {
      const form = await request.formData();
      body = form;
    }
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    });

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
      { message: "The admin API could not be reached. Start the Node server with npm run api:dev." },
      { status: 503 }
    );
  }
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxyAdminRequest(request, context, "GET");
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxyAdminRequest(request, context, "POST");
}

export async function PATCH(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxyAdminRequest(request, context, "PATCH");
}

export async function DELETE(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxyAdminRequest(request, context, "DELETE");
}
