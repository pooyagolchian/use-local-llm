---
sidebar_position: 3
title: Examples
---

# Examples

Real-world patterns for using `use-local-llm` in your React applications.

## Chat Interface with Input

A complete chat UI with a text input, send button, and streaming responses.

```tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { useOllama } from "use-local-llm";

function ChatApp() {
  const { messages, send, isStreaming, abort, error, clear } =
    useOllama("gemma3:1b");
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isStreaming) return;
      send(input);
      setInput("");
    },
    [input, isStreaming, send]
  );

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      {error && (
        <div style={{ color: "red", padding: "0.5rem" }}>
          {error.message}
        </div>
      )}

      <div style={{ height: 400, overflowY: "auto", padding: "1rem" }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              textAlign: m.role === "user" ? "right" : "left",
              margin: "0.5rem 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "0.5rem 1rem",
                borderRadius: "1rem",
                background: m.role === "user" ? "#6366f1" : "#1a1a2e",
                color: "#fff",
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isStreaming}
          style={{ flex: 1, padding: "0.5rem" }}
        />
        {isStreaming ? (
          <button type="button" onClick={abort}>Stop</button>
        ) : (
          <button type="submit" disabled={!input.trim()}>Send</button>
        )}
        <button type="button" onClick={clear}>Clear</button>
      </form>
    </div>
  );
}
```

## Dynamic Model Selector

Let users pick from available models before chatting.

```tsx
import { useState } from "react";
import { useOllama, useModelList } from "use-local-llm";

function SmartChat() {
  const { models, isLoading } = useModelList();
  const [selectedModel, setSelectedModel] = useState("gemma3:1b");
  const { messages, send, isStreaming } = useOllama(selectedModel);

  return (
    <div>
      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        disabled={isStreaming || isLoading}
      >
        {models.map((m) => (
          <option key={m.name} value={m.name}>
            {m.name}
          </option>
        ))}
      </select>

      {messages.map((m, i) => (
        <p key={i}>
          <b>{m.role}:</b> {m.content}
        </p>
      ))}

      <button
        onClick={() => send("Hello!")}
        disabled={isStreaming}
      >
        Send
      </button>
    </div>
  );
}
```

## Multi-Turn with System Prompt

Build a specialized assistant with a system prompt.

```tsx
import { useOllama } from "use-local-llm";

function CodeReviewer() {
  const { messages, send, isStreaming } = useOllama("gemma3:1b", {
    system: `You are an expert code reviewer. When given code:
1. Identify bugs and issues
2. Suggest improvements
3. Rate the code quality (1-10)
Always be constructive and explain your reasoning.`,
    temperature: 0.3,
  });

  return (
    <div>
      <button
        onClick={() =>
          send(`Review this code:
\`\`\`js
function add(a, b) {
  return a + b;
}
\`\`\``)
        }
        disabled={isStreaming}
      >
        Review Code
      </button>

      {messages.map((m, i) => (
        <pre key={i}>{m.content}</pre>
      ))}
    </div>
  );
}
```

## Token Counter

Track token count during streaming.

```tsx
import { useState } from "react";
import { useStreamCompletion } from "use-local-llm";

function TokenCounter() {
  const [tokenCount, setTokenCount] = useState(0);

  const { text, isStreaming, start } = useStreamCompletion({
    endpoint: "http://localhost:11434",
    model: "gemma3:1b",
    prompt: "Write a short story about a robot:",
    onToken: () => setTokenCount((c) => c + 1),
    onComplete: (fullText) => {
      console.log(`Generated ${tokenCount} tokens, ${fullText.length} chars`);
    },
  });

  return (
    <div>
      <button onClick={start} disabled={isStreaming}>
        Generate
      </button>
      <p>Tokens: {tokenCount}</p>
      <pre>{text}</pre>
    </div>
  );
}
```

## Streaming Code Generator

Build an AI code generator with syntax highlighting.

```tsx
import { useState } from "react";
import { useStreamCompletion } from "use-local-llm";

function CodeGenerator() {
  const [language, setLanguage] = useState("TypeScript");
  const [description, setDescription] = useState("");

  const { text, isStreaming, start, abort } = useStreamCompletion({
    endpoint: "http://localhost:11434",
    model: "qwen2.5-coder:32b",
    prompt: `Write ${language} code for: ${description}\n\nCode:`,
    temperature: 0.2,
  });

  return (
    <div>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option>TypeScript</option>
        <option>Python</option>
        <option>Rust</option>
        <option>Go</option>
      </select>

      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe what you need..."
      />

      {isStreaming ? (
        <button onClick={abort}>Stop</button>
      ) : (
        <button onClick={start} disabled={!description}>
          Generate
        </button>
      )}

      <pre>
        <code>{text}</code>
      </pre>
    </div>
  );
}
```

## Error Handling with Retry

Gracefully handle network errors and allow retrying.

```tsx
import { useCallback, useRef } from "react";
import { useOllama } from "use-local-llm";

function ResilientChat() {
  const lastMessageRef = useRef("");

  const { messages, send, isStreaming, error } = useOllama("gemma3:1b", {
    onError: (err) => {
      console.error("Chat error:", err.message);
    },
  });

  const handleSend = useCallback(
    (content: string) => {
      lastMessageRef.current = content;
      send(content);
    },
    [send]
  );

  const retry = useCallback(() => {
    if (lastMessageRef.current) {
      send(lastMessageRef.current);
    }
  }, [send]);

  return (
    <div>
      {error && (
        <div>
          <p>Error: {error.message}</p>
          <button onClick={retry}>Retry</button>
        </div>
      )}

      {messages.map((m, i) => (
        <p key={i}>
          <b>{m.role}:</b> {m.content}
        </p>
      ))}

      <button onClick={() => handleSend("Hello!")} disabled={isStreaming}>
        Send
      </button>
    </div>
  );
}
```
