---
sidebar_position: 4
title: useModelList
---

# useModelList

Hook to discover available models on a local LLM runtime. Fetches the model list on mount and provides a `refresh` function.

## Signature

```ts
function useModelList(options?: ModelListOptions): ModelListResult;
```

## Parameters

### `options`

**Type:** `ModelListOptions` · **Optional**

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `endpoint` | `string` | `"http://localhost:11434"` | LLM server URL |
| `backend` | `Backend` | Auto-detected | Backend type |

## Return value

Returns a [`ModelListResult`](../internals/typescript-reference#modellistresult) object:

| Property | Type | Description |
| --- | --- | --- |
| `models` | `LocalModel[]` | Array of available models |
| `isLoading` | `boolean` | Whether the model list is loading |
| `error` | `Error \| null` | Any error that occurred |
| `refresh` | `() => void` | Re-fetch the model list |

### `LocalModel`

```ts
interface LocalModel {
  name: string;       // Model name (e.g. "gemma3:1b")
  size?: number;      // Size in bytes
  modifiedAt?: string; // Last modified timestamp
  digest?: string;    // Model digest hash
}
```

## Behavior

1. Fetches models **automatically on mount**
2. Handles both Ollama (`{ models: [...] }`) and OpenAI-compatible (`{ data: [...] }`) response formats
3. Call `refresh()` to re-fetch manually

## Examples

### Model selector

```tsx
import { useModelList } from "use-local-llm";

function ModelSelector({ onSelect }: { onSelect: (model: string) => void }) {
  const { models, isLoading, error, refresh } = useModelList();

  if (isLoading) return <p>Loading models...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <select onChange={(e) => onSelect(e.target.value)}>
        {models.map((m) => (
          <option key={m.name} value={m.name}>
            {m.name} {m.size ? `(${(m.size / 1e9).toFixed(1)} GB)` : ""}
          </option>
        ))}
      </select>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

### LM Studio models

```tsx
const { models } = useModelList({
  endpoint: "http://localhost:1234",
  backend: "lmstudio",
});
```

### Model dashboard

```tsx
import { useModelList } from "use-local-llm";

function ModelDashboard() {
  const { models, isLoading, refresh } = useModelList();

  return (
    <div>
      <h2>
        Available Models ({models.length})
        <button onClick={refresh} disabled={isLoading}>
          {isLoading ? "Loading..." : "↻ Refresh"}
        </button>
      </h2>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Size</th>
            <th>Modified</th>
          </tr>
        </thead>
        <tbody>
          {models.map((m) => (
            <tr key={m.name}>
              <td><code>{m.name}</code></td>
              <td>{m.size ? `${(m.size / 1e9).toFixed(1)} GB` : "—"}</td>
              <td>{m.modifiedAt ? new Date(m.modifiedAt).toLocaleDateString() : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## API paths by backend

| Backend | Endpoint |
| --- | --- |
| Ollama | `GET /api/tags` |
| LM Studio | `GET /v1/models` |
| llama.cpp | `GET /v1/models` |
| OpenAI-compatible | `GET /v1/models` |

## Source

[`src/hooks/useModelList.ts`](https://github.com/pooyagolchian/use-local-llm/blob/main/src/hooks/useModelList.ts)
