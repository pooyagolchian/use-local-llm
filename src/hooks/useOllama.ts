import type { LocalLLMResult, OllamaOptions } from "../types";
import { ENDPOINTS } from "../utils/endpoints";
import { useLocalLLM } from "./useLocalLLM";

/**
 * Zero-config chat hook for Ollama. Wraps useLocalLLM with Ollama defaults.
 *
 * @example
 * ```tsx
 * const { messages, send, isStreaming } = useOllama("llama3.2");
 *
 * // With options:
 * const { messages, send } = useOllama("mistral", {
 *   system: "You are a pirate. Respond accordingly.",
 *   temperature: 0.8,
 * });
 * ```
 */
export function useOllama(model: string, options?: OllamaOptions): LocalLLMResult {
  return useLocalLLM({
    endpoint: options?.endpoint ?? ENDPOINTS.ollama.url,
    backend: "ollama",
    model,
    system: options?.system,
    temperature: options?.temperature,
    onToken: options?.onToken,
    onResponse: options?.onResponse,
    onError: options?.onError,
  });
}
