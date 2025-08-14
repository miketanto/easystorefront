import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  const key = req.headers.get('x-admin-key');
  if (key !== process.env.ADMIN_KEY) return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const q = searchParams.get('q');
  const where: Prisma.OrderWhereInput = {};
  if (status && ['PENDING','CONFIRMED','FULFILLED','CANCELED'].includes(status)) where.status = status as any; // enum narrowed
  if (q) {
    where.OR = [
      { customerName: { contains: q, mode: 'insensitive' } },
      { customerPhone: { contains: q, mode: 'insensitive' } }
    ];
  }
  const orders = await prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, include: { items: true } });
  return NextResponse.json(orders);
}
