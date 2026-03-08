---
sidebar_position: 4
title: Advanced Usage
---

# Advanced Usage

For power users who need lower-level access to the streaming engine.

## Direct Stream Access (Non-React)

The stream utilities work outside of React — in Node.js scripts, tests, or vanilla JS.

```ts
import { streamChat, streamGenerate } from "use-local-llm";

// Chat stream
async function chat() {
  const stream = streamChat({
    endpoint: "http://localhost:11434",
    backend: "ollama",
    model: "gemma3:1b",
    messages: [
      { role: "system", content: "You are helpful." },
      { role: "user", content: "What is TypeScript?" },
    ],
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.content);
    if (chunk.done) break;
  }
}

// Generate stream
async function generate() {
  const stream = streamGenerate({
    endpoint: "http://localhost:11434",
    backend: "ollama",
    model: "gemma3:1b",
    prompt: "Explain async generators:",
  });

  let fullText = "";
  for await (const chunk of stream) {
    fullText += chunk.content;
  }
  console.log(fullText);
}
```

## Custom Abort Handling

Use `AbortController` directly with the stream utilities.

```ts
import { streamChat } from "use-local-llm";

const controller = new AbortController();

// Abort after 5 seconds
setTimeout(() => controller.abort(), 5000);

const stream = streamChat({
  endpoint: "http://localhost:11434",
  backend: "ollama",
  model: "gemma3:1b",
  messages: [{ role: "user", content: "Write a long essay about AI." }],
  signal: controller.signal,
});

try {
  for await (const chunk of stream) {
    process.stdout.write(chunk.content);
  }
} catch (err) {
  if (err instanceof DOMException && err.name === "AbortError") {
    console.log("\nAborted!");
  } else {
    throw err;
  }
}
```

## Parsing Individual Chunks

Use `parseStreamChunk` to parse raw NDJSON or SSE lines.

```ts
import { parseStreamChunk } from "use-local-llm";

// Ollama NDJSON
const ollamaLine = '{"model":"gemma3:1b","message":{"content":"Hi"},"done":false}';
const chunk1 = parseStreamChunk(ollamaLine, "ollama");
// → { content: "Hi", done: false, model: "gemma3:1b" }

// OpenAI SSE
const sseLine = 'data: {"choices":[{"delta":{"content":"Hello"},"finish_reason":null}]}';
const chunk2 = parseStreamChunk(sseLine, "lmstudio");
// → { content: "Hello", done: false }

// Stream end markers
parseStreamChunk("data: [DONE]", "lmstudio");
// → { content: "", done: true }
```

## Backend Auto-Detection

Use `detectBackend` to determine the backend from a URL.

```ts
import { detectBackend } from "use-local-llm";

detectBackend("http://localhost:11434");  // → "ollama"
detectBackend("http://localhost:1234");   // → "lmstudio"
detectBackend("http://localhost:8080");   // → "llamacpp"
detectBackend("http://localhost:5000");   // → "openai-compatible"
detectBackend("http://my-server.com");    // → "openai-compatible"
```

## Endpoint Presets

Access the built-in endpoint configurations.

```ts
import { ENDPOINTS, CHAT_PATHS, GENERATE_PATHS, MODEL_LIST_PATHS } from "use-local-llm";

ENDPOINTS.ollama;
// → { url: "http://localhost:11434", backend: "ollama" }

CHAT_PATHS.ollama;          // → "/api/chat"
CHAT_PATHS.lmstudio;        // → "/v1/chat/completions"

GENERATE_PATHS.ollama;      // → "/api/generate"
MODEL_LIST_PATHS.ollama;    // → "/api/tags"
```

## Building a Custom Hook

Compose the primitives to build your own hooks.

```tsx
import { useState, useCallback } from "react";
import { streamChat, detectBackend } from "use-local-llm";
import type { ChatMessage, StreamChunk } from "use-local-llm";

function useSummarizer(model: string) {
  const [summary, setSummary] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const summarize = useCallback(async (text: string) => {
    setIsRunning(true);
    setSummary("");

    const messages: ChatMessage[] = [
      { role: "system", content: "Summarize the following text concisely." },
      { role: "user", content: text },
    ];

    const stream = streamChat({
      endpoint: "http://localhost:11434",
      backend: detectBackend("http://localhost:11434"),
      model,
      messages,
    });

    let accumulated = "";
    for await (const chunk of stream) {
      accumulated += chunk.content;
      setSummary(accumulated);
    }

    setIsRunning(false);
    return accumulated;
  }, [model]);

  return { summary, summarize, isRunning };
}
```
