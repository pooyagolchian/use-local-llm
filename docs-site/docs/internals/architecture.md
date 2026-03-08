---
sidebar_position: 1
title: Architecture
---

# Architecture

`use-local-llm` has a layered architecture with a clear separation between streaming I/O, response parsing, and React state management.

## Layer Diagram

```
┌─────────────────────────────────────────────┐
│              React Hooks Layer               │
│                                             │
│  useOllama ──► useLocalLLM    useModelList  │
│                useStreamCompletion          │
├─────────────────────────────────────────────┤
│            Stream Utilities Layer            │
│                                             │
│  streamChat()    streamGenerate()           │
│  parseStreamChunk()    readStream()         │
├─────────────────────────────────────────────┤
│            Endpoint Configuration            │
│                                             │
│  ENDPOINTS    CHAT_PATHS    GENERATE_PATHS  │
│  MODEL_LIST_PATHS    detectBackend()        │
├─────────────────────────────────────────────┤
│            Browser Fetch API                │
│                                             │
│  fetch() + ReadableStream + TextDecoder     │
└─────────────────────────────────────────────┘
```

## Data Flow

### Chat Flow (`useLocalLLM` / `useOllama`)

```
User calls send("Hello")
  │
  ├── 1. Append user message to state
  ├── 2. Append empty assistant message
  ├── 3. Build API messages (with system prompt)
  ├── 4. Auto-detect backend from URL port
  ├── 5. Call streamChat() with AbortController
  │     │
  │     ├── POST to endpoint (e.g. /api/chat)
  │     ├── Read response.body as stream
  │     ├── Decode chunks with TextDecoder
  │     ├── Split by newlines, parse each line
  │     └── yield StreamChunk { content, done, model }
  │
  ├── 6. For each chunk:
  │     ├── Accumulate content
  │     ├── Call onToken callback
  │     └── Update assistant message in state
  │
  └── 7. On completion: call onResponse callback
```

### Completion Flow (`useStreamCompletion`)

```
User calls start()
  │
  ├── 1. Reset text and tokens
  ├── 2. Auto-detect backend
  ├── 3. Call streamGenerate() with AbortController
  │     │
  │     ├── POST to endpoint (e.g. /api/generate)
  │     └── yield StreamChunks...
  │
  ├── 4. For each chunk:
  │     ├── Accumulate text
  │     ├── Push token to tokens array
  │     └── Call onToken callback
  │
  └── 5. On completion: call onComplete callback
```

## Streaming Protocols

### NDJSON (Ollama)

Ollama uses Newline-Delimited JSON. Each line is a complete JSON object:

```json
{"model":"gemma3:1b","message":{"content":"Hi"},"done":false}
{"model":"gemma3:1b","message":{"content":" there"},"done":false}
{"model":"gemma3:1b","message":{"content":"!"},"done":true}
```

### SSE (OpenAI-compatible)

LM Studio and llama.cpp use Server-Sent Events:

```
data: {"choices":[{"delta":{"content":"Hi"},"finish_reason":null}]}

data: {"choices":[{"delta":{"content":" there"},"finish_reason":null}]}

data: {"choices":[{"delta":{"content":"!"},"finish_reason":"stop"}]}

data: [DONE]
```

The stream parser handles both formats transparently.

## Hook Hierarchy

```
useOllama(model, options)
  └── useLocalLLM({ endpoint, model, backend: "ollama", ...options })
        └── streamChat({ endpoint, backend, model, messages, signal })
              └── fetch() → readStream() → parseStreamChunk()

useStreamCompletion(options)
  └── streamGenerate({ endpoint, backend, model, prompt, signal })
        └── fetch() → readStream() → parseStreamChunk()

useModelList(options)
  └── fetch(endpoint + MODEL_LIST_PATHS[backend])
```

## File Structure

```
src/
├── hooks/
│   ├── useLocalLLM.ts       # Full chat hook with history
│   ├── useOllama.ts          # Zero-config Ollama wrapper
│   ├── useStreamCompletion.ts # Low-level text completion
│   └── useModelList.ts       # Model discovery
├── utils/
│   ├── streamParser.ts       # NDJSON + SSE parsing, async generators
│   └── endpoints.ts          # Backend configs + auto-detection
├── types/
│   └── index.ts              # All TypeScript interfaces
└── index.ts                  # Barrel exports
```

## Key Design Decisions

1. **No runtime dependencies** — Uses only `fetch`, `ReadableStream`, and `TextDecoder` which are available in all modern browsers
2. **AsyncGenerator pattern** — Stream utilities use `async function*` for composable, cancellable streaming
3. **Ref-based options** — Hooks use `useRef` to access latest options without re-creating callbacks
4. **Auto-abort on re-send** — Calling `send()` while streaming automatically aborts the previous stream
5. **AbortController integration** — Every stream accepts a `signal` for cancellation
