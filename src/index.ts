// Hooks
export { useLocalLLM } from "./hooks/useLocalLLM";
export { useModelList } from "./hooks/useModelList";
export { useOllama } from "./hooks/useOllama";
export { useStreamCompletion } from "./hooks/useStreamCompletion";
// Types
export type {
  Backend,
  ChatMessage,
  EndpointConfig,
  LocalLLMOptions,
  LocalLLMResult,
  LocalModel,
  ModelListOptions,
  ModelListResult,
  OllamaOptions,
  StreamChunk,
  StreamCompletionOptions,
  StreamCompletionResult,
} from "./types";
// Utilities (advanced usage)
export {
  CHAT_PATHS,
  detectBackend,
  ENDPOINTS,
  GENERATE_PATHS,
  MODEL_LIST_PATHS,
} from "./utils/endpoints";
export { parseStreamChunk, streamChat, streamGenerate } from "./utils/streamParser";
