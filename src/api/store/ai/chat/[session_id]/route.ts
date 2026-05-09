import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { AI_MODULE } from "../../../../../modules/ai/index.js"
import type AiModuleService from "../../../../../modules/ai/service.js"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { session_id } = req.params as { session_id: string }

  const aiService = req.scope.resolve(AI_MODULE) as AiModuleService
  const messages = await aiService.listAiChatMessages({
    session_id,
    order: { created_at: "ASC" },
  })

  res.json({ messages })
}
