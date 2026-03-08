import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocalLLM } from "../hooks/useLocalLLM";
import { useModelList } from "../hooks/useModelList";
import { useOllama } from "../hooks/useOllama";
import { useStreamCompletion } from "../hooks/useStreamCompletion";

// Helper: create a mock ReadableStream from chunks
function createMockStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(encoder.encode(`${chunks[index]}\n`));
        index++;
      } else {
        controller.close();
      }
    },
  });
}

function mockFetchWith(body: ReadableStream, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    body,
    text: () => Promise.resolve("Error"),
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("useStreamCompletion", () => {
  it("returns initial state", () => {
    const { result } = renderHook(() =>
      useStreamCompletion({
        endpoint: "http://localhost:11434",
        model: "llama3.2",
        prompt: "hi",
      }),
    );

    expect(result.current.text).toBe("");
    expect(result.current.tokens).toEqual([]);
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.start).toBe("function");
    expect(typeof result.current.abort).toBe("function");
  });

  it("streams tokens on start", async () => {
    const chunks = [
      JSON.stringify({ response: "Hello", done: false }),
      JSON.stringify({ response: " world", done: false }),
      JSON.stringify({ response: "", done: true }),
    ];

    globalThis.fetch = mockFetchWith(createMockStream(chunks));

    const onToken = vi.fn();
    const onComplete = vi.fn();

    const { result } = renderHook(() =>
      useStreamCompletion({
        endpoint: "http://localhost:11434",
        model: "llama3.2",
        prompt: "hi",
        onToken,
        onComplete,
      }),
    );

    await act(async () => {
      result.current.start();
    });

    expect(result.current.text).toBe("Hello world");
    expect(result.current.tokens).toEqual(["Hello", " world", ""]);
    expect(result.current.isStreaming).toBe(false);
    expect(onToken).toHaveBeenCalledTimes(3);
    expect(onComplete).toHaveBeenCalledWith("Hello world");
  });

  it("handles fetch errors", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve("Model not found"),
    });

    const onError = vi.fn();

    const { result } = renderHook(() =>
      useStreamCompletion({
        endpoint: "http://localhost:11434",
        model: "nonexistent",
        prompt: "hi",
        onError,
      }),
    );

    await act(async () => {
      result.current.start();
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain("404");
    expect(onError).toHaveBeenCalled();
  });
});

describe("useLocalLLM", () => {
  it("returns initial state", () => {
    const { result } = renderHook(() =>
      useLocalLLM({
        endpoint: "http://localhost:11434",
        model: "llama3.2",
      }),
    );

    expect(result.current.messages).toEqual([]);
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.send).toBe("function");
    expect(typeof result.current.abort).toBe("function");
    expect(typeof result.current.clear).toBe("function");
  });

  it("sends a message and receives streamed response", async () => {
    const chunks = [
      JSON.stringify({
        message: { role: "assistant", content: "Hi" },
        done: false,
      }),
      JSON.stringify({
        message: { role: "assistant", content: " there" },
        done: false,
      }),
      JSON.stringify({
        message: { role: "assistant", content: "" },
        done: true,
      }),
    ];

    globalThis.fetch = mockFetchWith(createMockStream(chunks));

    const { result } = renderHook(() =>
      useLocalLLM({
        endpoint: "http://localhost:11434",
        model: "llama3.2",
      }),
    );

    await act(async () => {
      result.current.send("Hello!");
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toEqual({
      role: "user",
      content: "Hello!",
    });
    expect(result.current.messages[1].role).toBe("assistant");
    expect(result.current.messages[1].content).toBe("Hi there");
  });

  it("clears messages", async () => {
    const chunks = [
      JSON.stringify({
        message: { role: "assistant", content: "Hi" },
        done: true,
      }),
    ];

    globalThis.fetch = mockFetchWith(createMockStream(chunks));

    const { result } = renderHook(() =>
      useLocalLLM({
        endpoint: "http://localhost:11434",
        model: "llama3.2",
      }),
    );

    await act(async () => {
      result.current.send("Hello!");
    });

    expect(result.current.messages.length).toBeGreaterThan(0);

    act(() => {
      result.current.clear();
    });

    expect(result.current.messages).toEqual([]);
  });
});

describe("useModelList", () => {
  it("fetches models on mount", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          models: [
            { name: "llama3.2", size: 4000000000 },
            { name: "mistral", size: 7000000000 },
          ],
        }),
    });

    const { result } = renderHook(() => useModelList());

    // Wait for the async fetch
    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.models).toHaveLength(2);
    expect(result.current.models[0].name).toBe("llama3.2");
    expect(result.current.models[1].name).toBe("mistral");
    expect(result.current.error).toBeNull();
  });

  it("handles network errors", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Connection refused"));

    const { result } = renderHook(() => useModelList());

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.models).toEqual([]);
  });

  it("handles OpenAI-compatible model list format", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [{ id: "local-model", created: 1234567890 }],
        }),
    });

    const { result } = renderHook(() =>
      useModelList({
        endpoint: "http://localhost:1234",
        backend: "lmstudio",
      }),
    );

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.models).toHaveLength(1);
    expect(result.current.models[0].name).toBe("local-model");
  });
});

describe("useOllama", () => {
  it("returns same shape as useLocalLLM", () => {
    const { result } = renderHook(() => useOllama("llama3.2"));

    expect(result.current.messages).toEqual([]);
    expect(result.current.isStreaming).toBe(false);
    expect(typeof result.current.send).toBe("function");
    expect(typeof result.current.abort).toBe("function");
    expect(typeof result.current.clear).toBe("function");
  });

  it("uses Ollama endpoint by default", async () => {
    const chunks = [
      JSON.stringify({
        message: { role: "assistant", content: "yo" },
        done: true,
      }),
    ];

    globalThis.fetch = mockFetchWith(createMockStream(chunks));

    const { result } = renderHook(() => useOllama("llama3.2"));

    await act(async () => {
      result.current.send("test");
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:11434/api/chat",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
