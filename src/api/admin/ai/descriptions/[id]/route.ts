import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { AI_MODULE } from "../../../../../modules/ai/index.ts"
import type AiModuleService from "../../../../../modules/ai/service.ts"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params as { id: string }
  const aiService = req.scope.resolve(AI_MODULE) as AiModuleService
  const content = await aiService.retrieveAiGeneratedContent(id)
  res.json({ content })
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params as { id: string }
  const { is_approved, quality_score, content } = req.body as {
    is_approved?: boolean
    quality_score?: number
    content?: string
  }

  const aiService = req.scope.resolve(AI_MODULE) as AiModuleService
  const updated = await aiService.updateAiGeneratedContents({
    id,
    ...(is_approved !== undefined && { is_approved }),
    ...(quality_score !== undefined && { quality_score }),
    ...(content !== undefined && { content }),
  })

  res.json({ content: updated })
}
