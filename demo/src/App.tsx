import { useState, useRef, useEffect, useCallback, type FormEvent } from "react";
import {
  useOllama,
  useStreamCompletion,
  useModelList,
} from "use-local-llm";

type Tab = "chat" | "completion" | "models" | "code";

export default function App() {
  const [tab, setTab] = useState<Tab>("chat");
  const [endpoint, setEndpoint] = useState("http://localhost:11434");
  const [model, setModel] = useState("gemma3:1b");

  return (
    <div className="app">
      <header className="header">
        <h1>use-local-llm</h1>
        <p>React hooks for streaming local LLM responses</p>
        <div className="badges">
          <span className="badge">Zero dependencies</span>
          <span className="badge">~2.8 KB gzipped</span>
          <span className="badge">SSE + NDJSON</span>
        </div>
      </header>

      <div className="card">
        <div className="config-row">
          <label>
            Endpoint
            <input
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="http://localhost:11434"
            />
          </label>
          <label>
            Model
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gemma3:1b"
            />
          </label>
        </div>
      </div>

      <nav className="tabs">
        {(["chat", "completion", "models", "code"] as Tab[]).map((t) => (
          <button
            key={t}
            className={`tab ${tab === t ? "tab--active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "chat"
              ? "💬 Chat"
              : t === "completion"
                ? "✏️ Completion"
                : t === "models"
                  ? "📦 Models"
                  : "🧑‍💻 Code"}
          </button>
        ))}
      </nav>

      {tab === "chat" && <ChatTab endpoint={endpoint} model={model} />}
      {tab === "completion" && (
        <CompletionTab endpoint={endpoint} model={model} />
      )}
      {tab === "models" && <ModelsTab endpoint={endpoint} />}
      {tab === "code" && <CodeTab />}

      <footer className="footer">
        <a
          href="https://github.com/pooyagolchian/use-local-llm"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        {" · "}
        <a
          href="https://www.npmjs.com/package/use-local-llm"
          target="_blank"
          rel="noopener noreferrer"
        >
          npm
        </a>
        {" · "}
        MIT License
      </footer>
    </div>
  );
}

/* ── Chat Tab ─────────────────────────────────────── */

function ChatTab({
  endpoint,
  model,
}: {
  endpoint: string;
  model: string;
}) {
  const { messages, send, isStreaming, abort, error, clear } = useOllama(model, {
    endpoint,
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isStreaming) return;
      setInput("");
      send(trimmed);
    },
    [input, isStreaming, send],
  );

  return (
    <div className="card">
      <h2>Chat</h2>
      {error && <div className="error-banner">{error.message}</div>}
      <div className="chat-messages" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`msg msg--${m.role}`}>
            {m.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chat-input-row">
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          disabled={isStreaming}
        />
        {isStreaming ? (
          <button type="button" className="btn btn--danger" onClick={abort}>
            Stop
          </button>
        ) : (
          <button type="submit" className="btn btn--primary" disabled={!input.trim()}>
            Send
          </button>
        )}
      </form>
      {messages.length > 0 && (
        <div className="btn-row" style={{ marginTop: "0.75rem" }}>
          <button
            className="btn btn--ghost"
            onClick={clear}
            disabled={isStreaming}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Completion Tab ───────────────────────────────── */

function CompletionTab({
  endpoint,
  model,
}: {
  endpoint: string;
  model: string;
}) {
  const [prompt, setPrompt] = useState("Write a haiku about programming:");
  const { text, isStreaming, start, abort, error } = useStreamCompletion({
    endpoint,
    model,
  });

  const handleStart = useCallback(() => {
    if (!prompt.trim()) return;
    start(prompt);
  }, [prompt, start]);

  return (
    <div className="card">
      <h2>Text Completion</h2>
      {error && <div className="error-banner">{error.message}</div>}
      <div className="config-row">
        <label style={{ flex: 1 }}>
          Prompt
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt…"
          />
        </label>
      </div>
      <div className="completion-output">{text}</div>
      <div className="btn-row">
        {isStreaming ? (
          <button className="btn btn--danger" onClick={abort}>
            Stop
          </button>
        ) : (
          <button
            className="btn btn--primary"
            onClick={handleStart}
            disabled={!prompt.trim()}
          >
            Generate
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Models Tab ───────────────────────────────────── */

function ModelsTab({ endpoint }: { endpoint: string }) {
  const { models, isLoading, error } = useModelList({ endpoint });

  return (
    <div className="card">
      <h2>Available Models</h2>
      {error && <div className="error-banner">{error.message}</div>}
      {isLoading && (
        <p style={{ color: "var(--text-muted)" }}>
          <span className="spinner" />
          Loading models…
        </p>
      )}
      {!isLoading && models.length === 0 && !error && (
        <p style={{ color: "var(--text-muted)" }}>
          No models found. Is your LLM server running?
        </p>
      )}
      <div className="model-grid">
        {models.map((m) => (
          <div key={m.name} className="model-card">
            <strong>{m.name}</strong>
            {m.size && (
              <span>{(m.size / 1e9).toFixed(1)} GB</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Code Tab ─────────────────────────────────────── */

function CodeTab() {
  return (
    <div className="card">
      <h2>Quick Start</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "1rem", fontSize: "0.9rem" }}>
        Install the package and start streaming in minutes.
      </p>
      <pre className="code-block">
{`npm install use-local-llm`}
      </pre>
      <h2 style={{ marginTop: "1.5rem" }}>Chat Hook</h2>
      <pre className="code-block">
{`import { useOllama } from "use-local-llm";

function Chat() {
  const { messages, send, isStreaming, abort } = useOllama("gemma3:1b");

  return (
    <div>
      {messages.map((m, i) => (
        <p key={i}><b>{m.role}:</b> {m.content}</p>
      ))}
      <button onClick={() => send("Hello!")}>Send</button>
      {isStreaming && <button onClick={abort}>Stop</button>}
    </div>
  );
}`}
      </pre>
      <h2 style={{ marginTop: "1.5rem" }}>Stream Completion</h2>
      <pre className="code-block">
{`import { useStreamCompletion } from "use-local-llm";

function Writer() {
  const { text, start, isStreaming } = useStreamCompletion({
    endpoint: "http://localhost:11434",
    model: "gemma3:1b",
  });

  return (
    <div>
      <button onClick={() => start("Write a poem:")}>Go</button>
      <pre>{text}</pre>
    </div>
  );
}`}
      </pre>
      <h2 style={{ marginTop: "1.5rem" }}>Model Discovery</h2>
      <pre className="code-block">
{`import { useModelList } from "use-local-llm";

function Models() {
  const { models, isLoading } = useModelList({
    endpoint: "http://localhost:11434",
  });

  if (isLoading) return <p>Loading…</p>;
  return <ul>{models.map(m => <li key={m.name}>{m.name}</li>)}</ul>;
}`}
      </pre>
    </div>
  );
}
