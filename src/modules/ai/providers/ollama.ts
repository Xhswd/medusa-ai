import type { LLMProvider, GenerateOptions } from "../types"

export class OllamaProvider implements LLMProvider {
  id = "ollama"
  private baseUrl: string

  constructor(config: { baseUrl?: string }) {
    this.baseUrl = config.baseUrl || "http://localhost:11434"
  }

  async isAvailable(): Promise<boolean> {
    try {
      const resp = await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(3000) })
      return resp.ok
    } catch {
      return false
    }
  }

  async generateText(prompt: string, options?: GenerateOptions): Promise<string> {
    const body: Record<string, unknown> = {
      model: options?.model || "llama3.2",
      prompt,
      stream: false,
    }

    if (options?.systemPrompt) {
      body.system = options.systemPrompt
    }
    if (options?.temperature !== undefined) {
      body.options = { temperature: options.temperature }
    }

    const resp = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!resp.ok) {
      throw new Error(`Ollama error: ${resp.status} ${resp.statusText}`)
    }

    const data: any = await resp.json()
    return data.response || ""
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const resp = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "nomic-embed-text",
        prompt: text,
      }),
    })

    if (!resp.ok) {
      throw new Error(`Ollama embedding error: ${resp.status} ${resp.statusText}`)
    }

    const data: any = await resp.json()
    return data.embedding || []
  }
}
