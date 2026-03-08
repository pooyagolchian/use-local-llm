import type { Backend, EndpointConfig } from "../types";

/** Default endpoint configurations for supported backends */
export const ENDPOINTS: Record<string, EndpointConfig> = {
  ollama: {
    url: "http://localhost:11434",
    backend: "ollama",
  },
  lmstudio: {
    url: "http://localhost:1234",
    backend: "lmstudio",
  },
  llamacpp: {
    url: "http://localhost:8080",
    backend: "llamacpp",
  },
};

/** API paths for chat completions by backend */
export const CHAT_PATHS: Record<Backend, string> = {
  ollama: "/api/chat",
  lmstudio: "/v1/chat/completions",
  llamacpp: "/v1/chat/completions",
  "openai-compatible": "/v1/chat/completions",
};

/** API paths for text generation (non-chat) by backend */
export const GENERATE_PATHS: Record<Backend, string> = {
  ollama: "/api/generate",
  lmstudio: "/v1/completions",
  llamacpp: "/v1/completions",
  "openai-compatible": "/v1/completions",
};

/** API paths for listing models by backend */
export const MODEL_LIST_PATHS: Record<Backend, string> = {
  ollama: "/api/tags",
  lmstudio: "/v1/models",
  llamacpp: "/v1/models",
  "openai-compatible": "/v1/models",
};

const PORT_TO_BACKEND: Record<string, Backend> = {
  "11434": "ollama",
  "1234": "lmstudio",
  "8080": "llamacpp",
};

/** Auto-detect backend from endpoint URL based on port */
export function detectBackend(endpoint: string): Backend {
  try {
    const url = new URL(endpoint);
    return PORT_TO_BACKEND[url.port] ?? "openai-compatible";
  } catch {
    return "openai-compatible";
  }
}
