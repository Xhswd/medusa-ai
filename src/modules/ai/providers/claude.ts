import Anthropic from "@anthropic-ai/sdk"
import type { LLMProvider, GenerateOptions } from "../types.ts"

export class ClaudeProvider implements LLMProvider {
  id = "claude"
  private client: Anthropic | null = null
  private apiKey?: string

  constructor(config: { apiKey?: string }) {
    this.apiKey = config.apiKey
  }

  private getClient(): Anthropic {
    if (!this.client && this.apiKey) {
      this.client = new Anthropic({ apiKey: this.apiKey })
    }
    if (!this.client) {
      throw new Error("Anthropic API key not configured")
    }
    return this.client
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey
  }

  async generateText(prompt: string, options?: GenerateOptions): Promise<string> {
    const client = this.getClient()

    const response = await client.messages.create({
      model: options?.model || "claude-sonnet-4-20250514",
      max_tokens: options?.maxTokens || 2000,
      system: options?.systemPrompt,
      messages: [{ role: "user", content: prompt }],
    })

    const textBlock = response.content.find((b) => b.type === "text")
    return textBlock ? (textBlock as { type: "text"; text: string }).text : ""
  }

  async generateEmbedding(_text: string): Promise<number[]> {
    throw new Error(
      "Claude does not support embeddings. Use OpenAI or Ollama for embedding generation.",
    )
  }
}
