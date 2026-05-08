import { model } from "@medusajs/framework/utils"

export default model.define(
  { tableName: "ai_generated_content", name: "AiGeneratedContent" },
  {
    id: model.id({ prefix: "aigc" }).primaryKey(),
    reference_type: model.text().searchable(),
    reference_id: model.text().searchable(),
    content_type: model.text().searchable(),
    content: model.text(),
    provider: model.text(),
    model_used: model.text(),
    prompt_tokens: model.number().nullable(),
    completion_tokens: model.number().nullable(),
    quality_score: model.number().nullable(),
    is_approved: model.boolean().default(false),
    metadata: model.json().nullable(),
  },
)
