import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { AI_MODULE } from "../../../../modules/ai/index.ts"
import type AiModuleService from "../../../../modules/ai/service.ts"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const aiService = req.scope.resolve(AI_MODULE) as AiModuleService
  const providers = aiService.listAvailableProviders()

  const providerStatus: Record<string, boolean> = {}
  for (const name of ["openai", "claude", "ollama"]) {
    const provider = aiService.getProvider(name)
    providerStatus[name] = provider ? await provider.isAvailable() : false
  }

  res.json({
    available_providers: providers,
    provider_status: providerStatus,
    default_provider: (aiService as unknown as { defaultProvider: string }).defaultProvider,
  })
}
