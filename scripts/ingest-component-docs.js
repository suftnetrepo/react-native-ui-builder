import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import pg from 'pg';

dotenv.config({
  path: new URL('../.env.local', import.meta.url).pathname
});

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function toPgVector(values) {
  return `[${values.join(',')}]`;
}

async function loadJson() {
  const filePath = path.join(process.cwd(), 'component-docs.json');
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

async function embedText(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

async function upsertRecord(record, schemaVersion) {
  const embeddingSource = record.embeddingText || record.rawContent || record.summary;
  const embedding = await embedText(embeddingSource);

  const query = `
    INSERT INTO component_docs (
      id,
      schema_version,
      component_name,
      category,
      doc_type,
      import_path,
      export_name,
      status,
      usage_priority,
      tags,
      retrieval_keywords,
      related_components,
      composes_with,
      source_files,
      embedding_text,
      raw_content,
      record_json,
      embedding
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9,
      $10::jsonb, $11::jsonb, $12::jsonb, $13::jsonb, $14::jsonb,
      $15, $16, $17::jsonb, $18::vector
    )
    ON CONFLICT (id)
    DO UPDATE SET
      schema_version = EXCLUDED.schema_version,
      component_name = EXCLUDED.component_name,
      category = EXCLUDED.category,
      doc_type = EXCLUDED.doc_type,
      import_path = EXCLUDED.import_path,
      export_name = EXCLUDED.export_name,
      status = EXCLUDED.status,
      usage_priority = EXCLUDED.usage_priority,
      tags = EXCLUDED.tags,
      retrieval_keywords = EXCLUDED.retrieval_keywords,
      related_components = EXCLUDED.related_components,
      composes_with = EXCLUDED.composes_with,
      source_files = EXCLUDED.source_files,
      embedding_text = EXCLUDED.embedding_text,
      raw_content = EXCLUDED.raw_content,
      record_json = EXCLUDED.record_json,
      embedding = EXCLUDED.embedding;
  `;

  const values = [
    record.id,
    schemaVersion,
    record.componentName,
    record.category,
    record.docType,
    record.importPath,
    record.exportName,
    record.status,
    record.usagePriority,
    JSON.stringify(record.tags ?? []),
    JSON.stringify(record.retrievalKeywords ?? []),
    JSON.stringify(record.relatedComponents ?? []),
    JSON.stringify(record.composesWith ?? []),
    JSON.stringify(record.sourceFiles ?? []),
    record.embeddingText || '',
    record.rawContent || null,
    JSON.stringify(record),
    toPgVector(embedding),
  ];

  await pool.query(query, values);
}

async function main() {
  const data = await loadJson();

  console.log(`Found ${data.records.length} records`);

  for (const record of data.records) {
    console.log(`Embedding and saving: ${record.id}`);
    await upsertRecord(record, data.schemaVersion);
  }

  console.log('Done');
  await pool.end();
}

main().catch(async (error) => {
  console.error('Ingestion failed:', error);
  await pool.end();
  process.exit(1);
});