---
sidebar_position: 2
title: useLocalLLM
---

# useLocalLLM

Full-featured chat hook for local LLMs with message history, streaming, and abort support. Works with any supported backend.

## Signature

```ts
function useLocalLLM(options: LocalLLMOptions): LocalLLMResult;
```

## Parameters

### `options`

**Type:** `LocalLLMOptions` · **Required**

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `endpoint` | `string` | — | **Required.** LLM server URL (e.g. `"http://localhost:11434"`) |
| `model` | `string` | — | **Required.** Model name |
| `backend` | `Backend` | Auto-detected | Backend type: `"ollama"`, `"lmstudio"`, `"llamacpp"`, `"openai-compatible"` |
| `system` | `string` | — | System prompt prepended to the conversation |
| `temperature` | `number` | Model default | Sampling temperature (0–2) |
| `onToken` | `(token: string) => void` | — | Called on each streamed token |
| `onResponse` | `(message: ChatMessage) => void` | — | Called when a complete response is received |
| `onError` | `(error: Error) => void` | — | Called on error |

## Return value

Returns a [`LocalLLMResult`](../internals/typescript-reference#localllmresult) object:

| Property | Type | Description |
| --- | --- | --- |
| `messages` | `ChatMessage[]` | Full conversation history (user + assistant messages) |
| `send` | `(content: string) => void` | Send a user message and trigger streaming response |
| `isStreaming` | `boolean` | Whether the model is currently generating tokens |
| `isLoading` | `boolean` | Whether a request is in-flight (includes initial connection) |
| `abort` | `() => void` | Abort the current generation |
| `error` | `Error \| null` | Most recent error, or `null` |
| `clear` | `() => void` | Clear the entire conversation history and reset error |

## Behavior

1. **`send(content)`** appends a user message, then streams the assistant response
2. Messages are accumulated token-by-token in real time
3. If `send()` is called while streaming, the previous stream is aborted automatically
4. The `system` prompt is prepended as the first message in every API call
5. Backend is auto-detected from the endpoint port if not specified

## Examples

### Ollama

```tsx
import { useLocalLLM } from "use-local-llm";

const { messages, send, isStreaming, abort } = useLocalLLM({
  endpoint: "http://localhost:11434",
  model: "gemma3:1b",
  system: "You are a helpful coding assistant.",
});
```

### LM Studio

```tsx
const { messages, send } = useLocalLLM({
  endpoint: "http://localhost:1234",
  model: "lmstudio-community/Meta-Llama-3-8B-Instruct-GGUF",
  backend: "lmstudio", // or let it auto-detect from port 1234
});
```

### llama.cpp

```tsx
const { messages, send } = useLocalLLM({
  endpoint: "http://localhost:8080",
  model: "default",
  temperature: 0.7,
});
```

### Full chat component

```tsx
import { useState } from "react";
import { useLocalLLM } from "use-local-llm";

function ChatApp() {
  const [input, setInput] = useState("");
  const { messages, send, isStreaming, abort, error, clear } = useLocalLLM({
    endpoint: "http://localhost:11434",
    model: "gemma3:1b",
    system: "You are a helpful assistant.",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    send(input);
    setInput("");
  };

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error.message}</p>}

      {messages.map((m, i) => (
        <div key={i}>
          <b>{m.role}:</b> {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" disabled={isStreaming}>
          Send
        </button>
        {isStreaming && <button onClick={abort}>Stop</button>}
        <button type="button" onClick={clear}>
          Clear
        </button>
      </form>
    </div>
  );
}
```

## Source

[`src/hooks/useLocalLLM.ts`](https://github.com/pooyagolchian/use-local-llm/blob/main/src/hooks/useLocalLLM.ts)
