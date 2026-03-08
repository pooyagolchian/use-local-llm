---
sidebar_position: 1
title: useOllama
---

# useOllama

Zero-config chat hook for [Ollama](https://ollama.com). A convenience wrapper around [`useLocalLLM`](./use-local-llm) with Ollama defaults.

## Signature

```ts
function useOllama(model: string, options?: OllamaOptions): LocalLLMResult;
```

## Parameters

### `model`

**Type:** `string` · **Required**

The Ollama model name (e.g. `"gemma3:1b"`, `"llama3.2"`, `"mistral"`).

### `options`

**Type:** `OllamaOptions` · **Optional**

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `endpoint` | `string` | `"http://localhost:11434"` | Ollama server URL |
| `system` | `string` | — | System prompt prepended to conversation |
| `temperature` | `number` | Model default | Sampling temperature |
| `onToken` | `(token: string) => void` | — | Called on each streamed token |
| `onResponse` | `(message: ChatMessage) => void` | — | Called when streaming completes |
| `onError` | `(error: Error) => void` | — | Called on error |

## Return value

Returns a [`LocalLLMResult`](../internals/typescript-reference#localllmresult) object:

| Property | Type | Description |
| --- | --- | --- |
| `messages` | `ChatMessage[]` | Full conversation history |
| `send` | `(content: string) => void` | Send a user message |
| `isStreaming` | `boolean` | Currently generating a response |
| `isLoading` | `boolean` | Request in-flight (includes connection) |
| `abort` | `() => void` | Cancel current generation |
| `error` | `Error \| null` | Most recent error |
| `clear` | `() => void` | Clear conversation history |

## Examples

### Basic chat

```tsx
import { useOllama } from "use-local-llm";

function Chat() {
  const { messages, send, isStreaming } = useOllama("gemma3:1b");

  return (
    <div>
      {messages.map((m, i) => (
        <p key={i}>
          <b>{m.role}:</b> {m.content}
        </p>
      ))}
      <button onClick={() => send("Hello!")} disabled={isStreaming}>
        Send
      </button>
    </div>
  );
}
```

### With system prompt

```tsx
const { messages, send } = useOllama("mistral", {
  system: "You are a pirate. Respond in pirate speak.",
  temperature: 0.8,
});
```

### With callbacks

```tsx
const { messages, send } = useOllama("llama3.2", {
  onToken: (token) => console.log("Token:", token),
  onResponse: (msg) => console.log("Done:", msg.content),
  onError: (err) => console.error("Error:", err),
});
```

### Custom endpoint

```tsx
const { messages, send } = useOllama("gemma3:1b", {
  endpoint: "http://192.168.1.100:11434",
});
```

## Source

[`src/hooks/useOllama.ts`](https://github.com/pooyagolchian/use-local-llm/blob/main/src/hooks/useOllama.ts)
