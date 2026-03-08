# react-native-ui-builder

A **RAG-powered (Retrieval-Augmented Generation)** Next.js API service that generates React Native screen code from natural language prompts. It uses a curated component documentation dataset, vector embeddings, and OpenAI to produce production-ready UI code built on the `fluent-styles` component library.

---

## How It Works

1. **Component docs** (`component-docs.json`) describe every available UI component — props, variants, examples, usage guidance, and generation hints.
2. The **ingest script** embeds each record using OpenAI's embedding model and stores them in PostgreSQL with the `pgvector` extension.
3. At generation time, the API performs a **semantic vector search** to retrieve the most relevant components for the user's prompt.
4. Retrieved context is fed to an OpenAI chat model to **generate a complete React Native screen**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Database | PostgreSQL + [`pgvector`](https://github.com/pgvector/pgvector) |
| Embeddings / LLM | [OpenAI API](https://platform.openai.com) |
| Styling | Tailwind CSS v4 |
| Component Library | [`fluent-styles`](https://github.com/suftnetrepo/fluent-styles) |

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ with the `pgvector` extension installed
- An OpenAI API key

---

## Environment Setup

Create a `.env.local` file in the project root:

```env
DATABASE_URL=postgresql://<user>@localhost:5432/rn_ui_builder
OPENAI_API_KEY=sk-...
```

---

## Installation

```bash
yarn install
```

---

## Database Setup

Run the SQL schema to create the `component_docs` table:

```bash
psql $DATABASE_URL -f sql/component_docs.sql
```

---

## Ingest Component Docs

Embed and upsert all records from `component-docs.json` into PostgreSQL:

```bash
yarn ingest:component-docs
```

This script:
- Reads all records from `component-docs.json`
- Generates an embedding for each record via OpenAI
- Upserts each record into the `component_docs` table (conflict-safe on `id`)

---

## Development Server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Routes

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/generate-screen` | Generate a React Native screen from a prompt |
| `POST` | `/api/search-components` | Semantic search over component docs |
| `GET` | `/api/retrieve` | Retrieve a component doc record by ID |
| `GET` | `/api/component-docs` | List all ingested component docs |
| `GET` | `/api/health` | Health check |

### Example: Generate a Screen

```bash
curl -X POST http://localhost:3000/api/generate-screen \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A login screen with email and password inputs and a submit button"}'
```

---

## Project Structure

```
├── component-docs.json          # RAG dataset — 16 verified component records
├── scripts/
│   └── ingest-component-docs.js # Embed + upsert script
├── sql/
│   └── component_docs.sql       # PostgreSQL table schema
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── api/
│   │       ├── generate-screen/
│   │       ├── search-components/
│   │       ├── retrieve/
│   │       ├── component-docs/
│   │       └── health/
│   └── lib/
│       ├── db/db.js
│       ├── rag/
│       │   ├── searchComponents.js
│       │   └── buildGenerationPrompt.js
│       ├── validateGeneratedCode.js
│       └── types/component-doc.ts
└── docs/
    └── rag/
```

---

## Component Docs Schema

Records in `component-docs.json` follow schema version `1.1.0` and include:

- `id`, `componentName`, `category`, `importPath`, `exportName`
- `summary`, `whenToUse`, `whenNotToUse`
- `props` (name, type, required, default, description)
- `variants`, `examples`, `bestPractices`, `antiPatterns`
- `relatedComponents`, `composesWith`, `generationHints`
- `embeddingText` (used for vector search)
- `metadata` (status, confidence, source files)

---

## License

MIT
