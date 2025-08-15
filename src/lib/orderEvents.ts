import { EventEmitter } from 'events';
import type { Order, OrderItem } from '@/generated/prisma';

// Types of events we broadcast to admin dashboard via SSE
export type OrderBroadcast =
  | { type: 'order_created'; data: FullOrder }
  | { type: 'order_updated'; data: FullOrder };

export type FullOrder = Order & { items: OrderItem[] };

interface GlobalWithEmitter {
  __ORDER_EMITTER__?: EventEmitter;
}

const g = globalThis as unknown as GlobalWithEmitter;

export const orderEmitter: EventEmitter = g.__ORDER_EMITTER__ || new EventEmitter();
if (!g.__ORDER_EMITTER__) {
  g.__ORDER_EMITTER__ = orderEmitter;
  // Avoid max listener warning for multiple admin clients
  orderEmitter.setMaxListeners(50);
}

export function emitOrderCreated(order: FullOrder) {
  orderEmitter.emit('event', { type: 'order_created', data: order } as OrderBroadcast);
}
export function emitOrderUpdated(order: FullOrder) {
  orderEmitter.emit('event', { type: 'order_updated', data: order } as OrderBroadcast);
}

export function subscribe(cb: (evt: OrderBroadcast) => void) {
  orderEmitter.on('event', cb);
  return () => orderEmitter.off('event', cb);
}
