import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { AI_MODULE } from "../../modules/ai/index"
import type AiModuleService from "../../modules/ai/service"

type Input = {
  session_id: string
  message: string
  customer_id?: string
  provider?: string
}

const retrieveHistoryStep = createStep(
  "retrieve-chat-history",
  async (input: { session_id: string }, { container }) => {
    const aiService = container.resolve(AI_MODULE) as AiModuleService
    const messages = await aiService.listAiChatMessages({
      session_id: input.session_id,
      order: { created_at: "ASC" },
    })
    return new StepResponse(messages.slice(-20))
  },
)

const searchRelevantProductsStep = createStep(
  "search-relevant-products",
  async (input: { message: string; provider?: string }, { container }) => {
    const aiService = container.resolve(AI_MODULE) as AiModuleService
    const provider = aiService.getProvider(input.provider)

    if (!provider) {
      return new StepResponse([])
    }

    try {
      const embedding = await provider.generateEmbedding(input.message)
      const embeddings = await aiService.listProductEmbeddings({})

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

      const topProducts = embeddings
        .map((e: any) => ({
          product_id: e.product_id,
          content: e.content,
          similarity: cosineSimilarity(
            embedding,
            e.metadata?.embedding || [],
          ),
        }))
        .sort((a: any, b: any) => b.similarity - a.similarity)
        .slice(0, 5)

      return new StepResponse(topProducts)
    } catch {
      return new StepResponse([])
    }
  },
)

const generateResponseStep = createStep(
  "generate-assistant-response",
  async (
    input: {
      message: string
      history: any[]
      relevantProducts: any[]
      provider?: string
    },
    { container },
  ) => {
    const aiService = container.resolve(AI_MODULE) as AiModuleService
    const provider = aiService.getProvider(input.provider)
    if (!provider) {
      throw new Error("No AI provider configured.")
    }

    const productContext = input.relevantProducts.length
      ? `\n\nRelevant products from catalog:\n${input.relevantProducts.map((p: any) => `- ${p.content}`).join("\n")}`
      : ""

    const systemPrompt = `You are a helpful shopping assistant for an online store.
Answer questions about products, provide recommendations, and help customers find what they need.
Be friendly, concise, and helpful. If you reference products, mention them by name.${productContext}`

    const historyText = input.history.map((m: any) => `${m.role}: ${m.content}`).join("\n")
    const prompt = historyText ? `${historyText}\nuser: ${input.message}` : input.message

    const response = await provider.generateText(prompt, {
      systemPrompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return new StepResponse(response)
  },
)

const saveMessagesStep = createStep(
  "save-chat-messages",
  async (
    input: {
      session_id: string
      customer_id?: string
      userMessage: string
      assistantMessage: string
    },
    { container },
  ) => {
    const aiService = container.resolve(AI_MODULE) as AiModuleService

    await aiService.createAiChatMessages([
      {
        session_id: input.session_id,
        customer_id: input.customer_id,
        role: "user",
        content: input.userMessage,
      },
      {
        session_id: input.session_id,
        customer_id: input.customer_id,
        role: "assistant",
        content: input.assistantMessage,
      },
    ])

    return new StepResponse(undefined)
  },
)

export const shoppingAssistantWorkflow = createWorkflow(
  "shopping-assistant",
  (input: Input) => {
    const history = retrieveHistoryStep({ session_id: input.session_id })
    const relevantProducts = searchRelevantProductsStep({
      message: input.message,
      provider: input.provider,
    })
    const response = generateResponseStep({
      message: input.message,
      history,
      relevantProducts,
      provider: input.provider,
    })
    saveMessagesStep({
      session_id: input.session_id,
      customer_id: input.customer_id,
      userMessage: input.message,
      assistantMessage: response,
    })
    return new WorkflowResponse({ message: response })
  },
)
