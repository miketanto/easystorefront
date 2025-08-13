import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public GET: safe subset of order data (no phone)
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      note: true,
      total: true,
      createdAt: true,
      items: { select: { id: true, nameSnapshot: true, quantity: true, lineTotal: true } }
    }
  });
  if (!order) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
  return NextResponse.json(order);
}
