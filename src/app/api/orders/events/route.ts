import { NextRequest } from 'next/server';
import { orderEmitter } from '@/lib/orderEvents';
import { prisma } from '@/lib/prisma';
import type { OrderBroadcast } from '@/lib/orderEvents';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Server-Sent Events endpoint
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const adminKey = url.searchParams.get('key');
  if (adminKey !== process.env.ADMIN_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      // send initial snapshot
      const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, include: { items: true } });
      controller.enqueue(encode(`event: snapshot\n` + `data: ${JSON.stringify(orders)}\n\n`));

      const handler = (evt: OrderBroadcast) => {
        controller.enqueue(encode(`event: update\n` + `data: ${JSON.stringify(evt)}\n\n`));
      };
      orderEmitter.on('event', handler);

      // keep-alive comments every 15s to avoid timeouts
      const keepAlive = setInterval(() => {
        controller.enqueue(encode(`: ping\n\n`));
      }, 15000);

      const close = () => {
        clearInterval(keepAlive);
        orderEmitter.off('event', handler);
      };
      // Abort on client disconnect
      const signal = req.signal;
      if (signal.aborted) close();
      signal.addEventListener('abort', () => { close(); });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}

function encode(str: string) {
  return new TextEncoder().encode(str);
}
