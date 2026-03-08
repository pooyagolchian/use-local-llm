import { describe, expect, it } from "vitest";
import { CHAT_PATHS, detectBackend, ENDPOINTS } from "../utils/endpoints";
import { parseStreamChunk } from "../utils/streamParser";

describe("parseStreamChunk", () => {
  describe("Ollama backend", () => {
    it("parses Ollama chat response", () => {
      const raw = JSON.stringify({
        message: { role: "assistant", content: "Hello" },
        done: false,
        model: "llama3.2",
      });
      const chunk = parseStreamChunk(raw, "ollama");
      expect(chunk).toEqual({
        content: "Hello",
        done: false,
        model: "llama3.2",
      });
    });

    it("parses Ollama generate response", () => {
      const raw = JSON.stringify({
        response: "World",
        done: false,
        model: "llama3.2",
      });
      const chunk = parseStreamChunk(raw, "ollama");
      expect(chunk).toEqual({
        content: "World",
        done: false,
        model: "llama3.2",
      });
    });

    it("parses Ollama done signal", () => {
      const raw = JSON.stringify({
        message: { role: "assistant", content: "" },
        done: true,
        model: "llama3.2",
      });
      const chunk = parseStreamChunk(raw, "ollama");
      expect(chunk).toEqual({
        content: "",
        done: true,
        model: "llama3.2",
      });
    });
  });

  describe("OpenAI-compatible backend", () => {
    it("parses SSE delta format", () => {
      const raw =
        "data: " +
        JSON.stringify({
          choices: [{ delta: { content: "Hi" }, finish_reason: null }],
          model: "mistral",
        });
      const chunk = parseStreamChunk(raw, "openai-compatible");
      expect(chunk).toEqual({
        content: "Hi",
        done: false,
        model: "mistral",
      });
    });

    it("parses SSE done signal", () => {
      const raw = "data: [DONE]";
      const chunk = parseStreamChunk(raw, "openai-compatible");
      expect(chunk).toEqual({ content: "", done: true });
    });

    it("parses finish_reason stop", () => {
      const raw =
        "data: " +
        JSON.stringify({
          choices: [{ delta: { content: "" }, finish_reason: "stop" }],
        });
      const chunk = parseStreamChunk(raw, "openai-compatible");
      expect(chunk).toEqual({
        content: "",
        done: true,
        model: undefined,
      });
    });
  });

  describe("edge cases", () => {
    it("returns null for empty string", () => {
      expect(parseStreamChunk("", "ollama")).toBeNull();
    });

    it("returns null for whitespace", () => {
      expect(parseStreamChunk("   ", "ollama")).toBeNull();
    });

    it("returns null for invalid JSON", () => {
      expect(parseStreamChunk("not json", "ollama")).toBeNull();
    });

    it("handles SSE prefix with Ollama backend", () => {
      const raw =
        "data: " +
        JSON.stringify({
          message: { content: "test" },
          done: false,
        });
      const chunk = parseStreamChunk(raw, "ollama");
      expect(chunk?.content).toBe("test");
    });
  });
});

describe("detectBackend", () => {
  it("detects Ollama from port 11434", () => {
    expect(detectBackend("http://localhost:11434")).toBe("ollama");
  });

  it("detects LM Studio from port 1234", () => {
    expect(detectBackend("http://localhost:1234")).toBe("lmstudio");
  });

  it("detects llama.cpp from port 8080", () => {
    expect(detectBackend("http://localhost:8080")).toBe("llamacpp");
  });

  it("falls back to openai-compatible for unknown ports", () => {
    expect(detectBackend("http://localhost:3000")).toBe("openai-compatible");
  });

  it("falls back for invalid URLs", () => {
    expect(detectBackend("not-a-url")).toBe("openai-compatible");
  });
});

describe("ENDPOINTS", () => {
  it("has Ollama preset", () => {
    expect(ENDPOINTS.ollama.url).toBe("http://localhost:11434");
    expect(ENDPOINTS.ollama.backend).toBe("ollama");
  });

  it("has LM Studio preset", () => {
    expect(ENDPOINTS.lmstudio.url).toBe("http://localhost:1234");
    expect(ENDPOINTS.lmstudio.backend).toBe("lmstudio");
  });

  it("has llama.cpp preset", () => {
    expect(ENDPOINTS.llamacpp.url).toBe("http://localhost:8080");
    expect(ENDPOINTS.llamacpp.backend).toBe("llamacpp");
  });
});

describe("CHAT_PATHS", () => {
  it("uses /api/chat for Ollama", () => {
    expect(CHAT_PATHS.ollama).toBe("/api/chat");
  });

  it("uses /v1/chat/completions for OpenAI-compatible", () => {
    expect(CHAT_PATHS.lmstudio).toBe("/v1/chat/completions");
    expect(CHAT_PATHS.llamacpp).toBe("/v1/chat/completions");
    expect(CHAT_PATHS["openai-compatible"]).toBe("/v1/chat/completions");
  });
});
