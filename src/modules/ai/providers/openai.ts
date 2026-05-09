import OpenAI from "openai"
import type { LLMProvider, GenerateOptions } from "../types.ts"

export class OpenAIProvider implements LLMProvider {
  id = "openai"
  private client: OpenAI | null = null
  private apiKey?: string

  constructor(config: { apiKey?: string }) {
    this.apiKey = config.apiKey
  }

  private getClient(): OpenAI {
    if (!this.client && this.apiKey) {
      this.client = new OpenAI({ apiKey: this.apiKey })
    }
    if (!this.client) {
      throw new Error("OpenAI API key not configured")
    }
    return this.client
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey
  }

  async generateText(prompt: string, options?: GenerateOptions): Promise<string> {
    const client = this.getClient()
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []

    if (options?.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt })
    }
    messages.push({ role: "user", content: prompt })

    const response = await client.chat.completions.create({
      model: options?.model || "gpt-4o",
      messages,
      max_tokens: options?.maxTokens || 2000,
      temperature: options?.temperature ?? 0.7,
    })

    return response.choices[0]?.message?.content || ""
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const client = this.getClient()
    const response = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    })
    return response.data[0].embedding
  }
}
