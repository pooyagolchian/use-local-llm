---
sidebar_position: 4
title: TypeScript Reference
---

# TypeScript Reference

All types are exported from the main package entry point.

```ts
import type {
  Backend,
  ChatMessage,
  StreamChunk,
  EndpointConfig,
  LocalLLMOptions,
  LocalLLMResult,
  StreamCompletionOptions,
  StreamCompletionResult,
  LocalModel,
  ModelListOptions,
  ModelListResult,
  OllamaOptions,
} from "use-local-llm";
```

---

## Backend

```ts
type Backend = "ollama" | "lmstudio" | "llamacpp" | "openai-compatible";
```

Supported local LLM backend types.

---

## ChatMessage

```ts
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
```

A single message in a chat conversation.

---

## StreamChunk

```ts
interface StreamChunk {
  content: string;
  done: boolean;
  model?: string;
}
```

A parsed chunk from the streaming response.

---

## EndpointConfig

```ts
interface EndpointConfig {
  url: string;
  backend: Backend;
}
```

Configuration for a local LLM endpoint preset.

---

## LocalLLMOptions

```ts
interface LocalLLMOptions {
  endpoint: string;
  backend?: Backend;
  model: string;
  system?: string;
  temperature?: number;
  onToken?: (token: string) => void;
  onResponse?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
}
```

Options for [`useLocalLLM`](/docs/api/use-local-llm).

---

## LocalLLMResult

```ts
interface LocalLLMResult {
  messages: ChatMessage[];
  send: (content: string) => void;
  isStreaming: boolean;
  isLoading: boolean;
  abort: () => void;
  error: Error | null;
  clear: () => void;
}
```

Return value from [`useLocalLLM`](/docs/api/use-local-llm) and [`useOllama`](/docs/api/use-ollama).

---

## StreamCompletionOptions

```ts
interface StreamCompletionOptions {
  endpoint: string;
  backend?: Backend;
  model: string;
  prompt: string;
  autoFetch?: boolean;
  temperature?: number;
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}
```

Options for [`useStreamCompletion`](/docs/api/use-stream-completion).

---

## StreamCompletionResult

```ts
interface StreamCompletionResult {
  text: string;
  tokens: string[];
  isStreaming: boolean;
  start: () => void;
  abort: () => void;
  error: Error | null;
}
```

Return value from [`useStreamCompletion`](/docs/api/use-stream-completion).

---

## LocalModel

```ts
interface LocalModel {
  name: string;
  size?: number;
  modifiedAt?: string;
  digest?: string;
}
```

A model descriptor returned from [`useModelList`](/docs/api/use-model-list).

---

## ModelListOptions

```ts
interface ModelListOptions {
  endpoint?: string;
  backend?: Backend;
}
```

Options for [`useModelList`](/docs/api/use-model-list).

---

## ModelListResult

```ts
interface ModelListResult {
  models: LocalModel[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}
```

Return value from [`useModelList`](/docs/api/use-model-list).

---

## OllamaOptions

```ts
interface OllamaOptions {
  system?: string;
  temperature?: number;
  endpoint?: string;
  onToken?: (token: string) => void;
  onResponse?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
}
```

Options for [`useOllama`](/docs/api/use-ollama).
