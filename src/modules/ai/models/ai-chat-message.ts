import { model } from "@medusajs/framework/utils"

export default model.define(
  { tableName: "ai_chat_message", name: "AiChatMessage" },
  {
    id: model.id({ prefix: "aichat" }).primaryKey(),
    session_id: model.text().searchable(),
    customer_id: model.text().nullable(),
    role: model.text(),
    content: model.text(),
    metadata: model.json().nullable(),
  },
)
