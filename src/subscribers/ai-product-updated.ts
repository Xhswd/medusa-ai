import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { generateProductDescriptionWorkflow } from "../workflows/ai/generate-product-description.js"
import { AI_MODULE } from "../modules/ai/index.js"
import type AiModuleService from "../modules/ai/service.js"

export default async function productUpdatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const aiService = container.resolve(AI_MODULE) as AiModuleService
  const provider = aiService.getProvider()
  if (!provider) return

  try {
    await generateProductDescriptionWorkflow(container).run({
      input: { product_id: data.id },
    })
  } catch (err) {
    console.error(`[AI] Failed to regenerate description for product ${data.id}:`, err)
  }
}

export const config: SubscriberConfig = {
  event: "product.updated",
}
