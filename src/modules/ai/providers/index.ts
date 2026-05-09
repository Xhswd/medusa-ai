import type { AiModuleOptions, LLMProvider } from "../types.js"
import { OpenAIProvider } from "./openai.js"
import { ClaudeProvider } from "./claude.js"
import { OllamaProvider } from "./ollama.js"

export { OpenAIProvider } from "./openai.js"
export { ClaudeProvider } from "./claude.js"
export { OllamaProvider } from "./ollama.js"

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
