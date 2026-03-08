import { useCallback, useRef, useState } from "react";
import type { StreamCompletionOptions, StreamCompletionResult } from "../types";
import { detectBackend } from "../utils/endpoints";
import { streamGenerate } from "../utils/streamParser";

/**
 * Low-level hook for streaming text completions from a local LLM.
 *
 * @example
 * ```tsx
 * const { text, isStreaming, start, abort } = useStreamCompletion({
 *   endpoint: "http://localhost:11434",
 *   model: "llama3.2",
 *   prompt: "Explain React hooks in one paragraph",
 * });
 * ```
 */
export function useStreamCompletion(options: StreamCompletionOptions): StreamCompletionResult {
  const [text, setText] = useState("");
  const [tokens, setTokens] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsStreaming(false);
  }, []);

  const start = useCallback(async () => {
    // Abort any existing stream
    abort();

    const opts = optionsRef.current;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setText("");
    setTokens([]);
    setError(null);
    setIsStreaming(true);

    let accumulated = "";

    try {
      const backend = opts.backend ?? detectBackend(opts.endpoint);
      const stream = streamGenerate({
        endpoint: opts.endpoint,
        backend,
        model: opts.model,
        prompt: opts.prompt,
        temperature: opts.temperature,
        signal: controller.signal,
      });

      for await (const chunk of stream) {
        if (controller.signal.aborted) break;

        accumulated += chunk.content;
        setText(accumulated);
        setTokens((prev) => [...prev, chunk.content]);
        opts.onToken?.(chunk.content);
      }

      opts.onComplete?.(accumulated);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // User-initiated abort — not an error
        return;
      }
      const error = err instanceof Error ? err : new Error("Stream failed");
      setError(error);
      opts.onError?.(error);
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [abort]);

  return { text, tokens, isStreaming, start, abort, error };
}
