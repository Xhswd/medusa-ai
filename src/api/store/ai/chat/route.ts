import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { shoppingAssistantWorkflow } from "../../../../workflows/ai/shopping-assistant.js"
import { randomUUID } from "crypto"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { session_id, message, customer_id, provider } = req.body as {
    session_id?: string
    message: string
    customer_id?: string
    provider?: string
  }

  if (!message) {
    return res.status(400).json({ message: "message is required" })
  }

  const { result } = await shoppingAssistantWorkflow(req.scope).run({
    input: {
      session_id: session_id || randomUUID(),
      message,
      customer_id,
      provider,
    },
  })

  res.json(result)
}
