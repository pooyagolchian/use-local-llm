---
sidebar_position: 2
title: Backends
---

# Supported Backends

`use-local-llm` supports four backend types, each with its own API format. The backend is auto-detected from the endpoint URL port, or can be set explicitly.

## Ollama

[Ollama](https://ollama.com) is the easiest way to run local LLMs on macOS, Linux, and Windows.

| | |
| --- | --- |
| **Default port** | `11434` |
| **Chat API** | `POST /api/chat` (NDJSON) |
| **Generate API** | `POST /api/generate` (NDJSON) |
| **Models API** | `GET /api/tags` |

```bash
# Install
brew install ollama   # macOS
curl -fsSL https://ollama.com/install.sh | sh  # Linux

# Pull a model
ollama pull gemma3:1b
ollama pull llama3.2
ollama pull mistral

# Start (if not running as a service)
ollama serve
```

```tsx
import { useOllama } from "use-local-llm";

// Zero-config — defaults to localhost:11434
const { messages, send } = useOllama("gemma3:1b");
```

### Tested models

| Model | Parameters | Size | Status |
| --- | --- | --- | --- |
| `gemma3:1b` | 1B | 815 MB | ✅ Tested |
| `llama3.1:8b` | 8B | 4.9 GB | ✅ Tested |
| `llama3.2` | 3B | 2.0 GB | ✅ Tested |
| `mistral` | 7B | 4.1 GB | ✅ Tested |
| `deepseek-r1` | 8B | 5.2 GB | ✅ Tested |
| `qwen2.5-coder:32b` | 32B | 19.8 GB | ✅ Tested |

## LM Studio

[LM Studio](https://lmstudio.ai) provides a GUI for managing and running local models with an OpenAI-compatible API.

| | |
| --- | --- |
| **Default port** | `1234` |
| **Chat API** | `POST /v1/chat/completions` (SSE) |
| **Generate API** | `POST /v1/completions` (SSE) |
| **Models API** | `GET /v1/models` |

1. Download and install LM Studio
2. Download a model from the Discover tab
3. Go to **Developer** tab → Start server
4. CORS is enabled by default

```tsx
import { useLocalLLM } from "use-local-llm";

const { messages, send } = useLocalLLM({
  endpoint: "http://localhost:1234",
  model: "lmstudio-community/Meta-Llama-3-8B-Instruct-GGUF",
});
```

## llama.cpp

[llama.cpp](https://github.com/ggml-org/llama.cpp) is a C++ inference engine with an OpenAI-compatible HTTP server.

| | |
| --- | --- |
| **Default port** | `8080` |
| **Chat API** | `POST /v1/chat/completions` (SSE) |
| **Generate API** | `POST /v1/completions` (SSE) |
| **Models API** | `GET /v1/models` |

```bash
# Build
git clone https://github.com/ggml-org/llama.cpp
cd llama.cpp && make

# Start server with CORS
./llama-server \
  -m models/your-model.gguf \
  --host 0.0.0.0 \
  --port 8080 \
  --cors "*"
```

```tsx
import { useLocalLLM } from "use-local-llm";

const { messages, send } = useLocalLLM({
  endpoint: "http://localhost:8080",
  model: "default",
});
```

## OpenAI-Compatible

Any server implementing the [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat) works as a fallback.

```tsx
import { useLocalLLM } from "use-local-llm";

const { messages, send } = useLocalLLM({
  endpoint: "http://localhost:5000",
  backend: "openai-compatible", // explicit since port isn't recognized
  model: "my-model",
});
```

## Auto-Detection

The backend is auto-detected from the URL port:

| Port | Backend |
| --- | --- |
| `11434` | `ollama` |
| `1234` | `lmstudio` |
| `8080` | `llamacpp` |
| Other | `openai-compatible` |

You can always override with the `backend` option:

```tsx
const { messages, send } = useLocalLLM({
  endpoint: "http://my-server:9000",
  backend: "ollama", // force Ollama API format
  model: "gemma3:1b",
});
```
