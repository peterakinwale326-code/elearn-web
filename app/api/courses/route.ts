import { nodeApiUrl } from "@/lib/node-api";

export async function GET() {
try {
const upstream = await fetch(nodeApiUrl("/api/courses"), {
cache: "no-store",
headers: {
Accept: "application/json",
},
});


const body = await upstream.text();

return new Response(body, {
  status: upstream.status,
  headers: {
    "Content-Type":
      upstream.headers.get("content-type") ?? "application/json",
    "Cache-Control": "no-store",
  },
});


} catch (error) {
console.error("Courses API unavailable:", error);


return Response.json(
  { error: "Courses API unavailable" },
  { status: 503 },
);


}
}
