import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { pool } from '../../../lib/db/db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function toPgVector(values) {
  return `[${values.join(',')}]`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const query = body.query?.trim();

    if (!query) {
      return NextResponse.json(
        { ok: false, error: 'Query is required' },
        { status: 400 }
      );
    }

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
        1 - (embedding <=> $1::vector) AS similarity
      FROM component_docs
      ORDER BY embedding <=> $1::vector
      LIMIT 8;
    `;

    const result = await pool.query(sql, [vector]);

    return NextResponse.json({
      ok: true,
      query,
      count: result.rows.length,
      results: result.rows,
    });
  } catch (error) {
    console.error('Search failed:', error);

    return NextResponse.json(
      { ok: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}