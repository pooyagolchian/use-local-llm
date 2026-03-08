/** Supported local LLM backend types */
export type Backend = "ollama" | "lmstudio" | "llamacpp" | "openai-compatible";

/** A single message in a chat conversation */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** Streaming chunk from a local LLM endpoint */
export interface StreamChunk {
  content: string;
  done: boolean;
  model?: string;
}

/** Configuration for a local LLM endpoint */
export interface EndpointConfig {
  /** Full base URL, e.g. "http://localhost:11434" */
  url: string;
  /** Backend type — determines API path and response parsing */
  backend: Backend;
}

/** Options for useStreamCompletion */
export interface StreamCompletionOptions {
  /** Endpoint URL (e.g. "http://localhost:11434") */
  endpoint: string;
  /** Backend type. Defaults to auto-detection based on URL port. */
  backend?: Backend;
  /** Model name (e.g. "llama3.2", "mistral") */
  model: string;
  /** The prompt to send */
  prompt: string;
  /** Whether to fetch automatically when prompt changes. Default: false */
  autoFetch?: boolean;
  /** Temperature for generation. Default: model default */
  temperature?: number;
  /** Called on each token received */
  onToken?: (token: string) => void;
  /** Called when streaming completes */
  onComplete?: (fullText: string) => void;
  /** Called on error */
  onError?: (error: Error) => void;
}

/** Return value from useStreamCompletion */
export interface StreamCompletionResult {
  /** Accumulated full text so far */
  text: string;
  /** Array of individual tokens received */
  tokens: string[];
  /** Whether the stream is currently active */
  isStreaming: boolean;
  /** Start or restart the stream */
  start: () => void;
  /** Abort the current stream */
  abort: () => void;
  /** Any error that occurred */
  error: Error | null;
}

/** Options for useLocalLLM */
export interface LocalLLMOptions {
  /** Endpoint URL (e.g. "http://localhost:11434") */
  endpoint: string;
  /** Backend type. Defaults to auto-detection based on URL port. */
  backend?: Backend;
  /** Model name */
  model: string;
  /** System prompt */
  system?: string;
  /** Temperature for generation */
  temperature?: number;
  /** Called on each token received */
  onToken?: (token: string) => void;
  /** Called when a complete response is received */
  onResponse?: (message: ChatMessage) => void;
  /** Called on error */
  onError?: (error: Error) => void;
}

/** Return value from useLocalLLM */
export interface LocalLLMResult {
  /** Full conversation message history */
  messages: ChatMessage[];
  /** Send a user message and get a streaming response */
  send: (content: string) => void;
  /** Whether the model is currently generating */
  isStreaming: boolean;
  /** Whether a request is in-flight (includes initial connection) */
  isLoading: boolean;
  /** Abort the current generation */
  abort: () => void;
  /** Any error that occurred */
  error: Error | null;
  /** Clear conversation history */
  clear: () => void;
}

/** A model descriptor returned from the local runtime */
export interface LocalModel {
  name: string;
  size?: number;
  modifiedAt?: string;
  digest?: string;
}

/** Options for useModelList */
export interface ModelListOptions {
  /** Endpoint URL. Defaults to Ollama localhost. */
  endpoint?: string;
  /** Backend type. Defaults to auto-detection. */
  backend?: Backend;
}

/** Return value from useModelList */
export interface ModelListResult {
  /** Available models */
  models: LocalModel[];
  /** Whether the model list is loading */
  isLoading: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** Re-fetch the model list */
  refresh: () => void;
}

/** Options for useOllama (simplified) */
export interface OllamaOptions {
  /** System prompt */
  system?: string;
  /** Temperature for generation */
  temperature?: number;
  /** Ollama endpoint. Defaults to "http://localhost:11434" */
  endpoint?: string;
  /** Called on each token */
  onToken?: (token: string) => void;
  /** Called on complete response */
  onResponse?: (message: ChatMessage) => void;
  /** Called on error */
  onError?: (error: Error) => void;
}
