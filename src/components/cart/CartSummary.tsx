"use client";
import { useCart } from './CartContext';
import { formatIDR } from '@/lib/currency';
import Link from 'next/link';

export function CartSummary() {
  const { items, inc, dec, remove, total } = useCart();
  if (!items.length) return <div className="text-sm text-gray-500">Keranjang kosong.</div>;
  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {items.map(it => (
          <li key={it.id} className="flex items-center justify-between text-sm bg-white border rounded p-2">
            <div className="flex-1">
              <div className="font-medium">{it.name}</div>
              <div className="text-xs text-gray-500">{formatIDR(it.price)} x {it.quantity}</div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={()=>dec(it.id)} className="px-2 py-1 rounded bg-gray-200 text-xs">-</button>
              <span className="w-6 text-center">{it.quantity}</span>
              <button onClick={()=>inc(it.id)} className="px-2 py-1 rounded bg-gray-200 text-xs">+</button>
            </div>
            <div className="w-20 text-right font-semibold">{formatIDR(it.price * it.quantity)}</div>
            <button onClick={()=>remove(it.id)} className="ml-2 text-red-600 text-xs">Hapus</button>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between font-semibold">
        <span>Total</span>
        <span>{formatIDR(total)}</span>
      </div>
      <Link href="/checkout" className="block text-center bg-green-600 hover:bg-green-700 text-white rounded py-2 text-sm font-medium">Lanjutkan Checkout</Link>
    </div>
  );
}
