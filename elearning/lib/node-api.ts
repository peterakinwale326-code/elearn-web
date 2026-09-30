import "server-only";

export function nodeApiUrl(path: string): string {
  const baseUrl = process.env.NODE_API_URL ?? "http://127.0.0.1:4000";
  return new URL(path, baseUrl).toString();
}
