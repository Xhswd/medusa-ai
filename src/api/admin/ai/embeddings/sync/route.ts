import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { syncEmbeddingsWorkflow } from "../../../../../workflows/ai/sync-embeddings"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { provider } = req.body as { provider?: string }

  const { result } = await syncEmbeddingsWorkflow(req.scope).run({
    input: { provider },
  })

  res.json({ message: "Embeddings synced", count: result.count })
}
