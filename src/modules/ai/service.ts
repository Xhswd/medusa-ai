import { MedusaService } from "@medusajs/framework/utils"
import AiGeneratedContent from "./models/ai-generated-content"
import ProductEmbedding from "./models/product-embedding"
import PricingSuggestion from "./models/pricing-suggestion"
import AiChatMessage from "./models/ai-chat-message"
import type { AiModuleOptions, LLMProvider } from "./types"
import { createProviders } from "./providers"

class AiModuleService extends MedusaService({
  AiGeneratedContent,
  ProductEmbedding,
  PricingSuggestion,
  AiChatMessage,
}) {
  private providers: Map<string, LLMProvider>
  private defaultProvider: string

  constructor(_deps: Record<string, unknown>, options: AiModuleOptions) {
    super(_deps, options)
    this.providers = createProviders(options)
    this.defaultProvider = options.defaultProvider || "openai"
  }

  getProvider(name?: string): LLMProvider | null {
    const id = name || this.defaultProvider
    return this.providers.get(id) || null
  }

  listAvailableProviders(): string[] {
    return Array.from(this.providers.keys())
  }
}

export default AiModuleService
