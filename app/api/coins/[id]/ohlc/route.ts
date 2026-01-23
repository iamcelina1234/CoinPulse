import { NextResponse } from 'next/server';
import { fetcher } from '@/lib/coingecko.actions';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(req.url);
  const days = url.searchParams.get('days') ?? '1';
  const vs_currency = url.searchParams.get('vs_currency') ?? 'usd';
  const interval = url.searchParams.get('interval') ?? undefined;
  const precision = url.searchParams.get('precision') ?? undefined;

  const query: Record<string, string> = { vs_currency, days };
  if (interval) query.interval = interval;
  if (precision) (query as any).precision = precision;

  try {
    const data = await fetcher<OHLCData[]>(`/coins/${id}/ohlc`, query);
    return NextResponse.json(data);
  } catch (err) {
    // If 'max' fails, try a couple of graceful fallbacks because some endpoints
    // or param combinations may not accept 'max' or 'precision=full'. Log
    // the original error for later debugging and then try without 'precision'
    // or with a capped day range.
    console.warn(`OHLC fetch failed for ${id} with query`, query, err);

    try {
      if (query.days === 'max') {
        const withoutPrecision = { ...query };
        delete (withoutPrecision as any).precision;
        const data = await fetcher<OHLCData[]>(`/coins/${id}/ohlc`, withoutPrecision);
        return NextResponse.json(data);
      }
    } catch (err2) {
      console.warn(`Retry without precision failed for ${id}`, err2);
    }

    try {
      if (query.days === 'max') {
        // Fallback to 365 days (1 year) if 'max' isn't supported by the endpoint
        const fallbackQuery = { ...query, days: '365' };
        delete (fallbackQuery as any).precision;
        const data = await fetcher<OHLCData[]>(`/coins/${id}/ohlc`, fallbackQuery);
        return NextResponse.json(data);
      }
    } catch (err3) {
      console.warn(`Fallback to 365d failed for ${id}`, err3);
    }

    const message = err instanceof Error ? err.message : String(err);
    return new NextResponse(JSON.stringify({ error: message }), { status: 500 });
  }
}
