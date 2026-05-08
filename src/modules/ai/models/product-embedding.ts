import { model } from "@medusajs/framework/utils"

export default model.define(
  { tableName: "ai_product_embedding", name: "ProductEmbedding" },
  {
    id: model.id({ prefix: "aiemb" }).primaryKey(),
    product_id: model.text().searchable().unique(),
    content: model.text(),
    embedding_version: model.text(),
    metadata: model.json().nullable(),
  },
)
