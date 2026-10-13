import { nodeApiUrl } from "@/lib/node-api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;

  if (!courseId) {
    return Response.json(
      { error: "Course ID is required" },
      { status: 400 },
    );
  }

  const url = nodeApiUrl(
    `/api/courses/${encodeURIComponent(courseId)}`,
  );

  console.log("COURSE API REQUEST:", url);

  try {
    const upstream = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const body = await upstream.text();

    console.log(
      "COURSE API RESPONSE:",
      upstream.status,
      body.slice(0, 1000),
    );

    return new Response(body, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ??
          "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("COURSE API FETCH ERROR:", error);

    return Response.json(
      {
        error: "Course API unavailable",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 503 },
    );
  }
}