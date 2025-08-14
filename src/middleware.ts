import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory IP rate limiter for creating orders.
// NOTE: For production (multi-instance) replace with Redis or similar shared store.

interface Bucket { count: number; reset: number; }
interface GlobalBuckets { __ORDER_RATE_BUCKETS__?: Map<string, Bucket>; }
const g = globalThis as unknown as GlobalBuckets;
const buckets = g.__ORDER_RATE_BUCKETS__ || new Map<string, Bucket>();
if (!g.__ORDER_RATE_BUCKETS__) g.__ORDER_RATE_BUCKETS__ = buckets;

const WINDOW_MS = 60_000; // 1 minute
const LIMIT = parseInt(process.env.ORDER_RATE_LIMIT || '5', 10); // default 5 per minute

export function middleware(req: NextRequest) {
  if (req.method !== 'POST') return NextResponse.next();
  // Only apply to the exact /api/orders root (exclude subpaths like /api/orders/..)
  const { pathname } = req.nextUrl;
  if (pathname !== '/api/orders') return NextResponse.next();

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  let bucket = buckets.get(ip);
  if (!bucket || now > bucket.reset) {
    bucket = { count: 0, reset: now + WINDOW_MS };
    buckets.set(ip, bucket);
  }
  bucket.count += 1;

  const remaining = Math.max(0, LIMIT - bucket.count);
  if (bucket.count > LIMIT) {
    const res = NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi nanti.' }, { status: 429 });
    res.headers.set('Retry-After', Math.ceil((bucket.reset - now)/1000).toString());
    res.headers.set('X-RateLimit-Limit', LIMIT.toString());
    res.headers.set('X-RateLimit-Remaining', '0');
    res.headers.set('X-RateLimit-Reset', Math.floor(bucket.reset/1000).toString());
    return res;
  }
  const res = NextResponse.next();
  res.headers.set('X-RateLimit-Limit', LIMIT.toString());
  res.headers.set('X-RateLimit-Remaining', remaining.toString());
  res.headers.set('X-RateLimit-Reset', Math.floor(bucket.reset/1000).toString());
  return res;
}

export const config = {
  matcher: ['/api/orders']
};
