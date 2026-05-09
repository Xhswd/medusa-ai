import type { AiModuleOptions, LLMProvider } from "../types"
import { OpenAIProvider } from "./openai"
import { ClaudeProvider } from "./claude"
import { OllamaProvider } from "./ollama"

export { OpenAIProvider } from "./openai"
export { ClaudeProvider } from "./claude"
export { OllamaProvider } from "./ollama"

export function createProviders(options: AiModuleOptions): Map<string, LLMProvider> {
  const providers = new Map<string, LLMProvider>()
  const llmProviders = options.llmProviders

  if (llmProviders.openai?.apiKey) {
    providers.set("openai", new OpenAIProvider(llmProviders.openai))
  }
  if (llmProviders.claude?.apiKey) {
    providers.set("claude", new ClaudeProvider(llmProviders.claude))
  }
  if (llmProviders.ollama?.baseUrl) {
    providers.set("ollama", new OllamaProvider(llmProviders.ollama))
  }

  return providers
}
