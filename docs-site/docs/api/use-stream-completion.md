---
sidebar_position: 3
title: useStreamCompletion
---

# useStreamCompletion

Low-level hook for streaming text completions (non-chat). Use this for single-turn text generation like summarization, code generation, or creative writing.

## Signature

```ts
function useStreamCompletion(options: StreamCompletionOptions): StreamCompletionResult;
```

## Parameters

### `options`

**Type:** `StreamCompletionOptions` · **Required**

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `endpoint` | `string` | — | **Required.** LLM server URL |
| `model` | `string` | — | **Required.** Model name |
| `prompt` | `string` | — | **Required.** The prompt to send |
| `backend` | `Backend` | Auto-detected | Backend type |
| `temperature` | `number` | Model default | Sampling temperature |
| `onToken` | `(token: string) => void` | — | Called on each token |
| `onComplete` | `(fullText: string) => void` | — | Called when streaming finishes |
| `onError` | `(error: Error) => void` | — | Called on error |

## Return value

Returns a [`StreamCompletionResult`](../internals/typescript-reference#streamcompletionresult) object:

| Property | Type | Description |
| --- | --- | --- |
| `text` | `string` | Accumulated generated text |
| `tokens` | `string[]` | Array of individual tokens received |
| `isStreaming` | `boolean` | Whether the stream is active |
| `start` | `() => void` | Start or restart the stream |
| `abort` | `() => void` | Abort the current stream |
| `error` | `Error \| null` | Most recent error |

## Behavior

1. Call `start()` to begin streaming — it does **not** start automatically
2. `text` is updated in real-time as tokens arrive
3. `tokens` accumulates individual token strings for inspection
4. Calling `start()` while streaming aborts the previous stream first
5. Calling `abort()` stops the stream without triggering `onError`

## Examples

### Basic text generation

```tsx
import { useStreamCompletion } from "use-local-llm";

function Writer() {
  const { text, isStreaming, start, abort } = useStreamCompletion({
    endpoint: "http://localhost:11434",
    model: "gemma3:1b",
    prompt: "Write a haiku about programming:",
  });

  return (
    <div>
      <pre>{text}</pre>
      {isStreaming ? (
        <button onClick={abort}>Stop</button>
      ) : (
        <button onClick={start}>Generate</button>
      )}
    </div>
  );
}
```

### With token callback

```tsx
const { text, tokens, start } = useStreamCompletion({
  endpoint: "http://localhost:11434",
  model: "gemma3:1b",
  prompt: "Explain quantum computing:",
  onToken: (token) => {
    // Process each token individually
    console.log(`Received: "${token}"`);
  },
  onComplete: (fullText) => {
    console.log("Generation complete:", fullText.length, "chars");
  },
});

// tokens.length gives you the token count
```

### Dynamic prompt

```tsx
import { useState } from "react";
import { useStreamCompletion } from "use-local-llm";

function PromptTester() {
  const [prompt, setPrompt] = useState("Write a poem about:");
  const { text, isStreaming, start } = useStreamCompletion({
    endpoint: "http://localhost:11434",
    model: "gemma3:1b",
    prompt,
  });

  return (
    <div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
      />
      <button onClick={start} disabled={isStreaming}>
        Generate
      </button>
      <pre>{text}</pre>
    </div>
  );
}
```

## Source

[`src/hooks/useStreamCompletion.ts`](https://github.com/pooyagolchian/use-local-llm/blob/main/src/hooks/useStreamCompletion.ts)
