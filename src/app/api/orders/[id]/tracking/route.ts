import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateTrackingLinkSchema } from '@/lib/validation';
import { emitOrderUpdated, FullOrder } from '@/lib/orderEvents';

function unauthorized() { return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 }); }

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const key = req.headers.get('x-admin-key');
  if (key !== process.env.ADMIN_KEY) return unauthorized();
  let json: unknown;
  try { json = await req.json(); } catch { return NextResponse.json({ error: 'JSON tidak valid' }, { status: 400 }); }
  const parsed = updateTrackingLinkSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
  const trackingLink = parsed.data.trackingLink ? parsed.data.trackingLink : null;
  const order = await prisma.order.update({ where: { id }, data: { trackingLink }, include: { items: true } }).catch(()=>null);
  if (!order) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
  emitOrderUpdated(order as FullOrder);
  return NextResponse.json(order);
}
