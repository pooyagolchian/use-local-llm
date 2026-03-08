# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-08

### Added

- `useOllama` — zero-config chat hook for Ollama
- `useLocalLLM` — full-featured chat hook supporting Ollama, LM Studio, llama.cpp, and any OpenAI-compatible endpoint
- `useStreamCompletion` — low-level streaming text completion hook
- `useModelList` — discover available models on local runtimes
- `streamChat` / `streamGenerate` — async generator utilities for non-React usage
- Auto-detection of backend type from endpoint port
- Full TypeScript support with strict types
- AbortController integration for cancelling in-flight requests
- Zero runtime dependencies (React peer dep only)
- 2.8 KB gzipped bundle size
