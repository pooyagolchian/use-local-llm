import { useCallback, useEffect, useRef, useState } from "react";
import type { LocalModel, ModelListOptions, ModelListResult } from "../types";
import { detectBackend, ENDPOINTS, MODEL_LIST_PATHS } from "../utils/endpoints";

/**
 * Hook to list available models on a local LLM runtime.
 *
 * @example
 * ```tsx
 * const { models, isLoading, refresh } = useModelList();
 * // defaults to Ollama at localhost:11434
 *
 * const { models } = useModelList({
 *   endpoint: "http://localhost:1234",
 *   backend: "lmstudio",
 * });
 * ```
 */
export function useModelList(options?: ModelListOptions): ModelListResult {
  const [models, setModels] = useState<LocalModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetchModels = useCallback(async () => {
    const opts = optionsRef.current;
    const endpoint = opts?.endpoint ?? ENDPOINTS.ollama.url;
    const backend = opts?.backend ?? detectBackend(endpoint);
    const url = `${endpoint.replace(/\/$/, "")}${MODEL_LIST_PATHS[backend]}`;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch models (${response.status})`);
      }

      const data = await response.json();

      // Ollama returns { models: [...] }
      // OpenAI-compatible returns { data: [...] }
      const rawModels: unknown[] = data.models ?? data.data ?? [];

      const parsed: LocalModel[] = rawModels.map((m: unknown) => {
        const model = m as Record<string, unknown>;
        return {
          name: (model.name ?? model.id ?? "unknown") as string,
          size: model.size as number | undefined,
          modifiedAt: (model.modified_at ?? model.created) as string | undefined,
          digest: model.digest as string | undefined,
        };
      });

      setModels(parsed);
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error("Failed to fetch models");
      setError(fetchError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return { models, isLoading, error, refresh: fetchModels };
}
