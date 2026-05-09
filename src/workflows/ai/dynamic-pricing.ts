import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { AI_MODULE } from "../../modules/ai/index.js"
import type AiModuleService from "../../modules/ai/service.js"

type Input = {
  product_id: string
  provider?: string
}

const fetchPricingDataStep = createStep(
  "fetch-pricing-data",
  async (input: { product_id: string }, { container }) => {
    const productService = container.resolve("product") as any
    const product = await productService.retrieveProduct(input.product_id, {
      relations: ["variants", "variants.prices"],
    })

    let inventoryData: Array<{ variant_id: string; stocked_quantity: number }> = []
    try {
      const inventoryService = container.resolve("inventory") as any
      const [inventoryItems] = await inventoryService.listAndCountInventoryItems({})
      inventoryData = inventoryItems
        .filter((item: any) => {
          return product.variants?.some((v: any) => v.id === item.variant_id)
        })
        .map((item: any) => ({
          variant_id: item.variant_id,
          stocked_quantity: item.stocked_quantity || 0,
        }))
    } catch {
      // inventory module may not be available
    }

    return new StepResponse({ product, inventoryData })
  },
)

const generatePricingSuggestionStep = createStep(
  "generate-pricing-suggestion",
  async (
    input: {
      product: any
      inventoryData: Array<{ variant_id: string; stocked_quantity: number }>
      provider?: string
    },
    { container },
  ) => {
    const aiService = container.resolve(AI_MODULE) as AiModuleService
    const provider = aiService.getProvider(input.provider)
    if (!provider) {
      throw new Error("No AI provider configured.")
    }

    const product = input.product
    const variants = product.variants || []

    const variantData = variants.map((v: any) => {
      const price = v.prices?.[0]
      const inventory = input.inventoryData.find((inv) => inv.variant_id === v.id)
      return {
        id: v.id,
        title: v.title,
        current_price: price?.amount || 0,
        currency: price?.currency_code || "usd",
        inventory_level: inventory?.stocked_quantity ?? "unknown",
      }
    })

    const systemPrompt = `You are an AI pricing analyst for an e-commerce store.
Analyze product data and suggest optimal pricing. Consider inventory levels, product positioning, and market dynamics.
Respond in valid JSON format.`

    const prompt = `Analyze pricing for this product and suggest optimal prices:

Product: ${product.title}
Description: ${product.description || "N/A"}
Current variants and prices:
${variantData.map((v: any) => `  - ${v.title}: ${v.current_price} ${v.currency} (inventory: ${v.inventory_level})`).join("\n")}

Provide pricing suggestions in this JSON format:
{
  "suggestions": [
    {
      "variant_id": "...",
      "current_price": 0,
      "suggested_price": 0,
      "reason": "explanation",
      "confidence": 0.0 to 1.0
    }
  ],
  "overall_recommendation": "brief summary"
}`

    const response = await provider.generateText(prompt, {
      systemPrompt,
      temperature: 0.3,
      maxTokens: 1500,
    })

    let parsed: any
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : response)
    } catch {
      parsed = { suggestions: [], overall_recommendation: response }
    }

    const suggestions = (parsed.suggestions || []).map((s: any) => ({
      product_id: product.id,
      variant_id: s.variant_id || null,
      current_price: s.current_price,
      suggested_price: s.suggested_price,
      reason: s.reason || "",
      confidence: s.confidence || 0.5,
      factors: {
        inventory_level: input.inventoryData.find(
          (inv) => inv.variant_id === s.variant_id,
        )?.stocked_quantity,
        overall_recommendation: parsed.overall_recommendation,
      },
      is_applied: false,
    }))

    return new StepResponse(suggestions)
  },
)

const savePricingSuggestionsStep = createStep(
  "save-pricing-suggestions",
  async (suggestions: any[], { container }) => {
    const aiService = container.resolve(AI_MODULE) as AiModuleService
    const saved = await aiService.createPricingSuggestions(suggestions)
    return new StepResponse(saved, saved)
  },
  async (saved: any, { container }) => {
    if (!saved) return
    const aiService = container.resolve(AI_MODULE) as AiModuleService
    for (const record of saved) {
      await aiService.deletePricingSuggestions(record.id)
    }
  },
)

export const dynamicPricingWorkflow = createWorkflow(
  "dynamic-pricing",
  (input: Input) => {
    const pricingData = fetchPricingDataStep({ product_id: input.product_id })
    const suggestions = generatePricingSuggestionStep({
      product: pricingData.product,
      inventoryData: pricingData.inventoryData,
      provider: input.provider,
    })
    const saved = savePricingSuggestionsStep(suggestions)
    return new WorkflowResponse({ suggestions: saved })
  },
)
