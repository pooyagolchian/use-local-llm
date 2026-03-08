import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import CodeBlock from "@theme/CodeBlock";

const features = [
  {
    icon: "⚡",
    title: "Direct Browser → Localhost",
    description:
      "No server routes, no API layer. Your React app calls the local LLM directly via fetch + streaming.",
  },
  {
    icon: "🔌",
    title: "Multi-Backend",
    description:
      "Ollama, LM Studio, llama.cpp, and any OpenAI-compatible endpoint. Auto-detected by port.",
  },
  {
    icon: "💬",
    title: "Full Chat State",
    description:
      "Message history, system prompts, abort, clear — all managed inside the hook. No boilerplate.",
  },
  {
    icon: "🪶",
    title: "2.8 KB Gzipped",
    description:
      "Zero runtime dependencies. Only a peer dependency on React ≥17. Tree-shakeable ESM + CJS.",
  },
  {
    icon: "🔤",
    title: "Token-by-Token Streaming",
    description:
      "Real-time text rendering with onToken callbacks. Supports both SSE and NDJSON protocols.",
  },
  {
    icon: "🛡️",
    title: "TypeScript-First",
    description:
      "Written in strict TypeScript. Every option, return value, and callback is fully typed.",
  },
];

const quickStart = `import { useOllama } from "use-local-llm";

function Chat() {
  const { messages, send, isStreaming } = useOllama("gemma3:1b");

  return (
    <div>
      {messages.map((m, i) => (
        <p key={i}><b>{m.role}:</b> {m.content}</p>
      ))}
      <button onClick={() => send("Hello!")} disabled={isStreaming}>
        {isStreaming ? "Generating..." : "Send"}
      </button>
    </div>
  );
}`;

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title="Home" description={siteConfig.tagline}>
      <header className={clsx("hero hero--dark")}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>

          <div className="badges">
            <img
              alt="npm version"
              src="https://img.shields.io/npm/v/use-local-llm.svg"
            />
            <img
              alt="npm downloads"
              src="https://img.shields.io/npm/dm/use-local-llm.svg"
            />
            <img
              alt="bundle size"
              src="https://img.shields.io/bundlephobia/minzip/use-local-llm"
            />
            <img
              alt="TypeScript"
              src="https://img.shields.io/badge/TypeScript-strict-blue.svg"
            />
            <img
              alt="license"
              src="https://img.shields.io/npm/l/use-local-llm.svg"
            />
          </div>

          <div className="cta-buttons">
            <Link
              className="button button--primary button--lg"
              to="/docs/getting-started"
            >
              Get Started
            </Link>
            <Link
              className="button button--secondary button--lg"
              to="/docs/api/use-ollama"
            >
              API Reference
            </Link>
            <Link
              className="button button--outline button--lg"
              href="https://github.com/pooyagolchian/use-local-llm"
            >
              GitHub
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container" style={{ padding: "3rem 0" }}>
          <div className="feature-list">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <span style={{ fontSize: "2rem" }}>{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container" style={{ paddingBottom: "4rem" }}>
          <h2 style={{ textAlign: "center" }}>Quick Start</h2>
          <div className="quick-code">
            <CodeBlock language="tsx" title="App.tsx">
              {quickStart}
            </CodeBlock>
          </div>
          <p style={{ textAlign: "center", opacity: 0.7, marginTop: "1rem" }}>
            Install with <code>npm install use-local-llm</code> · Start Ollama ·
            Done.
          </p>
        </section>

        <section
          className="container"
          style={{ paddingBottom: "4rem", textAlign: "center" }}
        >
          <h2>Why not Vercel AI SDK?</h2>
          <p style={{ maxWidth: 650, margin: "0 auto", opacity: 0.8 }}>
            Vercel AI SDK requires Next.js API routes — it can't call{" "}
            <code>localhost:11434</code> from the browser.{" "}
            <strong>use-local-llm</strong> was built specifically for direct
            browser → localhost streaming with zero server configuration.
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            <Link
              className="button button--primary"
              to="/docs/introduction#comparison-with-vercel-ai-sdk"
            >
              See Full Comparison
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
