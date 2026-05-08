import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { AI_MODULE } from "../../modules/ai"
import type AiModuleService from "../../modules/ai/service"

type Input = {
  product_id: string
  content_types?: string[]
  provider?: string
  tone?: string
}

const fetchProductStep = createStep(
  "fetch-product-for-ai",
  async (input: { product_id: string }, { container }) => {
    const productService = container.resolve("product")
    const product = await productService.retrieveProduct(input.product_id, {
      relations: ["variants", "collection", "tags", "type"],
    })
    return new StepResponse(product)
  },
)

const generateContentStep = createStep(
  "generate-ai-content",
  async (
    input: {
      product: Record<string, unknown>
      content_types: string[]
      provider?: string
      tone?: string
    },
    { container },
  ) => {
    const aiService = container.resolve(AI_MODULE) as AiModuleService
    const provider = aiService.getProvider(input.provider)
    if (!provider) {
      throw new Error(
        "No AI provider configured. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or configure Ollama.",
      )
    }

    const product = input.product
    const name = (product.title as string) || "Unknown Product"
    const description = (product.description as string) || ""
    const tags = ((product.tags as Array<{ value: string }>) || []).map((t) => t.value).join(", ")
    const collection = (product.collection as { title?: string })?.title || ""
    const type = (product.type as { value?: string })?.value || ""
    const variants = (product.variants as Array<Record<string, unknown>>) || []
    const variantInfo = variants
      .map((v) => `${v.title}: $${v.prices?.[0]?.amount || "N/A"}`)
      .join("; ")

    const productContext = `
Product: ${name}
Category: ${type}
Collection: ${collection}
Tags: ${tags}
Current Description: ${description}
Variants: ${variantInfo}
Tone: ${input.tone || "professional, engaging"}
`.trim()

    const systemPrompt = `You are an expert e-commerce copywriter. Generate compelling product content.
Respond in valid JSON format with keys matching the requested content_types.
Each value should be a well-crafted string.`

    const prompt = `Generate the following content types for this product: ${input.content_types.join(", ")}

${productContext}

Respond ONLY with a JSON object where keys are the content_type names and values are the generated text.
Example: {"description": "...", "seo_title": "...", "seo_description": "..."}`

    const response = await provider.generateText(prompt, {
      systemPrompt,
      temperature: 0.7,
      maxTokens: 2000,
    })

    let parsed: Record<string, string>
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : response)
    } catch {
      parsed = {}
      for (const ct of input.content_types) {
        parsed[ct] = response
      }
    }

    const productId = product.id as string
    const contents = input.content_types.map((ct) => ({
      reference_type: "product",
      reference_id: productId,
      content_type: ct,
      content: parsed[ct] || "",
      provider: provider.id,
      model_used: provider.id === "openai" ? "gpt-4o" : provider.id === "claude" ? "claude-sonnet-4-20250514" : "llama3.2",
      is_approved: false,
    }))

    return new StepResponse(contents)
  },
)

const saveContentStep = createStep(
  "save-ai-content",
  async (contents: Record<string, unknown>[], { container }) => {
    const aiService = container.resolve(AI_MODULE) as AiModuleService
    const saved = await aiService.createAiGeneratedContents(contents)
    return new StepResponse(saved, saved)
  },
  async (saved: Array<{ id: string }>, { container }) => {
    const aiService = container.resolve(AI_MODULE) as AiModuleService
    for (const record of saved) {
      await aiService.deleteAiGeneratedContents(record.id)
    }
  },
)

export const generateProductDescriptionWorkflow = createWorkflow(
  "generate-product-description",
  (input: Input) => {
    const product = fetchProductStep({ product_id: input.product_id })
    const contents = generateContentStep({
      product,
      content_types: input.content_types || ["description", "seo_title", "seo_description"],
      provider: input.provider,
      tone: input.tone,
    })
    const saved = saveContentStep(contents)
    return new WorkflowResponse({ contents: saved })
  },
)
