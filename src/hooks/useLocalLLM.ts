import { useCallback, useRef, useState } from "react";
import type { ChatMessage, LocalLLMOptions, LocalLLMResult } from "../types";
import { detectBackend } from "../utils/endpoints";
import { streamChat } from "../utils/streamParser";

/**
 * Full-featured chat hook for local LLMs with message history,
 * streaming, and abort support.
 *
 * @example
 * ```tsx
 * const { messages, send, isStreaming, abort } = useLocalLLM({
 *   endpoint: "http://localhost:11434",
 *   model: "llama3.2",
 *   system: "You are a helpful assistant.",
 * });
 *
 * <button onClick={() => send("Hello!")}>Send</button>
 * ```
 */
export function useLocalLLM(options: LocalLLMOptions): LocalLLMResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsStreaming(false);
    setIsLoading(false);
  }, []);

  const clear = useCallback(() => {
    abort();
    setMessages([]);
    setError(null);
  }, [abort]);

  const send = useCallback(async (content: string) => {
    const opts = optionsRef.current;
    const controller = new AbortController();

    // Abort any existing stream
    abortControllerRef.current?.abort();
    abortControllerRef.current = controller;

    setError(null);
    setIsLoading(true);

    const userMessage: ChatMessage = { role: "user", content };
    const assistantMessage: ChatMessage = { role: "assistant", content: "" };
    const updated = [...messagesRef.current, userMessage];
    const withAssistant = [...updated, assistantMessage];
    setMessages(withAssistant);

    // Build API messages with system prompt
    const apiMessages: ChatMessage[] = [];
    if (opts.system) {
      apiMessages.push({ role: "system", content: opts.system });
    }
    apiMessages.push(...updated);

    // Stream the response
    let accumulated = "";

    try {
      const backend = opts.backend ?? detectBackend(opts.endpoint);
      const stream = streamChat({
        endpoint: opts.endpoint,
        backend,
        model: opts.model,
        messages: apiMessages,
        temperature: opts.temperature,
        signal: controller.signal,
      });

      setIsStreaming(true);
      setIsLoading(false);

      for await (const chunk of stream) {
        if (controller.signal.aborted) break;

        accumulated += chunk.content;
        opts.onToken?.(chunk.content);

        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: accumulated };
          return next;
        });
      }

      const finalMessage: ChatMessage = { role: "assistant", content: accumulated };
      opts.onResponse?.(finalMessage);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      const streamError = err instanceof Error ? err : new Error("Stream failed");
      setError(streamError);
      opts.onError?.(streamError);
    } finally {
      setIsStreaming(false);
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  return { messages, send, isStreaming, isLoading, abort, error, clear };
}
