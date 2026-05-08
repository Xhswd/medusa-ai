import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { AI_MODULE } from "../../modules/ai"
import type AiModuleService from "../../modules/ai/service"

type Input = {
  query: string
  limit?: number
  provider?: string
}

const generateQueryEmbeddingStep = createStep(
  "generate-query-embedding",
  async (input: { query: string; provider?: string }, { container }) => {
    const aiService = container.resolve(AI_MODULE) as AiModuleService
    const provider = aiService.getProvider(input.provider)
    if (!provider) {
      throw new Error("No AI provider configured for embeddings.")
    }
    const embedding = await provider.generateEmbedding(input.query)
    return new StepResponse(embedding)
  },
)

const vectorSearchStep = createStep(
  "vector-search-products",
  async (input: { embedding: number[]; limit: number }, { container }) => {
    const aiService = container.resolve(AI_MODULE) as AiModuleService

    const embeddings = await aiService.listProductEmbeddings({})
    if (!embeddings.length) {
      return new StepResponse([])
    }

    const cosineSimilarity = (a: number[], b: number[]) => {
      let dot = 0,
        normA = 0,
        normB = 0
      for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i]
        normA += a[i] * a[i]
        normB += b[i] * b[i]
      }
      return dot / (Math.sqrt(normA) * Math.sqrt(normB))
    }

    const results = embeddings
      .map((e: any) => ({
        product_id: e.product_id,
        similarity: cosineSimilarity(
          input.embedding,
          e.metadata?.embedding || [],
        ),
      }))
      .sort((a: any, b: any) => b.similarity - a.similarity)
      .slice(0, input.limit)

    return new StepResponse(results)
  },
)

const fetchProductDetailsStep = createStep(
  "fetch-search-result-products",
  async (
    input: { results: Array<{ product_id: string; similarity: number }> },
    { container },
  ) => {
    if (!input.results.length) {
      return new StepResponse([])
    }

    const productService = container.resolve("product") as any
    const products = []

    for (const r of input.results) {
      try {
        const product = await productService.retrieveProduct(r.product_id)
        products.push({ ...product, similarity: r.similarity })
      } catch {
        // product may have been deleted
      }
    }

    return new StepResponse(products)
  },
)

export const smartSearchWorkflow = createWorkflow(
  "smart-search",
  (input: Input) => {
    const embedding = generateQueryEmbeddingStep({
      query: input.query,
      provider: input.provider,
    })
    const results = vectorSearchStep({
      embedding,
      limit: input.limit || 10,
    })
    const products = fetchProductDetailsStep({ results })
    return new WorkflowResponse({ products })
  },
)
