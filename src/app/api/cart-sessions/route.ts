import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startCartSessionSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  let json: unknown;
  try { json = await req.json(); } catch { return NextResponse.json({ error: 'JSON tidak valid' }, { status: 400 }); }
  const parsed = startCartSessionSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'Nomor telepon tidak valid' }, { status: 400 });
  const { phone } = parsed.data;

  // Upsert by phone (one active session per phone) - create if not exists.
  const existing = await prisma.cartSession.findFirst({ where: { phone }, orderBy: { createdAt: 'desc' } });
  if (existing) {
    return NextResponse.json(existing);
  }
  const created = await prisma.cartSession.create({ data: { phone } });
  return NextResponse.json(created, { status: 201 });
}
