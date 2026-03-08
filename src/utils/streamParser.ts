import type { Backend, ChatMessage, StreamChunk } from "../types";
import { CHAT_PATHS, detectBackend, GENERATE_PATHS } from "./endpoints";

/**
 * Parse a single line/chunk from an NDJSON or SSE stream into a StreamChunk.
 */
export function parseStreamChunk(raw: string, backend: Backend): StreamChunk | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "data: [DONE]") {
    return trimmed === "data: [DONE]" ? { content: "", done: true } : null;
  }

  let jsonStr = trimmed;
  // SSE format: strip "data: " prefix
  if (trimmed.startsWith("data: ")) {
    jsonStr = trimmed.slice(6);
  }

  try {
    const parsed = JSON.parse(jsonStr);

    if (backend === "ollama") {
      // Ollama generate: { response: "...", done: bool }
      // Ollama chat:     { message: { content: "..." }, done: bool }
      if (parsed.message) {
        return {
          content: parsed.message.content ?? "",
          done: !!parsed.done,
          model: parsed.model,
        };
      }
      return {
        content: parsed.response ?? "",
        done: !!parsed.done,
        model: parsed.model,
      };
    }

    // OpenAI-compatible format (LM Studio, llama.cpp, etc.)
    // { choices: [{ delta: { content: "..." }, finish_reason: "stop"|null }] }
    const choice = parsed.choices?.[0];
    if (choice) {
      return {
        content: choice.delta?.content ?? choice.text ?? "",
        done: choice.finish_reason === "stop",
        model: parsed.model,
      };
    }

    return null;
  } catch {
    return null;
  }
}

export interface StreamRequestOptions {
  endpoint: string;
  backend?: Backend;
  model: string;
  temperature?: number;
  signal?: AbortSignal;
}

export interface ChatStreamRequestOptions extends StreamRequestOptions {
  messages: ChatMessage[];
}

export interface GenerateStreamRequestOptions extends StreamRequestOptions {
  prompt: string;
}

function buildChatBody(options: ChatStreamRequestOptions, backend: Backend): string {
  if (backend === "ollama") {
    return JSON.stringify({
      model: options.model,
      messages: options.messages,
      stream: true,
      ...(options.temperature != null && {
        options: { temperature: options.temperature },
      }),
    });
  }

  // OpenAI-compatible
  return JSON.stringify({
    model: options.model,
    messages: options.messages,
    stream: true,
    ...(options.temperature != null && { temperature: options.temperature }),
  });
}

function buildGenerateBody(options: GenerateStreamRequestOptions, backend: Backend): string {
  if (backend === "ollama") {
    return JSON.stringify({
      model: options.model,
      prompt: options.prompt,
      stream: true,
      ...(options.temperature != null && {
        options: { temperature: options.temperature },
      }),
    });
  }

  return JSON.stringify({
    model: options.model,
    prompt: options.prompt,
    stream: true,
    ...(options.temperature != null && { temperature: options.temperature }),
  });
}

/**
 * Initiate a streaming chat request and yield StreamChunks via an async generator.
 */
export async function* streamChat(options: ChatStreamRequestOptions): AsyncGenerator<StreamChunk> {
  const backend = options.backend ?? detectBackend(options.endpoint);
  const url = `${options.endpoint.replace(/\/$/, "")}${CHAT_PATHS[backend]}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: buildChatBody(options, backend),
    signal: options.signal,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error");
    throw new Error(`LLM request failed (${response.status}): ${text}`);
  }

  yield* readStream(response, backend);
}

/**
 * Initiate a streaming text generation request and yield StreamChunks.
 */
export async function* streamGenerate(
  options: GenerateStreamRequestOptions,
): AsyncGenerator<StreamChunk> {
  const backend = options.backend ?? detectBackend(options.endpoint);
  const url = `${options.endpoint.replace(/\/$/, "")}${GENERATE_PATHS[backend]}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: buildGenerateBody(options, backend),
    signal: options.signal,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error");
    throw new Error(`LLM request failed (${response.status}): ${text}`);
  }

  yield* readStream(response, backend);
}

/**
 * Read a streaming response body and yield parsed chunks.
 */
async function* readStream(response: Response, backend: Backend): AsyncGenerator<StreamChunk> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      // Keep the last (potentially incomplete) line in buffer
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const chunk = parseStreamChunk(line, backend);
        if (chunk) {
          yield chunk;
          if (chunk.done) return;
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      const chunk = parseStreamChunk(buffer, backend);
      if (chunk) yield chunk;
    }
  } finally {
    reader.releaseLock();
  }
}
