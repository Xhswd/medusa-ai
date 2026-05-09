import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { generateProductDescriptionWorkflow } from "../../../../workflows/ai/generate-product-description"
import { AI_MODULE } from "../../../../modules/ai/index"
import type AiModuleService from "../../../../modules/ai/service"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { product_id, content_types, provider, tone } = req.body as {
    product_id: string
    content_types?: string[]
    provider?: string
    tone?: string
  }

  if (!product_id) {
    return res.status(400).json({ message: "product_id is required" })
  }

  const { result } = await generateProductDescriptionWorkflow(req.scope).run({
    input: { product_id, content_types, provider, tone },
  })

  res.json(result)
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { product_id, content_type } = req.query as {
    product_id?: string
    content_type?: string
  }

  const aiService = req.scope.resolve(AI_MODULE) as AiModuleService
  const filters: Record<string, unknown> = { reference_type: "product" }
  if (product_id) filters.reference_id = product_id
  if (content_type) filters.content_type = content_type

  const contents = await aiService.listAiGeneratedContents(filters)
  res.json({ contents })
}
