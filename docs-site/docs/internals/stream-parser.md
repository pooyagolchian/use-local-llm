---
sidebar_position: 2
title: Stream Parser
---

# Stream Parser

The stream parser (`src/utils/streamParser.ts`) is the core engine that handles the actual HTTP streaming, parsing, and chunk yielding.

## parseStreamChunk

Parses a single raw line from an NDJSON or SSE stream into a typed `StreamChunk`.

```ts
function parseStreamChunk(raw: string, backend: Backend): StreamChunk | null;
```

### Behavior

- Empty lines return `null`
- `data: [DONE]` returns `{ content: "", done: true }`
- SSE lines (`data: {...}`) have the `data: ` prefix stripped
- **Ollama** format: reads `message.content` or `response`, `done` flag
- **OpenAI** format: reads `choices[0].delta.content`, `finish_reason`
- Invalid JSON returns `null` (never throws)

### Examples

```ts
import { parseStreamChunk } from "use-local-llm";

// Ollama chat response
parseStreamChunk(
  '{"model":"gemma3:1b","message":{"content":"Hello"},"done":false}',
  "ollama"
);
// → { content: "Hello", done: false, model: "gemma3:1b" }

// Ollama generate response
parseStreamChunk(
  '{"model":"gemma3:1b","response":"World","done":false}',
  "ollama"
);
// → { content: "World", done: false, model: "gemma3:1b" }

// OpenAI SSE (LM Studio / llama.cpp)
parseStreamChunk(
  'data: {"choices":[{"delta":{"content":"Hi"},"finish_reason":null}]}',
  "lmstudio"
);
// → { content: "Hi", done: false }

// End of stream
parseStreamChunk("data: [DONE]", "lmstudio");
// → { content: "", done: true }
```

## streamChat

Initiates a streaming chat request and yields `StreamChunk` objects via an async generator.

```ts
async function* streamChat(options: ChatStreamRequestOptions): AsyncGenerator<StreamChunk>;
```

### Parameters

```ts
interface ChatStreamRequestOptions {
  endpoint: string;        // Server URL
  backend?: Backend;       // Auto-detected if not specified
  model: string;           // Model name
  messages: ChatMessage[]; // Conversation messages
  temperature?: number;    // Sampling temperature
  signal?: AbortSignal;    // For abort/cancel
}
```

### Request format

**Ollama:**
```json
{
  "model": "gemma3:1b",
  "messages": [{"role": "user", "content": "Hello"}],
  "stream": true,
  "options": { "temperature": 0.7 }
}
```

**OpenAI-compatible:**
```json
{
  "model": "my-model",
  "messages": [{"role": "user", "content": "Hello"}],
  "stream": true,
  "temperature": 0.7
}
```

## streamGenerate

Initiates a streaming text generation request.

```ts
async function* streamGenerate(options: GenerateStreamRequestOptions): AsyncGenerator<StreamChunk>;
```

### Parameters

```ts
interface GenerateStreamRequestOptions {
  endpoint: string;
  backend?: Backend;
  model: string;
  prompt: string;        // Text prompt instead of messages
  temperature?: number;
  signal?: AbortSignal;
}
```

## Internal: readStream

The private `readStream` function handles the actual byte-level stream reading:

1. Gets a `ReadableStreamDefaultReader` from `response.body`
2. Decodes bytes with `TextDecoder` (streaming mode)
3. Maintains a line buffer for incomplete lines
4. Splits by newlines and parses each complete line
5. Yields `StreamChunk` objects
6. Properly releases the reader lock in `finally`

```
Response body
  → reader.read() loop
    → TextDecoder.decode(value, { stream: true })
      → Split by "\n"
        → parseStreamChunk() for each line
          → yield StreamChunk
```
