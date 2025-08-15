import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Local enum type to avoid build issues with generated client typing during standalone build
type OrderStatusType = 'PENDING' | 'CONFIRMED' | 'FULFILLED' | 'CANCELED';

export async function GET(req: NextRequest) {
  const key = req.headers.get('x-admin-key');
  if (key !== process.env.ADMIN_KEY) return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const q = searchParams.get('q');
  const allowed: OrderStatusType[] = ['PENDING','CONFIRMED','FULFILLED','CANCELED'];

  const orders = await prisma.order.findMany({
    where: {
      ...(status && allowed.includes(status as OrderStatusType) ? { status: status as OrderStatusType } : {}),
      ...(q ? { OR: [
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q, mode: 'insensitive' } }
      ] } : {})
    },
    orderBy: { createdAt: 'desc' },
    include: { items: true }
  });
  return NextResponse.json(orders);
}
