import type { AiModuleOptions, LLMProvider } from "../types.ts"
import { OpenAIProvider } from "./openai.ts"
import { ClaudeProvider } from "./claude.ts"
import { OllamaProvider } from "./ollama.ts"

export { OpenAIProvider } from "./openai.ts"
export { ClaudeProvider } from "./claude.ts"
export { OllamaProvider } from "./ollama.ts"

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
