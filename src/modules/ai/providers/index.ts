import type { AiModuleOptions, LLMProvider } from "../types"
import { OpenAIProvider } from "./openai"
import { ClaudeProvider } from "./claude"
import { OllamaProvider } from "./ollama"

export { OpenAIProvider } from "./openai"
export { ClaudeProvider } from "./claude"
export { OllamaProvider } from "./ollama"

export function createProviders(options: AiModuleOptions): Map<string, LLMProvider> {
  const providers = new Map<string, LLMProvider>()

  if (options.providers.openai?.apiKey) {
    providers.set("openai", new OpenAIProvider(options.providers.openai))
  }
  if (options.providers.claude?.apiKey) {
    providers.set("claude", new ClaudeProvider(options.providers.claude))
  }
  if (options.providers.ollama?.baseUrl) {
    providers.set("ollama", new OllamaProvider(options.providers.ollama))
  }

  return providers
}
