---
sidebar_position: 3
title: Endpoints
---

# Endpoints

The endpoints module (`src/utils/endpoints.ts`) provides backend presets, API path mappings, and auto-detection logic.

## ENDPOINTS

Default endpoint configurations for supported backends.

```ts
import { ENDPOINTS } from "use-local-llm";

ENDPOINTS.ollama;
// → { url: "http://localhost:11434", backend: "ollama" }

ENDPOINTS.lmstudio;
// → { url: "http://localhost:1234", backend: "lmstudio" }

ENDPOINTS.llamacpp;
// → { url: "http://localhost:8080", backend: "llamacpp" }
```

## CHAT_PATHS

API paths for chat completions, mapped by backend.

```ts
import { CHAT_PATHS } from "use-local-llm";

CHAT_PATHS.ollama;              // "/api/chat"
CHAT_PATHS.lmstudio;            // "/v1/chat/completions"
CHAT_PATHS.llamacpp;            // "/v1/chat/completions"
CHAT_PATHS["openai-compatible"]; // "/v1/chat/completions"
```

## GENERATE_PATHS

API paths for text generation (non-chat), mapped by backend.

```ts
import { GENERATE_PATHS } from "use-local-llm";

GENERATE_PATHS.ollama;              // "/api/generate"
GENERATE_PATHS.lmstudio;            // "/v1/completions"
GENERATE_PATHS.llamacpp;            // "/v1/completions"
GENERATE_PATHS["openai-compatible"]; // "/v1/completions"
```

## MODEL_LIST_PATHS

API paths for listing available models, mapped by backend.

```ts
import { MODEL_LIST_PATHS } from "use-local-llm";

MODEL_LIST_PATHS.ollama;              // "/api/tags"
MODEL_LIST_PATHS.lmstudio;            // "/v1/models"
MODEL_LIST_PATHS.llamacpp;            // "/v1/models"
MODEL_LIST_PATHS["openai-compatible"]; // "/v1/models"
```

## detectBackend

Auto-detects the backend type from a URL based on the port number.

```ts
import { detectBackend } from "use-local-llm";

detectBackend("http://localhost:11434");     // "ollama"
detectBackend("http://localhost:1234");      // "lmstudio"
detectBackend("http://localhost:8080");      // "llamacpp"
detectBackend("http://localhost:3000");      // "openai-compatible"
detectBackend("http://my-server.com:5000");  // "openai-compatible"
detectBackend("invalid-url");               // "openai-compatible"
```

### Port mapping

| Port | Backend |
| --- | --- |
| `11434` | `ollama` |
| `1234` | `lmstudio` |
| `8080` | `llamacpp` |
| Any other | `openai-compatible` |

## Full API path reference

| Backend | Chat | Generate | Models |
| --- | --- | --- | --- |
| **Ollama** | `POST /api/chat` | `POST /api/generate` | `GET /api/tags` |
| **LM Studio** | `POST /v1/chat/completions` | `POST /v1/completions` | `GET /v1/models` |
| **llama.cpp** | `POST /v1/chat/completions` | `POST /v1/completions` | `GET /v1/models` |
| **OpenAI-compatible** | `POST /v1/chat/completions` | `POST /v1/completions` | `GET /v1/models` |
