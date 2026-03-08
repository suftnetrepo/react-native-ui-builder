import { NextResponse } from 'next/server';
import { pool } from '../../../lib/db/client';

export async function GET() {
  try {
    const result = await pool.query('SELECT NOW() as now');

    return NextResponse.json({
      ok: true,
      db: 'connected',
      now: result.rows[0].now,
    });
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        ok: false,
        db: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}