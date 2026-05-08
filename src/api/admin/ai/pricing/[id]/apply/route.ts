import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { AI_MODULE } from "../../../../../../modules/ai"
import type AiModuleService from "../../../../../../modules/ai/service"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params as { id: string }
  const aiService = req.scope.resolve(AI_MODULE) as AiModuleService

  const suggestion = await aiService.retrievePricingSuggestion(id)

  try {
    const productService = req.scope.resolve("product")
    const product = await productService.retrieveProduct(suggestion.product_id, {
      relations: ["variants", "variants.prices"],
    })

    const variant = (product.variants as Array<Record<string, unknown>>)?.find(
      (v) => v.id === suggestion.variant_id,
    )

    if (variant) {
      const priceService = req.scope.resolve("pricing")
      const prices = variant.prices as Array<Record<string, unknown>>
      if (prices?.[0]) {
        await priceService.updatePriceSets({
          id: prices[0].price_set_id as string,
          prices: [{ ...prices[0], amount: Number(suggestion.suggested_price) }],
        })
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
