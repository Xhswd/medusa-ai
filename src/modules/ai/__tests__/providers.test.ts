import { OpenAIProvider } from "../providers/openai.js"
import { ClaudeProvider } from "../providers/claude.js"
import { OllamaProvider } from "../providers/ollama.js"

describe("AI Providers", () => {
  describe("OpenAIProvider", () => {
    it("should not be available without API key", async () => {
      const provider = new OpenAIProvider({})
      expect(await provider.isAvailable()).toBe(false)
    })

    it("should be available with API key", async () => {
      const provider = new OpenAIProvider({ apiKey: "sk-test" })
      expect(await provider.isAvailable()).toBe(true)
    })

    it("should have correct id", () => {
      const provider = new OpenAIProvider({})
      expect(provider.id).toBe("openai")
    })
  })

  describe("ClaudeProvider", () => {
    it("should not be available without API key", async () => {
      const provider = new ClaudeProvider({})
      expect(await provider.isAvailable()).toBe(false)
    })

    it("should be available with API key", async () => {
      const provider = new ClaudeProvider({ apiKey: "sk-ant-test" })
      expect(await provider.isAvailable()).toBe(true)
    })

    it("should throw for embedding generation", async () => {
      const provider = new ClaudeProvider({ apiKey: "sk-ant-test" })
      await expect(provider.generateEmbedding("test")).rejects.toThrow(
        "Claude does not support embeddings",
      )
    })
  })

  describe("OllamaProvider", () => {
    it("should have correct id", () => {
      const provider = new OllamaProvider({})
      expect(provider.id).toBe("ollama")
    })

    it("should use default base url", () => {
      const provider = new OllamaProvider({})
      expect((provider as unknown as { baseUrl: string }).baseUrl).toBe(
        "http://localhost:11434",
      )
    })
  })
})
