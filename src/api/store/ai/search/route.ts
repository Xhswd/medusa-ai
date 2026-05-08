import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { smartSearchWorkflow } from "../../../../workflows/ai/smart-search"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { query, limit, provider } = req.body as {
    query: string
    limit?: number
    provider?: string
  }

  if (!query) {
    return res.status(400).json({ message: "query is required" })
  }

  const { result } = await smartSearchWorkflow(req.scope).run({
    input: { query, limit: limit || 10, provider },
  })

  res.json({ results: result.products })
}
