import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { dynamicPricingWorkflow } from "../../../../workflows/ai/dynamic-pricing.ts"
import { AI_MODULE } from "../../../../modules/ai/index.ts"
import type AiModuleService from "../../../../modules/ai/service.ts"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { product_id, provider } = req.body as {
    product_id: string
    provider?: string
  }

  if (!product_id) {
    return res.status(400).json({ message: "product_id is required" })
  }

  const { result } = await dynamicPricingWorkflow(req.scope).run({
    input: { product_id, provider },
  })

  res.json(result)
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { product_id, is_applied } = req.query as {
    product_id?: string
    is_applied?: string
  }

  const aiService = req.scope.resolve(AI_MODULE) as AiModuleService
  const filters: Record<string, unknown> = {}
  if (product_id) filters.product_id = product_id
  if (is_applied !== undefined) filters.is_applied = is_applied === "true"

  const suggestions = await aiService.listPricingSuggestions(filters)
  res.json({ suggestions })
}
