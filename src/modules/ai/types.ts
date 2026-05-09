export interface GenerateOptions {
  model?: string
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
}

export interface LLMProvider {
  id: string
  generateText(prompt: string, options?: GenerateOptions): Promise<string>
  generateEmbedding(text: string): Promise<number[]>
  isAvailable(): Promise<boolean>
}

export interface AiModuleOptions {
  llmProviders: {
    openai?: { apiKey?: string }
    claude?: { apiKey?: string }
    ollama?: { baseUrl?: string }
  }
  defaultProvider?: string
}
