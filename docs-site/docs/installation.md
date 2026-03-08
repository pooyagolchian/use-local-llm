---
sidebar_position: 3
title: Installation
---

# Installation

## Package managers

```bash npm2yarn
npm install use-local-llm
```

## Peer dependencies

`use-local-llm` requires **React ≥17** as a peer dependency. If you're using a modern React project (Create React App, Next.js, Vite), React is already installed.

## What's included

The package ships:

| Format | File | Description |
| --- | --- | --- |
| ESM | `dist/index.mjs` | Modern ES modules (tree-shakeable) |
| CJS | `dist/index.cjs` | CommonJS for Node.js / older bundlers |
| Types | `dist/index.d.ts` | Full TypeScript declarations |

**Bundle size:** ~2.8 KB gzipped, zero runtime dependencies.

## TypeScript

Full TypeScript support out of the box. No `@types/` package needed — types are included.

```tsx
import type {
  Backend,
  ChatMessage,
  LocalLLMOptions,
  LocalLLMResult,
  StreamCompletionOptions,
} from "use-local-llm";
```

## CDN (UMD)

For quick prototyping, you can use a CDN (not recommended for production):

```html
<script src="https://unpkg.com/use-local-llm/dist/index.cjs"></script>
```

## Verify installation

```tsx
import { useOllama } from "use-local-llm";

// If this compiles, you're good ✓
console.log(typeof useOllama); // "function"
```
