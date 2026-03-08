---
sidebar_position: 2
title: Getting Started
---

# Getting Started

Get up and running with `use-local-llm` in under 2 minutes.

## Prerequisites

You need a local LLM server running. The easiest option is [Ollama](https://ollama.com):

```bash
# Install Ollama (macOS)
brew install ollama

# Pull a model
ollama pull gemma3:1b

# Start the server (if not running)
ollama serve
```

Verify it's running:

```bash
curl http://localhost:11434/api/tags
```

## Install the package

```bash
npm install use-local-llm
```

## Your first component

```tsx title="Chat.tsx"
import { useOllama } from "use-local-llm";

export default function Chat() {
  const { messages, send, isStreaming, abort } = useOllama("gemma3:1b");

  return (
    <div>
      <h2>Chat with Gemma</h2>

      {messages.map((m, i) => (
        <div key={i} style={{ margin: "0.5rem 0" }}>
          <strong>{m.role}:</strong> {m.content}
        </div>
      ))}

      <button
        onClick={() => send("Explain React hooks in one sentence")}
        disabled={isStreaming}
      >
        {isStreaming ? "Generating..." : "Ask"}
      </button>

      {isStreaming && (
        <button onClick={abort} style={{ marginLeft: "0.5rem" }}>
          Stop
        </button>
      )}
    </div>
  );
}
```

**That's it.** The hook handles:
- Sending the user message
- Streaming tokens from Ollama
- Updating message history
- Abort/cancel support
- Error handling

## Using a different backend

```tsx
import { useLocalLLM } from "use-local-llm";

// LM Studio
const chat = useLocalLLM({
  endpoint: "http://localhost:1234",
  model: "my-model",
});

// llama.cpp
const chat = useLocalLLM({
  endpoint: "http://localhost:8080",
  model: "my-model",
});
```

The backend is auto-detected from the port:

| Port | Backend |
| --- | --- |
| `11434` | Ollama |
| `1234` | LM Studio |
| `8080` | llama.cpp |
| Other | OpenAI-compatible |

## Next steps

- [**API Reference**](/docs/api/use-ollama) — Full documentation for all hooks
- [**Examples**](/docs/guides/examples) — Common patterns and recipes
- [**CORS Setup**](/docs/guides/cors-setup) — Fix browser CORS issues
- [**Backends**](/docs/guides/backends) — Detailed backend configuration
