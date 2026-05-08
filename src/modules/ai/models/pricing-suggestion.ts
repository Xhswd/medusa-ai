import { model } from "@medusajs/framework/utils"

export default model.define(
  { tableName: "ai_pricing_suggestion", name: "PricingSuggestion" },
  {
    id: model.id({ prefix: "aiprc" }).primaryKey(),
    product_id: model.text().searchable(),
    variant_id: model.text().nullable(),
    current_price: model.bigNumber(),
    suggested_price: model.bigNumber(),
    reason: model.text(),
    confidence: model.number(),
    factors: model.json(),
    is_applied: model.boolean().default(false),
    expires_at: model.dateTime().nullable(),
  },
)
