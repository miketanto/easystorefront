import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createOrderSchema } from '@/lib/validation';
import { emitOrderCreated, FullOrder } from '@/lib/orderEvents';

function formatError(message: string, status = 400) { return NextResponse.json({ error: message }, { status }); }

export async function POST(req: NextRequest) {
  let json: unknown;
  try { json = await req.json(); } catch { return formatError('JSON tidak valid'); }
  const parsed = createOrderSchema.safeParse(json);
  if (!parsed.success) return formatError(parsed.error.issues.map(i=>i.message).join(', '));
  const { customerName, customerPhone, note, items } = parsed.data;

  let sessionId: string | undefined;
  try {
    const session = await prisma.cartSession.findFirst({ where: { phone: customerPhone }, orderBy: { createdAt: 'desc' } });
    sessionId = session?.id;
  } catch {
    sessionId = undefined; // in case model mismatch
  }

  const menuItems = await prisma.menuItem.findMany({ where: { id: { in: items.map(i=>i.menuItemId) } } });
  if (menuItems.length !== items.length) return formatError('Beberapa item tidak ditemukan');

  const enriched = items.map(it => {
    const m = menuItems.find(mi => mi.id === it.menuItemId)!;
    const lineTotal = m.price * it.quantity;
    return { menuItemId: m.id, nameSnapshot: m.name, priceSnapshot: m.price, quantity: it.quantity, lineTotal };
  });
  const total = enriched.reduce((s,i)=>s+i.lineTotal,0);

  const order = await prisma.order.create({
    data: { customerName, customerPhone, note: note || null, total, cartSessionId: sessionId, items: { create: enriched } },
    include: { items: true }
  });
  emitOrderCreated(order as FullOrder);

  return NextResponse.json(order, { status: 201 });
}
