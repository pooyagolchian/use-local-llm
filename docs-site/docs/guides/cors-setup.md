---
sidebar_position: 1
title: CORS Setup
---

# CORS Configuration

When your React app runs at `http://localhost:5173` (Vite) or `http://localhost:3000` (CRA/Next.js), browsers block requests to `http://localhost:11434` due to cross-origin restrictions (CORS).

## Option 1: Set OLLAMA_ORIGINS (Recommended)

Tell Ollama to allow cross-origin requests by setting the `OLLAMA_ORIGINS` environment variable.

### macOS

```bash
# Temporary (current session)
OLLAMA_ORIGINS="*" ollama serve

# Permanent
launchctl setenv OLLAMA_ORIGINS "*"
# Then restart Ollama
```

### Linux (systemd)

```bash
sudo systemctl edit ollama
```

Add under `[Service]`:

```ini
[Service]
Environment="OLLAMA_ORIGINS=*"
```

Then restart:

```bash
sudo systemctl restart ollama
```

### Windows

```powershell
# Set environment variable
[System.Environment]::SetEnvironmentVariable("OLLAMA_ORIGINS", "*", "User")
# Restart Ollama
```

### Docker

```bash
docker run -d \
  -e OLLAMA_ORIGINS="*" \
  -p 11434:11434 \
  ollama/ollama
```

## Option 2: Vite Proxy (Development only)

If you're using Vite, add a proxy to `vite.config.ts`:

```ts title="vite.config.ts"
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/ollama": {
        target: "http://localhost:11434",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama/, ""),
      },
    },
  },
});
```

Then use `/ollama` as the endpoint:

```tsx
const { messages, send } = useOllama("gemma3:1b", {
  endpoint: "/ollama",
});
```

## Option 3: Next.js Rewrites

```js title="next.config.js"
module.exports = {
  async rewrites() {
    return [
      {
        source: "/ollama/:path*",
        destination: "http://localhost:11434/:path*",
      },
    ];
  },
};
```

## LM Studio

LM Studio enables CORS by default. No configuration needed.

## llama.cpp

Start the server with CORS enabled:

```bash
./llama-server -m model.gguf --host 0.0.0.0 --port 8080 --cors "*"
```

## Verifying CORS

Check if CORS is configured correctly:

```bash
curl -I -X OPTIONS http://localhost:11434/api/chat \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST"
```

Look for `Access-Control-Allow-Origin` in the response headers.
