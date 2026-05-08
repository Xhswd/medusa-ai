# Medusa AI

AI-powered e-commerce platform built on [Medusa.js v2](https://github.com/medusajs/medusa).

## Features

- **AI Product Description Generator** — Auto-generate marketing copy, SEO titles, and meta descriptions
- **Semantic Search** — Vector-based product search using pgvector embeddings
- **AI Shopping Assistant** — RAG-powered conversational product recommendations
- **Dynamic Pricing** — AI-driven pricing suggestions based on inventory and market data

## Quick Start

```bash
# One-command setup
chmod +x setup.sh && ./setup.sh
```

Or manually:

```bash
# Copy environment config
cp .env.example .env

# Start with Docker Compose (PostgreSQL only, no Redis needed)
docker compose up -d

# Run migrations
docker compose exec medusa npx medusa db:migrate

# Create admin user
docker compose exec medusa npx medusa user -e admin@example.com -p supersecret
```

**Endpoints:**
- Admin Dashboard: `http://localhost:9000/app`
- Store API: `http://localhost:9000/store`
- Admin API: `http://localhost:9000/admin`

## AI Configuration

At least one AI provider is required. Configure via environment variables:

| Provider | Variable | Notes |
|----------|----------|-------|
| OpenAI | `OPENAI_API_KEY` | GPT-4o + text-embedding-3-small |
| Claude | `ANTHROPIC_API_KEY` | Claude Sonnet (text only, no embeddings) |
| Ollama | `OLLAMA_BASE_URL` | Local models, zero cost |

Set default: `AI_DEFAULT_PROVIDER=openai|claude|ollama`

## API Reference

### Store (public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/store/ai/search` | Semantic product search |
| POST | `/store/ai/chat` | Shopping assistant chat |
| GET | `/store/ai/chat/:session_id` | Chat history |

### Admin (authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/ai/descriptions` | Generate product descriptions |
| GET | `/admin/ai/descriptions` | List generated descriptions |
| PUT | `/admin/ai/descriptions/:id` | Approve/edit description |
| POST | `/admin/ai/pricing` | Generate pricing suggestions |
| POST | `/admin/ai/pricing/:id/apply` | Apply pricing suggestion |
| POST | `/admin/ai/embeddings/sync` | Sync product embeddings |
| GET | `/admin/ai/config` | Check AI provider status |

## Architecture

```
src/
  modules/ai/         # AI module (models, service, providers)
  workflows/ai/       # Durable workflow pipelines
  subscribers/        # Event-driven auto-generation
  jobs/               # Scheduled tasks (embedding sync)
  api/                # REST API routes
```

## Development

```bash
npm install
npm run dev
```

## License

MIT
