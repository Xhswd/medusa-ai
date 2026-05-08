import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
      storeCors: process.env.STORE_CORS || "http://localhost:8000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:7001,http://localhost:9000",
      authCors: process.env.AUTH_CORS || "http://localhost:8000,http://localhost:7001,http://localhost:9000",
    },
    redisUrl: process.env.REDIS_URL,
    workerMode: (process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server") || "shared",
  },
  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
    backendUrl: process.env.MEDUSA_BACKEND_URL,
  },
  modules: [
    {
      resolve: "./src/modules/ai",
      options: {
        providers: {
          openai: { apiKey: process.env.OPENAI_API_KEY },
          claude: { apiKey: process.env.ANTHROPIC_API_KEY },
          ollama: { baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434" },
        },
        defaultProvider: process.env.AI_DEFAULT_PROVIDER || "openai",
      },
    },
  ],
  plugins: [],
})
