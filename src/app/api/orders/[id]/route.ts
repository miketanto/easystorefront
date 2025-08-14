import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public GET: safe subset of order data (no phone)
export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // Await params per Next.js dynamic API requirement
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      note: true,
      total: true,
      createdAt: true,
      trackingLink: true,
      items: { select: { id: true, nameSnapshot: true, quantity: true, lineTotal: true } }
    }
  });
  if (!order) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
  return NextResponse.json(order);
}
