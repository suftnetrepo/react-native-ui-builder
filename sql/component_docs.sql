CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS component_docs (
  id TEXT PRIMARY KEY,
  component_name TEXT NOT NULL,
  category TEXT NOT NULL,
  import_path TEXT NOT NULL,
  export_name TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  usage_priority TEXT NOT NULL,
  status TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_components JSONB NOT NULL DEFAULT '[]'::jsonb,
  retrieval_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  composes_with JSONB NOT NULL DEFAULT '[]'::jsonb,
  generation_hints JSONB NOT NULL DEFAULT '[]'::jsonb,
  props JSONB NOT NULL DEFAULT '[]'::jsonb,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  theme_usage JSONB NOT NULL DEFAULT '{}'::jsonb,
  examples JSONB NOT NULL DEFAULT '[]'::jsonb,
  best_practices JSONB NOT NULL DEFAULT '[]'::jsonb,
  anti_patterns JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_files JSONB NOT NULL DEFAULT '[]'::jsonb,
  type_definitions JSONB NOT NULL DEFAULT '[]'::jsonb,
  embedding_text TEXT NOT NULL,
  raw_content TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS component_docs_category_idx
  ON component_docs (category);

CREATE INDEX IF NOT EXISTS component_docs_doc_type_idx
  ON component_docs (doc_type);

CREATE INDEX IF NOT EXISTS component_docs_status_idx
  ON component_docs (status);

CREATE INDEX IF NOT EXISTS component_docs_usage_priority_idx
  ON component_docs (usage_priority);