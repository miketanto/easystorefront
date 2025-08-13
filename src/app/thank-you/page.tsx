"use client";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatIDR } from '@/lib/currency';

interface OrderItem { id: string; nameSnapshot: string; quantity: number; lineTotal: number; }
interface Order { id: string; total: number; items: OrderItem[]; status: string; }

export default function ThankYouPage() {
  const sp = useSearchParams();
  const id = sp.get('id');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) { setError('Tidak dapat memuat order'); return; }
        const data = await res.json();
        setOrder(data);
      } catch { setError('Gagal memuat detail'); }
    })();
  }, [id]);

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Terima kasih!</h1>
      <p>Pesanan Anda telah diterima. Silakan tunggu konfirmasi.</p>
      {id && <p className="text-sm text-gray-600">ID Pesanan: <span className="font-mono">{id}</span></p>}
      {order && (
        <div className="space-y-2">
          <h2 className="font-medium">Ringkasan</h2>
          <ul className="text-sm list-disc ml-5 space-y-1">
            {order.items.map(it => <li key={it.id}>{it.quantity}x {it.nameSnapshot} - {formatIDR(it.lineTotal)}</li>)}
          </ul>
          <div className="font-semibold">Total: {formatIDR(order.total)}</div>
          <div className="text-sm text-gray-500">Status: {order.status}</div>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </main>
  );
}
