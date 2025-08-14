import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateOrderStatusSchema } from '@/lib/validation';
import { emitOrderUpdated, FullOrder } from '@/lib/orderEvents';

function unauthorized() { return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 }); }

function getAdminKey(req: NextRequest) {
  const header = req.headers.get('x-admin-key');
  return header;
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (getAdminKey(req) !== process.env.ADMIN_KEY) return unauthorized();
  const { id } = await context.params; // await params per Next.js requirement
  let json: unknown;
  try { json = await req.json(); } catch { return NextResponse.json({ error: 'JSON tidak valid' }, { status: 400 }); }
  const parsed = updateOrderStatusSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
  const order = await prisma.order.update({ where: { id }, data: { status: parsed.data.status }, include: { items: true } }).catch(()=>null);
  if (!order) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
  emitOrderUpdated(order as FullOrder);
  return NextResponse.json(order);
}
