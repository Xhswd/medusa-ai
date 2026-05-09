import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { AI_MODULE } from "../../../../../../modules/ai/index.ts"
import type AiModuleService from "../../../../../../modules/ai/service.ts"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params as { id: string }
  const aiService = req.scope.resolve(AI_MODULE) as AiModuleService

  const suggestion = await aiService.retrievePricingSuggestion(id)

  try {
    const productService = req.scope.resolve("product") as any
    const product = await productService.retrieveProduct(suggestion.product_id, {
      relations: ["variants", "variants.prices"],
    })

    const variant = product.variants?.find(
      (v: any) => v.id === suggestion.variant_id,
    )

    if (variant) {
      const priceService = req.scope.resolve("pricing") as any
      const price = variant.prices?.[0]
      if (price) {
        await priceService.updatePriceSets(price.price_set_id, [
          { ...price, amount: Number(suggestion.suggested_price) },
        ])
      }
    }
  } catch (err) {
    console.error("[AI] Failed to apply pricing suggestion:", err)
  }

  await aiService.updatePricingSuggestions({
    id,
    is_applied: true,
  })

  res.json({ message: "Pricing suggestion applied", id })
}
