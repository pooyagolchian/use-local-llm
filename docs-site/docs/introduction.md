---
slug: introduction
sidebar_position: 1
title: Introduction
---

# use-local-llm

React hooks for streaming responses from local LLMs — **Ollama**, **LM Studio**, **llama.cpp**, and any OpenAI-compatible endpoint. Zero server required. Browser → localhost, directly.

## The Problem

[Vercel AI SDK](https://sdk.vercel.ai) is the standard for AI in React — but it **requires server routes**. Its React hooks (`useChat`, `useCompletion`) POST to your API routes, which then call the LLM. This architecture makes it impossible to call `http://localhost:11434` directly from the browser.

If you're prototyping with **Ollama**, **LM Studio**, or **llama.cpp**, you don't need a server in between. You need one hook that talks directly to your local model.

## The Solution

**use-local-llm** gives you:

- **Direct browser → localhost** streaming — no server, no API routes
- **Multi-backend support** — Ollama, LM Studio, llama.cpp, any OpenAI-compatible endpoint
- **Full chat state management** — message history, abort, clear, error handling
- **Token-by-token streaming** — real-time text rendering with `onToken` callbacks
- **Zero runtime dependencies** — only a peer dependency on React
- **2.8 KB gzipped** — smaller than most icons

## Comparison with Vercel AI SDK

| Feature | **use-local-llm** | **Vercel AI SDK** |
| --- | --- | --- |
| Browser → localhost | ✅ Direct | ❌ Needs API routes |
| Server required | ❌ None | ✅ Next.js/Express |
| Ollama support | ✅ Native | ⚠️ Via server proxy |
| LM Studio support | ✅ Native | ⚠️ Via server proxy |
| llama.cpp support | ✅ Native | ⚠️ Via server proxy |
| Bundle size | **2.8 KB** gzipped | ~45 KB gzipped |
| Runtime dependencies | **0** | Multiple |
| Streaming protocols | SSE + NDJSON | SSE only |
| TypeScript | Strict | Strict |
| React version | ≥17 | ≥18 |

## When to Use

Use **use-local-llm** when you:

- Are building prototypes or tools that talk to a local LLM
- Want to skip setting up API routes just to proxy localhost
- Need a lightweight, zero-dependency solution
- Want to support multiple backends (Ollama, LM Studio, llama.cpp)

Use **Vercel AI SDK** when you:

- Need cloud LLM providers (OpenAI, Anthropic, etc.)
- Have a full Next.js app with API routes already
- Need features like RAG, tool calling, or structured output
