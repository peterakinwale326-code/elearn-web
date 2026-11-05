import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatTurn = {
  role: "user" | "model";
  content: string;
};

type ChatRequest = {
  messages?: unknown;
};

const requestsByClient = new Map<string, number[]>();
const requestWindowMs = 60_000;
const requestLimit = 12;
const maximumRequestBytes = 120_000;
const maximumMessageLength = 2_400;
const fallbackStatuses = new Set([404, 429, 500, 502, 503, 504]);
let modelDiscoveryCache: { expiresAt: number; models: string[] } | undefined;
let preferredFallbackModel = "";

function limited(clientId: string) {
  const now = Date.now();
  const recent = (requestsByClient.get(clientId) ?? []).filter(
    (timestamp) => now - timestamp < requestWindowMs,
  );

  if (recent.length >= requestLimit) {
    requestsByClient.set(clientId, recent);
    return true;
  }

  recent.push(now);
  requestsByClient.set(clientId, recent);

  if (requestsByClient.size > 5_000) {
    for (const [key, timestamps] of requestsByClient) {
      if (!timestamps.some((timestamp) => now - timestamp < requestWindowMs)) {
        requestsByClient.delete(key);
      }
    }
  }

  return false;
}

function boundedText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function readMessages(value: unknown): ChatTurn[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 40) return null;

  const messages: ChatTurn[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;

    const turn = item as Record<string, unknown>;
    const role = turn.role === "assistant" ? "model" : turn.role;
    const content = boundedText(turn.content, maximumMessageLength);
    if ((role !== "user" && role !== "model") || !content) return null;
    messages.push({ role, content });
  }

  if (messages.at(-1)?.role !== "user") return null;
  return messages;
}

function getErrorStatus(payload: unknown) {
  if (!payload || typeof payload !== "object") return 0;
  const error = (payload as { error?: { code?: unknown } }).error;
  return typeof error?.code === "number" ? error.code : 0;
}

function canUseFallback(payload: unknown, status: number) {
  if (fallbackStatuses.has(status)) return true;
  if (!payload || typeof payload !== "object") return false;

  const error = (payload as {
    error?: { status?: unknown; message?: unknown };
  }).error;
  const statusText = typeof error?.status === "string" ? error.status : "";
  const message = typeof error?.message === "string" ? error.message : "";
  return statusText === "RESOURCE_EXHAUSTED" || /quota|rate.?limit|resource exhausted/i.test(message);
}

async function generateReply(
  model: string,
  apiKey: string,
  systemInstruction: string,
  messages: ChatTurn[],
) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: messages.map(({ role, content }) => ({
          role,
          parts: [{ text: content }],
        })),
        generationConfig: { maxOutputTokens: 1_024 },
      }),
    },
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { response, payload, text: "" };
  }

  const text = (payload as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  }).candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim() ?? "";

  return { response, payload, text };
}

async function discoverFallbackModels(apiKey: string, excluded: Set<string>) {
  const now = Date.now();
  if (!modelDiscoveryCache || modelDiscoveryCache.expiresAt <= now) {
    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000", {
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
        headers: { "x-goog-api-key": apiKey },
      });
      if (!response.ok) return [];

      const payload = await response.json() as {
        models?: Array<{ name?: string; supportedGenerationMethods?: string[] }>;
      };
      const models = (payload.models ?? [])
        .filter((model) => model.supportedGenerationMethods?.includes("generateContent"))
        .map((model) => model.name?.replace(/^models\//, "") ?? "")
        .filter((name) => name && /flash/i.test(name) && !/(image|audio|live|transcribe|tts)/i.test(name));

      modelDiscoveryCache = { expiresAt: now + 5 * 60_000, models };
    } catch {
      return [];
    }
  }

  return modelDiscoveryCache.models.filter((model) => !excluded.has(model)).slice(0, 3);
}

async function generateHuggingFaceReply(
  apiKey: string,
  systemInstruction: string,
  messages: ChatTurn[],
) {
  const model = process.env.HUGGINGFACE_MODEL?.trim() || "google/gemma-2-2b-it";
  const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemInstruction },
        ...messages.map(({ role, content }) => ({
          role: role === "model" ? "assistant" : "user",
          content,
        })),
      ],
      max_tokens: 1_024,
      stream: false,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  const text = (payload as {
    choices?: Array<{ message?: { content?: unknown } }>;
  }).choices?.[0]?.message?.content;

  return {
    response,
    text: typeof text === "string" ? text.trim() : "",
  };
}

async function generateOpenAIReply(
  apiKey: string,
  systemInstruction: string,
  messages: ChatTurn[],
) {
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemInstruction },
        ...messages.map(({ role, content }) => ({
          role: role === "model" ? "assistant" : "user",
          content,
        })),
      ],
      max_tokens: 1_024,
      stream: false,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  const text = (payload as {
    choices?: Array<{ message?: { content?: unknown } }>;
  }).choices?.[0]?.message?.content;

  return {
    response,
    text: typeof text === "string" ? text.trim() : "",
  };
}

export async function POST(request: Request) {
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ message: "The chat request could not be read." }, { status: 400 });
  }

  if (Buffer.byteLength(rawBody, "utf8") > maximumRequestBytes) {
    return NextResponse.json({ message: "This conversation is too long to send." }, { status: 413 });
  }

  const clientId = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(clientId)) {
    return NextResponse.json(
      { message: "Too many messages in a short time. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
  const huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY?.trim();
  const openAiApiKey = process.env.OPENAI_API_KEY?.trim();

  let body: ChatRequest;
  try {
    body = JSON.parse(rawBody) as ChatRequest;
  } catch {
    return NextResponse.json({ message: "The chat request was not valid JSON." }, { status: 400 });
  }

  const messages = readMessages(body.messages);
  if (!messages) {
    return NextResponse.json({ message: "Send a message with a valid conversation history." }, { status: 400 });
  }

  const systemInstruction = [
    "You are Fieldnote, a warm, attentive, and accurate learning companion for secondary-school students.",
    "Respond to the actual text in the latest user message, not to a generic idea of what a student might ask. This includes questions, short phrases, statements, greetings, rough notes, and follow-up comments. Infer the likely intent from the conversation and answer it directly; if something essential is unclear, give the useful part you can and ask one focused follow-up question.",
    "Write like a thoughtful human teacher and an engaging textbook: explain ideas in clear, connected prose; define important terms; show how or why things work; and use a concrete example when it helps. Be specific to the user's topic, vary your openings, and avoid filler, canned greetings, repeated summaries, and unnecessary disclaimers.",
    "For substantial explanations, use concise Markdown headings such as '## In brief', '## How it works', '## Example', or '## Check your understanding' only when they genuinely help. Use lists for steps or comparisons, and bold key terms. Adapt the structure and length to the request rather than forcing every answer into a template.",
    "Help students learn through explanations, hints, study strategies, and original practice activities. For unrelated but appropriate questions, answer helpfully instead of redirecting to a generic study prompt.",
    "Do not provide answers to active tests, quizzes, exams, or graded assessments. If asked, explain the relevant concept or offer a similar practice question instead.",
    "Use the conversation history to preserve context when the underlying model changes.",
    "You do not have access to course lessons or assessment materials.",
  ].join("\n\n");

  let geminiErrorStatus = 503;
  if (geminiApiKey) {
    const primaryModel = process.env.GEMINI_PRIMARY_MODEL?.trim() || "gemini-3.8-flash";
    const models = Array.from(new Set([
      primaryModel,
      preferredFallbackModel,
      process.env.GEMINI_FALLBACK_MODEL?.trim() || "gemini-3.5-flash-lite",
    ].filter(Boolean)));
    const attemptedModels = new Set(models);

    for (let index = 0; index < models.length; index += 1) {
      try {
        const result = await generateReply(models[index], geminiApiKey, systemInstruction, messages);
        if (result.response.ok && result.text) {
          if (index > 0) preferredFallbackModel = models[index];
          return NextResponse.json({ reply: result.text }, { headers: { "Cache-Control": "no-store" } });
        }

        geminiErrorStatus = getErrorStatus(result.payload) || result.response.status;
        console.error("[chat] Gemini returned no usable reply", {
          model: models[index],
          status: result.response.status,
          errorStatus: geminiErrorStatus,
        });
        if (!canUseFallback(result.payload, geminiErrorStatus)) break;
        if (index < models.length - 1) continue;

        const discoveredModels = await discoverFallbackModels(geminiApiKey, attemptedModels);
        if (discoveredModels.length > 0) {
          models.push(...discoveredModels);
          discoveredModels.forEach((model) => attemptedModels.add(model));
        } else {
          break;
        }
      } catch (error) {
        geminiErrorStatus = 503;
        console.error("[chat] Gemini request failed", {
          model: models[index],
          error: error instanceof Error ? error.message : "Unknown error",
        });
        break;
      }
    }
  }

  let huggingFaceErrorStatus = 0;
  if (huggingFaceApiKey) {
    try {
      const result = await generateHuggingFaceReply(
        huggingFaceApiKey,
        systemInstruction,
        messages,
      );
      if (result.response.ok && result.text) {
        return NextResponse.json({ reply: result.text }, { headers: { "Cache-Control": "no-store" } });
      }
      huggingFaceErrorStatus = result.response.status;
      console.error("[chat] Hugging Face returned no usable reply", {
        status: result.response.status,
      });
    } catch (error) {
      huggingFaceErrorStatus = 503;
      console.error("[chat] Hugging Face request failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  let openAiErrorStatus = 0;
  if (openAiApiKey) {
    try {
      const result = await generateOpenAIReply(
        openAiApiKey,
        systemInstruction,
        messages,
      );
      if (result.response.ok && result.text) {
        return NextResponse.json({ reply: result.text }, { headers: { "Cache-Control": "no-store" } });
      }
      openAiErrorStatus = result.response.status;
      console.error("[chat] OpenAI returned no usable reply", {
        status: result.response.status,
      });
    } catch (error) {
      openAiErrorStatus = 503;
      console.error("[chat] OpenAI request failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  if (!geminiApiKey && !huggingFaceApiKey && !openAiApiKey) {
    return NextResponse.json(
      { message: "The learning assistant is not configured yet. Add a Gemini, Hugging Face, or OpenAI server-side API key." },
      { status: 503 },
    );
  }

  if (huggingFaceErrorStatus === 401 || huggingFaceErrorStatus === 403) {
    return NextResponse.json(
      { message: "The Hugging Face fallback is unavailable. Check that its server-side token has Inference Providers permission." },
      { status: 503 },
    );
  }

  if (openAiErrorStatus === 401 || openAiErrorStatus === 403) {
    return NextResponse.json(
      { message: "The OpenAI fallback is unavailable. Check that its server-side API key is valid and has API access." },
      { status: 503 },
    );
  }

  if (
    huggingFaceErrorStatus === 429 ||
    geminiErrorStatus === 429 ||
    openAiErrorStatus === 429
  ) {
    return NextResponse.json(
      { message: "The learning assistant has reached its request limit. Please try again later." },
      { status: 429 },
    );
  }

  return NextResponse.json(
    { message: "The learning assistant is temporarily unavailable. Please try again shortly." },
    { status: 503 },
  );
}