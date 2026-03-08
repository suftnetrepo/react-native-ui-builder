import OpenAI from 'openai';
import { pool } from '../db/db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function toPgVector(values) {
  return `[${values.join(',')}]`;
}

export async function searchComponents(query, limit = 8) {
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });

  const embedding = embeddingResponse.data[0].embedding;
  const vector = toPgVector(embedding);

  const sql = `
    SELECT
      id,
      component_name,
      category,
      doc_type,
      import_path,
      export_name,
      status,
      usage_priority,
      tags,
      record_json->>'summary' AS summary,
      record_json->'generationHints' AS generation_hints,
      record_json->'examples' AS examples,
      record_json->'props' AS props,
      record_json->'variants' AS variants,
      1 - (embedding <=> $1::vector) AS similarity
    FROM component_docs
    ORDER BY embedding <=> $1::vector
    LIMIT $2;
  `;

  const result = await pool.query(sql, [vector, limit]);
  return result.rows;
}