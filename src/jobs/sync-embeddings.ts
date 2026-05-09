import type { MedusaContainer } from "@medusajs/framework"
import { syncEmbeddingsWorkflow } from "../workflows/ai/sync-embeddings.js"
import { AI_MODULE } from "../modules/ai/index.js"
import type AiModuleService from "../modules/ai/service.js"

export default async function syncEmbeddingsJob(container: MedusaContainer) {
  const aiService = container.resolve(AI_MODULE) as AiModuleService
  const provider = aiService.getProvider()
  if (!provider) {
    console.log("[AI] No provider configured, skipping embedding sync.")
    return
  }

  try {
    const { result } = await syncEmbeddingsWorkflow(container).run({
      input: {},
    })
    console.log(`[AI] Synced embeddings for ${result.count} products.`)
  } catch (err) {
    console.error("[AI] Embedding sync failed:", err)
  }
}

export const config = {
  name: "ai-sync-embeddings",
  schedule: "0 3 * * *",
}
