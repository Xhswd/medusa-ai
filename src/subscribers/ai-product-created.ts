import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { generateProductDescriptionWorkflow } from "../workflows/ai/generate-product-description.ts"
import { AI_MODULE } from "../modules/ai/index.ts"
import type AiModuleService from "../modules/ai/service.ts"

export default async function productCreatedHandler({
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
    console.error(`[AI] Failed to generate description for product ${data.id}:`, err)
  }
}

export const config: SubscriberConfig = {
  event: "product.created",
}
