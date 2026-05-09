import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { AI_MODULE } from "../../modules/ai/index.js"
import type AiModuleService from "../../modules/ai/service.js"

type Input = {
  provider?: string
  batch_size?: number
}

const fetchAllProductsStep = createStep(
  "fetch-all-products",
  async (_input: Record<string, unknown>, { container }) => {
    const productService = container.resolve("product") as any
    const [products] = await productService.listAndCountProducts(
      {},
      { relations: ["tags", "type", "collection"], take: 1000 },
    )
    return new StepResponse(products)
  },
)

const generateEmbeddingsStep = createStep(
  "generate-product-embeddings",
  async (
    input: { products: any[]; provider?: string },
    { container },
  ) => {
    const aiService = container.resolve(AI_MODULE) as AiModuleService
    const provider = aiService.getProvider(input.provider)
    if (!provider) {
      throw new Error("No AI provider configured for embeddings.")
    }

    const results: Array<{
      product_id: string
      content: string
      embedding_version: string
      metadata: { embedding: number[] }
    }> = []

    for (const product of input.products) {
      const name = product.title || ""
      const description = product.description || ""
      const tags = (product.tags || []).map((t: any) => t.value).join(", ")
      const type = product.type?.value || ""
      const collection = product.collection?.title || ""

      const content = [name, description, tags, type, collection].filter(Boolean).join(" | ")

      if (!content.trim()) continue

      try {
        const embedding = await provider.generateEmbedding(content)
        results.push({
          product_id: product.id,
          content,
          embedding_version: provider.id === "openai" ? "text-embedding-3-small" : provider.id,
          metadata: { embedding },
        })
      } catch {
        // skip products that fail embedding
      }
    }

    return new StepResponse(results)
  },
)

const saveEmbeddingsStep = createStep(
  "save-product-embeddings",
  async (
    input: {
      embeddings: Array<{
        product_id: string
        content: string
        embedding_version: string
        metadata: any
      }>
    },
    { container },
  ) => {
    const aiService = container.resolve(AI_MODULE) as AiModuleService

    for (const emb of input.embeddings) {
      const existing = await aiService.listProductEmbeddings({
        product_id: emb.product_id,
      })

      if (existing.length > 0) {
        await aiService.updateProductEmbeddings({
          id: existing[0].id,
          content: emb.content,
          embedding_version: emb.embedding_version,
          metadata: emb.metadata,
        })
      } else {
        await aiService.createProductEmbeddings([emb])
      }
    }

    return new StepResponse({ count: input.embeddings.length })
  },
)

export const syncEmbeddingsWorkflow = createWorkflow(
  "sync-embeddings",
  (input: Input) => {
    const products = fetchAllProductsStep({})
    const embeddings = generateEmbeddingsStep({
      products,
      provider: input.provider,
    })
    const result = saveEmbeddingsStep({ embeddings })
    return new WorkflowResponse(result)
  },
)
