import { NextRequest, NextResponse } from 'next/server';
import { buildUsageRecords } from '@/lib/usageReport';
import { queryUsageEvents, usageDbEnabled } from '@/lib/usageDb';

export const runtime = 'nodejs';

function parseMs(v: string | null, fallback: number) {
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const now = Date.now();
  const defaultStart = now - 7 * 24 * 60 * 60 * 1000;

  const startMs = parseMs(searchParams.get('startMs'), defaultStart);
  const endMs = parseMs(searchParams.get('endMs'), now);

  try {
    // Prefer DB if enabled (fast + filter-friendly)
    if (usageDbEnabled()) {
      const rows = await queryUsageEvents({ startMs, endMs });
      const records = rows.map(r => ({
        kind: r.kind,
        ts: r.ts,
        day: r.day,
        hour: r.hour,
        jobId: r.jobId || undefined,
        jobName: r.jobName || undefined,
        model: r.model || undefined,
        status: (r.status as any) || undefined,
        cost: r.cost === null ? undefined : r.cost,
        tokens: r.tokens === null ? undefined : Number(r.tokens),
        sessionId: r.sessionId || undefined,
        missingUsage: r.missingUsage ? true : false,
      }));
      return NextResponse.json({ startMs, endMs, records, warnings: [] });
    }

    const { records, warnings } = await buildUsageRecords({ startMs, endMs });
    return NextResponse.json({ startMs, endMs, records, warnings });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
